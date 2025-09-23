import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import heroImage from '@assets/image_1758670396246.png';
import DemoWizard from '@/components/demo/DemoWizard';
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
  Calendar
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
      content: "BookingGen transformed my business. I went from managing bookings in spreadsheets to having a professional system that handles everything automatically.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "David Martinez",
      role: "Therapist",
      content: "Managing appointments has never been easier! The automated scheduling and reminders save me hours every week. At just $10, it's incredibly affordable for such a powerful platform.",
      rating: 5,
      avatar: "DM"
    },
    {
      name: "Elena Rodriguez",
      role: "Personal Trainer",
      content: "My clients love how easy it is to book sessions. The mobile experience is flawless, and I've seen a 40% increase in bookings since switching.",
      rating: 5,
      avatar: "ER"
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
        {/* Glass Prism Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay"></div>
        <div className="absolute top-10 left-10 w-72 h-72 glass-prism rounded-full opacity-30 animate-float bg-overlay"></div>
        <div className="absolute top-32 right-20 w-96 h-96 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '3s'}}></div>
        
        <div className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 content-layer">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-5xl mx-auto">
              <div className="space-y-8 animate-fade-in-up">
                {/* Notification Badge - Blue Theme */}
                <div className="inline-flex items-center px-4 py-2 notification-badge rounded-full text-white text-sm font-semibold shadow-lg animate-scale-in">
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-md mr-3">New</span>
                  New Analytics Feature
                </div>
                
                {/* Main Headline */}
                <div className="hero-radial-beam">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight text-foreground animate-slide-in-left">
                    Create{' '}
                    <span className="text-blue-gradient">
                      beautiful booking pages
                    </span>{' '}
                    in minutes
                  </h1>
                </div>
                
                {/* Subtitle */}
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto animate-slide-in-right">
                  Our AI-powered platform works 24/7 to create professional booking pages that convert visitors into clients effortlessly.
                </p>
                
                {/* CTA Button */}
                <div className="pt-4 animate-scale-in content-layer" style={{animationDelay: '0.3s'}}>
                  <Button 
                    onClick={() => setLocation('/signup')}
                    size="lg"
                    className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto"
                    data-testid="button-get-started"
                  >
                    Get Started for Free
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
                
                {/* Feature Points */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground pt-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Quick setup
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Professional features
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image Section */}
        <div className="relative pb-20 lg:pb-32">
          <div className="container mx-auto px-6">
            <div className="relative max-w-6xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <img 
                src={heroImage} 
                alt="BookingGen dashboard interface" 
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Test Before You Launch Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-blue-50/30 dark:to-blue-950/30">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 glass-prism rounded-full opacity-15 animate-float bg-overlay"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-white text-sm font-semibold shadow-lg mb-8">
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-md mr-3">Try Now</span>
              No signup required
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
              <span className="text-blue-gradient">
                Test before you Launch
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              Create and preview your booking page instantly. See exactly how it will look before committing to a plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Benefits */}
            <div className="space-y-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Instant Preview</h3>
                    <p className="text-muted-foreground">See your booking page come to life in real-time as you customize it. No guesswork involved.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Perfect Your Design</h3>
                    <p className="text-muted-foreground">Test different themes, colors, and layouts until you find the perfect match for your brand.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Risk-Free Testing</h3>
                    <p className="text-muted-foreground">Try all features without any commitment. Only sign up when you're completely satisfied.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 glass-prism rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Share for Feedback</h3>
                    <p className="text-muted-foreground">Get feedback from colleagues or clients before going live. Share your demo link easily.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Call to Action */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Card className="glass-prism-card p-8 hover-lift relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 glass-prism rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="h-10 w-10 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Ready to create your demo?</h3>
                    <p className="text-muted-foreground mb-6">
                      It takes less than 5 minutes to build and preview your booking page. Start with our guided wizard.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowDemoWizard(true)}
                      size="lg"
                      className="w-full glass-prism-button px-8 py-4 rounded-full text-lg h-auto font-semibold"
                      data-testid="button-start-demo-wizard"
                    >
                      <Play className="mr-3 h-5 w-5" />
                      Start Demo Wizard
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        No credit card
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
                    <p className="text-xs text-muted-foreground">
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
        <div className="absolute top-20 right-10 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
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
        <div className="absolute top-32 left-10 w-80 h-80 glass-prism rounded-full opacity-15 animate-float"></div>
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
              Launch your booking page in{' '}
              <span className="text-blue-gradient">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center group animate-fade-in-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 glass-prism rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg hover-lift">
                    <span className="text-3xl font-bold text-blue-gradient">{step.number}</span>
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-400/30 to-transparent -translate-x-1/2"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-blue-gradient transition-colors duration-300">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Page Demo */}
      <section className="relative py-24 overflow-hidden gojiberry-gradient">
        {/* Glass Prism Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay"></div>
        <div className="absolute top-20 right-10 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '2s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
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
                    <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300">
                      <h4 className="font-semibold text-foreground">Individual Therapy Session</h4>
                      <p className="text-sm text-muted-foreground">50 minutes • $120</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300">
                      <h4 className="font-semibold text-foreground">Couples Counseling</h4>
                      <p className="text-sm text-muted-foreground">60 minutes • $150</p>
                    </div>
                  </div>
                  <Button className="w-full glass-prism-button px-6 py-2 rounded-full font-semibold">
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
                      <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300">
                        <h4 className="font-semibold text-sm text-foreground">Classic Cut</h4>
                        <p className="text-xs text-muted-foreground">30 min • $35</p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300">
                        <h4 className="font-semibold text-sm text-foreground">Cut & Style</h4>
                        <p className="text-xs text-muted-foreground">45 min • $50</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full glass-prism-button px-4 py-2 rounded-full font-semibold text-sm">
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
              className="glass-prism-button px-8 py-3 rounded-full text-lg font-semibold hover-lift"
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
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
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
              <Card key={index} className="group relative bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2" data-testid={`use-case-${index}`}>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8">
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
              <Card key={index} className="group relative bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2" data-testid={`testimonial-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
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

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden gojiberry-gradient">
        {/* Glass Prism Background Elements */}
        <div className="absolute top-10 right-32 w-72 h-72 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 glass-prism rounded-full opacity-15 animate-float bg-overlay" style={{animationDelay: '1s'}}></div>
        
        <div className="relative container mx-auto px-6 content-layer">
          <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-8 leading-tight">
              Ready to transform your{' '}
              <span className="text-blue-gradient">
                booking process?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Join thousands of professionals who have streamlined their business with BookingGen
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in content-layer" style={{animationDelay: '0.3s'}}>
              <Button 
                size="lg"
                onClick={() => setLocation('/signup')}
                className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto"
                data-testid="button-cta-signup"
              >
                Get Started for Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setLocation('/tutorial')}
                className="glass-prism-button px-12 py-6 rounded-full text-xl h-auto"
                data-testid="button-cta-tutorial"
              >
                <Play className="mr-3 h-6 w-6" />
                Watch Tutorial
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-12 text-lg text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                Professional features
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-3" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
