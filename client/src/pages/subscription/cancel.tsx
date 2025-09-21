import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function SubscriptionCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background page-gradient">
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg mx-auto glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/95 via-orange-50/80 to-white/90 dark:from-gray-900/95 dark:via-orange-950/80 dark:to-gray-900/90 border border-orange-200/30 dark:border-orange-800/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-orange-800 dark:text-orange-200">
              Subscription Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No worries!
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Your subscription was cancelled. You can try again anytime or explore our features with the free plan.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What you can still do:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 text-left">
                <li>• Explore the dashboard</li>
                <li>• Try our free features</li>
                <li>• Read our documentation</li>
                <li>• Contact support if you have questions</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/pricing')}
                className="w-full"
                data-testid="button-try-again"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                className="w-full"
                data-testid="button-dashboard"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}