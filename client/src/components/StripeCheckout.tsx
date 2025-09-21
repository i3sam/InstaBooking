// Referenced from javascript_stripe integration
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Load Stripe - supports both cards and PayPal automatically
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY - Stripe checkout will be disabled');
}
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface CheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  plan: string;
  amount: number;
}

const CheckoutForm = ({ onSuccess, onError, plan, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required', // Avoid redirect for better UX
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        if (onError) onError(error);
      } else {
        toast({
          title: "Payment Successful",
          description: "Welcome to Pro! Your account has been upgraded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="stripe-checkout-form">
      <div className="p-4 border rounded-lg">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'paypal'], // Show cards first, then PayPal
          }}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Complete Payment - $${amount}`
        )}
      </Button>
    </form>
  );
};

interface StripeCheckoutProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  plan: string;
  amount: number;
}

export default function StripeCheckout({ onSuccess, onError, plan, amount }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          plan, 
          currency: 'USD' 
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        toast({
          title: "Setup Error",
          description: "Unable to initialize payment. Please check configuration.",
          variant: "destructive",
        });
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [plan, onError, toast]);

  if (!stripePromise) {
    return (
      <div className="p-4 text-center" data-testid="stripe-unavailable">
        <p className="text-muted-foreground">Payment system is currently unavailable.</p>
        <p className="text-sm text-muted-foreground">Please check configuration.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center" data-testid="stripe-loading">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 text-center" data-testid="stripe-error">
        <p className="text-destructive">Failed to initialize payment</p>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: 'hsl(var(--primary))',
          }
        }
      }}
    >
      <CheckoutForm 
        onSuccess={onSuccess} 
        onError={onError} 
        plan={plan}
        amount={amount}
      />
    </Elements>
  );
}