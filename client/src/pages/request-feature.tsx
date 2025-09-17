import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Mail, Sparkles, Copy, CheckCircle, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RequestFeature() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const supportEmail = 'team@bookinggen.xyz';

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      toast({
        title: "Email copied!",
        description: "The email address has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy email to clipboard.",
        variant: "destructive",
      });
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent('Feature Request - BookingGen');
    const body = encodeURIComponent(`Dear BookingGen Team,

I would like to request a new feature for the BookingGen platform. Here are the details:

Feature Title:
[Brief, descriptive title of the feature]

Feature Description:
[Detailed description of what the feature should do]

Use Case/Problem to Solve:
[Why is this feature needed? What problem does it solve?]

How it would help:
[How would this feature benefit you and other users?]

Suggested Implementation:
[Any ideas on how this could work? This is optional]

Priority Level:
[High/Medium/Low - how important is this to you?]

Similar Features in Other Tools:
[Have you seen this feature elsewhere? Please provide examples]

Additional Notes:
[Any other relevant information or ideas]

Thank you for considering my request!

Best regards,
[Your Name]`);
    
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Lightbulb className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Request a Feature</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have an idea that could make BookingGen even better? We love hearing from our users! Share your feature requests and help shape the future of our platform.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Share Your Ideas</h2>
                <p className="text-muted-foreground">
                  Send us your feature request via email
                </p>
              </div>

              <div className="space-y-6">
                <div className="text-center p-6 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Support Email</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl font-semibold text-foreground" data-testid="support-email">
                      {supportEmail}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEmail}
                      className="h-8 w-8 p-0"
                      data-testid="button-copy-email"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={openEmailClient}
                  className="w-full h-12 text-lg font-semibold"
                  data-testid="button-open-email-client"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Open Email Client
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    We review all feature requests and respond promptly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Request Guidelines */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-4">How to Suggest Great Features</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Clear Title</h3>
                      <p className="text-sm text-muted-foreground">Give your feature a clear, descriptive name.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Problem & Solution</h3>
                      <p className="text-sm text-muted-foreground">Explain what problem this feature would solve.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <h3 className="font-semibold text-foreground">User Benefits</h3>
                      <p className="text-sm text-muted-foreground">How would this help you and other users?</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Use Cases</h3>
                      <p className="text-sm text-muted-foreground">Provide specific examples of when you'd use this feature.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Priority Level</h3>
                      <p className="text-sm text-muted-foreground">Tell us how important this feature is to you.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    🌟 <strong>Great Ideas Welcome:</strong> No idea is too small or too big - we want to hear them all!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Feature Categories */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Popular Feature Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-sm font-medium text-blue-800">Scheduling</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm font-medium text-green-800">Communication</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm font-medium text-purple-800">Analytics</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm font-medium text-orange-800">Customization</p>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-4 text-sm">
              Whether it's in these areas or something completely new, we'd love to hear your ideas!
            </p>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">What Happens Next?</h3>
            <p className="text-muted-foreground mb-6">
              Our team reviews every feature request. While we can't implement everything immediately, 
              your feedback directly influences our product roadmap and development priorities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back-to-dashboard-bottom"
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/report-bug')}
                data-testid="button-report-bug"
              >
                <Bug className="h-4 w-4 mr-2" />
                Report a Bug Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}