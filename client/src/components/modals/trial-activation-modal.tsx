import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, CreditCard, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import RazorpaySubscriptionButton from '@/components/RazorpaySubscriptionButton';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useCurrency } from '@/hooks/use-currency';

interface TrialActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialActivationModal({ isOpen, onClose }: TrialActivationModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [showPayment, setShowPayment] = useState(false);

  const handleActivateTrial = () => {
    setShowPayment(true);
  };

  const handleTrialSuccess = async (subscriptionId: string) => {
    try {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      
      toast({
        title: "Free Trial Activated! 🎉",
        description: "Your 7-day free trial has started. You won't be charged until the trial ends.",
      });
      
      onClose();
    } catch (error) {
      console.error('Profile refresh failed:', error);
      toast({
        title: "Trial activated",
        description: "Your free trial has started successfully. Please refresh the page.",
      });
      onClose();
    }
  };

  const handleTrialError = (error: any) => {
    console.error('Trial activation error:', error);
    toast({
      title: "Trial activation failed",
      description: "There was an error activating your trial. Please try again.",
      variant: "destructive",
    });
  };

  if (!profile || (profile as any).trialStatus !== 'available') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-purple-50/80 to-white/90 dark:from-gray-900/95 dark:via-purple-950/80 dark:to-gray-900/90 border border-white/30 dark:border-white/20 shadow-2xl max-w-lg sm:max-w-xl md:max-w-2xl mx-auto rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto" data-testid="modal-trial-activation">
        <div className="relative">
          {/* Glass prism background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 glass-prism bg-gradient-to-br from-white/20 via-purple-50/30 to-white/15 rounded-full -translate-y-20 translate-x-20 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 glass-prism bg-gradient-to-br from-purple-50/25 via-white/20 to-purple-50/15 rounded-full translate-y-16 -translate-x-16 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            <DialogHeader className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto group animate-fade-in-up backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/40 to-white/50 border border-white/30">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 dark:from-purple-100 dark:to-white bg-clip-text text-transparent">
                Start Your 7-Day Free Trial
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Experience all Pro features with no charge for 7 days
              </DialogDescription>
            </DialogHeader>
        
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Trial Info Card */}
              <div className="glass-prism-card backdrop-blur-md bg-gradient-to-br from-white/90 via-purple-50/70 to-white/80 dark:from-gray-900/90 dark:via-purple-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl">
                <Badge className="absolute top-4 right-4 sm:top-6 sm:right-6 glass-prism-button backdrop-blur-md bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 text-purple-800 dark:text-purple-100 shadow-lg animate-pulse border border-white/30 px-3 py-1 sm:px-4 sm:py-2 font-semibold text-xs sm:text-sm">
                  100% FREE
                </Badge>
                
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mr-4 backdrop-blur-md bg-gradient-to-br from-white/50 via-purple-50/40 to-white/40 border border-white/30">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 dark:from-purple-100 dark:to-white bg-clip-text text-transparent">7-Day Free Trial</h3>
                    <p className="text-gray-600 dark:text-gray-300">Then {formatPrice(14.99)}/month</p>
                  </div>
                </div>
                
                {/* How it works */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 glass-prism rounded-lg flex items-center justify-center mr-3 flex-shrink-0 backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/50 to-white/40 border border-white/30">
                      <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No charge now</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">We'll only capture your payment method, no charges for 7 days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 glass-prism rounded-lg flex items-center justify-center mr-3 flex-shrink-0 backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/50 to-white/40 border border-white/30">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Full access immediately</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Get instant access to all Pro features during your trial</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 glass-prism rounded-lg flex items-center justify-center mr-3 flex-shrink-0 backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/50 to-white/40 border border-white/30">
                      <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Automatic billing after trial</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">After 7 days, you'll be charged {formatPrice(14.99)}/month. Cancel anytime.</p>
                    </div>
                  </div>
                </div>
                
                {/* Features included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Unlimited booking pages",
                    "Custom branding",
                    "Analytics dashboard",
                    "Priority support",
                    "Full customization",
                    "Mobile optimized",
                    "No usage limits"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <div className="w-5 h-5 glass-prism rounded-full flex items-center justify-center mr-3 backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/50 to-white/40 border border-white/30">
                        <Check className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Setup Section */}
              {showPayment && (
                <div className="glass-prism-card backdrop-blur-md bg-gradient-to-br from-white/90 via-purple-50/70 to-white/80 dark:from-gray-900/90 dark:via-purple-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 dark:from-purple-100 dark:to-white bg-clip-text text-transparent mb-2">
                      Setup Your Payment Method
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Secure payment setup with Razorpay - No charge for 7 days
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <div className="glass-prism-card backdrop-blur-sm bg-gradient-to-br from-white/80 via-purple-50/60 to-white/70 dark:from-gray-800/80 dark:via-purple-950/60 dark:to-gray-800/70 border border-white/30 dark:border-white/20 rounded-xl p-6" data-testid="section-trial-payment">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 glass-prism rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-purple-50/50 to-white/40 border border-white/30">
                          <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Add Payment Method</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">7 days free, then {formatPrice(14.99)}/month</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Cancel anytime during trial • No charge until trial ends</p>
                      </div>
                      <RazorpaySubscriptionButton
                        plan="pro"
                        isTrial={true}
                        onSuccess={(subscriptionId) => {
                          console.log('Trial subscription successful:', subscriptionId);
                          handleTrialSuccess(subscriptionId);
                        }}
                        onError={handleTrialError}
                        onCancel={() => {
                          toast({
                            title: "Trial setup cancelled",
                            description: "You can activate your trial anytime.",
                            variant: "default",
                          });
                        }}
                        onPaymentStart={() => {
                          onClose();
                        }}
                        className="w-full glass-prism-button backdrop-blur-lg bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 hover:from-purple-200 hover:via-purple-300 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-500 text-purple-800 dark:text-purple-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 font-semibold h-12"
                      >
                        Start Free Trial
                      </RazorpaySubscriptionButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-12 glass-prism backdrop-blur-md bg-gradient-to-r from-white/40 via-purple-50/30 to-white/30 dark:from-gray-800/40 dark:via-purple-950/30 dark:to-gray-800/30 border border-white/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 text-purple-700 dark:text-purple-300 font-medium"
                  data-testid="button-cancel-trial"
                >
                  Maybe Later
                </Button>
                {!showPayment && (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleActivateTrial}
                    className="flex-1 h-12 glass-prism-button backdrop-blur-lg bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 hover:from-purple-200 hover:via-purple-300 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-500 text-purple-800 dark:text-purple-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 font-semibold"
                    data-testid="button-activate-trial"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Activate Free Trial
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
