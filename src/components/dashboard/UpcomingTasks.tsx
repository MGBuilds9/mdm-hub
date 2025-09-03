import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Clock, User } from 'lucide-react';

const tasks = [
  {
    id: '1',
    title: 'Review Foundation Plans',
    project: 'Downtown Office Complex',
    assignee: 'John Smith',
    dueDate: '2024-02-15',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Order Steel Materials',
    project: 'Residential Tower Phase 2',
    assignee: 'Sarah Johnson',
    dueDate: '2024-02-18',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Site Safety Inspection',
    project: 'Shopping Mall Renovation',
    assignee: 'Mike Wilson',
    dueDate: '2024-02-20',
    priority: 'urgent' as const,
  },
  {
    id: '4',
    title: 'Client Meeting Preparation',
    project: 'Industrial Warehouse',
    assignee: 'Lisa Brown',
    dueDate: '2024-02-22',
    priority: 'low' as const,
  },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function UpcomingTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-charcoal-950 text-sm">
                  {task.title}
                </h4>
                <Badge
                  className={priorityColors[task.priority]}
                  variant="secondary"
                >
                  {task.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{task.project}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(task.dueDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
