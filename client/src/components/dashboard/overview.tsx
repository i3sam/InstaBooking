import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CalendarCheck, Clock, DollarSign, Plus, Calendar, BarChart3, Edit, Check } from 'lucide-react';

export default function Overview() {
  const stats = [
    {
      title: "Booking Pages",
      value: "0",
      icon: FileText,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Total Bookings",
      value: "0",
      icon: CalendarCheck,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Pending",
      value: "0",
      icon: Clock,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const activities = [
    {
      type: 'info',
      title: "Welcome to BookingGen!",
      description: "Create your first booking page to get started",
      time: "Just now",
      icon: Check,
      iconBg: "bg-blue-100 text-blue-600"
    }
  ];

  const quickActions = [
    {
      title: "Create New Page",
      description: "Set up a booking page for your services",
      icon: Plus,
      iconBg: "bg-primary/10 text-primary",
      action: () => {
        // TODO: Navigate to create page
      }
    },
    {
      title: "View Calendar",
      description: "Check your upcoming appointments",
      icon: Calendar,
      iconBg: "bg-green-100 text-green-600",
      action: () => {
        // TODO: Open calendar view
      }
    },
    {
      title: "View Analytics",
      description: "Track your booking performance",
      icon: BarChart3,
      iconBg: "bg-purple-100 text-purple-600",
      action: () => {
        // TODO: Navigate to analytics
      }
    }
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                  {stat.value}
                </span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-muted-foreground mb-4">📋</div>
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted"
                  data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.iconBg}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-foreground block">{action.title}</span>
                      <span className="text-sm text-muted-foreground">{action.description}</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
