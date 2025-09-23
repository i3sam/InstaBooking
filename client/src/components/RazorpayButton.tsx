import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';

interface RazorpayButtonProps {
  plan?: string;
  onSuccess?: (paymentId: string, orderId: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  plan = 'pro',
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = "",
  children = "Pay with Credit / Debit card"
}: RazorpayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { selectedCurrency } = useCurrency();

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

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout script');
      }

      // Create order on backend (server determines pricing)
      const response = await apiRequest('POST', '/api/razorpay/order', {
        plan: plan
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const orderData = await response.json();

      // Configure Razorpay checkout options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BookingGen Pro',
        description: 'Upgrade to Pro Plan',
        order_id: orderData.orderId,
        handler: async (paymentResponse: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await apiRequest('POST', '/api/razorpay/verify', {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verificationData = await verifyResponse.json();
            
            if (verificationData.success) {
              toast({
                title: "Payment Successful!",
                description: "Your upgrade to Pro has been completed.",
              });

              if (onSuccess) {
                onSuccess(verificationData.paymentId, verificationData.orderId);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment Verification Failed",
              description: "There was an issue verifying your payment. Please contact support.",
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
          plan: plan
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime.",
            });
            
            if (onCancel) {
              onCancel();
            }
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsProcessing(false);
      
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={className}
      data-testid="button-razorpay"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
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