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
import { getCurrencyByCode } from '@/lib/currencies';
import BookingModal from '@/components/modals/booking-modal';
import { Phone, Calendar, ArrowLeft, Clock, DollarSign, HelpCircle, MapPin, Mail, Clock3, Image, Star, MessageSquare, Sparkles, ChevronLeft, ChevronRight, Scissors, Coffee, Heart, User, Monitor, Camera, Palette, Zap, Target, Shield, Briefcase, Wrench, Headphones, Music, BookOpen, Rocket, Leaf, CheckCircle, AlertCircle, Copy, ExternalLink, TrendingUp, Award, Users, Timer, Loader2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
  
  // Smart icon assignment based on service name
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('cut') || name.includes('hair') || name.includes('style')) return Scissors;
    if (name.includes('coffee') || name.includes('café') || name.includes('cafe')) return Coffee;
    if (name.includes('massage') || name.includes('spa') || name.includes('relax')) return Heart;
    if (name.includes('consult') || name.includes('meeting') || name.includes('session')) return User;
    if (name.includes('design') || name.includes('web') || name.includes('digital')) return Monitor;
    if (name.includes('photo') || name.includes('picture') || name.includes('shoot')) return Camera;
    if (name.includes('art') || name.includes('paint') || name.includes('creative')) return Palette;
    if (name.includes('fitness') || name.includes('training') || name.includes('workout')) return Zap;
    if (name.includes('coaching') || name.includes('mentor') || name.includes('goal')) return Target;
    if (name.includes('security') || name.includes('protect') || name.includes('safe')) return Shield;
    if (name.includes('business') || name.includes('corporate') || name.includes('professional')) return Briefcase;
    if (name.includes('repair') || name.includes('fix') || name.includes('service')) return Wrench;
    if (name.includes('audio') || name.includes('sound') || name.includes('podcast')) return Headphones;
    if (name.includes('music') || name.includes('lesson') || name.includes('instrument')) return Music;
    if (name.includes('education') || name.includes('tutor') || name.includes('learn')) return BookOpen;
    if (name.includes('marketing') || name.includes('growth') || name.includes('launch')) return Rocket;
    if (name.includes('wellness') || name.includes('health') || name.includes('therapy')) return Leaf;
    
    // Default fallback
    return Calendar;
  };

  // Enhanced validation function
  const validateField = (field: string, value: any) => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'customerName':
        if (!value.trim()) errors.customerName = 'Name is required';
        else if (value.trim().length < 2) errors.customerName = 'Name must be at least 2 characters';
        break;
      case 'customerEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.customerEmail = 'Please enter a valid email address';
        }
        break;
      case 'rating':
        if (value === 0) errors.rating = 'Please select a rating';
        break;
      case 'reviewText':
        if (value && value.length > 500) errors.reviewText = 'Review must be under 500 characters';
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Review form handlers
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValid = validateField('customerName', reviewFormData.customerName);
    const emailValid = validateField('customerEmail', reviewFormData.customerEmail);
    const ratingValid = validateField('rating', reviewFormData.rating);
    const textValid = validateField('reviewText', reviewFormData.reviewText);
    
    if (!nameValid || !emailValid || !ratingValid || !textValid) {
      toast({
        title: "Please check your inputs",
        description: "Some fields need attention before submitting.",
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

  // Handle input changes with real-time validation
  const handleInputChange = (field: string, value: any) => {
    setReviewFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Validate on blur (after a slight delay)
    setTimeout(() => validateField(field, value), 300);
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
          <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
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
      className={`min-h-screen ${themeStyles?.backgroundColor || 'bg-background'} ${themeStyles?.fontClass || 'font-inter'} scroll-smooth`}
      style={themeStyles?.cssVariables}
    >
      {/* Enhanced Responsive Header */}
      <header className="border-b border-border/10 bg-card/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{
                  background: themeStyles ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)` : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                }}
              >
                <span className="text-lg sm:text-xl font-bold text-white">
                  {page.title?.charAt(0) || 'B'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg sm:text-xl font-bold text-foreground truncate block">{page.title}</span>
                {page.tagline && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">{page.tagline}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex-shrink-0 h-9 sm:h-10 px-3 sm:px-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Better Mobile Spacing */}
      <section className="relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8">
        {/* Dynamic layered background */}
        <div className="absolute inset-0">
          {/* Primary gradient background */}
          <div 
            className="absolute inset-0"
            style={{
              background: themeStyles 
                ? `radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.15) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 25%, transparent 60%), linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 50%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 100%)`
                : 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 25%, transparent 60%), linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.02) 50%, rgba(37, 99, 235, 0.08) 100%)'
            }}
          ></div>
          
          {/* Enhanced animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-70 animate-pulse"
              style={{
                background: themeStyles 
                  ? `radial-gradient(circle, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.1) 0%, transparent 70%)`
                  : 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
                animationDuration: '4s'
              }}
            ></div>
            <div 
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-60 animate-pulse"
              style={{
                background: themeStyles 
                  ? `radial-gradient(circle, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, transparent 70%)`
                  : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
                animationDuration: '6s',
                animationDelay: '1s'
              }}
            ></div>
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse"
              style={{
                background: themeStyles 
                  ? `radial-gradient(ellipse, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.04) 0%, transparent 70%)`
                  : 'radial-gradient(ellipse, rgba(37, 99, 235, 0.04) 0%, transparent 70%)',
                animationDuration: '8s',
                animationDelay: '2s'
              }}
            ></div>
          </div>
          
          {/* Floating geometric elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-32 left-20 w-2 h-2 rounded-full opacity-40 animate-bounce"
              style={{
                backgroundColor: themeStyles?.primaryColor || '#2563eb',
                animationDuration: '3s',
                animationDelay: '0.5s'
              }}
            ></div>
            <div 
              className="absolute top-48 right-32 w-3 h-3 rotate-45 opacity-30 animate-bounce"
              style={{
                backgroundColor: themeStyles?.primaryColor || '#2563eb',
                animationDuration: '4s',
                animationDelay: '1.5s'
              }}
            ></div>
            <div 
              className="absolute bottom-40 left-1/3 w-1.5 h-1.5 rounded-full opacity-50 animate-bounce"
              style={{
                backgroundColor: themeStyles?.primaryColor || '#2563eb',
                animationDuration: '5s',
                animationDelay: '2.5s'
              }}
            ></div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Professional badge */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <div 
                className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.15) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 100%)`
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
                  color: themeStyles?.primaryColor || '#2563eb'
                }}
                data-testid="hero-professional-badge"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-3 animate-pulse"
                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                ></div>
                ✨ Premium Professional Services
              </div>
            </div>
            
            {/* Enhanced main heading with better mobile typography */}
            <div className="mb-6 sm:mb-10 lg:mb-16">
              {/* Large decorative background text */}
              <div className="relative">
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden"
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                >
                  <span className="text-8xl sm:text-9xl font-black transform rotate-[-5deg] select-none">
                    {page.title?.charAt(0) || 'B'}
                  </span>
                </div>
                
                <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground mb-3 sm:mb-6 leading-[0.9] tracking-tight">
                  <span className="block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {page.title}
                  </span>
                  {/* Subtle underline accent */}
                  <div 
                    className="w-16 sm:w-20 h-1 sm:h-1.5 rounded-full mx-auto mt-2 sm:mt-4 opacity-80"
                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                  ></div>
                </h1>
              </div>
              
              {page.tagline && (
                <div className="relative">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed opacity-95 px-4">
                    {page.tagline}
                  </p>
                  {/* Decorative quotes */}
                  <div className="absolute -top-2 -left-2 text-4xl opacity-20 font-bold" style={{ color: themeStyles?.primaryColor || '#2563eb' }}>"</div>
                  <div className="absolute -bottom-2 -right-2 text-4xl opacity-20 font-bold" style={{ color: themeStyles?.primaryColor || '#2563eb' }}>"</div>
                </div>
              )}
            </div>
            
            {/* Enhanced CTA section with improved mobile layout */}
            <div className="mb-8 sm:mb-12 lg:mb-20">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-4 sm:mb-6 max-w-md sm:max-w-none mx-auto">
                <Button 
                  onClick={() => setShowBookingModal(true)}
                  className="group px-4 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-xl h-auto font-semibold sm:font-bold shadow-lg sm:shadow-2xl hover:shadow-xl sm:hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 sm:duration-500 relative overflow-hidden"
                  style={{
                    background: themeStyles 
                      ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                      : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                  data-testid="button-book-appointment"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center justify-center relative z-10">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Book Appointment
                  </div>
                </Button>
                
                {page.calendarLink ? (
                  <Button
                    variant="outline"
                    className="group px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base h-auto font-medium sm:font-semibold border-2 hover:shadow-md sm:hover:shadow-lg transition-all duration-300"
                    style={{
                      borderColor: themeStyles?.primaryColor || '#2563eb',
                      color: themeStyles?.primaryColor || '#2563eb'
                    }}
                    asChild
                    data-testid="button-visit-calendar"
                  >
                    <a href={page.calendarLink} target="_blank" rel="noopener noreferrer">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      View Calendar
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="group px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base h-auto font-medium sm:font-semibold border-2 hover:shadow-md sm:hover:shadow-lg transition-all duration-300"
                    style={{
                      borderColor: themeStyles?.primaryColor || '#2563eb',
                      color: themeStyles?.primaryColor || '#2563eb'
                    }}
                    asChild
                    data-testid="button-call-us"
                  >
                    <a href="tel:+1234567890">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Call Now
                    </a>
                  </Button>
                )}
              </div>
              
              {/* Enhanced Trust indicators with better mobile design */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="group flex items-center justify-center sm:justify-start p-4 sm:p-3 rounded-2xl sm:rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded-full mr-3 sm:mr-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <CheckCircle className="w-4 h-4 sm:w-3 sm:h-3 text-white" />
                          </div>
                          <div className="text-center sm:text-left">
                            <span className="font-semibold text-foreground text-sm sm:text-xs block">Instant Confirmation</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">Immediate response</span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Get immediate booking confirmation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="group flex items-center justify-center sm:justify-start p-4 sm:p-3 rounded-2xl sm:rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded-full mr-3 sm:mr-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Award className="w-4 h-4 sm:w-3 sm:h-3 text-white" />
                          </div>
                          <div className="text-center sm:text-left">
                            <span className="font-semibold text-foreground text-sm sm:text-xs block">Professional Service</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">Expert quality</span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Certified and experienced professionals</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="group flex items-center justify-center sm:justify-start p-4 sm:p-3 rounded-2xl sm:rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded-full mr-3 sm:mr-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Shield className="w-4 h-4 sm:w-3 sm:h-3 text-white" />
                          </div>
                          <div className="text-center sm:text-left">
                            <span className="font-semibold text-foreground text-sm sm:text-xs block">Secure Booking</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">Safe & protected</span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your data is safe and secure</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Enhanced mobile content section to reduce emptiness */}
              <div className="mt-8 sm:mt-12 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                  {/* Service preview card */}
                  {services.length > 0 && (
                    <div className="relative group">
                      {/* Decorative elements */}
                      <div className="absolute -inset-1 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" 
                           style={{
                             background: themeStyles 
                               ? `linear-gradient(135deg, ${themeStyles.primaryColor}, transparent, ${themeStyles.primaryColor})`
                               : 'linear-gradient(135deg, #2563eb, transparent, #2563eb)'
                           }}>
                      </div>
                      
                      <div className="relative bg-card/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-border/20 shadow-xl">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-4">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                              style={{
                                background: themeStyles 
                                  ? `linear-gradient(135deg, ${themeStyles.primaryColor}20, ${themeStyles.primaryColor}10)`
                                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1))'
                              }}
                            >
                              <Sparkles 
                                className="w-6 h-6" 
                                style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                              />
                            </div>
                          </div>
                          
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                            Ready to Get Started?
                          </h3>
                          
                          <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                            Choose from {services.length} professional service{services.length > 1 ? 's' : ''} designed to meet your needs
                          </p>
                          
                          {/* Service range info */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/10">
                              <div 
                                className="text-lg font-bold mb-1"
                                style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                              >
                                {Math.min(...services.map((s: any) => s.durationMinutes))}
                                {services.length > 1 && `-${Math.max(...services.map((s: any) => s.durationMinutes))}`} min
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">Duration</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/10">
                              <div 
                                className="text-lg font-bold mb-1"
                                style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                              >
                                ${Math.min(...services.map((s: any) => parseInt(s.price) || 0))}
                                {services.length > 1 && services.some((s: any) => parseInt(s.price) !== Math.min(...services.map((s2: any) => parseInt(s2.price) || 0))) && `+`}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">Starting</div>
                            </div>
                          </div>
                          
                          {/* Quick action */}
                          <div className="flex items-center justify-center">
                            <div className="text-xs text-muted-foreground">Scroll down to explore services</div>
                            <div className="ml-2 animate-bounce">
                              <div 
                                className="w-1 h-4 rounded-full"
                                style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb', opacity: 0.6 }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Decorative accent line */}
                  <div className="flex items-center justify-center mt-8 sm:mt-12">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: themeStyles?.primaryColor || '#2563eb',
                          animationDelay: '0s',
                          animationDuration: '2s'
                        }}
                      ></div>
                      <div 
                        className="w-8 h-0.5 rounded-full"
                        style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb', opacity: 0.3 }}
                      ></div>
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: themeStyles?.primaryColor || '#2563eb',
                          animationDelay: '1s',
                          animationDuration: '2s'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Improved mobile-friendly scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div 
            className="w-5 h-8 sm:w-6 sm:h-10 border-2 rounded-full flex justify-center"
            style={{ borderColor: `${themeStyles?.primaryColor || '#2563eb'}40` }}
          >
            <div 
              className="w-0.5 sm:w-1 h-2 sm:h-3 rounded-full mt-2 animate-pulse"
              style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
            ></div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      {services.length > 0 && (
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
          {/* Background enhancements */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: themeStyles 
                  ? `radial-gradient(ellipse at 20% 80%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.06) 0%, transparent 50%)`
                  : 'radial-gradient(ellipse at 20% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 50%)'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced header */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-24">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                }}
              >
                <Sparkles 
                  className="h-8 w-8 sm:h-10 sm:w-10" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">Our Services</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
                Discover our expertly crafted services designed to exceed your expectations and deliver exceptional results
              </p>
              
              {/* Services count indicator */}
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/10 shadow-lg">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                ></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {services.length} Professional Service{services.length !== 1 ? 's' : ''} Available
                </span>
              </div>
            </div>

            {/* Enhanced services grid with improved mobile layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
              {services.map((service: any, index: number) => {
                const IconComponent = getServiceIcon(service.name);
                
                return (
                  <Card 
                    key={service.id} 
                    className="group hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 sm:duration-500 border-0 shadow-md sm:shadow-lg hover:-translate-y-2 sm:hover:-translate-y-4 bg-card/60 backdrop-blur-md relative overflow-hidden"
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                    data-testid={`service-card-${service.id}`}
                  >
                    {/* Enhanced gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: themeStyles 
                          ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.03) 50%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 100%)`
                          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.03) 50%, rgba(37, 99, 235, 0.08) 100%)'
                      }}
                    ></div>
                    
                    {/* Decorative corner accent */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: themeStyles 
                          ? `radial-gradient(circle at 0 0, ${themeStyles.primaryColor} 0%, transparent 70%)`
                          : 'radial-gradient(circle at 0 0, #2563eb 0%, transparent 70%)'
                      }}
                    ></div>
                    
                    <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col relative z-10">
                      {/* Enhanced icon container */}
                      <div className="relative mb-6 sm:mb-8">
                        <div 
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl"
                          style={{
                            background: themeStyles 
                              ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                          }}
                        >
                          <IconComponent 
                            className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" 
                            style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                          />
                        </div>
                        
                        {/* Floating accent dots */}
                        <div 
                          className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-pulse"
                          style={{ 
                            backgroundColor: themeStyles?.primaryColor || '#2563eb',
                            animationDuration: '2s',
                            animationDelay: `${index * 0.3}s`
                          }}
                        ></div>
                      </div>
                      
                      {/* Service title and description */}
                      <div className="mb-6 sm:mb-8 flex-grow">
                        <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                            {service.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Enhanced pricing and duration */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-background/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/10">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center">
                              <div 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-md"
                                style={{
                                  background: themeStyles 
                                    ? `${themeStyles.primaryColor}25`
                                    : 'rgba(37, 99, 235, 0.25)'
                                }}
                              >
                                <DollarSign 
                                  className="h-4 w-4 sm:h-5 sm:w-5" 
                                  style={{ color: themeStyles?.primaryColor || '#2563eb' }} 
                                />
                              </div>
                              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                                {getCurrencyByCode(service.currency || 'USD')?.symbol || '$'}{service.price}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-muted-foreground mb-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="text-sm font-medium">{service.durationMinutes} min</span>
                              </div>
                              <div className="text-xs text-muted-foreground opacity-75">Duration</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced booking button with improved mobile layout */}
                        <Button 
                          onClick={() => setShowBookingModal(true)}
                          className="w-full font-medium sm:font-semibold rounded-lg sm:rounded-xl py-3 sm:py-4 lg:py-5 h-auto hover:shadow-lg sm:hover:shadow-2xl transform hover:scale-105 transition-all duration-300 sm:duration-500 relative overflow-hidden group text-sm sm:text-base lg:text-lg"
                          style={{
                            background: themeStyles 
                              ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                              : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                            color: 'white',
                            border: 'none'
                          }}
                          data-testid={`button-book-service-${service.id}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800"></div>
                          <div className="flex items-center justify-center relative z-10">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                            <span>Book This Service</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Services summary */}
            <div className="text-center mt-20">
              <div className="inline-flex items-center space-x-4 sm:space-x-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/10 shadow-lg">
                <div className="text-center">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  >
                    {services.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Services</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  >
                    {Math.min(...services.map((s: any) => s.durationMinutes))}-{Math.max(...services.map((s: any) => s.durationMinutes))}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Minutes</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  >
                    ${Math.min(...services.map((s: any) => parseInt(s.price)))}-{Math.max(...services.map((s: any) => parseInt(s.price)))}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Price Range</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section - Modern Slideshow */}
      {(() => {
        // Combine all gallery images into one array for the slideshow
        const allImages = [
          ...(gallery.banners || []).map((img: any) => ({ ...img, type: 'banner' })),
          ...(gallery.images || []).map((img: any) => ({ ...img, type: 'image' })),
          ...(gallery.logos || []).map((img: any) => ({ ...img, type: 'logo' }))
        ];
        
        if (allImages.length === 0) return null;
        
        return (
          <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
            {/* Enhanced background */}
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: themeStyles 
                    ? `radial-gradient(circle at 30% 20%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.06) 0%, transparent 50%)`
                    : 'radial-gradient(circle at 30% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(37, 99, 235, 0.06) 0%, transparent 50%)'
                }}
              ></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Header */}
              <div className="text-center mb-20">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl"
                  style={{
                    background: themeStyles 
                      ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                      : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                  }}
                >
                  <Image 
                    className="h-8 w-8 sm:h-10 sm:w-10" 
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">Gallery</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover our work through this curated collection showcasing the quality and style that defines our service
                </p>
                <div className="flex items-center justify-center mt-8">
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(allImages.length, 5) }, (_, i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: themeStyles?.primaryColor || '#2563eb',
                          opacity: 0.3 + (i * 0.15)
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carousel Container */}
              <div className="max-w-6xl mx-auto">
                <Carousel 
                  className="w-full" 
                  opts={{
                    align: "center",
                    loop: true,
                    skipSnaps: false,
                    dragFree: true
                  }}
                >
                  <CarouselContent className="-ml-4">
                    {allImages.map((image: any, index: number) => (
                      <CarouselItem key={`${image.type}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="group relative">
                          {/* Main image container with enhanced styling */}
                          <div className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:-translate-y-3">
                            {image.type === 'logo' ? (
                              /* Logo specific styling */
                              <div className="aspect-square bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/50 via-transparent to-white/20 dark:from-gray-700/50 dark:to-gray-800/20"></div>
                                <img
                                  src={image.url}
                                  alt={image.name || 'Logo'}
                                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 filter drop-shadow-lg"
                                  data-testid={`gallery-logo-${index}`}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              /* Regular image styling */
                              <div className="aspect-[4/3] relative overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.name || 'Gallery image'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  data-testid={`gallery-image-${index}`}
                                  loading="lazy"
                                />
                                {/* Dynamic gradient overlay */}
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                  style={{
                                    background: themeStyles 
                                      ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.1) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 50%, transparent 100%)`
                                      : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 100%)'
                                  }}
                                ></div>
                              </div>
                            )}
                            
                            {/* Elegant border glow effect */}
                            <div 
                              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                boxShadow: themeStyles 
                                  ? `0 0 0 2px rgba(${hexToRgb(themeStyles.primaryColor)}, 0.3), 0 0 20px rgba(${hexToRgb(themeStyles.primaryColor)}, 0.1)`
                                  : '0 0 0 2px rgba(37, 99, 235, 0.3), 0 0 20px rgba(37, 99, 235, 0.1)'
                              }}
                            ></div>
                          </div>
                          
                          {/* Image name/caption */}
                          {image.name && (
                            <div className="mt-6 text-center">
                              <h4 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                {image.name}
                              </h4>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* Custom styled navigation buttons */}
                  <CarouselPrevious 
                    className="-left-16 sm:left-2 w-12 h-12 border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                    style={{
                      background: themeStyles 
                        ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                        : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                      color: 'white'
                    }}
                    data-testid="gallery-previous-button"
                  />
                  <CarouselNext 
                    className="-right-16 sm:right-2 w-12 h-12 border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                    style={{
                      background: themeStyles 
                        ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                        : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                      color: 'white'
                    }}
                    data-testid="gallery-next-button"
                  />
                </Carousel>
                
                {/* Gallery stats */}
                <div className="text-center mt-16">
                  <div className="inline-flex items-center space-x-8 px-8 py-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/10 shadow-lg">
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      >
                        {allImages.length}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Images</div>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      >
                        {gallery.banners?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Banners</div>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                      >
                        {gallery.logos?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">Logos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Enhanced Reviews Section */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        {/* Elegant background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: themeStyles 
                ? `radial-gradient(ellipse at 30% 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.04) 0%, transparent 50%)`
                : 'radial-gradient(ellipse at 30% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(37, 99, 235, 0.04) 0%, transparent 50%)'
            }}
          ></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced section header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-24">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl"
              style={{
                background: themeStyles 
                  ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
              }}
            >
              <MessageSquare 
                className="h-8 w-8 sm:h-10 sm:w-10" 
                style={{ color: themeStyles?.primaryColor || '#2563eb' }}
              />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">Customer Reviews</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Discover what our valued customers have to say about their experiences with our professional services
            </p>
            
            {/* Review stats */}
            {reviews.length > 0 && (
              <div className="inline-flex items-center space-x-4 sm:space-x-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/10 shadow-lg">
                <div className="text-center">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  >
                    {reviews.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Reviews</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                  >
                    {reviews.length > 0 ? (reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Average</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avgRating = reviews.length > 0 ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length : 0;
                    return (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= avgRating ? 'fill-current' : 'fill-muted'}`}
                        style={{ color: star <= avgRating ? (themeStyles?.primaryColor || '#2563eb') : '#e5e7eb' }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced reviews display */}
          {reviews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto mb-20">
              {reviews.map((review: any, index: number) => (
                <Card 
                  key={review.id} 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/60 backdrop-blur-md relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 150}ms`
                  }}
                  data-testid={`review-card-${review.id}`}
                >
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: themeStyles 
                        ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 100%)`
                        : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
                    }}
                  ></div>
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
                    {/* Rating stars with enhanced styling */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-6 w-6 ${star <= review.rating ? 'fill-current' : 'fill-muted'} transition-colors duration-300`}
                            style={{ color: star <= review.rating ? (themeStyles?.primaryColor || '#2563eb') : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      <div 
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{
                          background: themeStyles 
                            ? `${themeStyles.primaryColor}20`
                            : 'rgba(37, 99, 235, 0.2)',
                          color: themeStyles?.primaryColor || '#2563eb'
                        }}
                      >
                        {review.rating}.0
                      </div>
                    </div>
                    
                    {/* Review text with better typography */}
                    {review.reviewText && (
                      <blockquote className="text-foreground mb-8 leading-relaxed text-lg relative">
                        <div 
                          className="absolute -top-2 -left-1 text-6xl font-serif opacity-20"
                          style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                        >
                          “
                        </div>
                        <div className="relative pl-6">
                          {review.reviewText}
                        </div>
                      </blockquote>
                    )}
                    
                    {/* Enhanced customer info */}
                    <div className="flex items-center">
                      <div className="relative">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          style={{
                            background: themeStyles 
                              ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                              : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                          }}
                        >
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div 
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                        >
                          <Star className="h-3 w-3 fill-current text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-bold text-foreground text-lg">{review.customerName}</div>
                        <div className="text-muted-foreground font-medium">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 mb-20">
              <div 
                className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-xl"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(135deg, ${themeStyles.primaryColor}15 0%, ${themeStyles.primaryColor}08 100%)`
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)'
                }}
              >
                <MessageSquare 
                  className="h-12 w-12" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">No reviews yet</h3>
              <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                Be the first to share your experience and help others discover our exceptional service!
              </p>
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="h-5 w-5 sm:h-6 sm:w-6 fill-current opacity-30"
                      style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                    />
                  ))}
                  <span className="ml-3 text-muted-foreground font-medium">Awaiting your first review</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Review Form */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-md relative overflow-hidden">
              {/* Form background accent */}
              <div 
                className="absolute top-0 left-0 w-full h-2"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(90deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                    : 'linear-gradient(90deg, #2563eb 0%, #2563ebdd 100%)'
                }}
              ></div>
              
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="text-center mb-10">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg"
                    style={{
                      background: themeStyles 
                        ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                        : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                    }}
                  >
                    <Star 
                      className="h-8 w-8" 
                      style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                    />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Share Your Experience</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Your feedback helps us improve and helps others make informed decisions
                  </p>
                </div>
                
                <form onSubmit={handleReviewSubmit} className="space-y-8">
                  {/* Enhanced form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="customerName" className="text-foreground font-semibold text-lg mb-3 block">
                        Your Name *
                      </Label>
                      <div className="relative">
                        <Input
                          id="customerName"
                          value={reviewFormData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          placeholder="Enter your full name"
                          className={`h-12 text-lg border-2 rounded-xl focus:ring-2 focus:ring-opacity-20 pr-10 ${
                            validationErrors.customerName ? 'border-red-500 focus:border-red-500' : 
                            reviewFormData.customerName && !validationErrors.customerName ? 'border-green-500' : ''
                          }`}
                          style={{
                            borderColor: !validationErrors.customerName && reviewFormData.customerName ? (themeStyles?.primaryColor || '#2563eb') : undefined,
                            '--tw-ring-color': themeStyles?.primaryColor || '#2563eb'
                          } as React.CSSProperties}
                          data-testid="input-customer-name"
                          aria-invalid={!!validationErrors.customerName}
                          required
                        />
                        {reviewFormData.customerName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validationErrors.customerName ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {validationErrors.customerName && (
                        <p className="text-sm text-red-500 mt-1 flex items-center" data-testid="error-customer-name">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {validationErrors.customerName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customerEmail" className="text-foreground font-semibold text-lg mb-3 block">
                        Email (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="customerEmail"
                          type="email"
                          value={reviewFormData.customerEmail}
                          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                          placeholder="your.email@example.com"
                          className={`h-12 text-lg border-2 rounded-xl focus:ring-2 focus:ring-opacity-20 pr-10 ${
                            validationErrors.customerEmail ? 'border-red-500 focus:border-red-500' : 
                            reviewFormData.customerEmail && !validationErrors.customerEmail ? 'border-green-500' : ''
                          }`}
                          style={{
                            borderColor: !validationErrors.customerEmail && reviewFormData.customerEmail ? (themeStyles?.primaryColor || '#2563eb') : undefined,
                            '--tw-ring-color': themeStyles?.primaryColor || '#2563eb'
                          } as React.CSSProperties}
                          data-testid="input-customer-email"
                          aria-invalid={!!validationErrors.customerEmail}
                        />
                        {reviewFormData.customerEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validationErrors.customerEmail ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {validationErrors.customerEmail ? (
                        <p className="text-sm text-red-500 mt-1 flex items-center" data-testid="error-customer-email">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {validationErrors.customerEmail}
                        </p>
                      ) : (
                        reviewFormData.customerEmail && (
                          <p className="text-xs text-muted-foreground mt-1">Great! We'll use this to verify your review</p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Enhanced rating section */}
                  <div className="text-center">
                    <Label className="text-foreground font-semibold text-lg mb-6 block">
                      How would you rate your experience? *
                    </Label>
                    <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-background/50 border border-border/20">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange('rating', star)}
                          className="p-2 rounded-xl hover:bg-background/80 transition-all duration-300 transform hover:scale-110"
                          data-testid={`star-rating-${star}`}
                        >
                          <Star 
                            className={`h-10 w-10 transition-all duration-300 ${star <= reviewFormData.rating ? 'fill-current scale-110' : 'fill-muted hover:scale-105'}`}
                            style={{ 
                              color: star <= reviewFormData.rating ? (themeStyles?.primaryColor || '#2563eb') : '#e5e7eb'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewFormData.rating > 0 && (
                      <div className="mt-4 text-muted-foreground font-medium">
                        {reviewFormData.rating === 5 && "Excellent! ⭐"}
                        {reviewFormData.rating === 4 && "Great! 👍"}
                        {reviewFormData.rating === 3 && "Good 👌"}
                        {reviewFormData.rating === 2 && "Fair 😐"}
                        {reviewFormData.rating === 1 && "Poor 😔"}
                      </div>
                    )}
                    {validationErrors.rating && (
                      <p className="text-sm text-red-500 mt-2 flex items-center justify-center" data-testid="error-rating">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {validationErrors.rating}
                      </p>
                    )}
                  </div>

                  {/* Enhanced review text area */}
                  <div>
                    <Label htmlFor="reviewText" className="text-foreground font-semibold text-lg mb-3 block">
                      Tell us about your experience
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="reviewText"
                        value={reviewFormData.reviewText}
                        onChange={(e) => handleInputChange('reviewText', e.target.value)}
                        placeholder="Share what you loved about our service, what could be improved, or any other feedback..."
                        rows={6}
                        className={`text-lg border-2 rounded-xl resize-none focus:ring-2 focus:ring-opacity-20 ${
                          validationErrors.reviewText ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        style={{
                          borderColor: !validationErrors.reviewText && reviewFormData.reviewText ? (themeStyles?.primaryColor || '#2563eb') : undefined,
                          '--tw-ring-color': themeStyles?.primaryColor || '#2563eb'
                        } as React.CSSProperties}
                        data-testid="textarea-review-text"
                        aria-invalid={!!validationErrors.reviewText}
                        maxLength={500}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {validationErrors.reviewText ? (
                          <p className="text-sm text-red-500 flex items-center" data-testid="error-review-text">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors.reviewText}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Optional - help others understand your experience</p>
                        )}
                      </div>
                      <span 
                        className={`text-xs font-medium ${
                          reviewFormData.reviewText.length > 450 ? 'text-red-500' : 
                          reviewFormData.reviewText.length > 400 ? 'text-yellow-500' : 
                          'text-muted-foreground'
                        }`} 
                        data-testid="text-character-counter"
                      >
                        {reviewFormData.reviewText.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Enhanced submit button */}
                  <Button
                    type="submit"
                    disabled={submitReviewMutation.isPending || !reviewFormData.customerName || reviewFormData.rating === 0}
                    className="w-full h-14 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden group"
                    style={{
                      background: themeStyles 
                        ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                        : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                      color: 'white',
                      border: 'none'
                    }}
                    data-testid="button-submit-review"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="flex items-center justify-center relative z-10">
                      {submitReviewMutation.isPending ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          Submitting Review...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                          Publish Your Review
                        </>
                      )}
                    </div>
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Your review will be published after a quick moderation process to ensure quality and authenticity.
                  </p>
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
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">Frequently Asked Questions</h2>
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
                      className="text-left py-6 hover:no-underline group"
                      data-testid={`faq-question-${index}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base sm:text-lg font-semibold text-foreground">{faq.question}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center ml-4">
                                <HelpCircle 
                                  className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300" 
                                />
                                <ChevronRight 
                                  className="h-4 w-4 ml-2 text-muted-foreground transform group-data-[state=open]:rotate-90 transition-transform duration-300"
                                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to {faq.answer ? 'expand answer' : 'show more'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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

      {/* Enhanced Business Hours Section */}
      {page.showBusinessHours === 'true' && page.businessHours && (
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
          {/* Elegant background with theme colors */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: themeStyles 
                  ? `radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, transparent 70%)`
                  : 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 70%)'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                }}
              >
                <Clock3 
                  className="h-8 w-8 sm:h-10 sm:w-10" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">Business Hours</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Plan your visit during our convenient hours. We're here to serve you when you need us most.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-md relative overflow-hidden">
                {/* Elegant top accent */}
                <div 
                  className="absolute top-0 left-0 w-full h-2"
                  style={{
                    background: themeStyles 
                      ? `linear-gradient(90deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                      : 'linear-gradient(90deg, #2563eb 0%, #2563ebdd 100%)'
                  }}
                ></div>
                
                <CardContent className="p-6 sm:p-8 lg:p-10">
                  {/* Current status indicator */}
                  <div className="text-center mb-8">
                    <div 
                      className="inline-flex items-center px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg"
                      style={{
                        background: themeStyles 
                          ? `${themeStyles.primaryColor}15`
                          : 'rgba(37, 99, 235, 0.15)',
                        color: themeStyles?.primaryColor || '#2563eb',
                        border: `2px solid ${themeStyles?.primaryColor || '#2563eb'}20`
                      }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                              Currently {(() => {
                                const now = new Date();
                                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                const currentHours = page.businessHours[currentDay];
                                const isOpen = String(currentHours) !== 'Closed';
                                return (
                                  <span className="flex items-center">
                                    {isOpen ? 'Open' : 'Closed'}
                                    <div 
                                      className={`w-2 h-2 rounded-full ml-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                                    ></div>
                                  </span>
                                );
                              })()}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {(() => {
                                const now = new Date();
                                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                const currentHours = page.businessHours[currentDay];
                                return String(currentHours) === 'Closed' 
                                  ? 'We are currently closed'
                                  : `We are open today: ${currentHours}`;
                              })()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {Object.entries(page.businessHours).map(([day, hours], index) => {
                      const now = new Date();
                      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                      const isToday = day === currentDay;
                      const isClosed = String(hours) === 'Closed';
                      
                      return (
                        <div 
                          key={day} 
                          className={`group flex justify-between items-center p-6 rounded-2xl transition-all duration-300 ${
                            isToday 
                              ? 'shadow-lg transform scale-105'
                              : 'hover:shadow-md hover:transform hover:scale-102'
                          }`}
                          style={{
                            background: isToday 
                              ? themeStyles 
                                ? `linear-gradient(135deg, ${themeStyles.primaryColor}10 0%, ${themeStyles.primaryColor}05 100%)`
                                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
                              : 'rgba(255, 255, 255, 0.5)',
                            border: isToday 
                              ? `2px solid ${themeStyles?.primaryColor || '#2563eb'}30`
                              : '2px solid transparent',
                            animationDelay: `${index * 100}ms`
                          }}
                          data-testid={`business-hours-${day}`}
                        >
                          <div className="flex items-center">
                            {isToday && (
                              <div 
                                className="w-3 h-3 rounded-full mr-4 animate-pulse"
                                style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                              ></div>
                            )}
                            <span 
                              className={`text-xl font-semibold capitalize ${
                                isToday ? 'text-foreground' : 'text-foreground/90'
                              }`}
                            >
                              {day}
                            </span>
                            {isToday && (
                              <span 
                                className="ml-3 px-3 py-1 rounded-lg text-sm font-bold"
                                style={{
                                  background: themeStyles?.primaryColor || '#2563eb',
                                  color: 'white'
                                }}
                              >
                                Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            {isClosed ? (
                              <>
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                <span className="text-xl text-muted-foreground font-medium">
                                  Closed
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-xl font-bold text-foreground">
                                  {String(hours)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Additional info */}
                  <div className="mt-10 p-6 rounded-2xl bg-background/50 border border-border/20">
                    <div className="flex items-center justify-center text-center">
                      <div className="flex items-center text-muted-foreground">
                        <Clock3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="font-medium">All times are in your local timezone</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Contact Information Section */}
      {page.showContactInfo === 'true' && (page.contactPhone || page.contactEmail || page.businessAddress) && (
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
          {/* Sophisticated background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: themeStyles 
                  ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.08) 0%, transparent 50%)`
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 sm:mb-16 lg:mb-24">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl"
                style={{
                  background: themeStyles 
                    ? `linear-gradient(135deg, ${themeStyles.primaryColor}20 0%, ${themeStyles.primaryColor}10 100%)`
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                }}
              >
                <Phone 
                  className="h-8 w-8 sm:h-10 sm:w-10" 
                  style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">Get in Touch</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
                Ready to connect? Choose your preferred method of contact and let's start the conversation.
              </p>
              
              {/* Contact info display */}
              {[page.contactPhone, page.contactEmail, page.businessAddress].filter(Boolean).length > 0 && (
                <div className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/10 shadow-lg">
                  <div className="text-center">
                    <div 
                      className="text-xl sm:text-2xl font-bold mb-1"
                      style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                    >
                      {[page.contactPhone, page.contactEmail, page.businessAddress].filter(Boolean).length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Contact Methods</div>
                  </div>
                </div>
              )}
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {page.contactPhone && (
                  <Card className="group text-center border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 bg-card/80 backdrop-blur-md relative overflow-hidden">
                    {/* Hover gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: themeStyles 
                          ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 100%)`
                          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
                      }}
                    ></div>
                    
                    <CardContent className="p-6 sm:p-8 lg:p-10 relative z-10">
                      <div 
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500"
                        style={{
                          background: themeStyles 
                            ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                            : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                        }}
                      >
                        <Phone className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-6">Phone</h3>
                      <div className="flex items-center justify-center gap-3">
                        <a 
                          href={`tel:${page.contactPhone}`}
                          className="text-xl text-muted-foreground hover:text-foreground transition-colors font-medium group-hover:font-semibold"
                          data-testid="contact-phone"
                        >
                          {page.contactPhone}
                        </a>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(page.contactPhone, 'Phone number')}
                                className="h-8 w-8 p-0 hover:bg-background/80 transition-all duration-300"
                                data-testid="button-copy-phone"
                              >
                                {copiedField === 'Phone number' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedField === 'Phone number' ? 'Copied!' : 'Copy phone'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Click to call directly
                      </p>
                    </CardContent>
                  </Card>
                )}

                {page.contactEmail && (
                  <Card className="group text-center border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 bg-card/80 backdrop-blur-md relative overflow-hidden">
                    {/* Hover gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: themeStyles 
                          ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 100%)`
                          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
                      }}
                    ></div>
                    
                    <CardContent className="p-6 sm:p-8 lg:p-10 relative z-10">
                      <div 
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500"
                        style={{
                          background: themeStyles 
                            ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                            : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                        }}
                      >
                        <Mail className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-6">Email</h3>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <a 
                          href={`mailto:${page.contactEmail}`}
                          className="text-xl text-muted-foreground hover:text-foreground transition-colors font-medium group-hover:font-semibold break-all"
                          data-testid="contact-email"
                        >
                          {page.contactEmail}
                        </a>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(page.contactEmail, 'Email address')}
                                className="h-8 w-8 p-0 hover:bg-background/80 transition-all duration-300 flex-shrink-0"
                                data-testid="button-copy-email"
                              >
                                {copiedField === 'Email address' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedField === 'Email address' ? 'Copied!' : 'Copy email'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Send us a message
                      </p>
                    </CardContent>
                  </Card>
                )}

                {page.businessAddress && (
                  <Card className="group text-center border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 bg-card/80 backdrop-blur-md relative overflow-hidden">
                    {/* Hover gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: themeStyles 
                          ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 100%)`
                          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
                      }}
                    ></div>
                    
                    <CardContent className="p-6 sm:p-8 lg:p-10 relative z-10">
                      <div 
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500"
                        style={{
                          background: themeStyles 
                            ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                            : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                        }}
                      >
                        <MapPin className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-6">Address</h3>
                      <div className="flex items-start justify-center gap-3">
                        <address 
                          className="text-xl text-muted-foreground not-italic font-medium group-hover:font-semibold transition-all duration-300 leading-relaxed text-center"
                          data-testid="contact-address"
                        >
                          {page.businessAddress}
                        </address>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(page.businessAddress, 'Address')}
                                className="h-8 w-8 p-0 hover:bg-background/80 transition-all duration-300 flex-shrink-0 mt-1"
                                data-testid="button-copy-address"
                              >
                                {copiedField === 'Address' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedField === 'Address' ? 'Copied!' : 'Copy address'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        Visit us in person
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Additional contact CTA */}
              <div className="text-center mt-16">
                <div className="max-w-2xl mx-auto">
                  <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/20 shadow-lg">
                    <h3 className="text-2xl font-bold text-foreground mb-4">Prefer a Different Method?</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      We're flexible and happy to accommodate your communication preferences. Let us know how you'd like to connect!
                    </p>
                    <Button 
                      onClick={() => setShowBookingModal(true)}
                      className="px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                      style={{
                        background: themeStyles 
                          ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                          : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                      data-testid="button-contact-us-cta"
                    >
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Schedule a Consultation
                    </Button>
                  </div>
                </div>
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
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
