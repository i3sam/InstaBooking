import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { initializeRazorpay, openRazorpayCheckout } from '@/lib/razorpay';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useCurrency } from '@/hooks/use-currency';
import CurrencySelector from '@/components/ui/currency-selector';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { formatPrice, convertPrice, selectedCurrency } = useCurrency();

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        toast({
          title: "Error",
          description: "Payment service is not available. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const response = await apiRequest('POST', '/api/payments/create-order', {
        plan: 'pro',
        amount: 14.99,
        currency: selectedCurrency.code
      });
      const { orderId, amount, currency } = await response.json();

      // Open Razorpay checkout
      openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount,
        currency,
        name: 'BookingGen',
        description: 'Pro Plan - Monthly',
        order_id: orderId,
        handler: async (paymentResponse: any) => {
          try {
            // Verify payment
            await apiRequest('POST', '/api/payments/verify', {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            // Invalidate profile query to refresh user data
            queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
            
            toast({
              title: "Success!",
              description: "You've successfully upgraded to Pro! Your new features are now available.",
            });
            
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment verification failed",
              description: "Your payment was processed but verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: profile?.fullName || user.email,
          email: user.email,
        },
        theme: {
          color: '#2563eb',
        },
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "Something went wrong while processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-blue-50/80 to-white/90 dark:from-gray-900/95 dark:via-blue-950/80 dark:to-gray-900/90 border border-white/30 dark:border-white/20 shadow-2xl max-w-lg sm:max-w-xl md:max-w-2xl mx-auto rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto" data-testid="modal-upgrade">
        <div className="relative">
          {/* Glass prism background decorations matching app theme */}
          <div className="absolute top-0 right-0 w-40 h-40 glass-prism bg-gradient-to-br from-white/20 via-blue-50/30 to-white/15 rounded-full -translate-y-20 translate-x-20 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 glass-prism bg-gradient-to-br from-blue-50/25 via-white/20 to-blue-50/15 rounded-full translate-y-16 -translate-x-16 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-20 glass-prism bg-gradient-to-r from-white/15 via-blue-50/25 to-white/15 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-40"></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            <DialogHeader className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto group animate-fade-in-up backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30">
                  <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">
                Upgrade to Pro
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Unlock all features and take your booking business to the next level</p>
            </DialogHeader>
        
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Currency Selector */}
              <div className="flex justify-center">
                <CurrencySelector variant="compact" />
              </div>
              
              {/* Plan Details */}
              <div className="glass-prism-card backdrop-blur-md bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl">
                <Badge className="absolute top-4 right-4 sm:top-6 sm:right-6 glass-prism-button backdrop-blur-md bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-100 shadow-lg animate-pulse border border-white/30 px-3 py-1 sm:px-4 sm:py-2 font-semibold text-xs sm:text-sm">
                  50% OFF!
                </Badge>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mr-4 backdrop-blur-md bg-gradient-to-br from-white/50 via-blue-50/40 to-white/40 border border-white/30">
                    <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">Pro Plan</h3>
                    <p className="text-gray-600 dark:text-gray-300">Everything you need to succeed</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-baseline mb-6 sm:mb-8 gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{formatPrice(14.99)}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">/month</span>
                  <div className="glass-prism backdrop-blur-md bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 border border-white/30 rounded-lg px-2 sm:px-3 py-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold line-through">{formatPrice(29.99)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Unlimited booking pages",
                    "Custom branding",
                    "Payment processing",
                    "Analytics dashboard",
                    "Priority support",
                    "Full customization",
                    "Mobile optimized",
                    "No usage limits"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <div className="w-5 h-5 glass-prism rounded-full flex items-center justify-center mr-3 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/50 to-white/40 border border-white/30">
                        <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Plan Info */}
              <div className="glass-prism-card backdrop-blur-md bg-gradient-to-r from-white/80 via-blue-50/60 to-white/70 dark:from-gray-900/80 dark:via-blue-950/60 dark:to-gray-900/70 border border-white/30 dark:border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      Current Plan: {profile?.membershipStatus === 'pro' ? 'Pro' : 'Starter'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profile?.membershipStatus === 'pro' ? 'All features included' : 'Limited features - upgrade to unlock everything'}
                    </p>
                  </div>
                  <Badge className={profile?.membershipStatus === 'pro' ? 'glass-prism-button bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-100 border border-white/30' : 'glass-prism bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-200 border border-white/30'}>
                    {profile?.membershipStatus === 'pro' ? 'Pro' : 'Starter'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-12 glass-prism backdrop-blur-md bg-gradient-to-r from-white/40 via-blue-50/30 to-white/30 dark:from-gray-800/40 dark:via-blue-950/30 dark:to-gray-800/30 border border-white/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 text-blue-700 dark:text-blue-300 font-medium"
                  data-testid="button-cancel-upgrade"
                >
                  Maybe Later
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="flex-1 h-12 glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 hover:from-blue-200 hover:via-blue-300 hover:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-blue-800 dark:text-blue-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 font-semibold"
                  data-testid="button-confirm-upgrade"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}