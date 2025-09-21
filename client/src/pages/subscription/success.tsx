import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Crown } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const processSubscription = async () => {
      try {
        // Get subscription ID from URL params or session storage
        const urlParams = new URLSearchParams(window.location.search);
        const subscriptionId = urlParams.get('subscription_id') || 
                             sessionStorage.getItem('pendingSubscriptionId');
        
        if (!subscriptionId) {
          throw new Error('No subscription ID found');
        }

        // Get subscription details from PayPal to confirm it's active
        const response = await apiRequest('GET', `/api/paypal/subscriptions/${subscriptionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to verify subscription');
        }

        const subscription = await response.json();
        setSubscriptionData(subscription);

        // Clear session storage
        sessionStorage.removeItem('pendingSubscriptionId');
        sessionStorage.removeItem('subscriptionPlanKey');

        // Refresh user profile to show new membership status
        await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });

        toast({
          title: "Subscription Activated!",
          description: `Your ${subscription.status === 'ACTIVE' ? 'Pro' : 'subscription'} membership is now active. You have access to all premium features.`,
        });

      } catch (error) {
        console.error('Subscription processing failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to process subscription');
        
        toast({
          title: "Subscription Error",
          description: "There was an issue processing your subscription. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processSubscription();
  }, [toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background page-gradient flex items-center justify-center">
        <Header />
        <Card className="w-full max-w-md mx-auto glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-blue-50/80 to-white/90 dark:from-gray-900/95 dark:via-blue-950/80 dark:to-gray-900/90 border border-white/30 dark:border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Processing your subscription...</h2>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we activate your Pro membership.</p>
          </CardContent>
        </Card>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background page-gradient">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-auto glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-red-50/80 to-white/90 dark:from-gray-900/95 dark:via-red-950/80 dark:to-gray-900/90 border border-red-200/30 dark:border-red-800/20 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600 dark:text-red-400">Subscription Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => setLocation('/pricing')}
                  className="w-full"
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                  className="w-full"
                  data-testid="button-dashboard"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-gradient">
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg mx-auto glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-green-50/80 to-white/90 dark:from-gray-900/95 dark:via-green-950/80 dark:to-gray-900/90 border border-green-200/30 dark:border-green-800/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
              <Crown className="h-6 w-6" />
              Subscription Activated!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Welcome to Pro!
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Your subscription is now active and you have access to all premium features.
              </p>
            </div>

            {subscriptionData && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subscription ID:</span>
                  <span className="font-mono text-xs">{subscriptionData.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {subscriptionData.status}
                  </span>
                </div>
                {subscriptionData.billing_info?.next_billing_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Next Billing:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(subscriptionData.billing_info.next_billing_time).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-dashboard"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/pages/create')}
                className="w-full"
                data-testid="button-create-page"
              >
                Create Your First Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}