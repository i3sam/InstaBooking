import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Check } from 'lucide-react';

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const plans = [
    {
      name: "Pro",
      description: "Everything you need to succeed",
      price: 10,
      features: [
        "Unlimited booking pages",
        "Full customization",
        "Unlimited bookings",
        "Payment processing",
        "Analytics dashboard",
        "Priority support",
        "Custom branding",
        "Mobile optimized"
      ],
      buttonText: user ? "Upgrade to Pro" : "Get Started",
      buttonAction: () => {
        if (user) {
          // TODO: Open payment modal
          setLocation('/dashboard');
        } else {
          setLocation('/signup');
        }
      },
      isPrimary: true,
      badge: "Essential"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              One plan, all features
            </h1>
            <p className="text-xl text-muted-foreground">
              Get everything you need to create beautiful booking pages and grow your business.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-md w-full">
              {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.isPrimary ? 'border-2 border-primary' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price === null ? "Custom" : `$${plan.price}`}
                      {plan.price !== null && (
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={plan.buttonAction}
                    className={`w-full ${plan.isPrimary ? 'button-gradient' : ''}`}
                    variant={plan.isPrimary ? 'default' : 'outline'}
                    data-testid={`button-${plan.name.toLowerCase()}-plan`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
