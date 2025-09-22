import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Smartphone, Save, UserPlus, Rocket, Clock, DollarSign, Phone, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Service {
  name: string;
  duration: number;
  price: number;
}

interface DemoData {
  businessName: string;
  tagline: string;
  contactPhone: string;
  logoBase64: string;
  businessType: string;
  theme: string;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  showLogo: boolean;
  showPhone: boolean;
  services: Service[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

interface PreviewStepProps {
  data: DemoData;
  onSaveDemo: () => void;
  onCreateAccount: () => void;
  isSaving: boolean;
  isConverting: boolean;
  demoCreated: boolean;
  user: any;
}

export default function PreviewStep({
  data,
  onSaveDemo,
  onCreateAccount,
  isSaving,
  isConverting,
  demoCreated,
  user
}: PreviewStepProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const openBusinessHours = Object.entries(data.businessHours)
    .filter(([, hours]) => hours !== 'Closed')
    .slice(0, 3);

  const BookingPagePreview = () => (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden border ${
        viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
      }`}
      style={{ 
        minHeight: viewMode === 'mobile' ? '600px' : '500px',
        fontSize: data.fontSize === 'small' ? '14px' : data.fontSize === 'medium' ? '16px' : '18px'
      }}
    >
      {/* Header */}
      <div 
        className="relative p-6 text-white"
        style={{ backgroundColor: data.primaryColor }}
      >
        <div className="text-center space-y-3">
          {data.showLogo && data.logoBase64 && (
            <div className="flex justify-center">
              <img
                src={data.logoBase64}
                alt="Logo"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            </div>
          )}
          
          <div>
            <h1 className={`font-bold ${data.fontSize === 'small' ? 'text-xl' : data.fontSize === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
              {data.businessName || 'Your Business'}
            </h1>
            {data.tagline && (
              <p className={`opacity-90 mt-2 ${data.fontSize === 'small' ? 'text-sm' : ''}`}>
                {data.tagline}
              </p>
            )}
          </div>

          {data.showPhone && data.contactPhone && (
            <div className="flex items-center justify-center gap-2 text-sm opacity-90">
              <Phone className="w-4 h-4" />
              {data.contactPhone}
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Services</h2>
        <div className="space-y-3">
          {data.services.filter(s => s.name).map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium">{service.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button 
                size="sm"
                style={{ backgroundColor: data.primaryColor }}
                className="text-white"
              >
                Book
              </Button>
            </div>
          ))}
        </div>

        {/* Business Hours */}
        {openBusinessHours.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Business Hours
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {openBusinessHours.map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              👀 Live Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                data-testid="button-preview-desktop"
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                data-testid="button-preview-mobile"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BookingPagePreview />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!demoCreated ? (
            <>
              {/* Save Demo */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Save Demo</h4>
                  <p className="text-sm text-muted-foreground">
                    Save your demo for 7 days. Share the preview link with others.
                  </p>
                </div>
                <Button
                  onClick={onSaveDemo}
                  disabled={isSaving || !data.businessName}
                  data-testid="button-save-demo"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Demo'}
                </Button>
              </div>

              {/* Create Account */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center gap-2">
                    Create Account & Save
                    <Badge variant="secondary">Recommended</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sign up and convert your demo into a real booking page.
                  </p>
                </div>
                <Button
                  onClick={onCreateAccount}
                  disabled={isConverting || !data.businessName}
                  data-testid="button-create-account"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isConverting ? 'Converting...' : 'Create Account'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Demo Created Success */}
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  ✅ Demo Created Successfully!
                </div>
                <p className="text-sm text-green-700">
                  Your demo booking page has been saved. You can share it with others to get feedback.
                </p>
              </div>

              {/* Convert to Real Page */}
              {user ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                  <div className="space-y-1">
                    <h4 className="font-medium">Convert to Real Page</h4>
                    <p className="text-sm text-muted-foreground">
                      Turn your demo into a live booking page that accepts real appointments.
                    </p>
                  </div>
                  <Button
                    onClick={onCreateAccount}
                    disabled={isConverting}
                    data-testid="button-convert-demo"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {isConverting ? 'Converting...' : 'Convert Now'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="space-y-1">
                    <h4 className="font-medium">Sign Up to Convert</h4>
                    <p className="text-sm text-muted-foreground">
                      Create an account to turn your demo into a real booking page.
                    </p>
                  </div>
                  <Button
                    onClick={onCreateAccount}
                    disabled={isConverting}
                    data-testid="button-signup-convert"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isConverting ? 'Redirecting...' : 'Sign Up'}
                  </Button>
                </div>
              )}
            </>
          )}

          <Separator />

          {/* Summary */}
          <div className="text-sm text-muted-foreground space-y-2">
            <h5 className="font-medium text-foreground">Demo Summary:</h5>
            <ul className="space-y-1 ml-4">
              <li>• Business: {data.businessName || 'Not set'}</li>
              <li>• Theme: {data.theme}</li>
              <li>• Services: {data.services.filter(s => s.name).length}</li>
              <li>• Logo: {data.logoBase64 ? 'Uploaded' : 'None'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}