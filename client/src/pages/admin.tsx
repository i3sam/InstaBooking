import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Search, User, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userStatus, setUserStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!adminKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an admin key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate admin key by making a test request to the server
      const response = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid admin key');
      }

      setIsAuthenticated(true);
      toast({
        title: "Authenticated",
        description: "Admin access granted",
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Invalid admin key",
        variant: "destructive",
      });
      setAdminKey('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/user-status/${userId}`, {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setIsAuthenticated(false);
          throw new Error('Invalid admin key');
        }
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();
      setUserStatus(data);
      toast({
        title: "Success",
        description: "User status loaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user status",
        variant: "destructive",
      });
      setUserStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white dark:text-gray-900" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter your admin key to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              data-testid="input-admin-key"
            />
            <Button 
              onClick={handleAuth} 
              className="w-full"
              disabled={isLoading}
              data-testid="button-auth-admin"
            >
              {isLoading ? 'Validating...' : 'Authenticate'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">User subscription management</p>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Lock className="h-4 w-4 mr-2" />
            Authenticated
          </Badge>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>User Lookup</CardTitle>
            <CardDescription>Search for a user by their ID or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="User ID or Email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-user-id"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                data-testid="button-search-user"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Status */}
        {userStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="font-mono text-sm" data-testid="text-profile-id">{userStatus.profile.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p data-testid="text-profile-email">{userStatus.profile.email || userStatus.profile.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Membership Status</p>
                  <Badge variant={userStatus.profile.membershipStatus === 'pro' ? 'default' : 'secondary'} data-testid="badge-membership-status">
                    {userStatus.profile.membershipStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Membership Expires</p>
                  <p data-testid="text-membership-expires">
                    {userStatus.profile.membershipExpires 
                      ? new Date(userStatus.profile.membershipExpires).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trial Status</p>
                  <Badge variant="outline" data-testid="badge-trial-status">{userStatus.profile.trialStatus}</Badge>
                </div>
                {userStatus.profile.trialEndsAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trial Ends</p>
                    <p data-testid="text-trial-ends">
                      {new Date(userStatus.profile.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStatus.subscriptions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
                ) : (
                  <div className="space-y-4">
                    {userStatus.subscriptions.map((sub: any) => (
                      <div key={sub.id} className="border rounded-lg p-4 space-y-2" data-testid={`subscription-${sub.id}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{sub.planName}</p>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {sub.currency} {sub.amount}
                          {sub.isTrial && <span className="ml-2 text-blue-600">(Trial)</span>}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{sub.id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStatus.payments.length === 0 ? (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-5 w-5" />
                    <p>No payment records found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userStatus.payments.map((payment: any) => (
                      <div key={payment.id} className="border rounded-lg p-4 flex items-center justify-between" data-testid={`payment-${payment.id}`}>
                        <div>
                          <p className="font-medium">{payment.plan}</p>
                          <p className="text-sm text-gray-500">
                            {payment.currency} {payment.amount}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
