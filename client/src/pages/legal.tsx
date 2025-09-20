import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  Shield, 
  FileText, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  Scale,
  HelpCircle,
  Users,
  Gavel
} from 'lucide-react';

export default function Legal() {
  const [, setLocation] = useLocation();

  const legalTopics = [
    {
      icon: FileText,
      title: "Terms & Conditions",
      description: "Review our comprehensive terms of service and user agreement",
      action: () => setLocation('/terms'),
      buttonText: "Read Terms"
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      description: "Learn how we protect and handle your personal information",
      action: () => setLocation('/privacy'),
      buttonText: "View Policy"
    },
    {
      icon: Scale,
      title: "Cancellation & Refunds",
      description: "Understanding our refund policy and cancellation procedures",
      action: () => setLocation('/refunds'),
      buttonText: "View Policy"
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get help from our dedicated support team",
      action: () => setLocation('/contact'),
      buttonText: "Contact Us"
    }
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email for detailed assistance",
      contact: "team@bookinggen.xyz",
      response: "24-48 hours"
    },
    {
      icon: FileText,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      contact: "Self-service articles",
      response: "Available 24/7"
    },
    {
      icon: HelpCircle,
      title: "Documentation",
      description: "Step-by-step guides and tutorials",
      contact: "Complete user guides",
      response: "Available 24/7"
    }
  ];

  const commonQuestions = [
    {
      question: "How do I customize my booking page?",
      answer: "Go to your dashboard and click 'Create Page' to start customizing your booking page with your branding, services, and availability."
    },
    {
      question: "Is my data secure with BookingGen?",
      answer: "Absolutely. We use enterprise-grade security measures including SSL encryption and secure data storage to protect your information."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. See our refund policy for details."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Legal & Support Center | BookingGen" 
        description="Find answers to your questions, understand our policies, and get the support you need to succeed with BookingGen. Access legal documents, support options, and FAQ."
        ogTitle="Legal & Support Center - BookingGen"
        ogDescription="Get help with BookingGen - legal documents, support options, and frequently asked questions all in one place."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Gavel className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Legal & Support Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to your questions, understand our policies, and get the support you need to succeed with BookingGen.
            </p>
          </div>
        </div>
      </section>

      {/* Legal Documents Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Legal Information
            </h2>
            <p className="text-lg text-muted-foreground">
              Access our legal documents and policies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {legalTopics.map((topic, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                    <topic.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg" data-testid={`text-topic-title-${index}`}>{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm" data-testid={`text-topic-description-${index}`}>
                    {topic.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={topic.action}
                    className="w-full"
                    data-testid={`button-${topic.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {topic.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get Support
            </h2>
            <p className="text-lg text-muted-foreground">
              Multiple ways to get help when you need it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium" data-testid={`text-contact-${index}`}>{option.contact}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{option.response}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {commonQuestions.map((faq, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" data-testid={`text-question-${index}`}>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`text-answer-${index}`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => setLocation('/contact')}
              size="lg"
              data-testid="button-contact-support"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}