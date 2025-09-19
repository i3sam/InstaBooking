import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, ExternalLink } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailConfirmationModal({ isOpen, onClose, email }: EmailConfirmationModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl max-w-md mx-auto rounded-3xl overflow-hidden">
        <div className="p-8 text-center">
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
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            {/* Steps */}
            <div className="glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl p-6 text-left">
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
                className="w-full h-12 glass-prism-button text-white shadow-lg backdrop-blur-lg flex items-center justify-center"
                data-testid="button-open-email"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Email App
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-12 glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
                data-testid="button-close-modal"
              >
                I'll check later
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}