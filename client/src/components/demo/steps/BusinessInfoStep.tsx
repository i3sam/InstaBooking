import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

interface DemoData {
  businessName: string;
  tagline: string;
  contactPhone: string;
  logoBase64: string;
  businessType: string;
  walkInsAccepted: string;
  parking: string;
  amenities: string;
  spokenLanguages: string;
  kidFriendly: string;
  appointmentCancellationPolicy: string;
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

      {/* Additional Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ℹ️ Additional Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Walk-ins */}
          <div className="space-y-2">
            <Label htmlFor="walk-ins" data-testid="label-walk-ins">
              Walk-ins
            </Label>
            <Select
              value={data.walkInsAccepted}
              onValueChange={(value) => updateData({ walkInsAccepted: value })}
            >
              <SelectTrigger data-testid="select-walk-ins">
                <SelectValue placeholder="Select walk-in policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accepted" data-testid="option-walk-ins-accepted">Walk-ins accepted</SelectItem>
                <SelectItem value="declined" data-testid="option-walk-ins-declined">Walk-ins declined</SelectItem>
                <SelectItem value="by-appointment-preferred" data-testid="option-walk-ins-by-appointment">By appointment preferred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parking */}
          <div className="space-y-2">
            <Label htmlFor="parking" data-testid="label-parking">
              Parking (Optional)
            </Label>
            <Input
              id="parking"
              data-testid="input-parking"
              value={data.parking}
              onChange={(e) => updateData({ parking: e.target.value })}
              placeholder="e.g., Free parking available, Street parking only"
              className="w-full"
            />
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label htmlFor="amenities" data-testid="label-amenities">
              Amenities (Optional)
            </Label>
            <Input
              id="amenities"
              data-testid="input-amenities"
              value={data.amenities}
              onChange={(e) => updateData({ amenities: e.target.value })}
              placeholder="e.g., Free WiFi, Refreshments, Waiting area"
              className="w-full"
            />
          </div>

          {/* Spoken Languages */}
          <div className="space-y-2">
            <Label htmlFor="spoken-languages" data-testid="label-spoken-languages">
              Spoken Languages (Optional)
            </Label>
            <Input
              id="spoken-languages"
              data-testid="input-spoken-languages"
              value={data.spokenLanguages}
              onChange={(e) => updateData({ spokenLanguages: e.target.value })}
              placeholder="e.g., English, Spanish, French"
              className="w-full"
            />
          </div>

          {/* Kid Friendly */}
          <div className="space-y-2">
            <Label htmlFor="kid-friendly" data-testid="label-kid-friendly">
              Kid Friendly
            </Label>
            <Select
              value={data.kidFriendly}
              onValueChange={(value) => updateData({ kidFriendly: value })}
            >
              <SelectTrigger data-testid="select-kid-friendly">
                <SelectValue placeholder="Select kid-friendly policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes" data-testid="option-kid-friendly-yes">Yes</SelectItem>
                <SelectItem value="no" data-testid="option-kid-friendly-no">No</SelectItem>
                <SelectItem value="family-focused" data-testid="option-kid-friendly-family">Family-focused business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Cancellation Policy */}
          <div className="space-y-2">
            <Label htmlFor="cancellation-policy" data-testid="label-cancellation-policy">
              Appointment Cancellation Policy (Optional)
            </Label>
            <Textarea
              id="cancellation-policy"
              data-testid="textarea-cancellation-policy"
              value={data.appointmentCancellationPolicy}
              onChange={(e) => updateData({ appointmentCancellationPolicy: e.target.value })}
              placeholder="e.g., 24-hour notice required for cancellations. Fees may apply for last-minute cancellations."
              className="w-full min-h-[80px]"
            />
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