import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingModal from '@/components/modals/booking-modal';
import { Phone, Calendar, ArrowLeft, Clock, DollarSign } from 'lucide-react';

export default function PublicBooking() {
  const { slug } = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: pageData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-4xl text-muted-foreground mb-4">😕</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The booking page you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const page = pageData;
  const services = pageData.services || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {page.logoUrl ? (
                <img 
                  src={page.logoUrl} 
                  alt={`${page.title} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">
                    {page.title?.charAt(0) || 'B'}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-foreground">{page.title}</span>
            </div>
            <Button 
              variant="ghost"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {page.title}
          </h1>
          {page.tagline && (
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {page.tagline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="button-gradient px-8 py-4 rounded-xl text-lg h-auto"
              data-testid="button-book-appointment"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book an Appointment
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto"
              asChild
              data-testid="button-call-us"
            >
              <a href="tel:+1234567890">
                <Phone className="h-5 w-5 mr-2" />
                Call Us!
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Services</h2>
              <p className="text-xl text-muted-foreground">Choose the perfect session for your journey</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {services.map((service: any) => (
                <Card key={service.id} className="card-hover transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="feature-icon w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{service.name}</h3>
                    {service.description && (
                      <p className="text-muted-foreground mb-6">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-2xl font-bold text-foreground">
                        <DollarSign className="h-6 w-6" />
                        {service.price}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.durationMinutes} minutes
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowBookingModal(true)}
                      className="w-full button-gradient"
                      data-testid={`button-book-${service.id}`}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step toward your goals. Book your session today and let's create a plan that works for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="button-gradient px-8 py-4 rounded-xl text-lg h-auto"
              data-testid="button-book-appointment-cta"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book an Appointment
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg h-auto"
              asChild
              data-testid="button-call-us-cta"
            >
              <a href="tel:+1234567890">
                <Phone className="h-5 w-5 mr-2" />
                Call Us: (123) 456-7890
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal 
        open={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        page={page}
        services={services}
      />
    </div>
  );
}
