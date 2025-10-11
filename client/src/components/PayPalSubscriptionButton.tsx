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

  useEffect(() => {
    if (!user || !paypalRef.current) return;

    const loadPayPalScript = async () => {
      try {
        // Check if PayPal script is already loaded
        if (window.paypal && scriptLoadedRef.current) {
          renderPayPalButton();
          return;
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'ATMmwCMAF97M6P270q6699A0jwVpKTHLDNuijUw5-xrdTTVgT0mTzRtymFwEsBlmK5Yrjthh98j5aLPy';
        
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          renderPayPalButton();
        };
        
        script.onerror = () => {
          setError('Failed to load PayPal SDK');
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Failed to load PayPal payment system",
            variant: "destructive",
          });
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal:', err);
        setError('Failed to initialize PayPal');
        setIsLoading(false);
      }
    };

    const renderPayPalButton = () => {
      if (!window.paypal || !paypalRef.current) return;

      // Clear previous button
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }

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
              userName: profile?.fullName || user.fullName,
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

            // The webhook will handle the profile update, but we can refresh here too
            await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });

            toast({
              title: "Success!",
              description: "Your PayPal subscription has been activated. Welcome to Pro!",
            });

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
              title: "Error",
              description: "There was an issue activating your subscription. Please contact support.",
              variant: "destructive",
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

      setIsLoading(false);
    };

    loadPayPalScript();

    return () => {
      // Cleanup: remove PayPal script when component unmounts
      scriptLoadedRef.current = false;
    };
  }, [user, profile]);

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
