import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const projects = [
  {
    id: '1',
    name: 'Downtown Office Complex',
    status: 'active' as const,
    progress: 75,
    client: 'ABC Corporation',
    dueDate: '2024-03-15',
    budget: 2500000,
  },
  {
    id: '2',
    name: 'Residential Tower Phase 2',
    status: 'active' as const,
    progress: 45,
    client: 'XYZ Developers',
    dueDate: '2024-04-20',
    budget: 1800000,
  },
  {
    id: '3',
    name: 'Shopping Mall Renovation',
    status: 'planning' as const,
    progress: 15,
    client: 'Retail Group Inc',
    dueDate: '2024-05-10',
    budget: 1200000,
  },
  {
    id: '4',
    name: 'Industrial Warehouse',
    status: 'completed' as const,
    progress: 100,
    client: 'Manufacturing Co',
    dueDate: '2024-01-30',
    budget: 950000,
  },
];

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  'on-hold': 'bg-orange-100 text-orange-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function RecentProjects() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-charcoal-950">
                    {project.name}
                  </h3>
                  <Badge className={statusColors[project.status]}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Client: {project.client}</span>
                  <span>Due: {formatDate(project.dueDate)}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
