import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import heroImage from '@assets/Hero image (1)_1757961964946.png';
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
      icon: CreditCard,
      title: "Secure Payments",
      description: "Accept payments instantly with Razorpay integration. Secure, fast, and supports multiple payment methods."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Beautiful, responsive designs that work perfectly on all devices. Your clients can book from anywhere."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track bookings, revenue, and customer insights with powerful analytics and reporting tools."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated email and SMS reminders keep you and your clients informed about upcoming appointments."
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
      description: "Start receiving bookings instantly. Manage appointments, accept payments, and grow your business effortlessly."
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
      name: "Marcus Johnson",
      role: "Business Consultant",
      content: "The payment integration saved me so much time. Clients can book and pay instantly, and I get notifications for everything. Perfect for consultants!",
      rating: 5,
      avatar: "MJ"
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

  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Bookings Processed", value: "50,000+", icon: Calendar },
    { label: "Average Setup Time", value: "5 Minutes", icon: Clock },
    { label: "Customer Satisfaction", value: "98%", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="premium-gradient pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 glass-effect rounded-full text-primary text-sm font-medium">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  New: Advanced booking features
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
                  Create <span className="text-primary">beautiful booking pages</span> in minutes
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  Design, customize, and launch professional booking pages that convert. 
                  Perfect for freelancers, consultants, and service providers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  onClick={() => setLocation('/signup')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-10 py-6 rounded-xl text-xl h-auto text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-10 py-6 rounded-xl text-xl h-auto border-border hover:bg-muted text-foreground"
                  onClick={() => setLocation('/tutorial')}
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-3 h-6 w-6" />
                  See How It Works
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Quick setup
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Professional features
                </div>
              </div>
            </div>
            <div className="relative lg:order-last">
              <div className="relative max-w-full overflow-hidden">
                <img 
                  src={heroImage} 
                  alt="BookingGen dashboard interface" 
                  className="w-full h-auto object-contain lg:object-cover lg:max-h-[600px] xl:max-h-[700px]"
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything you need to accept bookings
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to help you create professional booking experiences that your clients will love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="premium-card transition-all duration-300 border-0">
                <CardContent className="p-8">
                  <div className="feature-icon w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Launch your booking page in 3 simple steps
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Page Demo */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              See what your booking pages will look like
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Beautiful, professional booking pages that convert visitors into clients
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Desktop Demo */}
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-xs text-muted-foreground font-mono">yourname.bookinggen.app</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Dr. Sarah Wellness</h3>
                      <p className="text-muted-foreground">Therapy & Counseling</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-foreground">Individual Therapy Session</h4>
                      <p className="text-sm text-muted-foreground">50 minutes • $120</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-foreground">Couples Counseling</h4>
                      <p className="text-sm text-muted-foreground">60 minutes • $150</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground">
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
            <div className="flex justify-center">
              <div className="w-80 space-y-6">
                <div className="bg-background border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-muted rounded-b-lg"></div>
                  <div className="pt-4 space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Mike's Barber Shop</h3>
                      <p className="text-sm text-muted-foreground">Premium cuts & styling</p>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground">Classic Cut</h4>
                        <p className="text-xs text-muted-foreground">30 min • $35</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground">Cut & Style</h4>
                        <p className="text-xs text-muted-foreground">45 min • $50</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full bg-primary text-primary-foreground">
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

          <div className="text-center mt-16">
            <Button 
              size="lg"
              onClick={() => setLocation('/tutorial')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-see-tutorial"
            >
              <Play className="mr-2 h-5 w-5" />
              See Full Tutorial
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Trusted by thousands of professionals
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground" data-testid={`stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Perfect for any service-based business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join professionals across industries who trust BookingGen to manage their appointments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="premium-card border-0" data-testid={`use-case-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <useCase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`use-case-title-${index}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid={`use-case-description-${index}`}>
                    {useCase.description}
                  </p>
                  <div className="space-y-1">
                    {useCase.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-center text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
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
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              What our users are saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how BookingGen has transformed businesses just like yours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="premium-card border-0" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic" data-testid={`testimonial-content-${index}`}>
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground" data-testid={`testimonial-name-${index}`}>
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`testimonial-role-${index}`}>
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to transform your booking process?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who have streamlined their business with BookingGen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setLocation('/signup')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                data-testid="button-cta-signup"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setLocation('/tutorial')}
                data-testid="button-cta-tutorial"
              >
                Watch Tutorial
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground mt-6">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Professional features
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
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
