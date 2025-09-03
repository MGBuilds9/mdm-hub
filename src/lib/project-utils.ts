import { Project, Milestone, Task, Database } from '@/types/database';

type ProjectStatus = Database['public']['Enums']['project_status'];

// Calculate overall project progress based on milestones and tasks
export function calculateProjectProgress(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): number {
  if (milestones.length === 0 && tasks.length === 0) {
    return 0;
  }

  // If we have milestones, use milestone-based calculation
  if (milestones.length > 0) {
    const totalWeight = milestones.length;
    const completedWeight = milestones.reduce((sum, milestone) => {
      return (
        sum +
        (milestone.status === 'completed'
          ? 1
          : milestone.status === 'in_progress'
            ? 0.5
            : 0)
      );
    }, 0);
    return Math.round((completedWeight / totalWeight) * 100);
  }

  // Fallback to task-based calculation
  if (tasks.length > 0) {
    const completedTasks = tasks.filter(
      task => task.status === 'completed'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  return 0;
}

// Calculate milestone progress based on tasks
export function calculateMilestoneProgress(
  milestone: Milestone,
  tasks: Task[]
): number {
  // Since milestones and tasks are both stored in the same table,
  // we'll use the milestone's own status for progress calculation
  if (milestone.status === 'completed') return 100;
  if (milestone.status === 'in_progress') return 50;
  if (milestone.status === 'pending') return 0;
  return 0;
}

// Get project health status
export function getProjectHealth(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
} {
  const issues: string[] = [];
  const now = new Date();

  // Check for overdue milestones
  const overdueMilestones = milestones.filter(milestone => {
    if (!milestone.due_date) return false;
    const dueDate = new Date(milestone.due_date);
    return dueDate < now && milestone.status !== 'completed';
  });

  if (overdueMilestones.length > 0) {
    issues.push(`${overdueMilestones.length} overdue milestone(s)`);
  }

  // Check for overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    return dueDate < now;
  });

  if (overdueTasks.length > 0) {
    issues.push(`${overdueTasks.length} overdue task(s)`);
  }

  // Check for high priority incomplete tasks
  const highPriorityIncomplete = tasks.filter(
    task => task.priority === 'urgent' && task.status !== 'completed'
  );

  if (highPriorityIncomplete.length > 0) {
    issues.push(`${highPriorityIncomplete.length} urgent incomplete task(s)`);
  }

  // Check project status
  if (project.status === 'on_hold' && issues.length > 0) {
    issues.push('Project is on hold with outstanding issues');
  }

  // Determine health status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (issues.length > 0) {
    status =
      overdueMilestones.length > 0 || highPriorityIncomplete.length > 0
        ? 'critical'
        : 'warning';
  }

  return { status, issues };
}

// Get project timeline status
export function getProjectTimelineStatus(project: Project): {
  status: 'on-track' | 'at-risk' | 'delayed';
  message: string;
} {
  if (!project.start_date || !project.end_date) {
    return { status: 'on-track', message: 'No timeline set' };
  }

  const now = new Date();
  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

  // Calculate expected progress based on time elapsed
  const expectedProgress = progress * 100;

  // Get actual progress (this would need to be calculated from milestones/tasks)
  // For now, we'll use a placeholder
  const actualProgress = 0; // This should be calculated from milestones/tasks

  const progressDiff = actualProgress - expectedProgress;

  if (progressDiff < -20) {
    return {
      status: 'delayed',
      message: 'Project is significantly behind schedule',
    };
  } else if (progressDiff < -10) {
    return { status: 'at-risk', message: 'Project is at risk of delay' };
  } else {
    return { status: 'on-track', message: 'Project is on track' };
  }
}

// Calculate project budget status
export function getProjectBudgetStatus(
  project: Project,
  actualCost?: number
): {
  status: 'on-budget' | 'over-budget' | 'under-budget';
  percentage: number;
  message: string;
} {
  if (!project.budget) {
    return { status: 'on-budget', percentage: 0, message: 'No budget set' };
  }

  if (!actualCost) {
    return {
      status: 'on-budget',
      percentage: 0,
      message: 'No actual costs tracked',
    };
  }

  const percentage = (actualCost / project.budget) * 100;

  if (percentage > 100) {
    return {
      status: 'over-budget',
      percentage,
      message: `Over budget by ${formatCurrency(actualCost - project.budget)}`,
    };
  } else if (percentage < 90) {
    return {
      status: 'under-budget',
      percentage,
      message: `Under budget by ${formatCurrency(project.budget - actualCost)}`,
    };
  } else {
    return {
      status: 'on-budget',
      percentage,
      message: 'On budget',
    };
  }
}

// Get next milestone
export function getNextMilestone(milestones: Milestone[]): Milestone | null {
  const upcomingMilestones = milestones
    .filter(milestone => milestone.status !== 'completed' && milestone.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    );

  return upcomingMilestones[0] ?? null;
}

// Get overdue items
export function getOverdueItems(
  milestones: Milestone[],
  tasks: Task[]
): {
  milestones: Milestone[];
  tasks: Task[];
} {
  const now = new Date();

  const overdueMilestones = milestones.filter(milestone => {
    if (!milestone.due_date) return false;
    const dueDate = new Date(milestone.due_date);
    return dueDate < now && milestone.status !== 'completed';
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    return dueDate < now;
  });

  return { milestones: overdueMilestones, tasks: overdueTasks };
}

// Get project statistics
export function getProjectStatistics(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    task => task.status === 'completed'
  ).length;
  const inProgressTasks = tasks.filter(
    task => task.status === 'in_progress'
  ).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    milestone => milestone.status === 'completed'
  ).length;
  const inProgressMilestones = milestones.filter(
    milestone => milestone.status === 'in_progress'
  ).length;

  const { milestones: overdueMilestones, tasks: overdueTasks } =
    getOverdueItems(milestones, tasks);

  return {
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      overdue: overdueTasks.length,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      inProgress: inProgressMilestones,
      overdue: overdueMilestones.length,
      completionRate:
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0,
    },
    overall: {
      progress: calculateProjectProgress(project, milestones, tasks),
      health: getProjectHealth(project, milestones, tasks),
      timeline: getProjectTimelineStatus(project),
    },
  };
}

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
