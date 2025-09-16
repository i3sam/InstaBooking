import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Users, 
  CreditCard, 
  CheckCircle,
  PlayCircle,
  Monitor,
  Smartphone,
  Expand
} from 'lucide-react';
import dashboardImage from '@assets/image_1758020681382.png';

export default function Tutorial() {
  const [, setLocation] = useLocation();

  const steps = [
    {
      id: 1,
      title: "Create Your Booking Page",
      description: "Set up your professional booking page in minutes",
      duration: "2 min",
      details: [
        "Choose your page name and URL",
        "Add your services and pricing", 
        "Customize your branding and colors",
        "Set your availability hours"
      ]
    },
    {
      id: 2,
      title: "Configure Your Services",
      description: "Define what you offer and how long each service takes",
      duration: "3 min", 
      details: [
        "Add service names and descriptions",
        "Set duration for each service",
        "Configure pricing (optional)",
        "Upload service images"
      ]
    },
    {
      id: 3,
      title: "Share Your Booking Link",
      description: "Make it easy for clients to find and book with you",
      duration: "1 min",
      details: [
        "Copy your unique booking URL",
        "Add to your website or social media",
        "Share via email or messaging",
        "Embed on your existing website"
      ]
    },
    {
      id: 4,
      title: "Manage Your Bookings",
      description: "Track appointments and communicate with clients",
      duration: "Ongoing",
      details: [
        "View all bookings in your dashboard",
        "Accept or decline appointments",
        "Send messages to clients",
        "Track your revenue and analytics"
      ]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Automate your booking process and reduce back-and-forth communication"
    },
    {
      icon: Users,
      title: "Better Experience", 
      description: "Provide clients with a professional, easy-to-use booking experience"
    },
    {
      icon: Monitor,
      title: "Real-time Analytics",
      description: "Track your business performance with detailed insights and reporting"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4" data-testid="badge-tutorial">
            Tutorial
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground" data-testid="text-tutorial-title">
            How BookingGen Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-tutorial-subtitle">
            Learn how to create your professional booking page and start accepting appointments in under 10 minutes.
          </p>
          
          {/* Demo Video */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Demo Video</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group" data-testid="video-container">
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        data-testid="demo-video"
                      >
                        <source src="/attached_assets/0916_1758025696817.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="bg-white/90 rounded-full p-3">
                          <Expand className="h-6 w-6 text-gray-800" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-full" data-testid="dialog-video-fullscreen">
                    <DialogTitle>Demo Video - Full Screen</DialogTitle>
                    <DialogDescription>
                      Complete walkthrough of BookingGen features and setup process
                    </DialogDescription>
                    <div className="aspect-video">
                      <video 
                        className="w-full h-full rounded-lg"
                        controls
                        autoPlay
                        data-testid="demo-video-fullscreen"
                      >
                        <source src="/attached_assets/0916_1758025696817.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Complete walkthrough
                </div>
                <div className="flex items-center">
                  <Monitor className="h-4 w-4 mr-1" />
                  Full demo
                </div>
                <div className="flex items-center">
                  <Expand className="h-4 w-4 mr-1" />
                  Fullscreen mode
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step by step process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-process-title">
              Step-by-Step Process
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-process-subtitle">
              Follow these simple steps to get your booking system up and running
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <Card key={step.id} className="relative" data-testid={`card-step-${step.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                      {step.id}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {step.duration}
                    </span>
                  </div>
                  <CardTitle className="text-xl" data-testid={`text-step-title-${step.id}`}>
                    {step.title}
                  </CardTitle>
                  <CardDescription data-testid={`text-step-description-${step.id}`}>
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start" data-testid={`text-step-detail-${step.id}-${detailIndex}`}>
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                {/* Connection line for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-border z-10"></div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-benefits-title">
              Why Choose BookingGen?
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-benefits-subtitle">
              See the benefits you'll get from using our booking platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center" data-testid={`card-benefit-${index}`}>
                <CardContent className="pt-6">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid={`text-benefit-title-${index}`}>
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-benefit-description-${index}`}>
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Screenshots placeholder */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-screenshots-title">
              See It In Action
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-screenshots-subtitle">
              Screenshots of the actual booking process
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card data-testid="card-screenshot-1">
              <CardContent className="p-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4 cursor-pointer group">
                      <img 
                        src={dashboardImage} 
                        alt="BookingGen Dashboard Screenshot" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        data-testid="img-dashboard-preview"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 rounded-full p-2">
                          <Expand className="h-4 w-4 text-gray-800" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full" data-testid="dialog-dashboard-enlarged">
                    <DialogTitle>Dashboard Preview</DialogTitle>
                    <DialogDescription>
                      Full-size view of the BookingGen dashboard interface
                    </DialogDescription>
                    <img 
                      src={dashboardImage} 
                      alt="BookingGen Dashboard - Full View" 
                      className="w-full h-auto rounded-lg"
                      data-testid="img-dashboard-full"
                    />
                  </DialogContent>
                </Dialog>
                <h3 className="font-semibold mb-2">Your Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Manage all your bookings from one clean, organized dashboard
                </p>
              </CardContent>
            </Card>
            
            <Card data-testid="card-screenshot-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Booking Page Screenshot</p>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Client Booking Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Beautiful, mobile-friendly booking pages your clients will love
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground" data-testid="text-cta-title">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-6" data-testid="text-cta-description">
                Join thousands of professionals who trust BookingGen to manage their appointments
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setLocation('/signup')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-signup"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation('/pricing')}
                  data-testid="button-pricing"
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}