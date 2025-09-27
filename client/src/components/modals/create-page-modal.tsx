import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CloudUpload, Plus, X, Palette, Image, FileText, Settings, HelpCircle, MapPin, Calendar, Trash2, ArrowLeft, ArrowRight, Check, Edit, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadFile } from '@/lib/supabase';

interface CreatePageModalProps {
  open: boolean;
  onClose: () => void;
  editingPage?: any | null;
}

export default function CreatePageModal({ open, onClose, editingPage }: CreatePageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingPage;
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    primaryColor: '#2563eb',
    calendarLink: '',
    logoUrl: '',
    theme: 'Ocean Blue',
    backgroundType: 'gradient',
    backgroundValue: 'blue',
    fontFamily: 'inter',
    acceptReviews: 'true',
    faqs: [{ question: '', answer: '' }],
    businessHours: {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-17:00',
      saturday: 'Closed',
      sunday: 'Closed'
    },
    contactPhone: '',
    contactEmail: '',
    businessAddress: '',
    cancellationPolicy: '',
    showBusinessHours: 'true',
    showContactInfo: 'true',
    services: [{ name: '', description: '', durationMinutes: 60, price: '0', currency: 'USD' }],
    staff: [] as Array<{ name: string; position: string; bio: string; email: string; phone: string; imageUrl: string }>,
    visitInfo: {
      parking: true,
      wheelchairAccessible: true,
      professionalAtmosphere: true,
      customInfo: [] as string[]
    },
    gallery: {
      banners: [],
      logos: [],
      images: []
    }
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  // Gallery state
  const [uploadingGallery, setUploadingGallery] = useState<{[key: string]: boolean}>({});
  const [galleryPreviews, setGalleryPreviews] = useState<{[key: string]: any[]}>({ banners: [], logos: [], images: [] });

  // Fetch page data for editing
  const { data: editingPageData } = useQuery({
    queryKey: ['/api/pages/edit', editingPage?.id],
    enabled: !!(isEditing && editingPage?.id),
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/pages/${editingPage.id}/edit`);
      return response.json();
    },
  });

  // Beautiful color themes for booking pages
  const colorThemes = [
    { name: 'Ocean Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c', gradient: 'from-orange-500 to-red-500' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Rose Gold', primary: '#e11d48', secondary: '#be185d', accent: '#f43f5e', gradient: 'from-rose-500 to-pink-500' },
    { name: 'Midnight', primary: '#1f2937', secondary: '#111827', accent: '#374151', gradient: 'from-gray-800 to-gray-900' },
    
    // New vibrant themes
    { name: 'Electric Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf', gradient: 'from-teal-500 to-cyan-500' },
    { name: 'Coral Sunset', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c', gradient: 'from-orange-400 to-rose-500' },
    { name: 'Lavender Dreams', primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', gradient: 'from-purple-400 to-pink-400' },
    { name: 'Golden Hour', primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Arctic Blue', primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', gradient: 'from-sky-400 to-blue-500' },
    { name: 'Cherry Blossom', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', gradient: 'from-pink-400 to-rose-500' },
    
    // Professional themes
    { name: 'Corporate Navy', primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6', gradient: 'from-blue-700 to-indigo-800' },
    { name: 'Sage Green', primary: '#65a30d', secondary: '#4d7c0f', accent: '#84cc16', gradient: 'from-lime-500 to-green-600' },
    { name: 'Warm Terracotta', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', gradient: 'from-red-500 to-orange-600' },
    { name: 'Deep Indigo', primary: '#4338ca', secondary: '#3730a3', accent: '#6366f1', gradient: 'from-indigo-500 to-purple-600' },
    
    // Modern minimalist themes  
    { name: 'Soft Mint', primary: '#10b981', secondary: '#059669', accent: '#34d399', gradient: 'from-emerald-400 to-teal-500' },
    { name: 'Dusty Rose', primary: '#be123c', secondary: '#9f1239', accent: '#f43f5e', gradient: 'from-rose-400 to-pink-500' },
    { name: 'Stone Gray', primary: '#57534e', secondary: '#44403c', accent: '#78716c', gradient: 'from-stone-500 to-gray-600' },
    { name: 'Slate Blue', primary: '#475569', secondary: '#334155', accent: '#64748b', gradient: 'from-slate-500 to-slate-600' },
    
    // Creative & vibrant themes
    { name: 'Tropical Paradise', primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee', gradient: 'from-cyan-400 to-teal-500' },
    { name: 'Sunset Magenta', primary: '#c026d3', secondary: '#a21caf', accent: '#d946ef', gradient: 'from-fuchsia-400 to-pink-500' },
    { name: 'Ocean Breeze', primary: '#0369a1', secondary: '#075985', accent: '#0284c7', gradient: 'from-sky-500 to-blue-600' },
    { name: 'Autumn Spice', primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', gradient: 'from-orange-500 to-red-500' }
  ];

  const backgroundOptions = [
    // Gradient backgrounds
    { type: 'gradient', name: 'Blue Gradient', value: 'blue', class: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { type: 'gradient', name: 'Green Gradient', value: 'green', class: 'bg-gradient-to-br from-emerald-100 to-emerald-200' },
    { type: 'gradient', name: 'Purple Gradient', value: 'purple', class: 'bg-gradient-to-br from-violet-100 to-violet-200' },
    { type: 'gradient', name: 'Rose Gradient', value: 'rose', class: 'bg-gradient-to-br from-rose-100 to-rose-200' },
    { type: 'gradient', name: 'Teal Gradient', value: 'teal', class: 'bg-gradient-to-br from-teal-100 to-teal-200' },
    { type: 'gradient', name: 'Orange Gradient', value: 'orange', class: 'bg-gradient-to-br from-orange-100 to-orange-200' },
    { type: 'gradient', name: 'Indigo Gradient', value: 'indigo', class: 'bg-gradient-to-br from-indigo-100 to-indigo-200' },
    { type: 'gradient', name: 'Amber Gradient', value: 'amber', class: 'bg-gradient-to-br from-amber-100 to-amber-200' },
    
    // Diagonal gradients
    { type: 'gradient', name: 'Ocean Waves', value: 'ocean', class: 'bg-gradient-to-r from-cyan-100 to-blue-200' },
    { type: 'gradient', name: 'Sunset Sky', value: 'sunset', class: 'bg-gradient-to-r from-orange-100 to-pink-200' },
    { type: 'gradient', name: 'Forest Mist', value: 'forest', class: 'bg-gradient-to-r from-green-100 to-emerald-200' },
    { type: 'gradient', name: 'Lavender Fields', value: 'lavender', class: 'bg-gradient-to-r from-purple-100 to-pink-200' },
    
    // Multi-color gradients
    { type: 'gradient', name: 'Rainbow Light', value: 'rainbow', class: 'bg-gradient-to-r from-red-100 via-yellow-100 to-green-100' },
    { type: 'gradient', name: 'Tropical Breeze', value: 'tropical', class: 'bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100' },
    { type: 'gradient', name: 'Warm Sunset', value: 'warm-sunset', class: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100' },
    { type: 'gradient', name: 'Cool Mint', value: 'cool-mint', class: 'bg-gradient-to-br from-green-100 via-teal-100 to-blue-100' },
    
    // Solid backgrounds
    { type: 'solid', name: 'Clean White', value: 'white', class: 'bg-white' },
    { type: 'solid', name: 'Soft Gray', value: 'gray', class: 'bg-gray-50' },
    { type: 'solid', name: 'Warm Cream', value: 'cream', class: 'bg-amber-50' },
    { type: 'solid', name: 'Cool Ice', value: 'ice', class: 'bg-blue-50' },
    { type: 'solid', name: 'Soft Mint', value: 'soft-mint', class: 'bg-green-50' },
    { type: 'solid', name: 'Light Lavender', value: 'light-lavender', class: 'bg-purple-50' },
    
    // Subtle patterns (using gradients with opacity for pattern-like effects)
    { type: 'pattern', name: 'Subtle Dots', value: 'dots', class: 'bg-gray-50 bg-dots-pattern' },
    { type: 'pattern', name: 'Soft Lines', value: 'lines', class: 'bg-gray-50 bg-lines-pattern' },
    { type: 'pattern', name: 'Light Mesh', value: 'mesh', class: 'bg-gray-50 bg-mesh-pattern' },
    { type: 'pattern', name: 'Paper Texture', value: 'paper', class: 'bg-stone-50 bg-paper-pattern' }
  ];

  const fontOptions = [
    { name: 'Inter (Modern)', value: 'inter', class: 'font-inter' },
    { name: 'Playfair (Elegant)', value: 'playfair', class: 'font-playfair' },
    { name: 'Roboto (Clean)', value: 'roboto', class: 'font-roboto' },
    { name: 'Open Sans (Friendly)', value: 'opensans', class: 'font-opensans' }
  ];

  const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  ];

  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        const response = await apiRequest('PATCH', `/api/pages/${editingPage.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/pages', data);
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      // Check if there are warnings about services that couldn't be deleted
      if (data.warnings?.servicesNotDeleted?.length > 0) {
        toast({
          title: isEditing ? "Page updated with warnings" : "Page created!",
          description: isEditing 
            ? `Page updated, but ${data.warnings.servicesNotDeleted.length} service(s) with existing appointments couldn't be removed.`
            : "Your booking page has been created successfully.",
          variant: "default",
        });
      } else {
        toast({
          title: isEditing ? "Page updated!" : "Page created!",
          description: isEditing ? "Your booking page has been updated successfully." : "Your booking page has been created successfully.",
        });
      }
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: isEditing ? "Error updating page" : "Error creating page",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    const defaultFormData = {
      title: '',
      slug: '',
      tagline: '',
      description: '',
      primaryColor: '#2563eb',
      calendarLink: '',
      logoUrl: '',
      theme: 'Ocean Blue',
      backgroundType: 'gradient',
      backgroundValue: 'blue',
      fontFamily: 'inter',
      acceptReviews: 'true',
      faqs: [{ question: '', answer: '' }],
      businessHours: {
        monday: '9:00-17:00',
        tuesday: '9:00-17:00',
        wednesday: '9:00-17:00',
        thursday: '9:00-17:00',
        friday: '9:00-17:00',
        saturday: 'Closed',
        sunday: 'Closed'
      },
      contactPhone: '',
      contactEmail: '',
      businessAddress: '',
      cancellationPolicy: '',
      showBusinessHours: 'true',
      showContactInfo: 'true',
      services: [{ name: '', description: '', durationMinutes: 60, price: '0', currency: 'USD' }],
      staff: [] as Array<{ name: string; position: string; bio: string; email: string; phone: string; imageUrl: string }>,
      visitInfo: {
        parking: true,
        wheelchairAccessible: true,
        professionalAtmosphere: true,
        customInfo: [] as string[]
      },
      gallery: {
        banners: [],
        logos: [],
        images: []
      }
    };
    setFormData(defaultFormData);
    setLogoFile(null);
    setLogoPreview('');
    setGalleryPreviews({ banners: [], logos: [], images: [] });
    setUploadingGallery({});
  };

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && editingPageData) {
      const services = editingPageData.services || [];
      const formattedServices = services.length > 0 
        ? services.map((service: any) => ({
            id: service.id, // Preserve service ID for editing
            name: service.name || '',
            description: service.description || '',
            durationMinutes: service.durationMinutes || 60,
            price: service.price?.toString() || '0',
            currency: service.currency || 'USD'
          }))
        : [{ name: '', description: '', durationMinutes: 60, price: '0', currency: 'USD' }];

      setFormData({
        title: editingPageData.title || '',
        slug: editingPageData.slug || '',
        tagline: editingPageData.tagline || '',
        description: editingPageData.data?.description || editingPageData.description || '',
        primaryColor: editingPageData.primaryColor || '#2563eb',
        calendarLink: editingPageData.calendarLink || '',
        logoUrl: editingPageData.logoUrl || '',
        theme: editingPageData.theme || 'Ocean Blue',
        backgroundType: editingPageData.backgroundType || 'gradient',
        backgroundValue: editingPageData.backgroundValue || 'blue',
        fontFamily: editingPageData.fontFamily || 'inter',
        acceptReviews: editingPageData.acceptReviews || 'true',
        faqs: editingPageData.faqs || [{ question: '', answer: '' }],
        businessHours: editingPageData.businessHours || {
          monday: '9:00-17:00',
          tuesday: '9:00-17:00',
          wednesday: '9:00-17:00',
          thursday: '9:00-17:00',
          friday: '9:00-17:00',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        contactPhone: editingPageData.contactPhone || '',
        contactEmail: editingPageData.contactEmail || '',
        businessAddress: editingPageData.businessAddress || '',
        cancellationPolicy: editingPageData.cancellationPolicy || '',
        showBusinessHours: editingPageData.showBusinessHours || 'true',
        showContactInfo: editingPageData.showContactInfo || 'true',
        services: formattedServices,
        staff: editingPageData.data?.staff || [],
        visitInfo: editingPageData.data?.visitInfo || {
          parking: true,
          wheelchairAccessible: true,
          professionalAtmosphere: true,
          customInfo: [] as string[]
        },
        gallery: editingPageData.data?.gallery || editingPageData.gallery || {
          banners: [],
          logos: [],
          images: []
        }
      });
      
      // Set logo preview if there's a logoUrl
      if (editingPageData.logoUrl) {
        setLogoPreview(editingPageData.logoUrl);
      }
      
      // Set gallery previews if there's gallery data
      const galleryData = editingPageData.data?.gallery || editingPageData.gallery;
      if (galleryData) {
        setGalleryPreviews({
          banners: galleryData.banners || [],
          logos: galleryData.logos || [],
          images: galleryData.images || []
        });
      }
    } else if (!isEditing) {
      resetForm();
    }
  }, [isEditing, editingPageData]);

  const selectColorTheme = (theme: any) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: theme.primary,
      theme: theme.name
    }));
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const result = await uploadFile(file, 'logos');
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, logoUrl: result.url || '' }));
        setLogoFile(file);
        toast({
          title: "Logo uploaded!",
          description: "Your logo has been uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Something went wrong while uploading your logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: !slugManuallyEdited ? generateSlug(value) : prev.slug
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: value }));
  };

  // Step definitions
  const steps = [
    {
      number: 1,
      title: "Basic Details",
      description: "Set up your booking page name, web address, tagline and description",
      icon: Edit,
      fields: ['title', 'slug', 'tagline', 'description']
    },
    {
      number: 2,
      title: "Team & Staff",
      description: "Add your team members and their information",
      icon: Users,
      fields: ['staff']
    },
    {
      number: 3, 
      title: "Services & Pricing",
      description: "Add your services, set pricing and duration for each offering",
      icon: FileText,
      fields: ['services']
    },
    {
      number: 4,
      title: "Style & Branding", 
      description: "Customize colors, themes, and upload your logo",
      icon: Palette,
      fields: ['theme', 'primaryColor', 'backgroundType', 'backgroundValue', 'fontFamily', 'logoUrl']
    },
    {
      number: 5,
      title: "Business Information",
      description: "Add contact details, business hours, location and visit information",
      icon: Settings,
      fields: ['contactPhone', 'contactEmail', 'businessAddress', 'businessHours', 'calendarLink', 'cancellationPolicy', 'visitInfo']
    },
    {
      number: 6,
      title: "Review & Publish",
      description: "Review your booking page and publish it to the world",
      icon: Check,
      fields: []
    }
  ];

  // Calculate progress percentage
  const getProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.slug.trim() && formData.description.trim();
      case 2:
        return true; // Staff is optional
      case 3:
        return formData.services.some(service => service.name.trim() && service.price);
      case 4:
        return true; // Styling is optional
      case 5:
        return true; // Business info is optional  
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast({
        title: "Please complete required fields",
        description: "Fill in the required information before proceeding to the next step.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', durationMinutes: 60, price: '0', currency: 'USD' }]
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const addStaffMember = () => {
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { name: '', position: '', bio: '', email: '', phone: '', imageUrl: '' }]
    }));
  };

  const removeStaffMember = (index: number) => {
    if (formData.staff.length > 1) {
      setFormData(prev => ({
        ...prev,
        staff: prev.staff.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStaffMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addCustomVisitInfo = () => {
    setFormData(prev => ({
      ...prev,
      visitInfo: {
        ...prev.visitInfo,
        customInfo: [...prev.visitInfo.customInfo, '']
      }
    }));
  };

  const removeCustomVisitInfo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      visitInfo: {
        ...prev.visitInfo,
        customInfo: prev.visitInfo.customInfo.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCustomVisitInfo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      visitInfo: {
        ...prev.visitInfo,
        customInfo: prev.visitInfo.customInfo.map((info, i) => 
          i === index ? value : info
        )
      }
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (index: number) => {
    if (formData.faqs.length > 1) {
      setFormData(prev => ({
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFaq = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  // Gallery functions
  const handleGalleryUpload = async (files: FileList, type: 'banners' | 'logos' | 'images') => {
    setUploadingGallery(prev => ({ ...prev, [type]: true }));
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: "File too large",
            description: `${file.name} is over 5MB. Please select a smaller file.`,
            variant: "destructive"
          });
          return null;
        }
        
        const result = await uploadFile(file, `gallery-${type}`);
        if (result.success && result.url) {
          return {
            name: file.name,
            url: result.url,
            type: file.type,
            size: file.size
          };
        }
        return null;
      });
      
      const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean);
      
      if (uploadedFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          gallery: {
            ...prev.gallery,
            [type]: [...prev.gallery[type], ...uploadedFiles]
          }
        }));
        
        // Update previews
        setGalleryPreviews(prev => ({
          ...prev,
          [type]: [...prev[type], ...uploadedFiles]
        }));
        
        toast({
          title: "Images uploaded!",
          description: `${uploadedFiles.length} ${type} uploaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: `Failed to upload ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadingGallery(prev => ({ ...prev, [type]: false }));
    }
  };
  
  const removeGalleryImage = (type: 'banners' | 'logos' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        [type]: prev.gallery[type].filter((_, i) => i !== index)
      }
    }));
    
    setGalleryPreviews(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title and slug.",
        variant: "destructive",
      });
      return;
    }

    // For editing, don't check slug uniqueness
    if (isEditing && editingPage && formData.slug !== editingPage.slug) {
      // If slug is being changed during edit, we still need to validate it
      // This will be handled by the backend
    }

    const servicesWithNumbers = formData.services.map(service => ({
      ...service,
      price: parseFloat(service.price) || 0,
      durationMinutes: parseInt(service.durationMinutes.toString()) || 60
    }));

    // Filter out empty FAQs
    const validFaqs = formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim());

    createPageMutation.mutate({
      ...formData,
      services: servicesWithNumbers,
      faqs: validFaqs,
      acceptReviews: formData.acceptReviews,
      businessHours: formData.businessHours,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      businessAddress: formData.businessAddress,
      cancellationPolicy: formData.cancellationPolicy,
      showBusinessHours: formData.showBusinessHours,
      showContactInfo: formData.showContactInfo,
      data: {
        description: formData.description,
        staff: formData.staff,
        visitInfo: formData.visitInfo,
        gallery: formData.gallery
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="glass-prism-card border-none shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Basic Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-medium">Page Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Personal Training"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="glass-effect border-border/50 mt-2"
                      required
                      data-testid="input-page-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-base font-medium">URL Slug *</Label>
                    <div className="flex mt-2">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border/50 glass-effect text-muted-foreground text-sm">
                        bookinggen.xyz/
                      </span>
                      <Input
                        id="slug"
                        placeholder="personal-training"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="rounded-l-none glass-effect border-border/50"
                        required
                        data-testid="input-page-slug"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tagline" className="text-base font-medium">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="Transform your fitness journey with personalized training"
                    value={formData.tagline}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-tagline"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    A catchy subtitle that describes what you offer
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium">Business Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your business, services, and what makes you unique. This will appear in the About section of your booking page..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full min-h-[120px] px-3 py-2 glass-effect border-border/50 mt-2 rounded-xl resize-vertical"
                    required
                    data-testid="textarea-description"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Tell potential clients about your expertise, experience, and approach
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card className="glass-prism-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team & Staff
                  </h3>
                  <Button type="button" onClick={addStaffMember} className="glass-effect hover-lift rounded-xl" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.staff.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No Staff Members Added</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your team members to build trust with potential clients. Staff information will appear in the Staff section of your booking page.
                    </p>
                  </div>
                ) : (
                  formData.staff.map((member, index) => (
                    <Card key={index} className="glass-effect border-border/50 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <h4 className="text-sm font-medium">Staff Member #{index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={addStaffMember}
                            size="sm"
                            className="glass-effect hover-lift rounded-xl"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStaffMember(index)}
                            className="hover-lift"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-base font-medium">Name</Label>
                            <Input
                              placeholder="e.g., John Smith"
                              value={member.name}
                              onChange={(e) => updateStaffMember(index, 'name', e.target.value)}
                              className="glass-effect border-border/50 mt-2"
                              data-testid={`input-staff-name-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-base font-medium">Position/Title</Label>
                            <Input
                              placeholder="e.g., Senior Trainer, Massage Therapist"
                              value={member.position}
                              onChange={(e) => updateStaffMember(index, 'position', e.target.value)}
                              className="glass-effect border-border/50 mt-2"
                              data-testid={`input-staff-position-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Bio</Label>
                          <textarea
                            placeholder="Brief description of experience, specialties, and qualifications..."
                            value={member.bio}
                            onChange={(e) => updateStaffMember(index, 'bio', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 glass-effect border-border/50 mt-2 rounded-xl resize-vertical"
                            data-testid={`textarea-staff-bio-${index}`}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-base font-medium">Email</Label>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              value={member.email}
                              onChange={(e) => updateStaffMember(index, 'email', e.target.value)}
                              className="glass-effect border-border/50 mt-2"
                              data-testid={`input-staff-email-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-base font-medium">Phone</Label>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              value={member.phone}
                              onChange={(e) => updateStaffMember(index, 'phone', e.target.value)}
                              className="glass-effect border-border/50 mt-2"
                              data-testid={`input-staff-phone-${index}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="glass-prism-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Services
                  </h3>
                  <Button type="button" onClick={addService} className="glass-effect hover-lift rounded-xl" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.services.map((service, index) => (
                  <Card key={index} className="glass-effect border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <h4 className="text-sm font-medium">Service #{index + 1}</h4>
                      {formData.services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="hover-lift"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div>
                        <Label className="text-base font-medium">Service Name *</Label>
                        <Input
                          placeholder="e.g., 60-minute consultation"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          className="glass-effect border-border/50 mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-base font-medium">Description</Label>
                        <textarea
                          placeholder="Describe what's included in this service..."
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 glass-effect border-border/50 mt-2 rounded-xl resize-vertical"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-medium">Duration (minutes)</Label>
                          <Input
                            type="number"
                            placeholder="60"
                            value={service.durationMinutes}
                            onChange={(e) => updateService(index, 'durationMinutes', parseInt(e.target.value) || 60)}
                            className="glass-effect border-border/50 mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-base font-medium">Price *</Label>
                          <div className="flex gap-2 mt-2">
                            <Select
                              value={service.currency || 'USD'}
                              onValueChange={(value) => updateService(index, 'currency', value)}
                            >
                              <SelectTrigger className="w-24 glass-effect border-border/50">
                                <SelectValue>
                                  {currencyOptions.find(c => c.code === (service.currency || 'USD'))?.symbol || '$'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {currencyOptions.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    {currency.symbol} {currency.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="99.00"
                              value={service.price}
                              onChange={(e) => updateService(index, 'price', e.target.value)}
                              className="flex-1 glass-effect border-border/50"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="glass-prism-card border-none shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Style & Branding
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Color Theme</Label>
                  <div className="max-h-64 overflow-y-auto glass-effect rounded-xl p-3 border border-border/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {colorThemes.map((theme, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectColorTheme(theme)}
                          className={`p-3 rounded-xl border-2 transition-all hover:scale-105 hover-lift glass-effect ${
                            formData.theme === theme.name 
                              ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 bg-blue-50/50' 
                              : 'border-border/50 hover:border-border'
                          }`}
                        >
                          <div className={`w-full h-8 rounded mb-2 bg-gradient-to-r ${theme.gradient}`}></div>
                          <span className="text-sm font-medium">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Upload Logo (Optional)</Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center glass-effect">
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain mx-auto rounded-lg border border-border/20" />
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            disabled={uploadingLogo}
                            variant="outline"
                            className="glass-effect hover-lift rounded-xl"
                            data-testid="button-change-logo"
                          >
                            Change Logo
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setLogoPreview('');
                              setLogoFile(null);
                              setFormData(prev => ({ ...prev, logoUrl: '' }));
                            }}
                            variant="destructive"
                            className="hover-lift rounded-xl"
                            data-testid="button-remove-logo"
                          >
                            Remove Logo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingLogo}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                          data-testid="button-upload-logo"
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                        <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card className="glass-prism-card border-none shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Business Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone" className="text-base font-medium">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="glass-effect border-border/50 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail" className="text-base font-medium">Email Address</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@yourbusiness.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="glass-effect border-border/50 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress" className="text-base font-medium">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    placeholder="123 Main Street, City, State 12345"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                    rows={2}
                    className="glass-effect border-border/50 mt-2"
                  />
                </div>

                <div className="glass-effect rounded-xl p-4 border border-border/50">
                  <Label htmlFor="calendarLink" className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Google Maps Link
                  </Label>
                  <Input
                    id="calendarLink"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.calendarLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, calendarLink: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your Google Maps link so customers can easily find you
                  </p>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Business Hours
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Label className="w-20 capitalize text-sm">{day}:</Label>
                        <Input
                          placeholder="9:00-17:00 or Closed"
                          value={hours}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            businessHours: { ...prev.businessHours, [day]: e.target.value }
                          }))}
                          className="flex-1 glass-effect border-border/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="glass-prism-card border-none shadow-lg">
                  <CardHeader>
                    <h4 className="text-lg font-semibold text-blue-gradient flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Visit Information
                    </h4>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="parking"
                          checked={formData.visitInfo.parking}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            visitInfo: { ...prev.visitInfo, parking: e.target.checked }
                          }))}
                          className="rounded border-border/50"
                          data-testid="checkbox-parking"
                        />
                        <Label htmlFor="parking" className="text-base">Easy parking available</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="wheelchair"
                          checked={formData.visitInfo.wheelchairAccessible}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            visitInfo: { ...prev.visitInfo, wheelchairAccessible: e.target.checked }
                          }))}
                          className="rounded border-border/50"
                          data-testid="checkbox-wheelchair"
                        />
                        <Label htmlFor="wheelchair" className="text-base">Wheelchair accessible</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="professional"
                          checked={formData.visitInfo.professionalAtmosphere}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            visitInfo: { ...prev.visitInfo, professionalAtmosphere: e.target.checked }
                          }))}
                          className="rounded border-border/50"
                          data-testid="checkbox-professional"
                        />
                        <Label htmlFor="professional" className="text-base">Professional atmosphere</Label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Custom Visit Information</Label>
                        <Button type="button" onClick={addCustomVisitInfo} size="sm" className="glass-effect hover-lift rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Info
                        </Button>
                      </div>
                      
                      {formData.visitInfo.customInfo.map((info, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="e.g., Free Wi-Fi, Complimentary beverages"
                            value={info}
                            onChange={(e) => updateCustomVisitInfo(index, e.target.value)}
                            className="flex-1 glass-effect border-border/50"
                            data-testid={`input-custom-visit-${index}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomVisitInfo(index)}
                            className="hover-lift"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {formData.visitInfo.customInfo.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Add custom information about visiting your business
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8 glass-prism-card p-6 rounded-2xl border-none shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-xl glass-prism flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-gradient mb-2">Ready to Launch!</h3>
              <p className="text-muted-foreground">
                Review your booking page details below and publish when you're ready
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <Edit className="h-4 w-4 mr-2" />
                    Basic Information
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                    <p><strong>URL:</strong> bookinggen.xyz/{formData.slug || 'not-set'}</p>
                    <p><strong>Tagline:</strong> {formData.tagline || 'None'}</p>
                    <p><strong>Description:</strong> {formData.description ? formData.description.substring(0, 100) + (formData.description.length > 100 ? '...' : '') : 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Members
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {formData.staff.filter(s => s.name.trim()).map((member, index) => (
                      <p key={index}>
                        <strong>{member.name}</strong> - {member.position || 'No position set'}
                      </p>
                    ))}
                    {formData.staff.filter(s => s.name.trim()).length === 0 && (
                      <p className="text-muted-foreground">No staff members added</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <FileText className="h-4 w-4 mr-2" />
                    Services
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {formData.services.filter(s => s.name.trim()).map((service, index) => {
                      const currency = currencyOptions.find(c => c.code === (service.currency || 'USD'));
                      return (
                        <p key={index}>
                          <strong>{service.name}</strong> - {currency?.symbol || '$'}{service.price} {service.currency || 'USD'} ({service.durationMinutes || 60} min)
                        </p>
                      );
                    })}
                    {formData.services.filter(s => s.name.trim()).length === 0 && (
                      <p className="text-muted-foreground">No services added</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <Palette className="h-4 w-4 mr-2" />
                    Styling
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Theme:</strong> {formData.theme}</p>
                    <p><strong>Logo:</strong> {formData.logoUrl ? 'Uploaded' : 'None'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <MapPin className="h-4 w-4 mr-2" />
                    Visit Information
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {formData.visitInfo.parking && <p>✓ Easy parking available</p>}
                    {formData.visitInfo.wheelchairAccessible && <p>✓ Wheelchair accessible</p>}
                    {formData.visitInfo.professionalAtmosphere && <p>✓ Professional atmosphere</p>}
                    {formData.visitInfo.customInfo.filter(info => info.trim()).map((info, index) => (
                      <p key={index}>✓ {info}</p>
                    ))}
                    {!formData.visitInfo.parking && !formData.visitInfo.wheelchairAccessible && 
                     !formData.visitInfo.professionalAtmosphere && formData.visitInfo.customInfo.length === 0 && (
                      <p className="text-muted-foreground">No visit information added</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <Settings className="h-4 w-4 mr-2" />
                    Contact Info
                  </h4>
                </CardHeader>
                <CardContent className="glass-effect rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> {formData.contactPhone || 'Not set'}</p>
                    <p><strong>Email:</strong> {formData.contactEmail || 'Not set'}</p>
                    <p><strong>Address:</strong> {formData.businessAddress || 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col glass-prism-card border-none shadow-2xl animate-scale-in">
        {/* Glass Prism Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
          <div className="absolute top-20 right-20 w-40 h-40 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '3s'}}></div>
        </div>
        
        <DialogHeader className="flex-shrink-0 relative z-10 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-blue-gradient flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass-prism flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" opacity="0.3"/>
                  <path d="M21 16L12 21L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12L12 17L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {isEditing ? 'Edit Booking Page' : 'Create Booking Page'}
            </DialogTitle>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-4 mt-6">
            <Progress value={getProgress()} className="w-full h-3 glass-effect" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div 
                  key={step.number} 
                  className={`flex flex-col items-center transition-all duration-300 ${
                    currentStep === step.number ? 'text-primary font-medium scale-105' : 
                    currentStep > step.number ? 'text-green-600' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                    currentStep === step.number 
                      ? 'glass-prism text-primary shadow-lg' 
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{step.number}</span>
                    )}
                  </div>
                  <span className="text-xs text-center leading-tight">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-xl glass-prism flex items-center justify-center text-blue-gradient shadow-lg">
                  {steps[currentStep - 1] && (() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return <StepIcon className="h-6 w-6" />;
                  })()}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-blue-gradient">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-effect rounded-xl p-6">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="glass-effect hover-lift rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="glass-prism-button hover-lift rounded-xl"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createPageMutation.isPending}
                    className="glass-prism-button hover-lift rounded-xl"
                  >
                    {createPageMutation.isPending ? 'Publishing...' : isEditing ? 'Update Page' : 'Create Page'}
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
