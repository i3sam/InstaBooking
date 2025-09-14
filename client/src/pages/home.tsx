import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { 
  Palette, 
  CalendarCheck, 
  CreditCard, 
  Smartphone, 
  BarChart3, 
  Bell,
  ArrowRight,
  Play,
  Check
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  New: Advanced booking features
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Create beautiful booking pages in minutes
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Design, customize, and launch professional booking pages that convert. 
                  Perfect for freelancers, consultants, and service providers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation('/signup')}
                  className="button-gradient px-8 py-4 rounded-xl text-lg h-auto"
                  data-testid="button-get-started"
                >
                  Get Started • It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="px-8 py-4 rounded-xl text-lg h-auto"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Free forever plan
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
                alt="BookingGen dashboard interface" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
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
              <Card key={index} className="card-hover transition-all duration-300">
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

      <Footer />
    </div>
  );
}
