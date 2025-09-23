import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CalendarCheck, Clock, DollarSign, Plus, Calendar, BarChart3, Edit, Check, User, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeDashboard } from '@/hooks/useRealtimeSubscription';

interface OverviewProps {
  onSectionChange?: (section: string) => void;
}

interface DashboardStats {
  pagesCount: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  conversionRate: number;
  avgBookingValue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
}

export default function Overview({ onSectionChange }: OverviewProps) {
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  // Enable real-time subscriptions for live dashboard updates
  const { isConnected: isRealtimeConnected } = useRealtimeDashboard(user?.id);

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useQuery<RecentActivity[]>({
    queryKey: ['/api/dashboard/recent-activity'],
    enabled: true
  });

  const stats = [
    {
      title: "Booking Pages",
      value: statsLoading ? "..." : (dashboardStats?.pagesCount?.toString() || "0"),
      icon: FileText,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Total Bookings",
      value: statsLoading ? "..." : (dashboardStats?.totalAppointments?.toString() || "0"),
      icon: CalendarCheck,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Pending",
      value: statsLoading ? "..." : (dashboardStats?.pendingAppointments?.toString() || "0"),
      icon: Clock,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  // Format activities from API data
  const activities = recentActivity || [];
  
  const formatActivityTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const getActivityIcon = (activity: any) => {
    switch (activity.status) {
      case 'pending':
        return { icon: Clock, iconBg: "bg-orange-100 text-orange-600" };
      case 'accepted':
        return { icon: Check, iconBg: "bg-green-100 text-green-600" };
      case 'declined':
        return { icon: AlertCircle, iconBg: "bg-red-100 text-red-600" };
      default:
        return { icon: User, iconBg: "bg-blue-100 text-blue-600" };
    }
  };

  const quickActions = [
    {
      title: "Create New Page",
      description: "Set up a booking page for your services",
      icon: Plus,
      iconBg: "bg-primary/10 text-primary",
      action: () => {
        setLocation('/create-page');
      }
    },
    {
      title: "View Calendar",
      description: "Check your upcoming appointments",
      icon: Calendar,
      iconBg: "bg-green-100 text-green-600",
      action: () => {
        onSectionChange?.('appointments');
      }
    },
    {
      title: "View Analytics",
      description: "Track your booking performance",
      icon: BarChart3,
      iconBg: "bg-purple-100 text-purple-600",
      action: () => {
        onSectionChange?.('analytics');
      }
    }
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Stats Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {statsError ? (
          <div className="col-span-full">
            <Card className="border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl text-red-500 mb-4">⚠️</div>
                <p className="text-red-600">Failed to load dashboard statistics</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br ${stat.color.includes('primary') ? 'from-blue-500/20 to-purple-500/20' : stat.color.includes('green') ? 'from-green-500/20 to-cyan-500/20' : 'from-orange-500/20 to-yellow-500/20'} border border-white/30 flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</h3>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-slide-in-left">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-muted-foreground mb-4">⏳</div>
                  <p className="text-gray-600 dark:text-gray-400">Loading recent activity...</p>
                </div>
              ) : activityError ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-muted-foreground mb-4">⚠️</div>
                  <p className="text-red-500 dark:text-red-400">Failed to load recent activity</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-muted-foreground mb-4">📋</div>
                  <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                </div>
              ) : (
                activities.map((activity: RecentActivity, index: number) => {
                  const { icon: ActivityIcon, iconBg } = getActivityIcon(activity);
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full glass-prism backdrop-blur-md bg-gradient-to-br ${iconBg.includes('orange') ? 'from-orange-500/20 to-yellow-500/20' : iconBg.includes('green') ? 'from-green-500/20 to-cyan-500/20' : iconBg.includes('red') ? 'from-red-500/20 to-pink-500/20' : 'from-blue-500/20 to-purple-500/20'} border border-white/30 flex items-center justify-center`}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{activity.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatActivityTime(activity.time)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-slide-in-right">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Quick Actions</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="ghost"
                  className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:shadow-lg hover:scale-105 w-full flex items-center justify-between p-4 h-auto rounded-xl"
                  data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br ${action.iconBg.includes('primary') ? 'from-blue-500/20 to-purple-500/20' : action.iconBg.includes('green') ? 'from-green-500/20 to-cyan-500/20' : 'from-purple-500/20 to-pink-500/20'} border border-white/30 flex items-center justify-center`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-800 dark:text-gray-100 block">{action.title}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{action.description}</span>
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">→</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
