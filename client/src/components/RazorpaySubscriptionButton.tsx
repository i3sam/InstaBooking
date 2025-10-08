import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RazorpaySubscriptionButtonProps {
  plan?: string;
  isTrial?: boolean;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  onPaymentStart?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpaySubscriptionButton({
  plan = 'pro',
  isTrial = false,
  onSuccess,
  onError,
  onCancel,
  onPaymentStart,
  disabled = false,
  className = "",
  children = "Pay with Credit / Debit card"
}: RazorpaySubscriptionButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscription = async () => {
    try {
      setIsProcessing(true);

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout script');
      }

      // Create subscription on backend
      const response = await apiRequest('POST', '/api/razorpay/subscriptions', {
        plan: plan,
        isTrial: isTrial
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const subscriptionData = await response.json();

      // Configure Razorpay subscription options
      const options = {
        key: subscriptionData.key,
        subscription_id: subscriptionData.subscriptionId,
        name: 'BookingGen Pro',
        description: isTrial ? '7-Day Free Trial - Then $14.99/month' : 'Monthly Pro Subscription - $14.99/month',
        handler: async (response: any) => {
          try {
            console.log('Razorpay subscription response:', response);
            
            // Check subscription status with retry logic (Razorpay needs time to update status)
            const checkStatus = async (retries = 8, delay = 3000): Promise<void> => {
              for (let i = 0; i < retries; i++) {
                try {
                  // Wait before EACH check to give Razorpay time to update
                  // Start with 5 seconds for the first check, then 3 seconds for subsequent checks
                  const waitTime = i === 0 ? 5000 : delay;
                  console.log(`⏱️ Waiting ${waitTime/1000}s before status check ${i + 1}...`);
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                  
                  const statusResponse = await apiRequest('GET', `/api/razorpay/subscriptions/${subscriptionData.subscriptionId}`);
                  if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    console.log(`✅ Subscription status check (attempt ${i + 1}):`, statusData);
                    
                    // If status is authenticated or active, activation is complete
                    if (statusData.status === 'authenticated' || statusData.status === 'active') {
                      console.log('🎉 Subscription activated successfully!');
                      return;
                    }
                    
                    console.log(`⏳ Status still "${statusData.status}", retrying...`);
                  } else {
                    const errorText = await statusResponse.text();
                    console.warn(`❌ Status check HTTP ${statusResponse.status} (attempt ${i + 1}):`, errorText);
                  }
                } catch (statusError) {
                  console.error(`❌ Status check failed (attempt ${i + 1}):`, statusError);
                }
              }
              
              console.log('⚠️ Status checks complete. Webhook will activate your membership shortly.');
            };
            
            // Start status check in background (don't await - let it run)
            checkStatus().catch(err => console.error('Status check error:', err));
            
            toast({
              title: isTrial ? "Free Trial Activated!" : "Subscription Created!",
              description: isTrial ? "Your 7-day free trial has started. You won't be charged until the trial ends." : "Your monthly Pro subscription is now active.",
            });

            if (onSuccess) {
              onSuccess(subscriptionData.subscriptionId);
            }
          } catch (error) {
            console.error('Subscription handler error:', error);
            toast({
              title: "Subscription Setup Failed",
              description: "There was an issue setting up your subscription. Please contact support.",
              variant: "destructive",
            });

            if (onError) {
              onError(error);
            }
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          plan: plan,
          type: 'subscription'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: "Subscription Cancelled",
              description: "You can try again anytime.",
            });
            
            if (onCancel) {
              onCancel();
            }
          }
        }
      };

      // Open Razorpay subscription checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

      // Call onPaymentStart callback to notify parent component that payment popup has opened
      if (onPaymentStart) {
        onPaymentStart();
      }

    } catch (error) {
      console.error('Subscription initialization failed:', error);
      setIsProcessing(false);
      
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to initialize subscription. Please try again.",
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Button
      onClick={handleSubscription}
      disabled={disabled || isProcessing}
      className={className}
      data-testid="button-razorpay-subscription"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Setting up subscription...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}