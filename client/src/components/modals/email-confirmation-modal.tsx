import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Mail, CheckCircle, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailConfirmationModal({ isOpen, onClose, email }: EmailConfirmationModalProps) {
  const { resendConfirmation } = useAuth();
  const { toast } = useToast();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailsSent, setEmailsSent] = useState(1);

  // Cooldown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleOpenEmailClient = () => {
    // Try to open common email clients
    const emailDomain = email.split('@')[1]?.toLowerCase();
    let emailUrl = 'mailto:';
    
    // Direct links to popular email providers
    if (emailDomain?.includes('gmail')) {
      emailUrl = 'https://mail.google.com';
    } else if (emailDomain?.includes('outlook') || emailDomain?.includes('hotmail') || emailDomain?.includes('live')) {
      emailUrl = 'https://outlook.live.com';
    } else if (emailDomain?.includes('yahoo')) {
      emailUrl = 'https://mail.yahoo.com';
    } else if (emailDomain?.includes('icloud')) {
      emailUrl = 'https://www.icloud.com/mail';
    }
    
    window.open(emailUrl, '_blank');
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await resendConfirmation(email);
      setEmailsSent(prev => prev + 1);
      setResendCooldown(60); // 60 second cooldown
      toast({
        title: "Email sent!",
        description: "We've sent another confirmation email to your inbox.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "Please try again in a few moments.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/60 to-white/80 dark:from-gray-900/90 dark:via-blue-950/60 dark:to-gray-900/80 border border-blue-200/40 dark:border-blue-800/40 shadow-2xl max-w-lg w-full mx-auto my-8 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8 text-center">
          {/* Animated Email Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 glass-prism rounded-full flex items-center justify-center mx-auto group animate-fade-in-up">
              <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-xl opacity-0 animate-pulse"></div>
          </div>

          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Check your email
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {emailsSent === 1 ? 'We sent' : `We've sent ${emailsSent}`} confirmation {emailsSent === 1 ? 'link' : 'emails'} to{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {email}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            {/* Steps */}
            <div className="glass-prism backdrop-blur-md bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 dark:from-gray-900/60 dark:via-blue-950/40 dark:to-gray-900/50 border border-blue-200/20 dark:border-blue-800/20 rounded-xl p-4 sm:p-6 text-left shadow-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Next steps:
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2">1.</span>
                  Open your email inbox
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2">2.</span>
                  Click the confirmation link in the email
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2">3.</span>
                  You'll be redirected back to complete your signup
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleOpenEmailClient}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg backdrop-blur-lg flex items-center justify-center border-0 font-semibold transition-all duration-300 hover:scale-105"
                data-testid="button-open-email"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Email App
              </Button>
              
              <Button
                onClick={handleResendEmail}
                disabled={resendLoading || resendCooldown > 0}
                variant="outline"
                className="w-full h-12 glass-prism backdrop-blur-md bg-white/20 dark:bg-gray-800/30 border border-blue-200/40 dark:border-blue-700/40 hover:bg-white/30 dark:hover:bg-gray-800/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-300 font-medium"
                data-testid="button-resend-email"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Email
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full h-12 glass-prism backdrop-blur-md bg-transparent border border-transparent hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                data-testid="button-close-modal"
              >
                I'll check later
              </Button>
            </div>

            {/* Help Text */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn't receive the email? Check your spam folder first.
              </p>
              {emailsSent > 1 && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email resent successfully
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}