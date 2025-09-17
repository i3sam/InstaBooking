import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BookingModal from '@/components/modals/booking-modal';
import { Phone, Calendar, ArrowLeft, Clock, DollarSign, HelpCircle, MapPin, Mail, Clock3, Image, Star, MessageSquare } from 'lucide-react';

export default function PublicBooking() {
  const { slug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 0,
    reviewText: ''
  });

  const { data: pageData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
  });

  // Fetch reviews for this page
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: [`/api/reviews/${pageData?.id}`],
    enabled: !!pageData?.id,
  });

  // Review submission mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await apiRequest('POST', '/api/reviews', reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review is pending approval.",
      });
      setReviewFormData({
        customerName: '',
        customerEmail: '',
        rating: 0,
        reviewText: ''
      });
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${pageData?.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting review",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create dynamic styles based on page theme data
  const getThemeStyles = (page: any) => {
    const primaryColor = page.primaryColor || '#2563eb';
    const backgroundType = page.backgroundType || 'gradient';
    const backgroundValue = page.backgroundValue || 'blue';
    const fontFamily = page.fontFamily || 'inter';
    
    // Background style mapping
    const backgroundClasses = {
      // Original gradients
      'blue': backgroundType === 'gradient' ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-blue-50',
      'green': backgroundType === 'gradient' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-emerald-50',
      'purple': backgroundType === 'gradient' ? 'bg-gradient-to-br from-violet-50 to-violet-100' : 'bg-violet-50',
      'rose': backgroundType === 'gradient' ? 'bg-gradient-to-br from-rose-50 to-rose-100' : 'bg-rose-50',
      'white': 'bg-white',
      'gray': 'bg-gray-50',
      
      // New gradient backgrounds
      'teal': backgroundType === 'gradient' ? 'bg-gradient-to-br from-teal-50 to-teal-100' : 'bg-teal-50',
      'orange': backgroundType === 'gradient' ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-orange-50',
      'indigo': backgroundType === 'gradient' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' : 'bg-indigo-50',
      'amber': backgroundType === 'gradient' ? 'bg-gradient-to-br from-amber-50 to-amber-100' : 'bg-amber-50',
      
      // Diagonal gradients  
      'ocean': 'bg-gradient-to-r from-cyan-50 to-blue-100',
      'sunset': 'bg-gradient-to-r from-orange-50 to-pink-100',
      'forest': 'bg-gradient-to-r from-green-50 to-emerald-100',
      'lavender': 'bg-gradient-to-r from-purple-50 to-pink-100',
      
      // Multi-color gradients
      'rainbow': 'bg-gradient-to-r from-red-50 via-yellow-50 to-green-50',
      'tropical': 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50',
      'warm-sunset': 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
      'cool-mint': 'bg-gradient-to-br from-green-50 via-teal-50 to-blue-50',
      
      // Solid backgrounds
      'cream': 'bg-amber-50',
      'ice': 'bg-blue-50',
      'soft-mint': 'bg-green-50',
      'light-lavender': 'bg-purple-50',
      
      // Pattern backgrounds (simplified for now - patterns would need CSS)
      'dots': 'bg-gray-50',
      'lines': 'bg-gray-50', 
      'mesh': 'bg-gray-50',
      'paper': 'bg-stone-50'
    };
    
    // Font family mapping
    const fontClasses = {
      'inter': 'font-inter',
      'playfair': 'font-playfair',
      'roboto': 'font-roboto',
      'opensans': 'font-opensans'
    };
    
    return {
      backgroundColor: backgroundClasses[backgroundValue as keyof typeof backgroundClasses] || backgroundClasses.blue,
      fontClass: fontClasses[fontFamily as keyof typeof fontClasses] || fontClasses.inter,
      primaryColor,
      cssVariables: {
        '--theme-primary': primaryColor,
        '--theme-primary-rgb': hexToRgb(primaryColor)
      } as React.CSSProperties
    };
  };
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '37, 99, 235'; // fallback to blue
  };

  // Review form handlers
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewFormData.customerName || !reviewFormData.rating) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and select a rating.",
        variant: "destructive",
      });
      return;
    }

    if (reviewFormData.rating < 1 || reviewFormData.rating > 5) {
      toast({
        title: "Invalid rating",
        description: "Please select a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({
      pageId: pageData.id,
      customerName: reviewFormData.customerName,
      customerEmail: reviewFormData.customerEmail,
      rating: reviewFormData.rating,
      reviewText: reviewFormData.reviewText
    });
  };

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
  const faqs = pageData.faqs || [];
  const gallery = pageData.data?.gallery || pageData.gallery || { banners: [], logos: [], images: [] };
  const themeStyles = page ? getThemeStyles(page) : null;

  return (
    <div 
      className={`min-h-screen ${themeStyles?.backgroundColor || 'bg-background'} ${themeStyles?.fontClass || 'font-inter'}`}
      style={themeStyles?.cssVariables}
    >
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
      <section 
        className="py-32 relative overflow-hidden"
        style={{
          background: themeStyles 
            ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.1) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 100%)`
            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-8 leading-tight">
            {page.title}
          </h1>
          {page.tagline && (
            <p className="text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
              {page.tagline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="px-12 py-6 rounded-2xl text-xl h-auto text-white font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              style={{
                background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)` : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                color: 'white',
                border: 'none'
              }}
              data-testid="button-book-appointment"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book an Appointment
            </Button>
            {page.calendarLink ? (
              <Button
                variant="outline"
                className="px-8 py-4 rounded-xl text-lg h-auto"
                asChild
                data-testid="button-visit-calendar"
              >
                <a href={page.calendarLink} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-5 w-5 mr-2" />
                  View My Calendar
                </a>
              </Button>
            ) : (
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
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Our Services</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the perfect session for your journey and experience our professional services</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {services.map((service: any) => (
                <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200"
                      style={{
                        background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)` : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                      }}
                    >
                      <Calendar 
                        className="h-8 w-8" 
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      />
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
                      className="w-full text-white font-semibold rounded-lg py-3 hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary/90"
                      style={{
                        background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)` : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                        color: 'white',
                        border: 'none'
                      }}
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

      {/* Gallery Section - Consolidated single gallery */}
      {(gallery.banners?.length > 0 || gallery.images?.length > 0 || gallery.logos?.length > 0) && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Gallery</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Take a look at our work and environment</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Render all images from all gallery types */}
              {gallery.banners?.map((image: any, index: number) => (
                <Card key={`banner-${index}`} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      data-testid={`gallery-image-${index}`}
                    />
                  </div>
                </Card>
              ))}
              {gallery.images?.map((image: any, index: number) => (
                <Card key={`image-${index}`} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      data-testid={`gallery-image-${gallery.banners?.length + index}`}
                    />
                  </div>
                </Card>
              ))}
              {gallery.logos?.map((image: any, index: number) => (
                <Card key={`logo-${index}`} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center p-4">
                    <img
                      src={image.url}
                      alt={image.name || 'Logo'}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      data-testid={`gallery-logo-${index}`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <MessageSquare 
                className="h-12 w-12 mr-4" 
                style={{ color: themeStyles?.primaryColor || '#2563eb' }}
              />
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Customer Reviews</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">See what our customers have to say</p>
          </div>

          {/* Display existing reviews */}
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              {reviews.map((review: any) => (
                <Card key={review.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= review.rating ? 'fill-current' : 'fill-muted'}`}
                        style={{ color: star <= review.rating ? (themeStyles?.primaryColor || '#2563eb') : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  {review.reviewText && (
                    <blockquote className="text-foreground mb-4 italic leading-relaxed">
                      "{review.reviewText}"
                    </blockquote>
                  )}
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-semibold text-sm"
                      style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                    >
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{review.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-16">
              <div 
                className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor}15 0%, ${themeStyles.primaryColor}08 100%)` : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)'
                }}
              >
                <MessageSquare 
                  className="h-8 w-8" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Be the first to share your experience!</p>
            </div>
          )}

          {/* Leave a Review Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Leave a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="customerName" className="text-foreground font-medium">
                        Your Name *
                      </Label>
                      <Input
                        id="customerName"
                        value={reviewFormData.customerName}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter your name"
                        className="mt-2"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail" className="text-foreground font-medium">
                        Email (Optional)
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={reviewFormData.customerEmail}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        placeholder="Enter your email"
                        className="mt-2"
                        data-testid="input-customer-email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground font-medium mb-3 block">
                      Rating *
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                          className="p-1 rounded-lg hover:bg-muted transition-colors"
                          data-testid={`star-rating-${star}`}
                        >
                          <Star 
                            className={`h-8 w-8 ${star <= reviewFormData.rating ? 'fill-current' : 'fill-muted'}`}
                            style={{ color: star <= reviewFormData.rating ? (themeStyles?.primaryColor || '#2563eb') : '#e5e7eb' }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reviewText" className="text-foreground font-medium">
                      Your Review
                    </Label>
                    <Textarea
                      id="reviewText"
                      value={reviewFormData.reviewText}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={4}
                      className="mt-2"
                      data-testid="textarea-review-text"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    className="w-full text-white font-semibold py-3 rounded-lg"
                    style={{
                      background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)` : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                      color: 'white',
                      border: 'none'
                    }}
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <HelpCircle 
                  className="h-12 w-12 mr-4" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Frequently Asked Questions</h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about our services</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl px-6 data-[state=open]:bg-muted/20"
                  >
                    <AccordionTrigger 
                      className="text-left py-6 hover:no-underline"
                      data-testid={`faq-question-${index}`}
                    >
                      <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent 
                      className="pb-6 text-muted-foreground leading-relaxed"
                      data-testid={`faq-answer-${index}`}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Business Hours Section */}
      {page.showBusinessHours === 'true' && page.businessHours && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <Clock3 
                  className="h-12 w-12 mr-4" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Business Hours</h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">When we're available for appointments</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="grid gap-4">
                    {Object.entries(page.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-lg font-medium text-foreground capitalize">{day}</span>
                        <span className={`text-lg ${String(hours) === 'Closed' ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                          {String(hours)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Contact Information Section */}
      {page.showContactInfo === 'true' && (page.contactPhone || page.contactEmail || page.businessAddress) && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Contact Information</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Get in touch with us</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {page.contactPhone && (
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-8">
                      <Phone 
                        className="h-12 w-12 mx-auto mb-6" 
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-4">Phone</h3>
                      <a 
                        href={`tel:${page.contactPhone}`}
                        className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="contact-phone"
                      >
                        {page.contactPhone}
                      </a>
                    </CardContent>
                  </Card>
                )}

                {page.contactEmail && (
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-8">
                      <Mail 
                        className="h-12 w-12 mx-auto mb-6" 
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-4">Email</h3>
                      <a 
                        href={`mailto:${page.contactEmail}`}
                        className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="contact-email"
                      >
                        {page.contactEmail}
                      </a>
                    </CardContent>
                  </Card>
                )}

                {page.businessAddress && (
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-8">
                      <MapPin 
                        className="h-12 w-12 mx-auto mb-6" 
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      />
                      <h3 className="text-xl font-semibold text-foreground mb-4">Address</h3>
                      <address 
                        className="text-lg text-muted-foreground not-italic"
                        data-testid="contact-address"
                      >
                        {page.businessAddress}
                      </address>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cancellation Policy Section */}
      {page.cancellationPolicy && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">Cancellation Policy</h3>
              <div className="bg-muted/30 rounded-xl p-6">
                <p className="text-muted-foreground leading-relaxed" data-testid="cancellation-policy">
                  {page.cancellationPolicy}
                </p>
              </div>
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
              className="px-8 py-4 rounded-xl text-lg h-auto bg-primary hover:bg-primary/90 text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(217.2, 91.2%, 60%) 100%)',
                color: 'white',
                border: 'none'
              }}
              data-testid="button-book-appointment-cta"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book an Appointment
            </Button>
            {page.calendarLink ? (
              <Button
                variant="outline"
                className="px-8 py-4 rounded-xl text-lg h-auto"
                asChild
                data-testid="button-visit-calendar-cta"
              >
                <a href={page.calendarLink} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-5 w-5 mr-2" />
                  View My Calendar
                </a>
              </Button>
            ) : (
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
            )}
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
