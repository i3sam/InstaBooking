import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { 
  Check, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Users, 
  Shield, 
  Headphones,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Sales() {
  const [, setLocation] = useLocation();

  const enterpriseFeatures = [
    {
      icon: Users,
      title: "Unlimited Team Members",
      description: "Add as many team members as you need with role-based permissions"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Advanced security features including SSO and data encryption"
    },
    {
      icon: Calendar,
      title: "Advanced Scheduling",
      description: "Complex scheduling rules, time zones, and calendar integrations"
    },
    {
      icon: Building,
      title: "Custom Integrations",
      description: "API access and custom integrations with your existing tools"
    },
    {
      icon: Headphones,
      title: "24/7 Priority Support",
      description: "Dedicated account manager and round-the-clock priority support"
    },
    {
      icon: Star,
      title: "SLA Guarantees",
      description: "99.9% uptime guarantee with service level agreements"
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our sales team",
      action: "team@bookinggen.xyz",
      buttonText: "Send Email",
      onClick: () => window.open('mailto:team@bookinggen.xyz?subject=Enterprise Plan Inquiry', '_blank')
    },
    {
      icon: Calendar,
      title: "Schedule a Demo",
      description: "Book a personalized demo with our team",
      action: "Book 30-min demo",
      buttonText: "Schedule Demo",
      onClick: () => window.open('mailto:team@bookinggen.xyz?subject=Demo Request&body=I would like to schedule a demo for the Enterprise plan.', '_blank')
    }
  ];

  return (
    <div className="min-h-screen bg-background page-gradient">
      <Header />
      
      {/* Glass Prism Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay pointer-events-none -z-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 glass-prism rounded-full opacity-30 animate-float bg-overlay pointer-events-none -z-10"></div>
      <div className="absolute top-32 right-20 w-96 h-96 glass-prism rounded-full opacity-20 animate-float bg-overlay pointer-events-none -z-10" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-20 left-1/3 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay pointer-events-none -z-10" style={{animationDelay: '3s'}}></div>
      
      <section className="pt-32 pb-32 relative content-layer">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 hero-radial-beam">
                Enterprise Solutions
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Scale your booking operations with enterprise-grade features, security, and support designed for growing organizations.
              </p>
            </div>
          </div>

          {/* Enterprise Features Grid */}
          <div className="mb-20">
            <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Built for Enterprise
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything in Pro, plus advanced features for enterprise needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {enterpriseFeatures.map((feature, index) => (
                <Card 
                  key={index}
                  className="glass-prism-card hover-lift animate-fade-in-up"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground">
                Contact our sales team to discuss your enterprise needs and get a custom quote
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {contactMethods.map((method, index) => (
                <Card 
                  key={index}
                  className="glass-prism-card hover-lift animate-fade-in-up"
                  style={{animationDelay: `${0.5 + 0.1 * index}s`}}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <method.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {method.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {method.description}
                    </p>
                    <div className="text-sm text-muted-foreground mb-6 font-mono">
                      {method.action}
                    </div>
                    <Button
                      onClick={method.onClick}
                      className="glass-prism-button w-full"
                      size="lg"
                      data-testid={`button-${method.title.toLowerCase().replace(' ', '-')}`}
                    >
                      {method.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Back to Pricing */}
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.7s'}}>
              <Button
                onClick={() => setLocation('/pricing')}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-foreground"
                data-testid="button-back-to-pricing"
              >
                ← Back to Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}