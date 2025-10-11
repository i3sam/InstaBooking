import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalSubscriptionButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalSubscriptionButton({ 
  onSuccess, 
  onError 
}: PayPalSubscriptionButtonProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  const buttonRenderedRef = useRef(false);

  useEffect(() => {
    if (!user || !paypalRef.current || buttonRenderedRef.current) return;

    const loadPayPalScript = async () => {
      try {
        // Check if PayPal script is already loaded
        if (window.paypal && scriptLoadedRef.current) {
          renderPayPalButton();
          return;
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
        
        if (!clientId) {
          if (isMountedRef.current) {
            setError('PayPal Client ID not configured');
            setIsLoading(false);
            toast({
              title: "Configuration Error",
              description: "PayPal is not properly configured. Please contact support.",
              variant: "destructive",
            });
          }
          return;
        }
        
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          if (isMountedRef.current) {
            renderPayPalButton();
          }
        };
        
        script.onerror = () => {
          if (isMountedRef.current) {
            setError('Failed to load PayPal SDK');
            setIsLoading(false);
            toast({
              title: "Error",
              description: "Failed to load PayPal payment system",
              variant: "destructive",
            });
          }
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal:', err);
        if (isMountedRef.current) {
          setError('Failed to initialize PayPal');
          setIsLoading(false);
        }
      }
    };

    const renderPayPalButton = () => {
      if (!window.paypal || !paypalRef.current || buttonRenderedRef.current) return;

      // Mark button as rendered to prevent re-rendering
      buttonRenderedRef.current = true;

      // Capture profile at render time to avoid dependency issues
      const userName = profile?.fullName || user.fullName;

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'subscribe',
          height: 45,
        },
        createSubscription: async (data: any, actions: any) => {
          try {
            // Create subscription on our backend
            const response = await apiRequest('POST', '/api/paypal/subscription', {
              userId: user.id,
              userEmail: user.email,
              userName: userName,
            });

            const result = await response.json();

            if (!result.subscriptionId) {
              throw new Error('Failed to create subscription');
            }

            return result.subscriptionId;
          } catch (err) {
            console.error('Subscription creation error:', err);
            toast({
              title: "Error",
              description: "Failed to create subscription. Please try again.",
              variant: "destructive",
            });
            throw err;
          }
        },
        onApprove: async (data: any) => {
          try {
            console.log('Subscription approved:', data.subscriptionID);

            // Wait a moment for webhook to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // First try to check if webhook already activated it
            await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
            let profileResponse = await apiRequest('GET', '/api/profile');
            let updatedProfile = await profileResponse.json();

            if (updatedProfile.membershipStatus === 'pro') {
              toast({
                title: "Success!",
                description: "Your PayPal subscription has been activated. Welcome to Pro!",
              });
            } else {
              // Webhook might be delayed, use fallback to check and activate
              console.log('Webhook delayed, checking subscription status...');
              
              try {
                const checkResponse = await apiRequest('POST', '/api/paypal/subscription/check-activate', {
                  subscriptionId: data.subscriptionID
                });
                const checkResult = await checkResponse.json();

                if (checkResult.success && checkResult.activated) {
                  // Subscription was successfully activated
                  await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
                  toast({
                    title: "Success!",
                    description: "Your PayPal subscription has been activated. Welcome to Pro!",
                  });
                } else if (checkResult.success && !checkResult.activated) {
                  // Already activated
                  toast({
                    title: "Success!",
                    description: "Your subscription is active. Welcome to Pro!",
                  });
                } else {
                  // Subscription not yet active
                  toast({
                    title: "Subscription Created",
                    description: "Your subscription is being processed. Please refresh in a moment.",
                  });
                }
              } catch (fallbackError) {
                console.error('Fallback activation failed:', fallbackError);
                toast({
                  title: "Subscription Approved",
                  description: "Your subscription is being activated. Please refresh the page shortly.",
                });
              }
            }

            if (onSuccess) {
              onSuccess();
            }

            // Reload to ensure all UI updates
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (err) {
            console.error('Approval error:', err);
            toast({
              title: "Subscription Approved",
              description: "Your subscription is being activated. Please refresh the page in a few moments.",
            });
            if (onError) {
              onError(err);
            }
          }
        },
        onCancel: (data: any) => {
          console.log('Subscription cancelled by user:', data);
          toast({
            title: "Cancelled",
            description: "Subscription process was cancelled.",
          });
        },
        onError: (err: any) => {
          console.error('PayPal button error:', err);
          toast({
            title: "Payment Error",
            description: "There was an error processing your payment. Please try again.",
            variant: "destructive",
          });
          if (onError) {
            onError(err);
          }
        },
      }).render(paypalRef.current);

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    };

    loadPayPalScript();

    return () => {
      // Cleanup: mark component as unmounted
      isMountedRef.current = false;
    };
  }, [user]);

  if (error) {
    return (
      <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalRef} className="w-full" data-testid="paypal-subscription-button" />
    </div>
  );
}
