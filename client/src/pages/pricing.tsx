import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Check, Sparkles, Zap, Shield, Crown, ArrowRight, HelpCircle, Mail } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import CurrencySelector from '@/components/ui/currency-selector';
import UpgradeModal from '@/components/modals/upgrade-modal';
import { useState } from 'react';

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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
          setIsUpgradeModalOpen(true);
        } else {
          setLocation('/signup');
        }
      },
      isPrimary: true,
      badge: "Essential",
      offerBadge: "50% OFF!",
      icon: Crown,
      gradient: "from-blue-500/20 to-purple-500/20"
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
      badge: null,
      icon: Sparkles,
      gradient: "from-purple-500/20 to-pink-500/20"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast Setup",
      description: "Create your booking page in minutes, not hours"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data"
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "Stunning templates that convert visitors"
    }
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. No long-term commitments required."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! New users get a 7-day free trial to experience all Pro features."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and various payment methods through our secure payment processor."
    }
  ];

  return (
    <div className="min-h-screen bg-background page-gradient">
      <SEO 
        title="Pricing Plans | BookingGen" 
        description="Choose the perfect plan for your booking needs. Get 50% off Pro plan - unlimited pages, analytics, and priority support. Start your free trial today!"
        ogTitle="BookingGen Pricing - Plans Starting at $14.99/month"
        ogDescription="Professional booking pages made simple. Choose from Pro or Enterprise plans."
      />
      <Header />
      
      {/* Glass Prism Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-overlay pointer-events-none -z-10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 glass-prism rounded-full opacity-30 animate-float bg-gradient-to-br from-blue-400/20 to-purple-400/20 pointer-events-none -z-10"></div>
      <div className="absolute top-32 right-20 w-96 h-96 glass-prism rounded-full opacity-20 animate-float bg-gradient-to-br from-purple-400/20 to-pink-400/20 pointer-events-none -z-10" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-20 left-1/3 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-gradient-to-br from-pink-400/20 to-blue-400/20 pointer-events-none -z-10" style={{animationDelay: '3s'}}></div>
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative content-layer">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 glass-prism rounded-full mb-6 backdrop-blur-md bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/30 animate-pulse">
              <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Choose the plan that fits you
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get everything you need to create beautiful booking pages and grow your business.
            </p>
            <div className="flex justify-center">
              <CurrencySelector variant="compact" className="mb-4" />
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex justify-center mb-16">
            <div className="max-w-5xl w-full">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={`relative glass-prism-card backdrop-blur-xl hover-lift animate-scale-in transition-all duration-300 ${
                      plan.isPrimary 
                        ? 'border-2 border-primary shadow-2xl scale-105 bg-gradient-to-br from-white/95 via-blue-50/80 to-white/90 dark:from-gray-900/95 dark:via-blue-950/80 dark:to-gray-900/90' 
                        : 'border border-white/20 bg-white/80 dark:bg-gray-900/80'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`card-${plan.name.toLowerCase()}-plan`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/30">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    {plan.offerBadge && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-red-100 via-red-200 to-red-300 dark:from-red-800 dark:via-red-700 dark:to-red-600 text-red-800 dark:text-red-100 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg border border-white/30">
                          {plan.offerBadge}
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient background decoration */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-10 rounded-lg pointer-events-none`}></div>
                    
                    <CardContent className="p-8 relative z-10">
                      <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 glass-prism rounded-xl mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 dark:from-gray-800/60 dark:via-blue-950/40 dark:to-gray-800/50 border border-white/30">
                          <plan.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        <div className="mb-2">
                          {plan.price === null ? (
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                              Custom
                            </div>
                          ) : (
                            <>
                              {plan.originalPrice && (
                                <div className="text-lg text-muted-foreground line-through mb-1">
                                  {formatPrice(plan.originalPrice)}/month
                                </div>
                              )}
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                  {formatPrice(plan.price)}
                                </span>
                                <span className="text-lg font-normal text-muted-foreground">/month</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center animate-fade-in-up" style={{ animationDelay: `${(index * 0.1) + (featureIndex * 0.05)}s` }}>
                            <div className="w-5 h-5 glass-prism rounded-full flex items-center justify-center mr-3 backdrop-blur-md bg-gradient-to-br from-green-100 via-green-200 to-green-300 dark:from-green-800 dark:via-green-700 dark:to-green-600 border border-white/30">
                              <Check className="h-3 w-3 text-green-700 dark:text-green-100" />
                            </div>
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        size="lg"
                        onClick={plan.buttonAction}
                        className={`w-full h-12 transition-all duration-300 hover:scale-105 ${
                          plan.isPrimary 
                            ? 'glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 hover:from-blue-200 hover:via-blue-300 hover:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-blue-800 dark:text-blue-100 shadow-lg border border-white/30 font-semibold' 
                            : 'glass-prism-button backdrop-blur-lg bg-gradient-to-r from-white/40 via-blue-50/30 to-white/30 dark:from-gray-800/40 dark:via-blue-950/30 dark:to-gray-800/30 border border-white/30 hover:bg-white/50 dark:hover:bg-gray-800/50 text-blue-700 dark:text-blue-300 font-medium'
                        }`}
                        data-testid={`button-${plan.name.toLowerCase()}-plan`}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Why Choose BookingGen?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className="glass-prism-card backdrop-blur-xl hover-lift bg-white/80 dark:bg-gray-900/80 border border-white/20 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
                  data-testid={`card-benefit-${index}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 glass-prism rounded-xl mb-4 backdrop-blur-md bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 border border-white/30 mx-auto">
                      <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="glass-prism-card backdrop-blur-xl hover-lift bg-white/80 dark:bg-gray-900/80 border border-white/20 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
                  data-testid={`card-faq-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 glass-prism rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-md bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 border border-white/30">
                        <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-blue-500/15 border-blue-300/50 dark:border-blue-600/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 animate-pulse pointer-events-none"></div>
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 glass-prism rounded-full mb-6 backdrop-blur-md bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/30 mx-auto animate-pulse">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Still have questions?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our team is here to help you find the perfect plan for your needs. Get in touch and we'll answer all your questions.
                </p>
                <Button
                  size="lg"
                  onClick={() => setLocation('/contact')}
                  className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 hover:from-blue-200 hover:via-blue-300 hover:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-blue-800 dark:text-blue-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 font-semibold"
                  data-testid="button-contact-us-cta"
                >
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
