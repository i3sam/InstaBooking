import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useCurrency } from '@/hooks/use-currency';
import { useQuery } from '@tanstack/react-query';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubscriptionDetails {
  subscriptionId: string;
  status: string;
  planId: string;
  plan: string;
  createdAt: string;
  amount: number;
  currency: string;
  nextBillingDate?: string;
  isTrial?: boolean;
}

interface PaymentHistory {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  plan: string;
}

export default function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch user's subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: isOpen && !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      return response.json();
    }
  });

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
    enabled: isOpen && !!user,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/payments');
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return response.json();
    }
  });

  const activeSubscription = subscriptions?.find((sub: SubscriptionDetails) => {
    const status = sub.status?.toLowerCase();
    return status === 'active' || status === 'authenticated' || status === 'created' || sub.isTrial;
  });

  // Fallback: Create a pseudo-subscription from profile data if user has Pro status but no subscription record
  // This handles legacy users who upgraded before subscription records were created for one-time payments
  const displaySubscription = activeSubscription || (profile?.membershipStatus === 'pro' && profile?.membershipExpires ? {
    subscriptionId: 'legacy',
    status: 'active',
    planId: 'pro',
    plan: 'pro',
    // Calculate start date: 1 year before the expiration date (or current date if expiration is in the past)
    createdAt: profile.membershipExpires ? new Date(Math.min(
      new Date(profile.membershipExpires).getTime() - (365 * 24 * 60 * 60 * 1000),
      Date.now()
    )).toISOString() : new Date().toISOString(),
    amount: 14.99,
    currency: 'USD',
    nextBillingDate: profile.membershipExpires
  } : null);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await apiRequest('POST', '/api/razorpay/cancel-subscription', {});
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
        await refetchSubscriptions();
        toast({
          title: "Subscription cancelled",
          description: "Your subscription will remain active until the end of your billing period.",
        });
        onClose();
      } else {
        const errorData = await response.json();
        // If no active subscription found, show a helpful message
        if (response.status === 404) {
          toast({
            title: "Unable to cancel",
            description: "No active subscription found. Please contact support for assistance.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.error || 'Failed to cancel subscription');
        }
      }
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl max-w-4xl mx-auto rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto" data-testid="modal-billing">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center">
            <CreditCard className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
            Billing & Subscription Management
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your subscription, view billing history, and update payment settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">Billing History</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Current Plan */}
              <Card className="glass-prism-card backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Crown className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptionsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading subscription details...</span>
                    </div>
                  ) : profile?.membershipStatus === 'pro' && displaySubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">Pro Plan</h3>
                          <p className="text-gray-600 dark:text-gray-400">All features unlocked</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(displaySubscription.status)}
                          <p className="text-2xl font-bold mt-1">{formatPrice(displaySubscription.amount)}<span className="text-sm font-normal text-gray-500">/month</span></p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile?.membershipExpires && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Next billing date</p>
                              <p className="font-medium">{formatDate(profile.membershipExpires)}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Plan started</p>
                            <p className="font-medium">{displaySubscription.createdAt ? formatDate(displaySubscription.createdAt) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {['Unlimited pages', 'Custom branding', 'Analytics', 'Priority support'].map((feature) => (
                          <div key={feature} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">You're currently on the free plan</p>
                      <Button 
                        onClick={() => {
                          onClose();
                          // This would open the upgrade modal - you can implement this flow
                        }}
                        className="glass-prism-button text-white"
                        data-testid="button-upgrade-now"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="glass-prism-card backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading payment history...</span>
                    </div>
                  ) : payments && payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map((payment: PaymentHistory) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-black/5 border border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">{payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan Payment</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.createdAt)} • {payment.paymentMethod}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${payment.amount}</p>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(payment.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-download-${payment.id}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
                      <p className="text-gray-600 dark:text-gray-400">Your payment history will appear here once you make a purchase</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-prism-card backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    Subscription Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile?.membershipStatus === 'pro' && displaySubscription ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Cancel Subscription</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                          Once cancelled, you'll continue to have access to Pro features until the end of your current billing period. 
                          After that, your account will be downgraded to the free plan.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={cancelLoading}
                          data-testid="button-cancel-subscription-modal"
                        >
                          {cancelLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Need Help?</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                          If you're experiencing issues with your subscription or have questions about billing, 
                          our support team is here to help.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            onClose();
                            window.location.href = '/contact';
                          }}
                          data-testid="button-contact-support"
                        >
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                      <p className="text-gray-600 dark:text-gray-400">Subscribe to Pro to access subscription management features</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}