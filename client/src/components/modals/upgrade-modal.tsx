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

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
        amount: 10
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
      <DialogContent className="sm:max-w-lg" data-testid="modal-upgrade">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Crown className="h-6 w-6 text-primary mr-2" />
            Upgrade to Professional
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 relative overflow-hidden">
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <div className="flex items-center mb-4">
              <Crown className="h-8 w-8 text-primary mr-3" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Professional</h3>
                <p className="text-muted-foreground">Perfect for growing businesses</p>
              </div>
            </div>
            
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                "Unlimited booking pages",
                "Advanced customization options",
                "Unlimited appointments",
                "Payment processing",
                "Priority customer support",
                "Analytics & reporting",
                "Custom branding"
              ].map((feature) => (
                <div key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Current Plan: Free</p>
                <p className="text-sm text-muted-foreground">Limited features</p>
              </div>
              <Badge variant="outline">Free</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-upgrade"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="flex-1 button-gradient"
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
                  Upgrade Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}