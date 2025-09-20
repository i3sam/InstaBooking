import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Check } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import CurrencySelector from '@/components/ui/currency-selector';

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const plans = [
    {
      name: "Pro",
      description: "Everything you need to succeed",
      price: 14.99,
      originalPrice: 29.99,
      features: [
        "Unlimited booking pages",
        "Full customization", 
        "Unlimited bookings",
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
      badge: "Essential",
      offerBadge: "50% OFF!"
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      price: null,
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support"
      ],
      buttonText: "Contact Sales",
      buttonAction: () => {
        setLocation('/sales');
      },
      isPrimary: false,
      badge: null
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
          <div className="text-center mb-16">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Choose the plan that fits you
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Get everything you need to create beautiful booking pages and grow your business.
            </p>
            <div className="flex justify-center">
              <CurrencySelector variant="compact" className="mb-4" />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="max-w-5xl w-full">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={`relative glass-prism-card hover-lift ${plan.isPrimary ? 'border-2 border-primary scale-105' : 'border border-white/20'}`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    {plan.offerBadge && (
                      <div className="absolute -top-3 -right-3">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          {plan.offerBadge}
                        </div>
                      </div>
                    )}
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        <div className="mb-2">
                          {plan.price === null ? (
                            <div className="text-4xl font-bold text-foreground">Custom</div>
                          ) : (
                            <>
                              {plan.originalPrice && (
                                <div className="text-lg text-muted-foreground line-through">
                                  {formatPrice(plan.originalPrice)}/month
                                </div>
                              )}
                              <div className="text-4xl font-bold text-foreground">
                                {formatPrice(plan.price)}
                                <span className="text-lg font-normal text-muted-foreground">/month</span>
                              </div>
                            </>
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
                        type="button"
                        size="lg"
                        onClick={plan.buttonAction}
                        className={`w-full h-12 ${plan.isPrimary ? 'glass-prism-button' : 'glass-prism-button'}`}
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
