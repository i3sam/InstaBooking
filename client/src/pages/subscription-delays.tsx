import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Mail,
  MessageCircle,
  Server,
  TrendingUp,
  Users,
  Shield,
  RefreshCw,
  Wrench
} from 'lucide-react';

export default function SubscriptionDelays() {
  const [, setLocation] = useLocation();

  const openEmailClient = () => {
    const supportEmail = 'team@bookinggen.xyz';
    const subject = encodeURIComponent('Subscription Activation Issue - BookingGen');
    const body = encodeURIComponent(`Dear BookingGen Team,

I'm experiencing delays with my subscription activation. Here are the details:

Subscription Type:
[e.g., Free Trial, Pro Subscription, Upgrade]

Payment/Activation Date:
[When you made the purchase/activated]

Current Status:
[What you're seeing in your account]

Expected Behavior:
[What should have happened]

Additional Information:
[Any error messages, screenshots, or other relevant details]

Thank you for your help!

Best regards,
[Your Name]`);
    
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get personalized help from our team",
      action: openEmailClient,
      buttonText: "Send Email"
    },
    {
      icon: MessageCircle,
      title: "Help Center",
      description: "Browse FAQs and guides",
      action: () => setLocation('/help-center'),
      buttonText: "Visit Help Center"
    },
    {
      icon: Users,
      title: "Contact Form",
      description: "Submit a detailed support request",
      action: () => setLocation('/contact'),
      buttonText: "Contact Us"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Subscription Activation Delays | BookingGen" 
        description="Important information about temporary subscription activation delays at BookingGen. We're working to resolve high server load issues."
        ogTitle="Subscription Activation Delays - BookingGen Status Update"
        ogDescription="Learn about current subscription activation delays and how we're addressing them."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-yellow-50 to-background dark:from-yellow-950/20 dark:to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')}
              className="mb-6 inline-flex items-center"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6 animate-pulse">
                <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Subscription Activation Delays
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're experiencing temporary delays in subscription activations due to higher than expected traffic. 
                Here's what you need to know.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Status Card */}
      <section className="py-8 -mt-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Server className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3">Current Status: Experiencing High Load</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      We're currently experiencing higher than normal server load due to an unexpected surge in new subscriptions and free trial activations. 
                      This is causing some delays in our subscription activation process. We sincerely apologize for any inconvenience this may cause.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Happening Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">What's Happening?</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                BookingGen has seen tremendous growth recently, with a significant increase in users signing up for our Pro subscription and free trials. 
                While this is fantastic news, our infrastructure is currently under strain as we scale to meet this demand.
              </p>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Why Is This Happening?
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Unexpected Growth:</strong> We've seen a 300% increase in subscription activations over the past week due to our recent marketing campaigns and word-of-mouth growth.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Infrastructure Scaling:</strong> Our current server infrastructure is being upgraded to handle the increased load, but this process takes time to complete safely.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Payment Processing Queue:</strong> Our payment processor (Razorpay) is experiencing higher webhook volumes, causing slight delays in confirming successful payments to our system.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Database Optimization:</strong> We're performing real-time database optimizations to ensure data consistency and prevent any loss of subscription information.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Expected Timeline Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">What to Expect</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Activation Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg mb-1">Normal Processing Time</p>
                      <p className="text-muted-foreground">Usually: Instant to 30 seconds</p>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="font-semibold text-lg mb-1 text-yellow-600 dark:text-yellow-400">Current Processing Time</p>
                      <p className="text-muted-foreground">Currently: 2-5 minutes</p>
                      <p className="text-sm text-muted-foreground mt-2">In some cases, it may take up to 10 minutes during peak hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    What Should You Do?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Wait 2-5 minutes after payment confirmation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Refresh your dashboard page periodically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Check your email for confirmation (sent immediately)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Contact us if activation takes more than 10 minutes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Doing Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">How We're Fixing This</h2>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">Active Measures Being Taken</h3>
                    <p className="text-muted-foreground mb-4">
                      Our engineering team is working around the clock to resolve these issues. Here's what we're doing:
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</span>
                      Server Capacity Expansion
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      We're deploying additional server instances across multiple regions to distribute the load. Expected completion: Within 24-48 hours.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</span>
                      Database Optimization
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      We're implementing database query optimizations and adding read replicas to improve performance. In progress.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</span>
                      Payment Webhook Processing
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      We're adding a dedicated queue system for payment webhooks to process confirmations faster and more reliably. Testing in progress.
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-4 border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">4</span>
                      24/7 Monitoring & Support
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      Our support team is on high alert and actively monitoring all subscription activations to manually intervene when necessary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-green-900 dark:text-green-100">Our Guarantee to You</h3>
                    <div className="space-y-3 text-green-900/80 dark:text-green-100/80">
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>No Lost Payments:</strong> Every payment is tracked and will be honored. If you paid, you will get your subscription activated - guaranteed.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Extended Trial Period:</strong> If your free trial was affected by these delays, we'll automatically extend it to ensure you get the full 7 days.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Priority Support:</strong> All users experiencing activation delays will receive priority support - your issue will be escalated immediately.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Full Refund Option:</strong> If you're not satisfied due to these delays, we'll provide a full refund - no questions asked.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Need Help Right Now?</h2>
              <p className="text-lg text-muted-foreground">
                Our support team is here to help you. Choose the best way to reach us:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-contact-method-${index}`}>
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-center text-lg">{method.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <Button 
                      onClick={method.action}
                      className="w-full"
                      data-testid={`button-contact-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {method.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Direct Email Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Direct Email Support</h3>
                  <p className="text-muted-foreground mb-4">
                    For immediate assistance with subscription activation issues, email us directly:
                  </p>
                  <a 
                    href="mailto:team@bookinggen.xyz?subject=Subscription%20Activation%20Issue" 
                    className="text-2xl font-bold text-primary hover:underline inline-block mb-4"
                    data-testid="link-email-support"
                  >
                    team@bookinggen.xyz
                  </a>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>We typically respond within 1-2 hours for urgent subscription issues</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Thank You for Your Patience</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We sincerely apologize for any inconvenience these delays have caused. Your trust in BookingGen means everything to us, 
              and we're committed to resolving these issues as quickly as possible while ensuring the security and reliability of your subscriptions.
            </p>
            <p className="text-lg text-muted-foreground">
              This rapid growth is only possible because of amazing users like you, and we're working hard to ensure our platform can 
              continue to serve you at the highest level.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                onClick={() => setLocation('/dashboard')}
                data-testid="button-return-dashboard"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
