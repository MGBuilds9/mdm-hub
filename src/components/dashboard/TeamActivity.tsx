import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, FileText, MessageSquare, UserPlus } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'task_completed',
    user: 'John Smith',
    action: 'completed task',
    target: 'Foundation Inspection',
    timestamp: '2024-02-14T10:30:00Z',
    icon: CheckCircle,
    color: 'text-green-500',
  },
  {
    id: '2',
    type: 'document_uploaded',
    user: 'Sarah Johnson',
    action: 'uploaded document',
    target: 'Steel Specifications.pdf',
    timestamp: '2024-02-14T09:15:00Z',
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    id: '3',
    type: 'comment_added',
    user: 'Mike Wilson',
    action: 'commented on',
    target: 'Downtown Office Complex',
    timestamp: '2024-02-14T08:45:00Z',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  {
    id: '4',
    type: 'member_added',
    user: 'Lisa Brown',
    action: 'added team member',
    target: 'Alex Thompson',
    timestamp: '2024-02-13T16:20:00Z',
    icon: UserPlus,
    color: 'text-orange-500',
  },
];

export function TeamActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal-950">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
