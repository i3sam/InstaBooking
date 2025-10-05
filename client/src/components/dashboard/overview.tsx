import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CalendarCheck, Clock, DollarSign, Plus, Calendar, BarChart3, Edit, Check, User, AlertCircle, Wifi, WifiOff, Sparkles, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeDashboard } from '@/hooks/useRealtimeSubscription';
import TrialActivationModal from '@/components/modals/trial-activation-modal';

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
  const { user, profile } = useAuth();
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  // Enable real-time subscriptions for live dashboard updates
  const { isConnected: isRealtimeConnected } = useRealtimeDashboard(user?.id);

  // Check if user is eligible for trial
  const isTrialAvailable = profile && (profile as any).trialStatus === 'available' && profile.membershipStatus !== 'pro';
  
  // Check if user is currently on a trial
  const isOnTrial = profile && (profile as any).trialStatus === 'active' && profile.membershipStatus === 'pro';
  
  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    if (!isOnTrial || !(profile as any).trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date((profile as any).trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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
      {/* Trial Activation Banner */}
      {isTrialAvailable && showTrialBanner && (
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-purple-300/50 dark:border-purple-600/50 shadow-2xl mb-8 animate-slide-down relative overflow-hidden" data-testid="banner-trial-activation">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 animate-pulse"></div>
          <CardContent className="p-6 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              onClick={() => setShowTrialBanner(false)}
              data-testid="button-close-trial-banner"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-300/50 dark:border-purple-600/50 animate-pulse">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-900 to-pink-900 dark:from-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-2">
                  Start Your 7-Day Free Trial!
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
                  Experience all Pro features with no charge for 7 days. Cancel anytime.
                </p>
              </div>
              <Button
                onClick={() => setIsTrialModalOpen(true)}
                size="lg"
                className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 hover:from-purple-200 hover:via-purple-300 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-500 text-purple-800 dark:text-purple-100 shadow-lg hover:scale-105 transition-all duration-300 border border-purple-300/50 dark:border-purple-600/50 font-semibold h-12"
                data-testid="button-activate-trial-banner"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Activate Free Trial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Activation Modal */}
      <TrialActivationModal 
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />

      {/* Active Trial Banner */}
      {isOnTrial && (
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-purple-500/15 border-purple-300/50 dark:border-purple-600/50 shadow-2xl mb-8 animate-slide-down" data-testid="banner-active-trial">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass-prism rounded-full flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-300/50 dark:border-purple-600/50">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Free Trial Active
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getDaysRemaining() > 0 ? (
                      <>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'}</span> remaining in your trial
                        {(profile as any).trialEndsAt && (
                          <> • Ends {new Date((profile as any).trialEndsAt).toLocaleDateString()}</>
                        )}
                      </>
                    ) : (
                      'Your trial is ending soon'
                    )}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onSectionChange?.('settings')}
                className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 hover:from-purple-200 hover:via-purple-300 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-500 text-purple-800 dark:text-purple-100 shadow-lg border border-purple-300/50 dark:border-purple-600/50 font-semibold"
                data-testid="button-upgrade-from-trial"
              >
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
