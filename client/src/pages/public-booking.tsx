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
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">About {page.title}</h3>
                  <p className="text-muted-foreground">About content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Services</h3>
                  <p className="text-muted-foreground">Services content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Meet Our Team</h3>
                  <p className="text-muted-foreground">Staff content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Customer Reviews</h3>
                  <p className="text-muted-foreground">Reviews content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hours">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Business Hours</h3>
                  <p className="text-muted-foreground">Hours content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Gallery</h3>
                  <p className="text-muted-foreground">Gallery content will be implemented here.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="book">
              <div className="py-8 rounded-2xl glass-prism-card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Book Appointment</h3>
                  <p className="text-muted-foreground">Booking content will be implemented here.</p>
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
