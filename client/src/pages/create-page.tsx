import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { uploadFile } from '@/lib/supabase';
import { currencies, formatCurrencyDisplay, searchCurrencies, getCurrencyByCode } from '@/lib/currencies';
import { ArrowLeft, ArrowRight, CloudUpload, Plus, X, Palette, FileText, MapPin, Settings, Check, Trash2, Search, Calendar, Phone, Mail, Edit, Users, User, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CreatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tagline: '',
    primaryColor: '#2563eb',
    locationLink: '',
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
    services: [{ name: '', description: '', durationMinutes: '', price: '', currency: 'USD' }],
    staff: [] as Array<{name: string; bio: string; position: string; imageUrl: string; email: string; phone: string}>,
    businessType: 'salon',
    walkInsAccepted: 'accepted',
    parking: '',
    amenities: '',
    spokenLanguages: 'English',
    kidFriendly: 'yes',
    appointmentCancellationPolicy: '',
    gallery: [] as string[],
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadingStaffImage, setUploadingStaffImage] = useState<{[key: number]: boolean}>({});
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Step definitions
  const steps = [
    {
      number: 1,
      title: "Basic Details",
      description: "Set up your booking page name, web address, and tagline",
      icon: Edit,
      fields: ['title', 'slug', 'tagline']
    },
    {
      number: 2, 
      title: "Services & Pricing",
      description: "Add your services, set pricing and duration for each offering",
      icon: FileText,
      fields: ['services']
    },
    {
      number: 3,
      title: "Style & Branding", 
      description: "Customize colors, themes, and upload your logo",
      icon: Palette,
      fields: ['theme', 'primaryColor', 'backgroundType', 'backgroundValue', 'fontFamily', 'logoUrl']
    },
    {
      number: 4,
      title: "Business Information",
      description: "Add contact details, business hours, and policies",
      icon: Settings,
      fields: ['contactPhone', 'contactEmail', 'businessAddress', 'businessHours', 'locationLink', 'cancellationPolicy']
    },
    {
      number: 5,
      title: "Additional Details",
      description: "Add business type, amenities, and other details",
      icon: Info,
      fields: ['businessType', 'walkInsAccepted', 'parking', 'amenities', 'spokenLanguages', 'kidFriendly', 'appointmentCancellationPolicy']
    },
    {
      number: 6,
      title: "Review & Publish",
      description: "Review your booking page and publish it to the world",
      icon: Check,
      fields: []
    }
  ];

  // Font options for typography customization
  const fontOptions = [
    { name: 'Inter (Modern)', value: 'inter', class: 'font-inter' },
    { name: 'Roboto (Clean)', value: 'roboto', class: 'font-roboto' },
    { name: 'Poppins (Rounded)', value: 'poppins', class: 'font-poppins' },
    { name: 'Montserrat (Elegant)', value: 'montserrat', class: 'font-montserrat' },
    { name: 'Lato (Professional)', value: 'lato', class: 'font-lato' },
    { name: 'Open Sans (Friendly)', value: 'opensans', class: 'font-opensans' }
  ];

  // Beautiful color themes for booking pages
  const colorThemes = [
    { name: 'Ocean Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c', gradient: 'from-orange-500 to-red-500' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Rose Gold', primary: '#e11d48', secondary: '#be185d', accent: '#f43f5e', gradient: 'from-rose-500 to-pink-500' },
    { name: 'Midnight', primary: '#1f2937', secondary: '#111827', accent: '#374151', gradient: 'from-gray-800 to-gray-900' },
    { name: 'Electric Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#2dd4bf', gradient: 'from-teal-500 to-cyan-500' },
    { name: 'Coral Sunset', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c', gradient: 'from-orange-400 to-rose-500' },
  ];

  const backgroundOptions = [
    { type: 'gradient', name: 'Blue Gradient', value: 'blue', class: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { type: 'gradient', name: 'Green Gradient', value: 'green', class: 'bg-gradient-to-br from-emerald-100 to-emerald-200' },
    { type: 'gradient', name: 'Purple Gradient', value: 'purple', class: 'bg-gradient-to-br from-violet-100 to-violet-200' },
    { type: 'gradient', name: 'Rose Gradient', value: 'rose', class: 'bg-gradient-to-br from-rose-100 to-rose-200' },
    { type: 'solid', name: 'Clean White', value: 'white', class: 'bg-white' },
    { type: 'solid', name: 'Soft Gray', value: 'gray', class: 'bg-gray-50' },
  ];

  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/pages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Page created!",
        description: "Your booking page has been created successfully.",
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating page",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

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
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => {
      const newData = { ...prev, title };
      // Only auto-generate slug if user hasn't manually edited it
      if (title && !slugManuallyEdited) {
        newData.slug = generateSlug(title);
      }
      return newData;
    });
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug }));
  };

  // Calculate progress percentage
  const getProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', durationMinutes: '', price: '', currency: 'USD' }]
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

  const updateService = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? { ...service, [field]: value } : service)
    }));
  };

  // Staff management functions
  const addStaff = () => {
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { name: '', bio: '', position: '', imageUrl: '', email: '', phone: '' }]
    }));
  };

  const removeStaff = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index)
    }));
  };

  const updateStaff = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.map((member, i) => i === index ? { ...member, [field]: value } : member)
    }));
  };

  const handleStaffImageUpload = async (index: number, file: File) => {
    try {
      setUploadingStaffImage(prev => ({ ...prev, [index]: true }));
      const result = await uploadFile(file, 'staff');
      
      if (result.success && result.url) {
        updateStaff(index, 'imageUrl', result.url);
        toast({
          title: "Staff image uploaded",
          description: "The staff member's profile image has been uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload the staff image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading staff image:', error);
      toast({
        title: "Upload error",
        description: "Something went wrong while uploading the staff image.",
        variant: "destructive",
      });
    } finally {
      setUploadingStaffImage(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file, 'gallery'));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(r => r.success && r.url).map(r => r.url as string);
      
      if (successfulUploads.length > 0) {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...successfulUploads]
        }));
        toast({
          title: "Images uploaded!",
          description: `Successfully uploaded ${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast({
        title: "Upload error",
        description: "Something went wrong while uploading images.",
        variant: "destructive",
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
    toast({
      title: "Image removed",
      description: "The image has been removed from your gallery.",
    });
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFAQ = (index: number) => {
    if (formData.faqs.length > 1) {
      setFormData(prev => ({
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFAQ = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.slug.trim();
      case 2:
        return formData.services.some(service => service.name.trim() && service.price.trim());
      case 3:
        return true; // Styling is optional
      case 4:
        return true; // Business info is optional  
      case 5:
        return true; // Additional details are optional
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

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title and slug.",
        variant: "destructive",
      });
      return;
    }

    if (formData.locationLink && formData.locationLink.trim() !== '') {
      try {
        new URL(formData.locationLink);
      } catch {
        toast({
          title: "Invalid location link",
          description: "Please enter a valid URL (e.g., https://maps.google.com/...)",
          variant: "destructive",
        });
        return;
      }
    }

    const servicesWithNumbers = formData.services.map(service => ({
      ...service,
      price: service.price || '0',
      durationMinutes: parseInt(service.durationMinutes) || 60,
      currency: service.currency || 'USD'
    }));

    const validFaqs = formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim());

    // Prepare the data object with additional business information
    const pageData = {
      businessName: formData.title,
      businessType: formData.businessType,
      walkInsAccepted: formData.walkInsAccepted,
      parking: formData.parking,
      amenities: formData.amenities,
      spokenLanguages: formData.spokenLanguages,
      kidFriendly: formData.kidFriendly,
      appointmentCancellationPolicy: formData.appointmentCancellationPolicy,
    };

    // Destructure to exclude the new business fields from top-level payload
    const { businessType, walkInsAccepted, parking, amenities, spokenLanguages, kidFriendly, appointmentCancellationPolicy, ...pagePayload } = formData;

    createPageMutation.mutate({
      ...pagePayload,
      services: servicesWithNumbers,
      staff: formData.staff,
      faqs: validFaqs,
      data: pageData,
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
                <div>
                  <Label htmlFor="title" className="text-base font-medium">Business Name *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Your Business Name"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="text-base font-medium">Web Address (URL) *</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-muted-foreground px-3 py-2 glass-effect rounded-lg border border-border/50">bookinggen.xyz/</span>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="your-business-name"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="glass-effect border-border/50"
                      data-testid="input-slug"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will be your unique booking page URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="tagline" className="text-base font-medium">Tagline</Label>
                  <Input
                    id="tagline"
                    type="text"
                    placeholder="Professional services made easy"
                    value={formData.tagline}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-tagline"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    A short description that appears under your business name
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
                    <FileText className="h-5 w-5" />
                    Your Services
                  </h3>
                  <Button type="button" onClick={addService} className="glass-effect hover-lift rounded-xl" size="sm" data-testid="button-add-service">
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
                          data-testid={`button-remove-service-${index}`}
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
                          data-testid={`input-service-name-${index}`}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-base font-medium">Description</Label>
                        <Textarea
                          placeholder="Describe what's included in this service..."
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          rows={2}
                          className="glass-effect border-border/50 mt-2"
                          data-testid={`textarea-service-description-${index}`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-base font-medium">Duration (minutes)</Label>
                          <Input
                            type="number"
                            placeholder="60"
                            value={service.durationMinutes}
                            onChange={(e) => updateService(index, 'durationMinutes', e.target.value)}
                            className="glass-effect border-border/50 mt-2"
                            data-testid={`input-service-duration-${index}`}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-base font-medium">Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="99.00"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', e.target.value)}
                            className="glass-effect border-border/50 mt-2"
                            data-testid={`input-service-price-${index}`}
                          />
                        </div>

                        <div>
                          <Label className="text-base font-medium">Currency</Label>
                          <div className="mt-2">
                            <Select
                              value={service.currency}
                              onValueChange={(value) => updateService(index, 'currency', value)}
                            >
                              <SelectTrigger className="glass-effect border-border/50" data-testid={`select-service-currency-${index}`}>
                                <SelectValue placeholder="USD" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.slice(0, 10).map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    <span className="font-mono text-sm">{currency.symbol}</span>
                                    <span className="font-medium ml-2">{currency.code}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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

      case 3:
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorThemes.map((theme, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, theme: theme.name, primaryColor: theme.primary }))}
                          className={`w-full p-3 rounded-xl border-2 transition-all hover:scale-105 hover-lift glass-effect ${
                            formData.theme === theme.name ? 'border-primary shadow-lg' : 'border-border/50'
                          }`}
                          data-testid={`button-theme-${index}`}
                        >
                          <div className={`w-full h-8 rounded mb-2 bg-gradient-to-r ${theme.gradient}`}></div>
                          <span className="text-sm font-medium">{theme.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Background Style</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {backgroundOptions.map((bg, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          backgroundType: bg.type, 
                          backgroundValue: bg.value 
                        }))}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 hover-lift glass-effect ${
                          formData.backgroundValue === bg.value ? 'border-primary shadow-lg' : 'border-border/50'
                        }`}
                        data-testid={`button-background-${index}`}
                      >
                        <div className={`w-full h-12 rounded mb-2 ${bg.class}`}></div>
                        <span className="text-sm font-medium">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Typography</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fontOptions.map((font, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, fontFamily: font.value }))}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 hover-lift glass-effect text-left ${
                          formData.fontFamily === font.value ? 'border-primary shadow-lg' : 'border-border/50'
                        }`}
                        data-testid={`button-font-${index}`}
                      >
                        <div className={`${font.class} text-lg mb-1`}>Aa Bb Cc</div>
                        <span className="text-sm font-medium">{font.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Custom Primary Color</Label>
                  <div className="glass-effect rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-16 rounded-lg border-2 border-border/50 cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <div>
                        <Label className="text-sm font-medium">Primary Color</Label>
                        <Input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="glass-effect border-border/50 mt-1 font-mono"
                          placeholder="#2563eb"
                          data-testid="input-primary-color-hex"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Choose a primary color that represents your brand
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Upload Logo (Optional)</Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center glass-effect">
                    {logoPreview ? (
                      <div className="space-y-4">
                        <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain mx-auto" />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingLogo}
                          className="glass-effect hover-lift rounded-xl"
                          data-testid="button-change-logo"
                        >
                          Change Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingLogo}
                          className="glass-effect hover-lift rounded-xl"
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

                {/* Gallery Upload */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Photo Gallery (Optional)</Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 glass-effect">
                    <div className="text-center space-y-4 mb-4">
                      <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <Button
                          type="button"
                          onClick={() => document.getElementById('gallery-upload')?.click()}
                          disabled={uploadingGallery}
                          className="glass-effect hover-lift rounded-xl"
                          data-testid="button-upload-gallery"
                        >
                          {uploadingGallery ? 'Uploading...' : 'Upload Images'}
                        </Button>
                        <input
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload multiple images to showcase your business. PNG, JPG up to 5MB each
                      </p>
                    </div>

                    {/* Gallery Preview */}
                    {formData.gallery.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {formData.gallery.map((imageUrl, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border/30">
                              <img 
                                src={imageUrl} 
                                alt={`Gallery ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeGalleryImage(index)}
                                  className="rounded-full"
                                  data-testid={`button-remove-gallery-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          {formData.gallery.length} image{formData.gallery.length > 1 ? 's' : ''} uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
                      data-testid="input-contact-phone"
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
                      data-testid="input-contact-email"
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
                    data-testid="textarea-business-address"
                  />
                </div>

                <div className="glass-effect rounded-xl p-4 border border-border/50">
                  <Label htmlFor="locationLink" className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Google Maps Link
                  </Label>
                  <Input
                    id="locationLink"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.locationLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationLink: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-location-link"
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
                          data-testid={`input-hours-${day}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cancellationPolicy" className="text-base font-medium">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    placeholder="Please provide 24 hours notice for cancellations..."
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                    rows={3}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="textarea-cancellation-policy"
                  />
                </div>

                {/* Staff Management Section (Optional) */}
                <div className="glass-effect rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members (Optional)
                    </Label>
                    <Button 
                      type="button" 
                      onClick={addStaff} 
                      className="glass-effect hover-lift rounded-xl" 
                      size="sm"
                      data-testid="button-add-staff"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your team members to showcase your staff on the booking page
                  </p>

                  {formData.staff.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No team members added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.staff.map((member, index) => (
                        <Card key={index} className="glass-effect border-border/50 shadow-sm">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <h4 className="text-sm font-medium">Team Member #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStaff(index)}
                              className="hover-lift"
                              data-testid={`button-remove-staff-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-4">
                            {/* Profile Image Upload */}
                            <div>
                              <Label className="text-sm font-medium">Profile Image (Optional)</Label>
                              <div className="mt-2 flex items-center gap-4">
                                {member.imageUrl ? (
                                  <img 
                                    src={member.imageUrl} 
                                    alt={member.name || "Staff member"} 
                                    className="w-16 h-16 rounded-full object-cover border-2 border-border/50"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border/50">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => document.getElementById(`staff-image-${index}`)?.click()}
                                  disabled={uploadingStaffImage[index]}
                                  className="glass-effect hover-lift rounded-xl"
                                  size="sm"
                                  data-testid={`button-upload-staff-image-${index}`}
                                >
                                  {uploadingStaffImage[index] ? 'Uploading...' : member.imageUrl ? 'Change Image' : 'Upload Image'}
                                </Button>
                                <input
                                  id={`staff-image-${index}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files?.[0] && handleStaffImageUpload(index, e.target.files[0])}
                                  className="hidden"
                                />
                              </div>
                            </div>

                            {/* Staff Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Name *</Label>
                                <Input
                                  placeholder="e.g., Dr. Sarah Johnson"
                                  value={member.name}
                                  onChange={(e) => updateStaff(index, 'name', e.target.value)}
                                  className="glass-effect border-border/50 mt-1"
                                  data-testid={`input-staff-name-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Position</Label>
                                <Input
                                  placeholder="e.g., Senior Consultant"
                                  value={member.position}
                                  onChange={(e) => updateStaff(index, 'position', e.target.value)}
                                  className="glass-effect border-border/50 mt-1"
                                  data-testid={`input-staff-position-${index}`}
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Bio</Label>
                              <Textarea
                                placeholder="Brief description about this team member..."
                                value={member.bio}
                                onChange={(e) => updateStaff(index, 'bio', e.target.value)}
                                rows={2}
                                className="glass-effect border-border/50 mt-1"
                                data-testid={`textarea-staff-bio-${index}`}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                  type="email"
                                  placeholder="sarah@company.com"
                                  value={member.email}
                                  onChange={(e) => updateStaff(index, 'email', e.target.value)}
                                  className="glass-effect border-border/50 mt-1"
                                  data-testid={`input-staff-email-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 123-4567"
                                  value={member.phone}
                                  onChange={(e) => updateStaff(index, 'phone', e.target.value)}
                                  className="glass-effect border-border/50 mt-1"
                                  data-testid={`input-staff-phone-${index}`}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
                  <Info className="h-5 w-5" />
                  Additional Business Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType" className="text-base font-medium">Business Type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                    >
                      <SelectTrigger className="glass-effect border-border/50 mt-2" data-testid="select-business-type">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salon" data-testid="option-salon">Salon</SelectItem>
                        <SelectItem value="spa" data-testid="option-spa">Spa</SelectItem>
                        <SelectItem value="clinic" data-testid="option-clinic">Clinic</SelectItem>
                        <SelectItem value="consultant" data-testid="option-consultant">Consultant</SelectItem>
                        <SelectItem value="photography" data-testid="option-photography">Photography</SelectItem>
                        <SelectItem value="fitness" data-testid="option-fitness">Fitness</SelectItem>
                        <SelectItem value="restaurant" data-testid="option-restaurant">Restaurant</SelectItem>
                        <SelectItem value="education" data-testid="option-education">Education</SelectItem>
                        <SelectItem value="other" data-testid="option-other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="walkInsAccepted" className="text-base font-medium">Walk-ins</Label>
                    <Select
                      value={formData.walkInsAccepted}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, walkInsAccepted: value }))}
                    >
                      <SelectTrigger className="glass-effect border-border/50 mt-2" data-testid="select-walk-ins">
                        <SelectValue placeholder="Select walk-in policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepted" data-testid="option-walk-ins-accepted">Walk-ins accepted</SelectItem>
                        <SelectItem value="declined" data-testid="option-walk-ins-declined">Walk-ins declined</SelectItem>
                        <SelectItem value="by-appointment-preferred" data-testid="option-walk-ins-by-appointment">By appointment preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="parking" className="text-base font-medium">Parking (Optional)</Label>
                  <Input
                    id="parking"
                    type="text"
                    placeholder="e.g., Free parking available, Street parking only"
                    value={formData.parking}
                    onChange={(e) => setFormData(prev => ({ ...prev, parking: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-parking"
                  />
                </div>

                <div>
                  <Label htmlFor="amenities" className="text-base font-medium">Amenities (Optional)</Label>
                  <Input
                    id="amenities"
                    type="text"
                    placeholder="e.g., Free WiFi, Refreshments, Waiting area"
                    value={formData.amenities}
                    onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="input-amenities"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="spokenLanguages" className="text-base font-medium">Spoken Languages (Optional)</Label>
                    <Input
                      id="spokenLanguages"
                      type="text"
                      placeholder="e.g., English, Spanish, French"
                      value={formData.spokenLanguages}
                      onChange={(e) => setFormData(prev => ({ ...prev, spokenLanguages: e.target.value }))}
                      className="glass-effect border-border/50 mt-2"
                      data-testid="input-spoken-languages"
                    />
                  </div>

                  <div>
                    <Label htmlFor="kidFriendly" className="text-base font-medium">Kid Friendly</Label>
                    <Select
                      value={formData.kidFriendly}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, kidFriendly: value }))}
                    >
                      <SelectTrigger className="glass-effect border-border/50 mt-2" data-testid="select-kid-friendly">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes" data-testid="option-kid-yes">Yes</SelectItem>
                        <SelectItem value="no" data-testid="option-kid-no">No</SelectItem>
                        <SelectItem value="family-focused" data-testid="option-kid-family">Family-focused business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="appointmentCancellationPolicy" className="text-base font-medium">Appointment Cancellation Policy (Optional)</Label>
                  <Textarea
                    id="appointmentCancellationPolicy"
                    placeholder="e.g., Please notify us 24 hours in advance if you need to cancel or reschedule your appointment..."
                    value={formData.appointmentCancellationPolicy}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentCancellationPolicy: e.target.value }))}
                    rows={3}
                    className="glass-effect border-border/50 mt-2"
                    data-testid="textarea-appointment-cancellation"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    This will be displayed in the About section of your booking page
                  </p>
                </div>
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
                    <p><strong>Business:</strong> {formData.title || 'Not set'}</p>
                    <p><strong>URL:</strong> bookinggen.xyz/{formData.slug || 'not-set'}</p>
                    <p><strong>Tagline:</strong> {formData.tagline || 'None'}</p>
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
                    {formData.services.filter(s => s.name.trim()).map((service, index) => (
                      <p key={index}>
                        <strong>{service.name}</strong> - ${service.price} ({service.durationMinutes || 60} min)
                      </p>
                    ))}
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
                    <p><strong>Location:</strong> {formData.locationLink ? 'Added' : 'None'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-prism-card border-none shadow-lg hover-lift">
                <CardHeader>
                  <h4 className="font-medium flex items-center text-blue-gradient">
                    <Phone className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen page-gradient">
      {/* Glass Prism Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
        <div className="absolute top-32 right-20 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-32 h-32 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '3s'}}></div>
      </div>
      
      {/* Header */}
      <div className="container mx-auto px-6 pt-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center glass-effect hover-lift rounded-xl"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Glass Prism Progress Header */}
      <div className="container mx-auto px-6 mb-12 relative z-10">
        <div className="glass-prism-card p-8 rounded-2xl border-none shadow-2xl animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl glass-prism flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" opacity="0.3"/>
                  <path d="M21 16L12 21L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12L12 17L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-blue-gradient mb-2">Create Your Booking Page</h1>
            <p className="text-muted-foreground">Build a professional booking page in just a few steps</p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={getProgress()} className="w-full h-3 glass-effect" data-testid="progress-wizard" />
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
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-6 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto glass-prism-card border-none shadow-2xl animate-fade-in-up rounded-2xl">
          <CardHeader className="text-center pb-6 relative">
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
          </CardHeader>
          <CardContent className="relative">
            <div className="glass-effect rounded-xl p-6">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/20">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="glass-effect hover-lift rounded-xl"
                data-testid="button-previous"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="glass-prism-button hover-lift rounded-xl"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createPageMutation.isPending}
                  className="glass-prism-button hover-lift rounded-xl"
                  data-testid="button-publish"
                >
                  {createPageMutation.isPending ? 'Publishing...' : 'Publish Page'}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}