import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { uploadFile } from '@/lib/supabase';
import { ArrowLeft, CloudUpload, Plus, X, Palette, Image } from 'lucide-react';

export default function CreatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    services: [{ name: '', description: '', durationMinutes: 60, price: '0' }]
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Beautiful color themes for booking pages
  const colorThemes = [
    { name: 'Ocean Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c', gradient: 'from-orange-500 to-red-500' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Rose Gold', primary: '#e11d48', secondary: '#be185d', accent: '#f43f5e', gradient: 'from-rose-500 to-pink-500' },
    { name: 'Midnight', primary: '#1f2937', secondary: '#111827', accent: '#374151', gradient: 'from-gray-800 to-gray-900' }
  ];

  const backgroundOptions = [
    { type: 'gradient', name: 'Blue Gradient', value: 'blue', class: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { type: 'gradient', name: 'Green Gradient', value: 'green', class: 'bg-gradient-to-br from-emerald-100 to-emerald-200' },
    { type: 'gradient', name: 'Purple Gradient', value: 'purple', class: 'bg-gradient-to-br from-violet-100 to-violet-200' },
    { type: 'gradient', name: 'Rose Gradient', value: 'rose', class: 'bg-gradient-to-br from-rose-100 to-rose-200' },
    { type: 'solid', name: 'Clean White', value: 'white', class: 'bg-white' },
    { type: 'solid', name: 'Soft Gray', value: 'gray', class: 'bg-gray-50' }
  ];

  const fontOptions = [
    { name: 'Inter (Modern)', value: 'inter', class: 'font-inter' },
    { name: 'Playfair (Elegant)', value: 'playfair', class: 'font-playfair' },
    { name: 'Roboto (Clean)', value: 'roboto', class: 'font-roboto' },
    { name: 'Open Sans (Friendly)', value: 'opensans', class: 'font-opensans' }
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

  const selectColorTheme = (theme: any) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: theme.primary,
      theme: theme.name
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

    const servicesWithNumbers = formData.services.map(service => ({
      ...service,
      price: parseFloat(service.price) || 0,
      durationMinutes: parseInt(service.durationMinutes.toString()) || 60
    }));

    createPageMutation.mutate({
      ...formData,
      services: servicesWithNumbers
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create Booking Page</h1>
          <p className="text-muted-foreground">Set up a new booking page for your services</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>
              
              <div>
                <Label>Logo Upload</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => !uploadingLogo && document.getElementById('logo-upload')?.click()}
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
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
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
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>Color Theme</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {colorThemes.map((theme, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectColorTheme(theme)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.primaryColor === theme.primary 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div 
                          className={`h-8 w-full rounded-lg bg-gradient-to-r ${theme.gradient} mb-2`}
                        />
                        <p className="text-sm font-medium text-foreground">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Image className="h-4 w-4" />
                    <span>Background Style</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {backgroundOptions.map((bg, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          backgroundType: bg.type, 
                          backgroundValue: bg.value 
                        }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.backgroundValue === bg.value 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`h-8 w-full rounded-lg ${bg.class} mb-2 border border-border/20`} />
                        <p className="text-sm font-medium text-foreground">{bg.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Font Style</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
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
              
              <div>
                <Label>Services</Label>
                <div className="space-y-4">
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
              </div>
              
              <div className="flex space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation('/dashboard')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="default"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  disabled={createPageMutation.isPending}
                  data-testid="button-create-page"
                >
                  {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
