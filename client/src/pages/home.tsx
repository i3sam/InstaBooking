import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLocation } from 'wouter';
import DemoWizard from '@/components/demo/DemoWizard';
import AppointmentBallpit from '@/components/animations/AppointmentBallpit';
import Stepper, { Step } from '@/components/ui/Stepper';
import { 
  Palette, 
  CalendarCheck, 
  CreditCard, 
  Smartphone, 
  BarChart3, 
  Bell,
  ArrowRight,
  Play,
  Check,
  Star,
  Users,
  Clock,
  DollarSign,
  Zap,
  Globe,
  Shield,
  Target,
  BookOpen,
  Heart,
  Coffee,
  Scissors,
  Monitor,
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [showDemoWizard, setShowDemoWizard] = useState(false);

  // Handle hash-based scrolling when navigating to homepage with hash
  useEffect(() => {
    const scrollToHashSection = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
      }
      return false;
    };

    // Try to scroll immediately
    if (!scrollToHashSection()) {
      // If element not found, retry after a short delay (for DOM to be ready)
      const timeoutId = setTimeout(() => {
        if (!scrollToHashSection()) {
          // Final retry with requestAnimationFrame
          requestAnimationFrame(scrollToHashSection);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const features = [
    {
      icon: Palette,
      title: "Custom Branding",
      description: "Personalize your booking pages with your logo, colors, and custom domain to match your brand perfectly."
    },
    {
      icon: CalendarCheck,
      title: "Smart Scheduling",
      description: "Intelligent calendar integration with availability management, time zone detection, and automated confirmations."
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Build stronger relationships with comprehensive customer profiles, booking history, and communication tools."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Beautiful, responsive designs that work perfectly on all devices. Your clients can book from anywhere."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track bookings and performance with powerful analytics and customer insights."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated email notifications for appointment approvals and rejections keep you and your clients informed about booking status instantly."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Page",
      description: "Design your booking page with our intuitive editor. Add your services, set your availability, and customize your branding."
    },
    {
      number: "2",
      title: "Share Your Link",
      description: "Get a beautiful, shareable link for your booking page. Add it to your website, social media, or email signature."
    },
    {
      number: "3",
      title: "Accept Bookings",
      description: "Start receiving bookings instantly. Manage appointments and grow your business effortlessly with our streamlined booking system."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Yoga Instructor",
      content: "BookingGen transformed my business. I went from managing bookings in spreadsheets to having a professional system that handles everything automatically. It's been a game-changer for my studio!",
      rating: 5,
      avatar: "SC",
      metric: "Time Saver",
      timeframe: "Daily use"
    },
    {
      name: "David Martinez",
      role: "Therapist",
      content: "Managing appointments has never been easier! The automated scheduling and reminders have streamlined my entire booking process. At just $14.99, it's an incredible value for what you get.",
      rating: 5,
      avatar: "DM",
      metric: "Highly Efficient",
      timeframe: "Regular use"
    },
    {
      name: "Elena Rodriguez",
      role: "Personal Trainer",
      content: "My clients love how easy it is to book sessions. The mobile experience is flawless, and the professional look has really elevated my brand. Best investment I've made for my business!",
      rating: 5,
      avatar: "ER",
      metric: "Client Favorite",
      timeframe: "Daily use"
    }
  ];

  const useCases = [
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Therapists, counselors, fitness trainers, and wellness coaches",
      examples: ["Medical consultations", "Therapy sessions", "Personal training", "Spa treatments"]
    },
    {
      icon: Coffee,
      title: "Professional Services",
      description: "Consultants, coaches, and business professionals",
      examples: ["Business consulting", "Life coaching", "Legal consultations", "Financial planning"]
    },
    {
      icon: Scissors,
      title: "Beauty & Lifestyle",
      description: "Salons, stylists, photographers, and personal services",
      examples: ["Hair appointments", "Photo shoots", "Makeup sessions", "Styling consultations"]
    },
    {
      icon: BookOpen,
      title: "Education & Tutoring",
      description: "Teachers, tutors, and educational professionals",
      examples: ["Private tutoring", "Music lessons", "Language coaching", "Skills training"]
    }
  ];


  return (
    <div className="min-h-screen page-gradient">
      <Header />
      
      {/* Add top padding to account for floating header */}
      <div className="h-28"></div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gojiberry-hero-gradient">
        {/* Appointment Ballpit Animation */}
        <div className="absolute inset-0" style={{ height: '700px' }}>
          <AppointmentBallpit count={35} />
        </div>
        
        {/* Glass Prism Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay"></div>
        <div className="absolute top-10 left-10 w-72 h-72 glass-prism rounded-full opacity-30 animate-float bg-overlay mobile-hide"></div>
        <div className="absolute top-32 right-20 w-96 h-96 glass-prism rounded-full opacity-20 animate-float bg-overlay mobile-hide" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay mobile-hide" style={{animationDelay: '3s'}}></div>
        
        <div className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 content-layer">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-5xl mx-auto">
              <div className="space-y-8 animate-fade-in-up">
                {/* Limited Time Offer Badge */}
                <div className="inline-flex items-center px-4 py-2 notification-badge rounded-full text-white text-sm font-semibold shadow-lg animate-scale-in">
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-md mr-3">🎉 LIMITED TIME</span>
                  7 Days FREE Trial - No Credit Card Required
                </div>
                
                {/* Main Headline */}
                <div className="hero-radial-beam">
                  <h1 className="text-clamp-xl font-bold leading-tight text-foreground animate-slide-in-left text-wrap-balance">
                    Get More Bookings & Grow Revenue with{' '}
                    <span className="text-blue-gradient">
                      Professional Booking Pages
                    </span>
                  </h1>
                </div>
                
                {/* Subtitle */}
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto animate-slide-in-right break-words">
                  Create stunning, professional booking pages in minutes. Increase your bookings and grow your revenue effortlessly.
                </p>
                
                {/* CTA Buttons */}
                <div className="pt-4 animate-scale-in content-layer flex flex-col sm:flex-row gap-4 justify-center items-center" style={{animationDelay: '0.3s'}}>
                  <Button 
                    onClick={() => setLocation('/signup')}
                    size="lg"
                    className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto mobile-full-width min-touch-target"
                    data-testid="button-get-started"
                  >
                    Start Your 7-Day FREE Trial
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={() => setLocation('/pricing')}
                    size="lg"
                    variant="outline"
                    className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto mobile-full-width min-touch-target"
                    data-testid="button-view-pricing"
                  >
                    View Pricing
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground pt-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    7-Day FREE Trial
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Cancel Anytime
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Setup in 5 Minutes
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Just $14.99/mo After Trial
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Before You Launch Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-blue-50/30 dark:to-blue-950/30">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 glass-prism rounded-full opacity-15 animate-float bg-overlay mobile-hide"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 glass-prism rounded-full opacity-20 animate-float bg-overlay mobile-hide" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white text-sm font-semibold shadow-lg mb-8">
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-md mr-3">Try Now</span>
              No signup required
            </div>
            
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              <span className="text-blue-gradient">
                Test before you Launch
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12 break-words">
              Create and preview your booking page instantly. See exactly how it will look before committing to a plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center lg:items-start">
            {/* Left: Benefits */}
            <div className="space-y-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0 min-touch-target">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Instant Preview</h3>
                    <p className="text-muted-foreground break-words">See your booking page come to life in real-time as you customize it. No guesswork involved.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0 min-touch-target">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Perfect Your Design</h3>
                    <p className="text-muted-foreground break-words">Test different themes, colors, and layouts until you find the perfect match for your brand.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0 min-touch-target">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Risk-Free Testing</h3>
                    <p className="text-muted-foreground break-words">Try all features without any commitment. Only sign up when you're completely satisfied.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0 min-touch-target">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Share for Feedback</h3>
                    <p className="text-muted-foreground break-words">Get feedback from colleagues or clients before going live. Share your demo link easily.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Call to Action */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Card className="glass-prism-card p-8 hover-lift relative group mobile-no-blur">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 mobile-hide"></div>
                
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 glass-prism rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="h-10 w-10 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Ready to create your demo?</h3>
                    <p className="text-muted-foreground mb-6 break-words">
                      It takes less than 5 minutes to build and preview your booking page. Start with our guided wizard.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowDemoWizard(true)}
                      size="lg"
                      className="w-full glass-prism-button px-8 py-4 rounded-full text-lg h-auto font-semibold min-touch-target"
                      data-testid="button-start-demo-wizard"
                    >
                      <Play className="mr-3 h-5 w-5" />
                      Start Demo Wizard
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Free demo preview
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        No signup required
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        5 min setup
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground break-words">
                      💡 <strong>Pro tip:</strong> Your demo will be saved for 7 days so you can come back and refine it anytime.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Wizard Modal */}
      {showDemoWizard && (
        <DemoWizard 
          open={showDemoWizard}
          onClose={() => setShowDemoWizard(false)}
        />
      )}

      {/* Features Section */}
      <section id="features" className="relative py-24 overflow-hidden gojiberry-gradient">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay mobile-hide"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay mobile-hide" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              Everything you need to{' '}
              <span className="text-blue-gradient">
                accept bookings
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Powerful features designed to help you create professional booking experiences that your clients will love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group glass-prism-card hover-lift animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 glass-prism rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-primary group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-blue-gradient transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-32 left-10 w-80 h-80 glass-prism rounded-full opacity-15 animate-float mobile-hide"></div>
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              Launch your booking page in{' '}
              <span className="text-blue-gradient">
                3 simple steps
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow our interactive guide to see how easy it is to get started
            </p>
          </div>

          <div className="max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Stepper
              initialStep={1}
              backButtonText="Previous"
              nextButtonText="Next Step"
              onFinalStepCompleted={() => {
                setLocation('/signup');
              }}
            >
              <Step>
                <div className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 glass-prism rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-4xl font-bold text-blue-gradient">1</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{steps[0].title}</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {steps[0].description}
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <Palette className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Custom Branding</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Set Availability</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Add Services</span>
                    </div>
                  </div>
                </div>
              </Step>
              <Step>
                <div className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 glass-prism rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-4xl font-bold text-blue-gradient">2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{steps[1].title}</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {steps[1].description}
                  </p>
                  <div className="pt-4 flex justify-center">
                    <div className="inline-block px-6 py-3 bg-muted rounded-lg font-mono text-sm">
                      <Globe className="inline h-5 w-5 text-primary mr-2" />
                      bookinggen.xyz/<span className="text-primary font-bold">yourname</span>
                    </div>
                  </div>
                </div>
              </Step>
              <Step>
                <div className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 glass-prism rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-4xl font-bold text-blue-gradient">3</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{steps[2].title}</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {steps[2].description}
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Automated Confirmations</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                      <Bell className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Track Performance</span>
                    </div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>

          <div className="text-center mt-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Complete all steps to automatically redirect to sign up
            </p>
          </div>
        </div>
      </section>

      {/* Booking Page Demo */}
      <section className="relative py-24 overflow-hidden gojiberry-gradient">
        {/* Glass Prism Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay"></div>
        <div className="absolute top-20 right-10 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay mobile-hide"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay mobile-hide" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              See what your{' '}
              <span className="text-blue-gradient">
                booking pages
              </span>{' '}
              will look like
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Beautiful, professional booking pages that convert visitors into clients
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Desktop Demo */}
            <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="glass-prism-card rounded-3xl p-8 hover-lift relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-xs text-muted-foreground font-mono">bookinggen.xyz/yourname</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Dr. Sarah Wellness</h3>
                      <p className="text-muted-foreground">Therapy & Counseling</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 mobile-no-blur">
                      <h4 className="font-semibold text-foreground">Individual Therapy Session</h4>
                      <p className="text-sm text-muted-foreground">50 minutes • $120</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 mobile-no-blur">
                      <h4 className="font-semibold text-foreground">Couples Counseling</h4>
                      <p className="text-sm text-muted-foreground">60 minutes • $150</p>
                    </div>
                  </div>
                  <Button className="w-full glass-prism-button px-6 py-2 rounded-full font-semibold min-touch-target">
                    Book Appointment
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Desktop Experience</h3>
                <p className="text-muted-foreground">Clean, professional layout optimized for desktop users</p>
              </div>
            </div>

            {/* Mobile Demo */}
            <div className="flex justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="w-80 space-y-6">
                <div className="glass-prism-card rounded-3xl p-6 relative overflow-hidden hover-lift group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-b-lg"></div>
                  <div className="pt-4 space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 glass-prism rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Mike's Barber Shop</h3>
                      <p className="text-sm text-muted-foreground">Premium cuts & styling</p>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 mobile-no-blur">
                        <h4 className="font-semibold text-sm text-foreground">Classic Cut</h4>
                        <p className="text-xs text-muted-foreground">30 min • $35</p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300 mobile-no-blur">
                        <h4 className="font-semibold text-sm text-foreground">Cut & Style</h4>
                        <p className="text-xs text-muted-foreground">45 min • $50</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full glass-prism-button px-4 py-2 rounded-full font-semibold text-sm min-touch-target">
                      Book Now
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Mobile Experience</h3>
                  <p className="text-muted-foreground">Perfect mobile design for on-the-go bookings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <Button 
              size="lg"
              onClick={() => setLocation('/tutorial')}
              className="glass-prism-button px-8 py-3 rounded-full text-lg font-semibold hover-lift mobile-full-width min-touch-target"
              data-testid="button-see-tutorial"
            >
              <Play className="mr-2 h-5 w-5" />
              See Full Tutorial
            </Button>
          </div>
        </div>
      </section>


      {/* Use Cases Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-blue-50/20 dark:to-blue-950/20"></div>
        <div className="relative container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              Perfect for any{' '}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                service-based business
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Join professionals across industries who trust BookingGen to manage their appointments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group relative bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 mobile-no-blur" data-testid={`use-case-${index}`}>
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <useCase.icon className="h-8 w-8 text-primary group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300" data-testid={`use-case-title-${index}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed" data-testid={`use-case-description-${index}`}>
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {example}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Booking Page Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTI4YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMjggMjhjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTI4YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNOCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMjhjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Still confused?{' '}
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Take a look at a booking page yourself
                </span>
                {' '}to see how it looks
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Experience a real booking page in action and see exactly what your customers will interact with
              </p>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                onClick={() => window.open('https://www.bookinggen.xyz/marcos-hair-salon', '_blank')}
                className="glass-prism-button px-10 py-6 rounded-full text-lg h-auto font-bold shadow-lg hover:shadow-xl transition-all duration-300 min-touch-target group"
                data-testid="button-preview-booking-page"
              >
                <ExternalLink className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Preview Booking Page
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Live example page
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                No signup needed
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                See it in action
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              What our{' '}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                users are saying
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              See how BookingGen has transformed businesses just like yours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group relative bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 mobile-no-blur" data-testid={`testimonial-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-gradient">{testimonial.metric}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.timeframe}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-8 italic text-lg leading-relaxed" data-testid={`testimonial-content-${index}`}>
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm font-bold text-primary">{testimonial.avatar}</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors duration-300" data-testid={`testimonial-name-${index}`}>
                        {testimonial.name}
                      </div>
                      <div className="text-muted-foreground font-medium" data-testid={`testimonial-role-${index}`}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 overflow-hidden bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-clamp-lg font-bold text-foreground mb-8 text-wrap-balance">
              Frequently Asked{' '}
              <span className="text-blue-gradient">
                Questions
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything you need to know about BookingGen and our 7-day free trial
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  Do I need a credit card for the free trial?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  No credit card required! Start your 7-day free trial instantly with just your email. Experience all Pro features with no payment information needed. It's completely free, no strings attached.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  What happens after my 7-day free trial ends?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  After your 7-day trial ends, you can choose to upgrade to Pro for $14.99/month to continue enjoying all features. There's no automatic billing - you'll only be charged if you decide to upgrade. Your account will simply revert to the free plan if you don't upgrade.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  Can I cancel my subscription anytime?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Yes! Cancel anytime with just one click from your dashboard. No contracts, no commitments, no cancellation fees. We believe in earning your business every month, not trapping you in a contract.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  How quickly can I set up my booking page?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Most users create their first professional booking page in under 5 minutes! Our intuitive builder guides you through adding your services, availability, and branding. You can start accepting bookings the same day you sign up.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  Is there a limit on bookings or pages?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  During your trial and with the Pro plan, you get UNLIMITED booking pages and UNLIMITED bookings. No hidden limits, no surprise charges. Whether you get 10 bookings or 10,000, the price stays the same at $14.99/month.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  What features are included in the free trial?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  You get FULL access to all Pro features: unlimited booking pages, custom branding, analytics dashboard, automated notifications, mobile optimization, priority support, and more. No features are locked or hidden during the trial.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  Will my booking page work on mobile devices?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Yes! All booking pages are fully responsive and optimized for mobile devices. Over 60% of bookings happen on mobile, so we've made sure your pages look perfect and function flawlessly on phones, tablets, and desktops.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="glass-prism-card border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  Do you offer support during the trial?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  Absolutely! Trial users get access to our priority support team. We're here to help you succeed from day one. Get answers via email support, live chat, and our comprehensive help center with video tutorials.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="text-center mt-16 animate-fade-in-up">
            <p className="text-lg text-muted-foreground mb-6">
              Still have questions? We're here to help!
            </p>
            <Button 
              onClick={() => setLocation('/contact')}
              size="lg"
              variant="outline"
              className="glass-prism-button px-8 py-3 rounded-full text-lg min-touch-target"
              data-testid="button-contact"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden gojiberry-gradient">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-10 right-32 w-72 h-72 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 glass-prism rounded-full opacity-15 animate-float bg-overlay" style={{animationDelay: '1s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white text-sm font-semibold shadow-lg mb-8 animate-pulse">
              <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-md mr-3">⏰ LIMITED OFFER</span>
              50% OFF - Only $14.99/Month
            </div>
            
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-8 leading-tight">
              Ready to{' '}
              <span className="text-blue-gradient">
                Transform Your Booking Process?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Start your 7-day FREE trial now. Full Pro access. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in content-layer" style={{animationDelay: '0.3s'}}>
              <Button 
                size="lg"
                onClick={() => setLocation('/signup')}
                className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto mobile-full-width min-touch-target font-bold"
                data-testid="button-cta-signup"
              >
                Start Your 7-Day FREE Trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setLocation('/pricing')}
                className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto mobile-full-width min-touch-target"
                data-testid="button-cta-pricing"
              >
                <DollarSign className="mr-3 h-6 w-6" />
                View Pricing
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-12 text-lg text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                7-Day FREE Trial
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                Full Pro Access
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                Cancel Anytime
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                Just $14.99/mo After Trial
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                💡 <strong className="text-foreground">Limited Time Offer:</strong> Get 50% OFF the regular price when you subscribe after your trial. Only $14.99/month instead of $29.99!
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
