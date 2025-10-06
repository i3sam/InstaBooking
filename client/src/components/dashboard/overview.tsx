import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CalendarCheck, Clock, DollarSign, Plus, Calendar, BarChart3, Edit, Check, User, AlertCircle, Wifi, WifiOff, Sparkles, X, XCircle, TrendingUp, Percent } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeDashboard } from '@/hooks/useRealtimeSubscription';
import TrialActivationModal from '@/components/modals/trial-activation-modal';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface AnalyticsCharts {
  bookingTrend: Array<{ date: string; bookings: number; revenue: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  revenueData: Array<{ status: string; revenue: number; color: string }>;
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
  
  // Check if user has a cancelled trial (still has access until it expires)
  const isCancelledTrial = profile && (profile as any).trialStatus === 'cancelled' && profile.membershipStatus === 'pro';
  
  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    if ((!isOnTrial && !isCancelledTrial) || !(profile as any).trialEndsAt) return 0;
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

  // Fetch analytics charts data
  const { data: analyticsCharts, isLoading: chartsLoading } = useQuery<AnalyticsCharts>({
    queryKey: ['/api/dashboard/analytics-charts'],
    enabled: true
  });

  // Fetch appointments for calendar preview
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
    enabled: true
  });

  const stats = [
    {
      title: "Booking Pages",
      value: statsLoading ? "..." : (dashboardStats?.pagesCount?.toString() || "0"),
      icon: FileText,
      color: "bg-primary/10 text-primary",
      gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Total Bookings",
      value: statsLoading ? "..." : (dashboardStats?.totalAppointments?.toString() || "0"),
      icon: CalendarCheck,
      color: "bg-green-100 text-green-600",
      gradient: "from-green-500/20 to-cyan-500/20"
    },
    {
      title: "Pending",
      value: statsLoading ? "..." : (dashboardStats?.pendingAppointments?.toString() || "0"),
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-500/20 to-yellow-500/20"
    },
    {
      title: "Total Revenue",
      value: statsLoading ? "..." : formatPrice(dashboardStats?.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "Conversion Rate",
      value: statsLoading ? "..." : `${dashboardStats?.conversionRate || 0}%`,
      icon: Percent,
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Avg Booking Value",
      value: statsLoading ? "..." : formatPrice(dashboardStats?.avgBookingValue || 0),
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500/20 to-indigo-500/20"
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

  // Get upcoming appointments for calendar preview
  const upcomingAppointments = (appointments || [])
    .filter(apt => {
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

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

      {/* Cancelled Trial Banner - User still has access until trial ends */}
      {isCancelledTrial && (
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-r from-orange-500/15 via-red-500/15 to-orange-500/15 border-orange-300/50 dark:border-orange-600/50 shadow-2xl mb-8 animate-slide-down" data-testid="banner-cancelled-trial">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass-prism rounded-full flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-300/50 dark:border-orange-600/50">
                  <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Trial Cancelled
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getDaysRemaining() > 0 ? (
                      <>
                        You still have <span className="font-semibold text-orange-600 dark:text-orange-400">{getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'}</span> of Pro access
                        {(profile as any).trialEndsAt && (
                          <> • Ends {new Date((profile as any).trialEndsAt).toLocaleDateString()}</>
                        )}
                      </>
                    ) : (
                      'Your trial access is ending soon'
                    )}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onSectionChange?.('settings')}
                className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 dark:from-orange-800 dark:via-orange-700 dark:to-orange-600 hover:from-orange-200 hover:via-orange-300 hover:to-orange-400 dark:hover:from-orange-700 dark:hover:via-orange-600 dark:hover:to-orange-500 text-orange-800 dark:text-orange-100 shadow-lg border border-orange-300/50 dark:border-orange-600/50 font-semibold"
                data-testid="button-upgrade-from-cancelled-trial"
              >
                Upgrade to Keep Access
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
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
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br ${stat.gradient} border border-white/30 flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent" data-testid={`stat-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</h3>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Trend Chart */}
        {!chartsLoading && analyticsCharts && analyticsCharts.bookingTrend.length > 0 && (
          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">Booking Trends (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analyticsCharts.bookingTrend}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorBookings)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Calendar Preview */}
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Upcoming Appointments</h3>
              <Button
                onClick={() => onSectionChange?.('appointments')}
                variant="ghost"
                size="sm"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 text-gray-800 dark:text-gray-100"
                data-testid="button-view-full-calendar"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Full Calendar
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {appointmentsLoading ? (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2">⏳</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming appointments</p>
                  <Button
                    onClick={() => onSectionChange?.('pages')}
                    variant="link"
                    size="sm"
                    className="mt-2 text-blue-600 dark:text-blue-400"
                    data-testid="button-create-page"
                  >
                    Create a booking page
                  </Button>
                </div>
              ) : (
                upcomingAppointments.map((apt, index) => {
                  const appointmentDate = new Date(apt.date);
                  const isToday = appointmentDate.toDateString() === new Date().toDateString();
                  const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  let dateLabel = appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  if (isToday) dateLabel = 'Today';
                  if (isTomorrow) dateLabel = 'Tomorrow';
                  
                  const statusColors: Record<string, string> = {
                    pending: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                    accepted: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                    declined: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                    rescheduled: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  };

                  return (
                    <div 
                      key={apt.id || index} 
                      className="glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/20 rounded-lg p-3 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200"
                      data-testid={`calendar-preview-appointment-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {apt.customerName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[apt.status] || statusColors.pending}`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {apt.serviceName || 'Service'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {dateLabel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Chart */}
      {!chartsLoading && analyticsCharts && analyticsCharts.statusDistribution.length > 0 && (
        <div className="mb-8">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">Appointment Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsCharts.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsCharts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Chart (full width if exists) */}
      {!chartsLoading && analyticsCharts && analyticsCharts.revenueData.length > 0 && (
        <div className="mb-8">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">Revenue by Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsCharts.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="status" 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value) => formatPrice(Number(value))}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {analyticsCharts.revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

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
