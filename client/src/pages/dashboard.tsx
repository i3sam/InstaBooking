import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Overview from '@/components/dashboard/overview';
import PagesList from '@/components/dashboard/pages-list';
import AppointmentsList from '@/components/dashboard/appointments-list';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Crown, LogOut, Home, Menu, X, Bug, Lightbulb } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import UpgradeModal from '@/components/modals/upgrade-modal';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'pages':
        return <PagesList />;
      case 'appointments':
        return <AppointmentsList />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <Overview onSectionChange={setActiveSection} />;
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when section changes
  };

  return (
    <div className="min-h-screen page-gradient animate-fade-in relative overflow-hidden">
      {/* Glass prism background effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-green-400/10 via-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>
      
      <div className="flex relative z-10">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="relative w-64 h-full animate-slide-in-left">
              <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
            </div>
          </div>
        )}
        
        <div className="flex-1 w-full lg:w-auto">
          {/* Header */}
          <header className="glass-prism-card mx-4 lg:mx-8 my-6 px-6 py-4 backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl glass-prism backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  )}
                </button>
                
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">Manage your booking pages and appointments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full glass-prism flex items-center justify-center backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30">
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200">
                      {(user?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100" data-testid="text-username">
                      {profile?.fullName || user?.email}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="text-membership-status">
                      {profile?.membershipStatus === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-8">
            <div className="animate-slide-up">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardStats {
  pagesCount: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  conversionRate: number;
  avgBookingValue: number;
}

function AnalyticsSection() {
  const { formatPrice } = useCurrency();

  // Fetch dashboard statistics for analytics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true
  });

  // Check for errors first
  if (!statsLoading && dashboardStats === undefined) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
          <p className="text-muted-foreground">Track your booking performance and revenue</p>
        </div>
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-red-300/20 shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-4xl text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">Track your booking performance and revenue</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</h3>
              <div className="w-8 h-8 rounded-lg glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">📊</span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {statsLoading ? "..." : `${dashboardStats?.conversionRate || 0}%`}
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {statsLoading 
                ? "Loading..." 
                : (dashboardStats?.totalAppointments || 0) === 0 
                  ? "Create pages to track conversions" 
                  : `From ${dashboardStats?.totalAppointments || 0} total bookings`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Booking Value</h3>
              <div className="w-8 h-8 rounded-lg glass-prism backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400">📈</span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {statsLoading ? "..." : formatPrice(dashboardStats?.avgBookingValue || 0)}
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {statsLoading 
                ? "Loading..." 
                : (dashboardStats?.totalAppointments || 0) === 0 
                  ? "No bookings yet" 
                  : `Total revenue: ${formatPrice(dashboardStats?.totalRevenue || 0)}`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Key Metrics</h3>
          {statsLoading ? (
            <div className="h-64 glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
              </div>
            </div>
          ) : dashboardStats?.totalAppointments === 0 ? (
            <div className="h-64 glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">📊</div>
                <p className="text-gray-600 dark:text-gray-400">Analytics will appear here once you have booking data</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{dashboardStats?.pagesCount || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Pages</p>
              </div>
              <div className="text-center p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-white/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{dashboardStats?.totalAppointments || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              </div>
              <div className="text-center p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-white/20 rounded-xl">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">{dashboardStats?.pendingAppointments || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
              </div>
              <div className="text-center p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">{formatPrice(dashboardStats?.totalRevenue || 0)}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSection() {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: user?.email || '',
    timezone: 'pacific'
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string; timezone: string }) => {
      const response = await apiRequest('PATCH', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated!",
        description: "Your profile changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Profile Information</h3>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                updateProfileMutation.mutate({
                  fullName: formData.fullName,
                  timezone: formData.timezone
                });
              }}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="h-12"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    value={formData.email}
                    disabled
                    className="h-12 bg-muted/50"
                    data-testid="input-email"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pacific">UTC-08:00 (Pacific Time)</SelectItem>
                      <SelectItem value="eastern">UTC-05:00 (Eastern Time)</SelectItem>
                      <SelectItem value="gmt">UTC+00:00 (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 glass-prism-button text-white shadow-lg backdrop-blur-lg" 
                  data-testid="button-save-changes"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive booking confirmations and updates via email</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">SMS Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get text reminders for upcoming appointments</p>
                  </div>
                  <Checkbox className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">Marketing Updates</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive product updates and helpful tips</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Plan Status - Clean and Simple */}
        {profile?.membershipStatus === 'pro' && (
          <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Current Plan</h3>
                  <p className="text-gray-600 dark:text-gray-300">Pro Plan - All features unlocked</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Active</div>
                  {profile?.membershipExpires && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Renews {new Date(profile.membershipExpires).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extras Section */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Extras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 text-left"
                onClick={() => setLocation('/report-bug')}
                data-testid="button-report-bug"
              >
                <Bug className="h-4 w-4 mr-2 text-red-500" />
                Report a Bug
              </Button>
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 text-left"
                onClick={() => setLocation('/request-feature')}
                data-testid="button-request-feature"
              >
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                Request a Feature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Account Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 w-full"
                onClick={() => setLocation('/')}
                data-testid="button-back-home"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
              <Button
                variant="destructive"
                className="glass-prism backdrop-blur-md bg-red-500 dark:bg-red-600 border-2 border-red-400 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold transition-all duration-300 flex items-center justify-center h-12 w-full shadow-lg hover:shadow-xl"
                onClick={() => {
                  logout();
                  setLocation('/');
                }}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}
