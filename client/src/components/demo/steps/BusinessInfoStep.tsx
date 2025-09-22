import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DemoData {
  businessName: string;
  tagline: string;
  contactPhone: string;
  logoBase64: string;
  businessType: string;
}

interface BusinessInfoStepProps {
  data: DemoData;
  updateData: (updates: Partial<DemoData>) => void;
}

const businessTypes = [
  { value: 'salon', label: 'Salon & Spa' },
  { value: 'barber', label: 'Barber Shop' },
  { value: 'coach', label: 'Life Coach' },
  { value: 'fitness', label: 'Fitness Trainer' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'lawyer', label: 'Legal Services' },
  { value: 'photographer', label: 'Photography' },
  { value: 'tutor', label: 'Tutoring' },
  { value: 'other', label: 'Other Service' }
];

export default function BusinessInfoStep({ data, updateData }: BusinessInfoStepProps) {
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setLogoUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateData({ logoBase64: base64 });
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business-name" data-testid="label-business-name">
              Business Name *
            </Label>
            <Input
              id="business-name"
              data-testid="input-business-name"
              value={data.businessName}
              onChange={(e) => updateData({ businessName: e.target.value })}
              placeholder="Enter your business name"
              className="w-full"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline" data-testid="label-tagline">
              Tagline (Optional)
            </Label>
            <Input
              id="tagline"
              data-testid="input-tagline"
              value={data.tagline}
              onChange={(e) => updateData({ tagline: e.target.value })}
              placeholder="A brief description of your services"
              className="w-full"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" data-testid="label-phone">
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              data-testid="input-phone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => updateData({ contactPhone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="business-type" data-testid="label-business-type">
              Business Type
            </Label>
            <Select
              value={data.businessType}
              onValueChange={(value) => updateData({ businessType: value })}
            >
              <SelectTrigger data-testid="select-business-type">
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    data-testid={`option-business-type-${type.value}`}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🖼️ Logo Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label data-testid="label-logo">Logo (Optional)</Label>
            <div className="flex items-center space-x-4">
              {data.logoBase64 && (
                <div className="w-16 h-16 rounded border border-border overflow-hidden">
                  <img
                    src={data.logoBase64}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    data-testid="img-logo-preview"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                  data-testid="input-logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={logoUploading}
                  data-testid="button-upload-logo"
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoUploading ? 'Uploading...' : data.logoBase64 ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, max 5MB. JPG, PNG, or GIF format.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}