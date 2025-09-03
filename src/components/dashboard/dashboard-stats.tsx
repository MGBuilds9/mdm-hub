import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Users,
  FolderOpen,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

function StatCard({ title, value, change, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-charcoal-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-charcoal-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-charcoal-900">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-charcoal-500 mt-1">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-error-500 mr-1" />
            )}
            <span className={cn(
              change.type === 'increase' ? 'text-success-600' : 'text-error-600'
            )}>
              {Math.abs(change.value)}%
            </span>
            <span className="ml-1">from last {change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProjectProgressProps {
  project: {
    id: string
    name: string
    progress: number
    status: string
    budget: number
    spent: number
    endDate: string
  }
}

function ProjectProgress({ project }: ProjectProgressProps) {
  const budgetUtilization = (project.spent / project.budget) * 100
  const isOverBudget = budgetUtilization > 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{project.name}</CardTitle>
          <Badge variant={project.status as any}>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-charcoal-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Budget */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-charcoal-600">Budget</span>
            <span className={cn(
              "font-medium",
              isOverBudget ? "text-error-600" : "text-charcoal-900"
            )}>
              ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={Math.min(budgetUtilization, 100)} 
            className={cn("h-2", isOverBudget && "bg-error-100")}
          />
          {isOverBudget && (
            <div className="flex items-center text-xs text-error-600 mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Over budget by ${(project.spent - project.budget).toLocaleString()}
            </div>
          )}
        </div>

        {/* End Date */}
        <div className="flex items-center text-sm text-charcoal-600">
          <Calendar className="h-4 w-4 mr-2" />
          Due: {new Date(project.endDate).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: {
    totalProjects: number
    activeProjects: number
    totalBudget: number
    spentBudget: number
    teamMembers: number
    changeOrders: number
    pendingApprovals: number
    completedProjects: number
  }
  projects: Array<{
    id: string
    name: string
    progress: number
    status: string
    budget: number
    spent: number
    endDate: string
  }>
  className?: string
}

export function DashboardStats({ stats, projects, className }: DashboardStatsProps) {
  const budgetUtilization = (stats.spentBudget / stats.totalBudget) * 100
  const isOverBudget = budgetUtilization > 100

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          change={{
            value: 12,
            type: 'increase',
            period: 'month'
          }}
          icon={FolderOpen}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          change={{
            value: 5,
            type: 'increase',
            period: 'month'
          }}
          icon={CheckCircle}
        />
        <StatCard
          title="Total Budget"
          value={`$${stats.totalBudget.toLocaleString()}`}
          change={{
            value: 8,
            type: 'increase',
            period: 'month'
          }}
          icon={DollarSign}
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          change={{
            value: 2,
            type: 'increase',
            period: 'month'
          }}
          icon={Users}
        />
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-charcoal-600">Budget Utilization</span>
                <span className={cn(
                  "font-medium",
                  isOverBudget ? "text-error-600" : "text-charcoal-900"
                )}>
                  {budgetUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(budgetUtilization, 100)} 
                className={cn("h-3", isOverBudget && "bg-error-100")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-charcoal-600">Total Budget</p>
                <p className="font-semibold">${stats.totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-charcoal-600">Spent</p>
                <p className={cn(
                  "font-semibold",
                  isOverBudget ? "text-error-600" : "text-charcoal-900"
                )}>
                  ${stats.spentBudget.toLocaleString()}
                </p>
              </div>
            </div>
            {isOverBudget && (
              <div className="flex items-center text-sm text-error-600 bg-error-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Over budget by ${(stats.spentBudget - stats.totalBudget).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Change Orders</span>
              <Badge variant="warning">{stats.changeOrders}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Pending Approvals</span>
              <Badge variant="warning">{stats.pendingApprovals}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Completed Projects</span>
              <Badge variant="success">{stats.completedProjects}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">
          Project Progress
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectProgress key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}
