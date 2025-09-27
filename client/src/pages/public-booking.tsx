import { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getCurrencyByCode } from '@/lib/currencies';
import { getPublicPageBySlug, getPublicServicesByPageId, getPublicReviewsByPageId, getPublicStaffByPageId } from '@/lib/supabase-queries';
import BookingModal from '@/components/modals/booking-modal';
import { Phone, Calendar, ArrowLeft, Clock, DollarSign, HelpCircle, MapPin, Mail, Clock3, Image, Star, MessageSquare, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Scissors, Coffee, Heart, User, Monitor, Camera, Palette, Zap, Target, Shield, Briefcase, Wrench, Headphones, Music, BookOpen, Rocket, Leaf, CheckCircle, AlertCircle, Copy, ExternalLink, FileText, TrendingUp, Award, Users, Timer, Loader2, Info, Calendar as CalendarIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function PublicBooking() {
  const { slug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBusinessHours, setShowBusinessHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 0,
    reviewText: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // State for tabbed interface
  const [activeTab, setActiveTab] = useState('about');
  const heroRef = useRef<HTMLElement>(null);

  // Use direct Supabase client for public page data
  const { data: pageData, isLoading, error } = useQuery<any>({
    queryKey: [`public-page-${slug}`],
    queryFn: () => getPublicPageBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch services and reviews for this page using direct Supabase client
  const { data: pageServices = [] } = useQuery<any[]>({
    queryKey: [`public-services-${pageData?.id}`],
    queryFn: () => getPublicServicesByPageId(pageData?.id),
    enabled: !!pageData?.id,
  });

  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: [`public-reviews-${pageData?.id}`],
    queryFn: () => getPublicReviewsByPageId(pageData?.id),
    enabled: !!pageData?.id,
  });

  const { data: pageStaff = [] } = useQuery<any[]>({
    queryKey: [`public-staff-${pageData?.id}`],
    queryFn: () => getPublicStaffByPageId(pageData?.id),
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
      queryClient.invalidateQueries({ queryKey: [`public-reviews-${pageData?.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting review",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Tab items for the interface
  const tabItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'book', label: 'Book', icon: CalendarIcon },
  ];

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
  const services = pageServices;
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

      {/* Mobile-First Hero Section with Glass Prism Effects */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8"
      >
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
          
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Professional badge */}
            <div className="mt-8 sm:mt-12 mb-8 sm:mb-12 lg:mb-16">
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
                </h1>
              </div>
              
              {page.tagline && (
                <div className="relative">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed opacity-95 px-4">
                    {page.tagline}
                  </p>
                </div>
              )}
            </div>
            
            {/* Enhanced CTA section with improved mobile layout */}
            <div className="mb-8 sm:mb-12 lg:mb-20">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-4 sm:mb-6 max-w-md sm:max-w-none mx-auto">
                <Button 
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-xl h-auto font-semibold sm:font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-book-appointment"
                >
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
                    Book Appointment
                  </div>
                </Button>
                
                {page.calendarLink && (
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
                )}
              </div>
              
              {/* Enhanced Trust indicators with better mobile design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto mb-8">
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


            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Interface Section */}
      <section className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList 
              className="grid w-full grid-cols-7 glass-prism-card backdrop-blur-md border border-border/20 shadow-xl mb-8"
              style={{
                background: themeStyles 
                  ? `linear-gradient(135deg, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.05) 0%, rgba(${hexToRgb(themeStyles.primaryColor)}, 0.02) 100%)`
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
              }}
            >
              {tabItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TabsTrigger 
                    key={item.id} 
                    value={item.id}
                    className="flex flex-col items-center px-3 py-4 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:shadow-lg"
                    style={{
                      color: activeTab === item.id ? 'white' : undefined,
                      background: activeTab === item.id 
                        ? themeStyles 
                          ? `linear-gradient(135deg, ${themeStyles.primaryColor} 0%, ${themeStyles.primaryColor}dd 100%)`
                          : 'linear-gradient(135deg, #2563eb 0%, #2563ebdd 100%)'
                        : undefined
                    }}
                    data-testid={`tab-${item.id}`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span>{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="about">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">About {page.title}</h3>
                    {page.tagline && (
                      <p className="text-lg text-muted-foreground mb-6">{page.tagline}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Business Description */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                          <Info className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                          Description
                        </h4>
                        <div className="bg-background/50 rounded-lg p-6 border border-border/20">
                          <p className="text-muted-foreground leading-relaxed">
                            {page.data?.description || page.cancellationPolicy || `Welcome to ${page.title}! We are pleased to inform you that ${page.title?.split(' ')[0]} will be providing you with exceptional professional services. Our team is dedicated to delivering high-quality service and ensuring your satisfaction. We look forward to serving you and exceeding your expectations.`}
                          </p>
                        </div>
                      </div>

                      {/* Key Features */}
                      <div>
                        <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                          <Sparkles className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                          What We Offer
                        </h4>
                        <div className="grid gap-3">
                          {services.length > 0 && (
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{services.length} Professional Service{services.length > 1 ? 's' : ''} Available</span>
                            </div>
                          )}
                          {pageStaff.length > 0 && (
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Expert Team of {pageStaff.length} Professional{pageStaff.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {page.acceptReviews === "true" && (
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Customer Reviews & Ratings</span>
                            </div>
                          )}
                          {page.calendarLink && (
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Online Booking Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Photos */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                          <Image className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                          Photos
                        </h4>
                        {gallery.images && gallery.images.length > 0 ? (
                          <Carousel className="w-full">
                            <CarouselContent>
                              {gallery.images.map((image: any, index: number) => (
                                <CarouselItem key={index}>
                                  <div className="relative aspect-square rounded-lg overflow-hidden">
                                    <img 
                                      src={image.url || image} 
                                      alt={`${page.title} - Photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        ) : (
                          <div className="bg-background/50 rounded-lg p-8 border border-border/20 text-center">
                            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No photos available yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Bar */}
                  {page.showContactInfo === "true" && (page.contactPhone || page.contactEmail || page.businessAddress) && (
                    <div className="bg-background/50 rounded-lg p-6 border border-border/20">
                      <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                        Contact Information
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {page.contactPhone && (
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                            >
                              <Phone className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <a href={`tel:${page.contactPhone}`} className="font-medium text-foreground hover:underline">
                                {page.contactPhone}
                              </a>
                            </div>
                          </div>
                        )}
                        {page.contactEmail && (
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                            >
                              <Mail className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <a href={`mailto:${page.contactEmail}`} className="font-medium text-foreground hover:underline">
                                {page.contactEmail}
                              </a>
                            </div>
                          </div>
                        )}
                        {page.businessAddress && (
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                            >
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Address</p>
                              <p className="font-medium text-foreground">{page.businessAddress}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Our Services</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Discover our range of professional services designed to meet your needs
                    </p>
                  </div>

                  {services.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {services.map((service: any, index: number) => {
                        const ServiceIcon = getServiceIcon(service.name);
                        const currency = getCurrencyByCode(service.currency || 'USD');
                        
                        return (
                          <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 border-border/20 bg-background/50 backdrop-blur-sm" data-testid={`card-service-${service.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div 
                                  className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                >
                                  <ServiceIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                      {service.name}
                                    </h4>
                                  </div>
                                  
                                  {service.description && (
                                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                      {service.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{service.durationMinutes} min</span>
                                      </div>
                                      <div className="flex items-center text-sm font-semibold">
                                        <DollarSign className="h-4 w-4 mr-1" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                                        <span style={{ color: themeStyles?.primaryColor || '#2563eb' }}>
                                          {currency?.symbol || '$'}{parseFloat(service.price).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      onClick={() => setShowBookingModal(true)}
                                      className="h-8 px-3 text-xs font-medium"
                                      style={{
                                        backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                        color: 'white'
                                      }}
                                      data-testid={`button-book-${service.id}`}
                                    >
                                      Book
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${themeStyles?.primaryColor || '#2563eb'}20` }}
                      >
                        <Sparkles className="h-8 w-8" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                      </div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">No Services Listed</h4>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Services are currently being updated. Please contact us directly for information about available services.
                      </p>
                      {(page.contactPhone || page.contactEmail) && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                          {page.contactPhone && (
                            <Button variant="outline" asChild data-testid="button-call-no-services">
                              <a href={`tel:${page.contactPhone}`} className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Us
                              </a>
                            </Button>
                          )}
                          {page.contactEmail && (
                            <Button variant="outline" asChild data-testid="button-email-no-services">
                              <a href={`mailto:${page.contactEmail}`} className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                Email Us
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Categories or Additional Info */}
                  {services.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border/20">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                          Need something specific? We offer customized services to meet your unique requirements.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setShowBookingModal(true)}
                            className="px-6 py-2"
                            style={{
                              backgroundColor: themeStyles?.primaryColor || '#2563eb',
                              color: 'white'
                            }}
                            data-testid="button-book-custom"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Appointment
                          </Button>
                          {page.contactPhone && (
                            <Button variant="outline" asChild data-testid="button-call-custom">
                              <a href={`tel:${page.contactPhone}`} className="flex items-center px-6 py-2">
                                <Phone className="h-4 w-4 mr-2" />
                                Ask About Custom Services
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Our experienced professionals are here to provide you with exceptional service
                    </p>
                  </div>

                  {pageStaff.filter((staff: any) => staff.isActive !== false).length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {pageStaff
                        .filter((staff: any) => staff.isActive !== false)
                        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map((staff: any) => (
                          <Card key={staff.id} className="group hover:shadow-lg transition-all duration-300 border-border/20 bg-background/50 backdrop-blur-sm overflow-hidden" data-testid={`card-staff-${staff.id}`}>
                            <CardContent className="p-6 text-center">
                              <div className="relative mb-4">
                                {staff.imageUrl ? (
                                  <div className="relative w-24 h-24 mx-auto mb-4">
                                    <img 
                                      src={staff.imageUrl} 
                                      alt={staff.name}
                                      className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
                                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                  >
                                    <User className="h-12 w-12 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 mb-4">
                                <h4 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {staff.name}
                                </h4>
                                {staff.position && (
                                  <p className="text-sm font-medium" style={{ color: themeStyles?.primaryColor || '#2563eb' }}>
                                    {staff.position}
                                  </p>
                                )}
                              </div>

                              {staff.bio && (
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                  {staff.bio}
                                </p>
                              )}

                              {/* Contact Information */}
                              {(staff.email || staff.phone) && (
                                <div className="flex flex-col space-y-2 pt-4 border-t border-border/20">
                                  {staff.email && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      asChild
                                      className="text-xs justify-center hover:bg-background/50"
                                      data-testid={`button-email-${staff.id}`}
                                    >
                                      <a href={`mailto:${staff.email}`} className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {staff.email}
                                      </a>
                                    </Button>
                                  )}
                                  {staff.phone && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      asChild
                                      className="text-xs justify-center hover:bg-background/50"
                                      data-testid={`button-phone-${staff.id}`}
                                    >
                                      <a href={`tel:${staff.phone}`} className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {staff.phone}
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* Book with this staff member */}
                              <div className="pt-4">
                                <Button 
                                  size="sm" 
                                  onClick={() => setShowBookingModal(true)}
                                  className="w-full text-xs font-medium"
                                  style={{
                                    backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                    color: 'white'
                                  }}
                                  data-testid={`button-book-staff-${staff.id}`}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Book with {staff.name.split(' ')[0]}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${themeStyles?.primaryColor || '#2563eb'}20` }}
                      >
                        <Users className="h-8 w-8" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                      </div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Team Information Coming Soon</h4>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        We're updating our team profiles. In the meantime, feel free to book an appointment and we'll match you with the perfect professional.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                        <Button 
                          onClick={() => setShowBookingModal(true)}
                          className="px-6 py-2"
                          style={{
                            backgroundColor: themeStyles?.primaryColor || '#2563eb',
                            color: 'white'
                          }}
                          data-testid="button-book-any-staff"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                        {page.contactPhone && (
                          <Button variant="outline" asChild data-testid="button-call-about-staff">
                            <a href={`tel:${page.contactPhone}`} className="flex items-center px-6 py-2">
                              <Phone className="h-4 w-4 mr-2" />
                              Call for Team Info
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Team Stats or Additional Info */}
                  {pageStaff.filter((staff: any) => staff.isActive !== false).length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border/20">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Professional Team</h5>
                          <p className="text-sm text-muted-foreground">Certified and experienced professionals ready to serve you</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Team of {pageStaff.filter((staff: any) => staff.isActive !== false).length}</h5>
                          <p className="text-sm text-muted-foreground">Dedicated professionals working together for your satisfaction</p>
                        </div>
                        <div className="text-center sm:col-span-2 lg:col-span-1">
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Quality Assured</h5>
                          <p className="text-sm text-muted-foreground">Every team member is committed to delivering exceptional results</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Customer Reviews</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      See what our customers are saying about their experience
                    </p>
                  </div>

                  {/* Reviews Summary */}
                  {reviews.filter((review: any) => review.isApproved === 'approved').length > 0 && (
                    <div className="mb-8">
                      <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="text-center sm:text-left mb-4 sm:mb-0">
                              <div className="flex items-center justify-center sm:justify-start mb-2">
                                <div className="text-3xl font-bold text-foreground mr-2">
                                  {(reviews.filter((review: any) => review.isApproved === 'approved').reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.filter((review: any) => review.isApproved === 'approved').length).toFixed(1)}
                                </div>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`h-5 w-5 ${
                                        star <= Math.round(reviews.filter((review: any) => review.isApproved === 'approved').reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.filter((review: any) => review.isApproved === 'approved').length)
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground">
                                Based on {reviews.filter((review: any) => review.isApproved === 'approved').length} review{reviews.filter((review: any) => review.isApproved === 'approved').length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {page.acceptReviews === "true" && (
                              <Button 
                                onClick={() => setShowReviews(!showReviews)}
                                className="px-6 py-2"
                                style={{
                                  backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                  color: 'white'
                                }}
                                data-testid="button-write-review"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Write a Review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.filter((review: any) => review.isApproved === 'approved').length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                      {reviews
                        .filter((review: any) => review.isApproved === 'approved')
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((review: any) => (
                          <Card key={review.id} className="bg-background/50 border-border/20 backdrop-blur-sm" data-testid={`card-review-${review.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                >
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-foreground truncate">
                                      {review.reviewerName}
                                    </h5>
                                    <div className="flex space-x-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                          key={star} 
                                          className={`h-4 w-4 ${
                                            star <= review.rating 
                                              ? 'text-yellow-400 fill-current' 
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  {review.reviewText && (
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                                      {review.reviewText}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 mb-8">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${themeStyles?.primaryColor || '#2563eb'}20` }}
                      >
                        <Star className="h-8 w-8" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                      </div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">No Reviews Yet</h4>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Be the first to share your experience with {page.title}!
                      </p>
                    </div>
                  )}

                  {/* Review Submission Form */}
                  {page.acceptReviews === "true" && (
                    <Collapsible open={showReviews} onOpenChange={setShowReviews}>
                      <CollapsibleContent className="space-y-4">
                        <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <h4 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                              <MessageSquare className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                              Share Your Experience
                            </h4>
                            
                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="customerName" className="text-sm font-medium text-foreground">
                                    Your Name *
                                  </Label>
                                  <Input
                                    id="customerName"
                                    type="text"
                                    value={reviewFormData.customerName}
                                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                                    className={`mt-1 ${validationErrors.customerName ? 'border-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                    data-testid="input-review-name"
                                  />
                                  {validationErrors.customerName && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.customerName}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <Label htmlFor="customerEmail" className="text-sm font-medium text-foreground">
                                    Email (Optional)
                                  </Label>
                                  <Input
                                    id="customerEmail"
                                    type="email"
                                    value={reviewFormData.customerEmail}
                                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                    className={`mt-1 ${validationErrors.customerEmail ? 'border-red-500' : ''}`}
                                    placeholder="your.email@example.com"
                                    data-testid="input-review-email"
                                  />
                                  {validationErrors.customerEmail && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.customerEmail}</p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">
                                  Rating *
                                </Label>
                                <div className="flex items-center space-x-2 mt-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleInputChange('rating', star)}
                                      className="focus:outline-none"
                                      data-testid={`button-rating-${star}`}
                                    >
                                      <Star 
                                        className={`h-8 w-8 transition-colors ${
                                          star <= reviewFormData.rating 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span className="text-muted-foreground text-sm ml-2">
                                    {reviewFormData.rating > 0 && `${reviewFormData.rating} star${reviewFormData.rating !== 1 ? 's' : ''}`}
                                  </span>
                                </div>
                                {validationErrors.rating && (
                                  <p className="text-red-500 text-xs mt-1">{validationErrors.rating}</p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="reviewText" className="text-sm font-medium text-foreground">
                                  Your Review (Optional)
                                </Label>
                                <Textarea
                                  id="reviewText"
                                  value={reviewFormData.reviewText}
                                  onChange={(e) => handleInputChange('reviewText', e.target.value)}
                                  className={`mt-1 min-h-[120px] ${validationErrors.reviewText ? 'border-red-500' : ''}`}
                                  placeholder="Tell us about your experience..."
                                  maxLength={500}
                                  data-testid="textarea-review-text"
                                />
                                <div className="flex justify-between items-center mt-1">
                                  {validationErrors.reviewText && (
                                    <p className="text-red-500 text-xs">{validationErrors.reviewText}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground ml-auto">
                                    {reviewFormData.reviewText.length}/500 characters
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/20">
                                <Button 
                                  type="submit"
                                  disabled={submitReviewMutation.isPending}
                                  className="flex-1 sm:flex-none px-6 py-2"
                                  style={{
                                    backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                    color: 'white'
                                  }}
                                  data-testid="button-submit-review"
                                >
                                  {submitReviewMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Submit Review
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowReviews(false)}
                                  className="flex-1 sm:flex-none px-6 py-2"
                                  data-testid="button-cancel-review"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Action Button for Reviews when not showing form */}
                  {page.acceptReviews === "true" && !showReviews && (
                    <div className="text-center">
                      <Button 
                        onClick={() => setShowReviews(true)}
                        className="px-8 py-3"
                        style={{
                          backgroundColor: themeStyles?.primaryColor || '#2563eb',
                          color: 'white'
                        }}
                        data-testid="button-open-review-form"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hours">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Hours & Contact</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Find us here and get in touch
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Business Hours & Contact Info */}
                    <div className="space-y-6">
                      {/* Business Hours */}
                      {page.showBusinessHours === "true" && page.businessHours && (
                        <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                              <Clock className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                              Business Hours
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(page.businessHours).map(([day, hours]: [string, any]) => {
                                const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                const displayHours = hours === "Closed" ? "Closed" : String(hours);
                                
                                return (
                                  <div 
                                    key={day} 
                                    className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                                      isToday 
                                        ? 'bg-primary/10 border border-primary/20' 
                                        : 'bg-background/30 hover:bg-background/50'
                                    }`}
                                    data-testid={`hours-${day.toLowerCase()}`}
                                  >
                                    <span className={`font-medium capitalize ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                      {day}{isToday && ' (Today)'}
                                    </span>
                                    <span className={`text-sm ${hours === "Closed" ? 'text-muted-foreground' : isToday ? 'text-primary font-medium' : 'text-foreground'}`}>
                                      {displayHours}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Contact Information */}
                      {page.showContactInfo === "true" && (page.contactPhone || page.contactEmail || page.businessAddress) && (
                        <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                              <Phone className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                              Contact Information
                            </h4>
                            <div className="space-y-4">
                              {page.contactPhone && (
                                <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                  >
                                    <Phone className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <a 
                                      href={`tel:${page.contactPhone}`} 
                                      className="font-medium text-foreground hover:text-primary transition-colors"
                                      data-testid="link-phone"
                                    >
                                      {page.contactPhone}
                                    </a>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      asChild
                                      className="h-8 px-3 text-xs"
                                      style={{
                                        backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                        color: 'white'
                                      }}
                                      data-testid="button-call"
                                    >
                                      <a href={`tel:${page.contactPhone}`}>
                                        <Phone className="h-3 w-3 mr-1" />
                                        Call
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {page.contactEmail && (
                                <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                  >
                                    <Mail className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <a 
                                      href={`mailto:${page.contactEmail}`} 
                                      className="font-medium text-foreground hover:text-primary transition-colors"
                                      data-testid="link-email"
                                    >
                                      {page.contactEmail}
                                    </a>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      asChild
                                      className="h-8 px-3 text-xs"
                                      style={{
                                        backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                        color: 'white'
                                      }}
                                      data-testid="button-message"
                                    >
                                      <a href={`mailto:${page.contactEmail}`}>
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Message
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {page.businessAddress && (
                                <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                  >
                                    <MapPin className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium text-foreground">{page.businessAddress}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      asChild
                                      className="h-8 px-3 text-xs"
                                      style={{
                                        backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                        color: 'white'
                                      }}
                                      data-testid="button-directions"
                                    >
                                      <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(page.businessAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Directions
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Quick Actions */}
                      <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                            Quick Actions
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Button 
                              onClick={() => setShowBookingModal(true)}
                              className="w-full justify-start h-12"
                              style={{
                                backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                color: 'white'
                              }}
                              data-testid="button-book-quick"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Appointment
                            </Button>
                            
                            {page.calendarLink && (
                              <Button 
                                variant="outline" 
                                asChild
                                className="w-full justify-start h-12"
                                data-testid="button-calendar-quick"
                              >
                                <a href={page.calendarLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Calendar
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Map Integration */}
                    <div className="space-y-6">
                      {page.businessAddress ? (
                        <Card className="bg-background/50 border-border/20 backdrop-blur-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-6 pb-4">
                              <h4 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                                <MapPin className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                                Find Us Here
                              </h4>
                              <p className="text-muted-foreground text-sm">{page.businessAddress}</p>
                            </div>
                            <div className="relative">
                              <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBokTpGg0vmljYf0_rdR_zx_LT-SjXj2FU&q=${encodeURIComponent(page.businessAddress)}`}
                                width="100%"
                                height="300"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full"
                                data-testid="map-iframe"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                            </div>
                            <div className="p-4 bg-background/30">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                  asChild 
                                  className="flex-1 text-xs"
                                  style={{
                                    backgroundColor: themeStyles?.primaryColor || '#2563eb',
                                    color: 'white'
                                  }}
                                  data-testid="button-open-maps"
                                >
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(page.businessAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Open in Maps
                                  </a>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => copyToClipboard(page.businessAddress, 'Address')}
                                  className="flex-1 text-xs"
                                  data-testid="button-copy-address"
                                >
                                  {copiedField === 'Address' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Address
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                          <CardContent className="p-6 text-center">
                            <div 
                              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                              style={{ backgroundColor: `${themeStyles?.primaryColor || '#2563eb'}20` }}
                            >
                              <MapPin className="h-8 w-8" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                            </div>
                            <h4 className="text-xl font-semibold text-foreground mb-2">Location Coming Soon</h4>
                            <p className="text-muted-foreground">
                              We're updating our location information. Contact us for directions.
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Additional Information */}
                      <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <h4 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                            Visit Information
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Easy parking available</span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Wheelchair accessible</span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Professional atmosphere</span>
                            </div>
                            {page.contactPhone && (
                              <div className="pt-3 border-t border-border/20">
                                <p className="text-muted-foreground">
                                  <strong>Need directions?</strong> Call us at {' '}
                                  <a 
                                    href={`tel:${page.contactPhone}`} 
                                    className="text-primary hover:underline font-medium"
                                    data-testid="link-directions-phone"
                                  >
                                    {page.contactPhone}
                                  </a>
                                  {' '} and we'll guide you here.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Gallery</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Take a look at our work and facilities
                    </p>
                  </div>

                  {gallery.images && gallery.images.length > 0 ? (
                    <div className="space-y-8">
                      {/* Featured Image Carousel */}
                      <div className="mb-8">
                        <Carousel className="w-full max-w-4xl mx-auto">
                          <CarouselContent>
                            {gallery.images.map((image: any, index: number) => (
                              <CarouselItem key={index}>
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-background/50 border border-border/20">
                                  <img 
                                    src={image.url || image} 
                                    alt={`${page.title} - Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    data-testid={`gallery-main-${index}`}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="text-white font-semibold mb-1">
                                          {image.title || `${page.title} Gallery`}
                                        </h4>
                                        <p className="text-white/80 text-sm">
                                          {image.description || `Professional workspace and service environment`}
                                        </p>
                                      </div>
                                      <div className="text-white/60 text-sm">
                                        {index + 1} / {gallery.images.length}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-4" />
                          <CarouselNext className="right-4" />
                        </Carousel>
                      </div>

                      {/* Thumbnail Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {gallery.images.slice(0, 12).map((image: any, index: number) => (
                          <div 
                            key={index} 
                            className="relative aspect-square rounded-lg overflow-hidden bg-background/50 border border-border/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                            data-testid={`gallery-thumb-${index}`}
                          >
                            <img 
                              src={image.url || image} 
                              alt={`${page.title} - Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                              >
                                <Image className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {gallery.images.length > 12 && (
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-background/80 border border-border/20 flex items-center justify-center text-center p-4">
                            <div>
                              <div 
                                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                                style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                              >
                                <Image className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-xs font-medium text-foreground">
                                +{gallery.images.length - 12} more
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div 
                        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ backgroundColor: `${themeStyles?.primaryColor || '#2563eb'}20` }}
                      >
                        <Image className="h-10 w-10" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                      </div>
                      <h4 className="text-2xl font-semibold text-foreground mb-4">Gallery Coming Soon</h4>
                      <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        We're currently updating our photo gallery. Check back soon to see our beautiful work and facilities.
                      </p>
                      
                      {/* Placeholder Gallery Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                        {[1, 2, 3].map((item) => (
                          <div 
                            key={item} 
                            className="aspect-square rounded-lg bg-background/30 border border-border/20 flex items-center justify-center"
                          >
                            <Image className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => setShowBookingModal(true)}
                          className="px-6 py-2"
                          style={{
                            backgroundColor: themeStyles?.primaryColor || '#2563eb',
                            color: 'white'
                          }}
                          data-testid="button-book-gallery"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book to See Our Work
                        </Button>
                        {page.contactPhone && (
                          <Button variant="outline" asChild data-testid="button-call-gallery">
                            <a href={`tel:${page.contactPhone}`} className="flex items-center px-6 py-2">
                              <Phone className="h-4 w-4 mr-2" />
                              Call for Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gallery Features */}
                  {gallery.images && gallery.images.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border/20">
                      <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Professional Quality</h5>
                          <p className="text-sm text-muted-foreground">High-resolution photos showcasing our professional standards</p>
                        </div>
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Our Work</h5>
                          <p className="text-sm text-muted-foreground">Examples of our best work and satisfied customers</p>
                        </div>
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Our Space</h5>
                          <p className="text-sm text-muted-foreground">Take a virtual tour of our clean, professional environment</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="book">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-foreground mb-4">Book Your Appointment</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Ready to get started? Choose your preferred booking method below
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Online Booking */}
                    <Card className="bg-background/50 border-border/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-8 text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                        >
                          <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-xl font-semibold text-foreground mb-3">Book Online</h4>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          Use our convenient online booking system to schedule your appointment instantly. Choose your service, preferred time, and staff member.
                        </p>
                        <Button 
                          onClick={() => setShowBookingModal(true)}
                          className="w-full py-3 text-base font-semibold"
                          style={{
                            backgroundColor: themeStyles?.primaryColor || '#2563eb',
                            color: 'white'
                          }}
                          data-testid="button-book-online"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>

                    {/* External Calendar */}
                    {page.calendarLink && (
                      <Card className="bg-background/50 border-border/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                            style={{ borderColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <ExternalLink className="h-8 w-8" style={{ color: themeStyles?.primaryColor || '#2563eb' }} />
                          </div>
                          <h4 className="text-xl font-semibold text-foreground mb-3">External Calendar</h4>
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            Access our full calendar system with advanced scheduling options and availability viewing.
                          </p>
                          <Button 
                            variant="outline"
                            asChild
                            className="w-full py-3 text-base font-semibold border-2"
                            style={{
                              borderColor: themeStyles?.primaryColor || '#2563eb',
                              color: themeStyles?.primaryColor || '#2563eb'
                            }}
                            data-testid="button-external-calendar"
                          >
                            <a href={page.calendarLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-5 w-5 mr-2" />
                              View Calendar
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Contact Booking Options */}
                  {(page.contactPhone || page.contactEmail) && (
                    <div className="mb-8">
                      <h4 className="text-xl font-semibold text-foreground mb-4 text-center">
                        Prefer to Book by Phone or Email?
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {page.contactPhone && (
                          <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div 
                                  className="w-12 h-12 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                >
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-foreground mb-1">Call Us</h5>
                                  <p className="text-sm text-muted-foreground mb-2">Speak directly with our team</p>
                                  <a 
                                    href={`tel:${page.contactPhone}`} 
                                    className="text-sm font-medium hover:underline"
                                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                                    data-testid="link-phone-booking"
                                  >
                                    {page.contactPhone}
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {page.contactEmail && (
                          <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4">
                                <div 
                                  className="w-12 h-12 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                >
                                  <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-foreground mb-1">Email Us</h5>
                                  <p className="text-sm text-muted-foreground mb-2">Send us your booking request</p>
                                  <a 
                                    href={`mailto:${page.contactEmail}?subject=Appointment Booking Request&body=Hi! I would like to book an appointment. Please let me know your availability.`} 
                                    className="text-sm font-medium hover:underline"
                                    style={{ color: themeStyles?.primaryColor || '#2563eb' }}
                                    data-testid="link-email-booking"
                                  >
                                    {page.contactEmail}
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services Preview */}
                  {services.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xl font-semibold text-foreground mb-4 text-center">
                        Popular Services
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.slice(0, 3).map((service: any) => {
                          const ServiceIcon = getServiceIcon(service.name);
                          const currency = getCurrencyByCode(service.currency || 'USD');
                          
                          return (
                            <Card key={service.id} className="bg-background/30 border-border/20 backdrop-blur-sm hover:bg-background/50 transition-colors" data-testid={`service-preview-${service.id}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                                  >
                                    <ServiceIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-foreground truncate">{service.name}</h5>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{service.durationMinutes} min</span>
                                  <span className="font-medium" style={{ color: themeStyles?.primaryColor || '#2563eb' }}>
                                    {currency?.symbol || '$'}{parseFloat(service.price).toFixed(2)}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      {services.length > 3 && (
                        <div className="text-center mt-4">
                          <p className="text-sm text-muted-foreground">
                            +{services.length - 3} more services available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Booking Benefits */}
                  <Card className="bg-background/50 border-border/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <h4 className="text-xl font-semibold text-foreground mb-4 text-center">
                        Why Book With Us?
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-6 text-center">
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Secure & Safe</h5>
                          <p className="text-sm text-muted-foreground">Your information is protected and secure</p>
                        </div>
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Easy Booking</h5>
                          <p className="text-sm text-muted-foreground">Quick and simple appointment scheduling</p>
                        </div>
                        <div>
                          <div 
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: themeStyles?.primaryColor || '#2563eb' }}
                          >
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold text-foreground mb-1">Professional Service</h5>
                          <p className="text-sm text-muted-foreground">Expert care from qualified professionals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Remove all old sections - they are now in the tabs above */}
      
      {/* Services Section - REMOVED - now in tabs */}
      {/* Staff Section - REMOVED - now in tabs */}
      {/* Gallery Section - REMOVED - now in tabs */}
      {/* Reviews Section - REMOVED - now in tabs */}
      {/* Business Hours Section - REMOVED - now in tabs */}
      {/* Contact Information Section - REMOVED - now in tabs */}

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
