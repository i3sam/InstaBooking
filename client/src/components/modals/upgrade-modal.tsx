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
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl max-w-2xl mx-auto rounded-3xl overflow-hidden" data-testid="modal-upgrade">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
          
          <div className="relative z-10 p-8">
            <DialogHeader className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto group animate-fade-in-up">
                  <Crown className="h-8 w-8 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Upgrade to Pro
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Unlock all features and take your booking business to the next level</p>
            </DialogHeader>
        
            <div className="space-y-8">
              {/* Currency Selector */}
              <div className="flex justify-center">
                <CurrencySelector variant="compact" />
              </div>
              
              {/* Plan Details */}
              <div className="glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
                <Badge className="absolute top-6 right-6 glass-prism-button text-white shadow-lg animate-pulse">
                  50% OFF!
                </Badge>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mr-4 backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/30">
                    <Crown className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Pro Plan</h3>
                    <p className="text-gray-600 dark:text-gray-300">Everything you need to succeed</p>
                  </div>
                </div>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(14.99)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-3 text-lg">/month</span>
                  <div className="ml-4 glass-prism backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1">
                    <span className="text-red-600 dark:text-red-400 text-sm font-semibold line-through">{formatPrice(29.99)}</span>
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
                      <div className="w-5 h-5 glass-prism rounded-full flex items-center justify-center mr-3 backdrop-blur-md bg-green-500/20 border border-green-500/30">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Plan Info */}
              <div className="glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      Current Plan: {profile?.membershipStatus === 'pro' ? 'Pro' : 'Starter'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profile?.membershipStatus === 'pro' ? 'All features included' : 'Limited features - upgrade to unlock everything'}
                    </p>
                  </div>
                  <Badge className={profile?.membershipStatus === 'pro' ? 'glass-prism-button text-white' : 'glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 text-gray-700 dark:text-gray-300'}>
                    {profile?.membershipStatus === 'pro' ? 'Pro' : 'Starter'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-12 glass-prism backdrop-blur-md bg-transparent border border-white/20 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300 text-gray-700 dark:text-gray-300"
                  data-testid="button-cancel-upgrade"
                >
                  Maybe Later
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="flex-1 h-12 glass-prism-button text-white shadow-lg backdrop-blur-lg hover:scale-105 transition-all duration-300"
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