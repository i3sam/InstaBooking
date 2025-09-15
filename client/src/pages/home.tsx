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
                  Get Started • It's Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-10 py-6 rounded-xl text-xl h-auto border-border hover:bg-muted text-foreground"
                  onClick={() => {
                    const element = document.querySelector('#how-it-works');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-3 h-6 w-6" />
                  See How It Works
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Free forever plan
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

      <Footer />
    </div>
  );
}
