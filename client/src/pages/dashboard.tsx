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
import { Bell, Crown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1">
          {/* Header */}
          <header className="dashboard-header px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Manage your booking pages and appointments</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {(user?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid="text-username">
                      {profile?.fullName || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-membership-status">
                      {profile?.membershipStatus === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection() {
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
            <div className="text-3xl font-bold text-foreground mb-2">--%</div>
            <p className="text-sm text-blue-600">Create pages to track conversions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Avg. Booking Value</h3>
              <div className="w-4 h-4 text-purple-600">📈</div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">$0</div>
            <p className="text-sm text-purple-600">No bookings yet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Booking Trends</h3>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-muted-foreground mb-4">📊</div>
              <p className="text-muted-foreground">Analytics will appear here once you have booking data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate({
                fullName: formData.fullName,
                timezone: formData.timezone
              });
            }}>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  data-testid="input-fullname"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={formData.email}
                  disabled
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Time Zone</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pacific">UTC-08:00 (Pacific Time)</SelectItem>
                    <SelectItem value="eastern">UTC-05:00 (Eastern Time)</SelectItem>
                    <SelectItem value="gmt">UTC+00:00 (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="button-gradient" data-testid="button-save-changes">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive booking confirmations via email</p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">SMS Reminders</p>
                  <p className="text-sm text-muted-foreground">Get text reminders for upcoming appointments</p>
                </div>
                <Checkbox />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Marketing Updates</p>
                  <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                </div>
                <Checkbox defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
