import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalSubscriptionButtonProps {
  onSuccess?: (subscriptionId: string) => void;
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
  const [planId, setPlanId] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  const buttonRenderedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const fetchPlanId = async () => {
      try {
        // Use regular fetch for public endpoint (no auth required)
        const response = await fetch('/api/paypal/plan-id');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.planId) {
          throw new Error('Plan ID not found');
        }
        
        setPlanId(data.planId);
      } catch (err) {
        console.error('Failed to fetch plan ID:', err);
        if (isMountedRef.current) {
          setError('Failed to load payment options');
          setIsLoading(false);
          toast({
            title: "Configuration Error",
            description: "Failed to load payment options. Please try again or contact support.",
            variant: "destructive",
          });
        }
      }
    };

    fetchPlanId();
  }, [user]);

  useEffect(() => {
    if (!user || !planId || !paypalRef.current || buttonRenderedRef.current) return;

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
      if (!window.paypal || !paypalRef.current || buttonRenderedRef.current || !planId) return;

      // Mark button as rendered to prevent re-rendering
      buttonRenderedRef.current = true;

      // Capture user info at render time to avoid dependency issues
      const userId = user.id;
      const userEmail = user.email;
      const userName = profile?.fullName || user.fullName || userEmail;

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
            console.log('🔵 Creating PayPal subscription with plan ID:', planId);
            console.log('🔵 User info:', { userId, userEmail, userName });
            
            // Create subscription using PayPal SDK
            const subscriptionId = await actions.subscription.create({
              plan_id: planId,
              custom_id: userId, // Store user ID for webhook processing
              subscriber: {
                name: {
                  given_name: userName,
                },
                email_address: userEmail,
              },
            });
            
            console.log('✅ PayPal subscription created:', subscriptionId);
            return subscriptionId;
          } catch (error) {
            console.error('❌ Failed to create PayPal subscription:', error);
            console.error('Error type:', typeof error);
            console.error('Error details:', error);
            if (error && typeof error === 'object') {
              console.error('Error keys:', Object.keys(error));
              console.error('Error stringified:', JSON.stringify(error, null, 2));
            }
            toast({
              title: "Subscription Error",
              description: "Failed to create subscription. Please check the console for details.",
              variant: "destructive",
            });
            throw error;
          }
        },
        onApprove: async (data: any) => {
          try {
            console.log('✅ PayPal subscription approved:', data.subscriptionID);

            toast({
              title: "Processing...",
              description: "Activating your subscription. Please wait...",
            });

            // Wait a moment for webhook to process
            await new Promise(resolve => setTimeout(resolve, 3000));

            // First try to check if webhook already activated it
            await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
            let profileResponse = await apiRequest('GET', '/api/profile');
            let updatedProfile = await profileResponse.json();

            if (updatedProfile.membershipStatus === 'pro') {
              console.log('✅ Subscription activated via webhook');
              toast({
                title: "Success!",
                description: "Your PayPal subscription has been activated. Welcome to Pro!",
              });
            } else {
              // Webhook might be delayed, use fallback to check and activate
              console.log('⏳ Webhook delayed, using fallback activation...');
              
              try {
                const checkResponse = await apiRequest('POST', '/api/paypal/subscription/check-activate', {
                  subscriptionId: data.subscriptionID
                });
                const checkResult = await checkResponse.json();

                if (checkResult.success && checkResult.activated) {
                  console.log('✅ Subscription activated via fallback');
                  await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
                  toast({
                    title: "Success!",
                    description: "Your PayPal subscription has been activated. Welcome to Pro!",
                  });
                } else if (checkResult.success && !checkResult.activated) {
                  console.log('✅ Subscription already active');
                  toast({
                    title: "Success!",
                    description: "Your subscription is active. Welcome to Pro!",
                  });
                } else {
                  console.warn('⚠️ Subscription not yet active');
                  toast({
                    title: "Subscription Created",
                    description: "Your subscription is being processed. It may take up to 5 minutes to activate. Please refresh the page shortly.",
                  });
                }
              } catch (fallbackError) {
                console.error('❌ Fallback activation failed:', fallbackError);
                toast({
                  title: "Subscription Approved",
                  description: "Your subscription is being activated. It may take up to 5 minutes. Please refresh the page shortly.",
                });
              }
            }

            if (onSuccess) {
              onSuccess(data.subscriptionID);
            }

            // Reload to ensure all UI updates
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (err) {
            console.error('❌ Approval error:', err);
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
          console.error('❌ PayPal button error:', err);
          
          let errorMessage = "There was an error processing your payment. Please try again.";
          
          // Provide more specific error messages when possible
          if (err && typeof err === 'object') {
            if (err.message) {
              errorMessage = err.message;
            } else if (err.toString) {
              errorMessage = err.toString();
            }
          }
          
          toast({
            title: "Payment Error",
            description: errorMessage,
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
  }, [user, planId]);

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
