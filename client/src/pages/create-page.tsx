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
import { ArrowLeft, CloudUpload, Plus, X } from 'lucide-react';

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
    services: [{ name: '', description: '', durationMinutes: 60, price: '0' }]
  });

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
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <CloudUpload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drop your logo here, or <span className="text-primary cursor-pointer">browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 border border-border rounded-lg"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1"
                    data-testid="input-primary-color-hex"
                  />
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
                  className="flex-1 button-gradient"
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
