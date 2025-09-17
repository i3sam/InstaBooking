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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="relative w-64 h-full">
              <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
            </div>
          </div>
        )}
        
        <div className="flex-1 w-full lg:w-auto">
          {/* Header */}
          <header className="dashboard-header px-4 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-foreground" />
                  ) : (
                    <Menu className="h-6 w-6 text-foreground" />
                  )}
                </button>
                
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground text-sm lg:text-base">Manage your booking pages and appointments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-medium text-muted-foreground">
                      {(user?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-foreground" data-testid="text-username">
                      {profile?.fullName || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-membership-status">
                      {profile?.membershipStatus === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-8">
            {renderContent()}
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
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl text-red-500 mb-4">⚠️</div>
            <p className="text-red-600">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
        <p className="text-muted-foreground">Track your booking performance and revenue</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
              <div className="w-4 h-4 text-blue-600">📊</div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {statsLoading ? "..." : `${dashboardStats?.conversionRate || 0}%`}
            </div>
            <p className="text-sm text-blue-600">
              {statsLoading 
                ? "Loading..." 
                : (dashboardStats?.totalAppointments || 0) === 0 
                  ? "Create pages to track conversions" 
                  : `From ${dashboardStats?.totalAppointments || 0} total bookings`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Avg. Booking Value</h3>
              <div className="w-4 h-4 text-purple-600">📈</div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">
              {statsLoading ? "..." : formatPrice(dashboardStats?.avgBookingValue || 0)}
            </div>
            <p className="text-sm text-purple-600">
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

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Key Metrics</h3>
          {statsLoading ? (
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-muted-foreground mb-4">⏳</div>
                <p className="text-muted-foreground">Loading analytics data...</p>
              </div>
            </div>
          ) : dashboardStats?.totalAppointments === 0 ? (
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-muted-foreground mb-4">📊</div>
                <p className="text-muted-foreground">Analytics will appear here once you have booking data</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">{dashboardStats?.pagesCount || 0}</div>
                <p className="text-sm text-muted-foreground">Active Pages</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">{dashboardStats?.totalAppointments || 0}</div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">{dashboardStats?.pendingAppointments || 0}</div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">{formatPrice(dashboardStats?.totalRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
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
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
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
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  data-testid="button-save-changes"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">Receive booking confirmations and updates via email</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">SMS Reminders</p>
                    <p className="text-sm text-muted-foreground mt-1">Get text reminders for upcoming appointments</p>
                  </div>
                  <Checkbox className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Marketing Updates</p>
                    <p className="text-sm text-muted-foreground mt-1">Receive product updates and helpful tips</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Plan Status - Clean and Simple */}
        {profile?.membershipStatus === 'pro' && (
          <Card className="mt-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Current Plan</h3>
                  <p className="text-muted-foreground">Pro Plan - All features unlocked</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 font-medium mb-1">Active</div>
                  {profile?.membershipExpires && (
                    <p className="text-sm text-muted-foreground">
                      Renews {new Date(profile.membershipExpires).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extras Section */}
        <Card className="mt-8">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">Extras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center h-12 text-left"
                onClick={() => setLocation('/report-bug')}
                data-testid="button-report-bug"
              >
                <Bug className="h-4 w-4 mr-2 text-red-500" />
                Report a Bug
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center h-12 text-left"
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
        <Card className="mt-8">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center h-12"
                onClick={() => setLocation('/')}
                data-testid="button-back-home"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
              <Button
                variant="destructive"
                className="flex items-center justify-center h-12"
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
