import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  RefreshCw, 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react';

export default function Refunds() {
  const [, setLocation] = useLocation();

  const refundTypes = [
    {
      icon: CheckCircle,
      title: "Full Refund",
      description: "100% refund within first 14 days",
      timeframe: "Within 14 days of purchase",
      conditions: "No usage limitations",
      processing: "2-5 business days"
    },
    {
      icon: RefreshCw,
      title: "Pro-rated Refund",
      description: "Partial refund for unused time",
      timeframe: "After 14 days, within billing period",
      conditions: "Based on remaining subscription time",
      processing: "3-7 business days"
    },
    {
      icon: XCircle,
      title: "No Refund",
      description: "Service credit or alternative solution",
      timeframe: "After current billing period ends",
      conditions: "Account downgrades available",
      processing: "Immediate account adjustment"
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: "Submit Request",
      description: "Contact our support team with your refund request and reason",
      icon: DollarSign
    },
    {
      step: 2,
      title: "Review Process",
      description: "Our team reviews your request within 24 hours",
      icon: Clock
    },
    {
      step: 3,
      title: "Approval & Processing",
      description: "Approved refunds are processed back to your original payment method",
      icon: CreditCard
    },
    {
      step: 4,
      title: "Confirmation",
      description: "You'll receive confirmation once the refund is processed",
      icon: CheckCircle
    }
  ];

  const policies = [
    {
      title: "Subscription Refunds",
      content: [
        "Monthly subscriptions: Full refund within 14 days of initial purchase. Pro-rated refunds available for unused time after 14 days.",
        "Annual subscriptions: Full refund within 14 days. Pro-rated refunds calculated based on unused months.",
        "Upgrade charges: If you upgrade your plan, refund eligibility is based on the upgrade date, not the original subscription date.",
        "Automatic renewals: Refunds for automatic renewals must be requested within 7 days of the renewal charge."
      ]
    },
    {
      title: "Service Credits",
      content: [
        "Service interruptions: If our service is unavailable for more than 4 hours, we'll provide service credits.",
        "Feature failures: Credits may be provided for significant feature malfunctions that impact your business.",
        "Data loss: In the unlikely event of data loss on our end, we'll provide credits and assistance with recovery.",
        "Credit usage: Service credits are applied to your next billing cycle and cannot be transferred or refunded as cash."
      ]
    },
    {
      title: "Dispute Resolution",
      content: [
        "Chargeback prevention: We encourage contacting us before initiating chargebacks to resolve issues quickly.",
        "Documentation: Keep records of your refund request and our response for your records.",
        "Appeal process: If your refund request is denied, you can appeal the decision within 30 days.",
        "External mediation: For unresolved disputes, we support mediation through recognized dispute resolution services."
      ]
    },
    {
      title: "Non-Refundable Items",
      content: [
        "Setup fees: One-time setup or customization fees are generally non-refundable after service delivery.",
        "Third-party costs: External service integration costs cannot be refunded.",
        "Abuse or violations: Accounts terminated for terms of service violations are not eligible for refunds.",
        "Downgrade difference: When downgrading plans, the difference is typically applied as credit rather than refunded."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cancellation & Refunds | BookingGen" 
        description="Understand BookingGen's refund policy and cancellation procedures. Learn about our 14-day satisfaction guarantee, pro-rated refunds, and refund process."
        ogTitle="Cancellation & Refunds Policy - BookingGen"
        ogDescription="Complete refund and cancellation policy with 14-day satisfaction guarantee and clear refund procedures."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/legal')}
              className="mb-6"
              data-testid="button-back-to-legal"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Legal & Support
            </Button>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Cancellation & Refunds
              </h1>
              <p className="text-xl text-muted-foreground">
                Last updated: September 17, 2025
              </p>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                We want you to be completely satisfied with BookingGen. Here's everything you need 
                to know about our cancellation and refund policies.
              </p>
            </div>

            {/* Satisfaction Guarantee */}
            <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      14-Day Satisfaction Guarantee
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Try BookingGen risk-free! If you're not completely satisfied within the first 14 days, 
                      we'll provide a full refund, no questions asked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Refund Types */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Refund Options</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {refundTypes.map((type, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                      <type.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-timeframe-${index}`}>{type.timeframe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-conditions-${index}`}>{type.conditions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-processing-${index}`}>{type.processing}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Refund Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How to Request a Refund</h2>
            <div className="space-y-6">
              {refundProcess.map((process, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold text-lg flex-shrink-0">
                      {process.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <process.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{process.title}</h3>
                      </div>
                      <p className="text-muted-foreground" data-testid={`text-process-${index}`}>
                        {process.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg"
                onClick={() => setLocation('/contact')}
                data-testid="button-request-refund"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Request a Refund
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Policies */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Detailed Refund Policies</h2>
            <div className="space-y-8">
              {policies.map((policy, index) => (
                <Card key={index} className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      {policy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {policy.content.map((item, itemIndex) => (
                        <p 
                          key={itemIndex} 
                          className="text-muted-foreground leading-relaxed"
                          data-testid={`text-policy-${index}-item-${itemIndex}`}
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-6">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      Important Notes
                    </h3>
                  </div>
                </div>
                <div className="space-y-4 text-orange-800 dark:text-orange-200">
                  <p>• Refunds are processed back to your original payment method and may take 5-10 business days to appear.</p>
                  <p>• Annual subscriptions are calculated monthly for pro-rated refunds (annual price ÷ 12 months).</p>
                  <p>• Service credits cannot be converted to cash refunds and expire if your account is closed.</p>
                  <p>• Refund requests must include your account email and reason for the refund request.</p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                  <p className="text-muted-foreground mb-6">
                    Have questions about our refund policy? Our support team is here to help you understand 
                    your options and process any requests quickly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setLocation('/contact')}
                      data-testid="button-contact-support"
                    >
                      Contact Support
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation('/legal')}
                      data-testid="button-legal-help"
                    >
                      Legal Center
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}