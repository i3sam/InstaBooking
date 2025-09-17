import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bug, Mail, AlertTriangle, Copy, CheckCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReportBug() {
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
    const subject = encodeURIComponent('Bug Report - BookingGen');
    const body = encodeURIComponent(`Dear BookingGen Team,

I've encountered a bug in the application. Here are the details:

Bug Description:
[Please describe what went wrong]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [Third step]

Expected Behavior:
[What should have happened]

Actual Behavior:
[What actually happened]

Browser/Device Information:
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [Browser version]
- Operating System: [e.g., Windows 10, macOS, iOS]
- Device: [Desktop, Mobile, Tablet]

Additional Information:
[Any other relevant details, screenshots, or error messages]

Thank you for your help!

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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
              <Bug className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Report a Bug</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Found something that's not working as expected? We want to hear about it! Help us improve BookingGen by reporting any bugs you encounter.
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
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Our Team</h2>
                <p className="text-muted-foreground">
                  Send us your bug report directly via email
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
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bug Reporting Guidelines */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground text-center mb-4">How to Report Effectively</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Describe the Problem</h3>
                      <p className="text-sm text-muted-foreground">Tell us what went wrong in clear, simple language.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Steps to Reproduce</h3>
                      <p className="text-sm text-muted-foreground">List the exact steps that led to the bug.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Expected vs Actual</h3>
                      <p className="text-sm text-muted-foreground">What should have happened vs what actually happened.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Browser & Device Info</h3>
                      <p className="text-sm text-muted-foreground">Include your browser, version, and device details.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Screenshots (if possible)</h3>
                      <p className="text-sm text-muted-foreground">Visual evidence helps us understand the issue better.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 <strong>Pro Tip:</strong> The more details you provide, the faster we can fix the issue!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Help */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">Need Immediate Help?</h3>
            <p className="text-muted-foreground mb-6">
              If you're experiencing a critical issue that's preventing you from using BookingGen, 
              please mark your email as "URGENT" in the subject line.
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
                onClick={() => setLocation('/request-feature')}
                data-testid="button-request-feature"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Request a Feature Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}