import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CloudUpload, Plus, X, Palette, Image, FileText, Settings, HelpCircle, MapPin, Calendar, Trash2 } from 'lucide-react';
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
    services: [{ name: '', description: '', durationMinutes: 60, price: '0' }],
    gallery: {
      banners: [],
      logos: [],
      images: []
    }
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
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
      services: [{ name: '', description: '', durationMinutes: 60, price: '0' }],
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
            price: service.price?.toString() || '0'
          }))
        : [{ name: '', description: '', durationMinutes: 60, price: '0' }];

      setFormData({
        title: editingPageData.title || '',
        slug: editingPageData.slug || '',
        tagline: editingPageData.tagline || '',
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
        gallery: editingPageData.gallery || {
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
      if (editingPageData.gallery) {
        setGalleryPreviews({
          banners: editingPageData.gallery.banners || [],
          logos: editingPageData.gallery.logos || [],
          images: editingPageData.gallery.images || []
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
      slug: prev.slug === '' ? generateSlug(value) : prev.slug
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', durationMinutes: 60, price: '0' }]
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
      gallery: formData.gallery
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Booking Page' : 'Create Booking Page'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
            
            {/* Basic Information Section */}
            <AccordionItem value="basic" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Basic Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Page Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Personal Training"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                        data-testid="input-page-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                          bookinggen.com/
                        </span>
                        <Input
                          id="slug"
                          placeholder="personal-training"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                          className="rounded-l-none"
                          required
                          data-testid="input-page-slug"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      placeholder="Transform your fitness journey with personalized training"
                      value={formData.tagline}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      data-testid="input-tagline"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      A catchy subtitle that describes what you offer
                    </p>
                  </div>

                  <div>
                    <Label>Logo Upload</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => !uploadingLogo && document.getElementById('logo-upload-modal')?.click()}
                    >
                      {logoPreview ? (
                        <div className="space-y-4">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-16 w-auto mx-auto rounded-lg border border-border"
                          />
                          <p className="text-sm text-muted-foreground">{logoFile?.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoPreview('');
                              setLogoFile(null);
                              setFormData(prev => ({ ...prev, logoUrl: '' }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CloudUpload className={`h-8 w-8 mx-auto mb-4 ${uploadingLogo ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-muted-foreground mb-2">
                            {uploadingLogo ? 'Uploading...' : 'Drop your logo here, or'} 
                            {!uploadingLogo && <span className="text-primary cursor-pointer"> browse</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB</p>
                        </>
                      )}
                      <input
                        id="logo-upload-modal"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast({
                                title: "File too large",
                                description: "Please select an image under 2MB",
                                variant: "destructive"
                              });
                              return;
                            }
                            handleLogoUpload(file);
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your company or service logo (optional)
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Styling & Appearance Section */}
            <AccordionItem value="styling" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Styling & Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Color Theme ({colorThemes.length} options)</span>
                    </Label>
                    <div className="max-h-64 overflow-y-auto border border-border rounded-xl p-3 mt-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {colorThemes.map((theme, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectColorTheme(theme)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              formData.primaryColor === theme.primary 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div 
                              className={`h-4 w-full rounded bg-gradient-to-r ${theme.gradient} mb-1`}
                            />
                            <p className="text-xs font-medium text-foreground">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>Background Style ({backgroundOptions.length} options)</span>
                    </Label>
                    <div className="max-h-64 overflow-y-auto border border-border rounded-xl p-3 mt-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {backgroundOptions.map((bg, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              backgroundType: bg.type, 
                              backgroundValue: bg.value 
                            }))}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              formData.backgroundValue === bg.value 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className={`h-4 w-full rounded ${bg.class} mb-1 border border-border/20`} />
                            <p className="text-xs font-medium text-foreground">{bg.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{bg.type}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Font Style</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {fontOptions.map((font, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, fontFamily: font.value }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.fontFamily === font.value 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`text-center ${font.class}`}>
                            <p className="text-lg font-semibold mb-1">Sample Text</p>
                            <p className="text-xs text-muted-foreground">{font.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="primaryColor">Custom Primary Color</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-12 border border-border rounded-lg cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                        placeholder="#2563eb"
                        data-testid="input-primary-color-hex"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Services Section */}
            <AccordionItem value="services" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Services & Pricing</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div>
                  <Label>Services</Label>
                  <div className="space-y-4 mt-2">
                    {formData.services.map((service, index) => (
                      <div key={index} className="grid md:grid-cols-4 gap-4 p-4 border border-border rounded-xl">
                        <Input
                          placeholder="Service name"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          data-testid={`input-service-name-${index}`}
                        />
                        <Input
                          type="number"
                          placeholder="Duration (min)"
                          value={service.durationMinutes}
                          onChange={(e) => updateService(index, 'durationMinutes', parseInt(e.target.value))}
                          data-testid={`input-service-duration-${index}`}
                        />
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="Price"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', e.target.value)}
                            className="rounded-l-none"
                            data-testid={`input-service-price-${index}`}
                          />
                        </div>
                        {formData.services.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeService(index)}
                            data-testid={`button-remove-service-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      onClick={addService}
                      data-testid="button-add-service"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Service
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Content Management Section */}
            <AccordionItem value="content" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Content & FAQ Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label>Frequently Asked Questions</Label>
                    <div className="space-y-3 mt-2">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="grid gap-3 p-4 border border-border rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">FAQ #{index + 1}</span>
                            {formData.faqs.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFaq(index)}
                                data-testid={`button-remove-faq-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`faq-question-${index}`}>Question</Label>
                            <Input
                              id={`faq-question-${index}`}
                              placeholder="e.g., What should I bring to my appointment?"
                              value={faq.question}
                              onChange={(e) => updateFaq(index, 'question', e.target.value)}
                              data-testid={`input-faq-question-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                            <Textarea
                              id={`faq-answer-${index}`}
                              rows={3}
                              placeholder="Please bring comfortable workout clothes and a water bottle..."
                              value={faq.answer}
                              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                              className="resize-none"
                              data-testid={`textarea-faq-answer-${index}`}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed"
                        onClick={addFaq}
                        data-testid="button-add-faq"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another FAQ
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.acceptReviews === 'true'}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptReviews: e.target.checked ? 'true' : 'false' }))}
                        className="rounded border-border"
                        data-testid="checkbox-accept-reviews"
                      />
                      <span>Accept and display customer reviews on booking page</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      When enabled, customers can leave reviews after appointments that will be displayed on your booking page
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Business Information Section */}
            <AccordionItem value="business" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Business Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label>Business Information</Label>
                    <div className="space-y-3 mt-2">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="contactPhone">Phone Number</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                            data-testid="input-contact-phone"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail">Email Address</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="hello@example.com"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                            data-testid="input-contact-email"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <Textarea
                          id="businessAddress"
                          rows={2}
                          placeholder="123 Main Street, City, State 12345"
                          value={formData.businessAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                          className="resize-none"
                          data-testid="input-business-address"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                        <Textarea
                          id="cancellationPolicy"
                          rows={3}
                          placeholder="Please provide 24 hours notice for cancellations..."
                          value={formData.cancellationPolicy}
                          onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                          className="resize-none"
                          data-testid="input-cancellation-policy"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.showContactInfo === 'true'}
                            onChange={(e) => setFormData(prev => ({ ...prev, showContactInfo: e.target.checked ? 'true' : 'false' }))}
                            className="rounded border-border"
                            data-testid="checkbox-show-contact-info"
                          />
                          <span>Display contact information on booking page</span>
                        </Label>
                        
                        <Label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.showBusinessHours === 'true'}
                            onChange={(e) => setFormData(prev => ({ ...prev, showBusinessHours: e.target.checked ? 'true' : 'false' }))}
                            className="rounded border-border"
                            data-testid="checkbox-show-business-hours"
                          />
                          <span>Display business hours on booking page</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Business Hours</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
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
                            className="flex-1"
                            data-testid={`input-hours-${day}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Integration Section */}
            <AccordionItem value="integration" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Calendar Integration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div>
                  <Label htmlFor="calendarLink">Calendar Integration</Label>
                  <Input
                    id="calendarLink"
                    type="url"
                    placeholder="Google Calendar, Calendly, or other calendar link"
                    value={formData.calendarLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, calendarLink: e.target.value }))}
                    data-testid="input-calendar-link"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your booking calendar link (Google Calendar, Calendly, etc.)
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Gallery Section */}
            <AccordionItem value="gallery" className="border border-border rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <Image className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold">Gallery</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  
                  {/* Banners Section */}
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Image className="h-4 w-4" />
                      <span>Banner Images</span>
                    </Label>
                    <div className="space-y-2">
                      <div 
                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => document.getElementById('banner-upload-modal')?.click()}
                      >
                        {uploadingGallery.banners ? (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 animate-pulse text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading banners...</p>
                          </>
                        ) : (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-1">Drop banner images here, or <span className="text-primary cursor-pointer">browse</span></p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                          </>
                        )}
                        <input
                          id="banner-upload-modal"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingGallery.banners}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleGalleryUpload(e.target.files, 'banners');
                            }
                          }}
                        />
                      </div>
                      
                      {galleryPreviews.banners.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {galleryPreviews.banners.map((banner, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={banner.url} 
                                alt={banner.name}
                                className="w-full h-16 object-cover rounded-lg border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={() => removeGalleryImage('banners', index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{banner.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Logos Section */}
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Image className="h-4 w-4" />
                      <span>Logo Variations</span>
                    </Label>
                    <div className="space-y-2">
                      <div 
                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => document.getElementById('logos-upload-modal')?.click()}
                      >
                        {uploadingGallery.logos ? (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 animate-pulse text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading logos...</p>
                          </>
                        ) : (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-1">Drop logo variations here, or <span className="text-primary cursor-pointer">browse</span></p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                          </>
                        )}
                        <input
                          id="logos-upload-modal"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingGallery.logos}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleGalleryUpload(e.target.files, 'logos');
                            }
                          }}
                        />
                      </div>
                      
                      {galleryPreviews.logos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {galleryPreviews.logos.map((logo, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={logo.url} 
                                alt={logo.name}
                                className="w-full h-12 object-contain rounded-lg border border-border bg-white p-1"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                                onClick={() => removeGalleryImage('logos', index)}
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{logo.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General Images Section */}
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Image className="h-4 w-4" />
                      <span>Additional Images</span>
                    </Label>
                    <div className="space-y-2">
                      <div 
                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => document.getElementById('images-upload-modal')?.click()}
                      >
                        {uploadingGallery.images ? (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 animate-pulse text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading images...</p>
                          </>
                        ) : (
                          <>
                            <CloudUpload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-1">Drop additional images here, or <span className="text-primary cursor-pointer">browse</span></p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                          </>
                        )}
                        <input
                          id="images-upload-modal"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingGallery.images}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleGalleryUpload(e.target.files, 'images');
                            }
                          }}
                        />
                      </div>
                      
                      {galleryPreviews.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {galleryPreviews.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={image.url} 
                                alt={image.name}
                                className="w-full h-16 object-cover rounded-lg border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={() => removeGalleryImage('images', index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              disabled={createPageMutation.isPending}
              data-testid={isEditing ? "button-update-page" : "button-create-page"}
            >
              {createPageMutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Page' : 'Create Page')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
