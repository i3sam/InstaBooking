import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionButtonProps {
  planKey: string; // "pro", "premium", etc.
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function SubscriptionButton({
  planKey,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = "",
  children = "Subscribe Now"
}: SubscriptionButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setIsCreating(true);
      
      // Create subscription on backend
      const response = await apiRequest('POST', '/api/paypal/subscriptions', { planKey });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      
      if (!data.approvalUrl) {
        throw new Error('No approval URL returned from PayPal');
      }

      // Store subscription ID in session storage for return flow
      sessionStorage.setItem('pendingSubscriptionId', data.subscriptionId);
      sessionStorage.setItem('subscriptionPlanKey', planKey);

      // Redirect to PayPal for approval
      window.location.href = data.approvalUrl;
      
    } catch (error) {
      console.error('Subscription creation failed:', error);
      setIsCreating(false);
      
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to create subscription. Please try again.",
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={disabled || isCreating}
      className={className}
      data-testid="button-subscribe"
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating subscription...
        </>
      ) : (
        children
      )}
    </Button>
  );
}