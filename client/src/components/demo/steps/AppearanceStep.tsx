import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette } from 'lucide-react';

interface DemoData {
  theme: string;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  showLogo: boolean;
  showPhone: boolean;
}

interface AppearanceStepProps {
  data: DemoData;
  updateData: (updates: Partial<DemoData>) => void;
}

const colorThemes = [
  { name: 'Ocean Blue', primary: '#2563eb', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Forest Green', primary: '#059669', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Sunset Orange', primary: '#ea580c', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Royal Purple', primary: '#9333ea', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Cherry Red', primary: '#dc2626', gradient: 'from-red-500 to-red-600' },
  { name: 'Midnight Black', primary: '#1f2937', gradient: 'from-gray-800 to-gray-900' }
];

const fontSizes = [
  { value: 'small', label: 'Small', description: 'Compact and minimal' },
  { value: 'medium', label: 'Medium', description: 'Balanced and readable' },
  { value: 'large', label: 'Large', description: 'Bold and prominent' }
];

export default function AppearanceStep({ data, updateData }: AppearanceStepProps) {
  return (
    <div className="space-y-6">
      {/* Color Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 Color Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => updateData({ 
                  theme: theme.name, 
                  primaryColor: theme.primary 
                })}
                data-testid={`button-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`p-4 rounded-lg border-2 transition-all ${
                  data.theme === theme.name
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className={`w-full h-12 rounded-md bg-gradient-to-r ${theme.gradient} mb-2`}
                />
                <div className="text-sm font-medium text-center">
                  {theme.name}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Font Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateData({ fontSize: size.value as 'small' | 'medium' | 'large' })}
                data-testid={`button-font-size-${size.value}`}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  data.fontSize === size.value
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`font-medium mb-1 ${
                  size.value === 'small' ? 'text-sm' : 
                  size.value === 'medium' ? 'text-base' : 'text-lg'
                }`}>
                  {size.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {size.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👁️ Display Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show Logo */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-logo" data-testid="label-show-logo">
                Show Logo
              </Label>
              <p className="text-sm text-muted-foreground">
                Display your uploaded logo on the booking page
              </p>
            </div>
            <Switch
              id="show-logo"
              data-testid="switch-show-logo"
              checked={data.showLogo}
              onCheckedChange={(checked) => updateData({ showLogo: checked })}
            />
          </div>

          {/* Show Phone */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-phone" data-testid="label-show-phone">
                Show Phone Number
              </Label>
              <p className="text-sm text-muted-foreground">
                Display your phone number on the booking page
              </p>
            </div>
            <Switch
              id="show-phone"
              data-testid="switch-show-phone"
              checked={data.showPhone}
              onCheckedChange={(checked) => updateData({ showPhone: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👀 Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg border-2 border-dashed border-muted"
            style={{ 
              backgroundColor: `${data.primaryColor}10`,
              borderColor: `${data.primaryColor}40`
            }}
          >
            <div className="text-center space-y-4">
              <div 
                className={`font-bold ${
                  data.fontSize === 'small' ? 'text-lg' : 
                  data.fontSize === 'medium' ? 'text-xl' : 'text-2xl'
                }`}
                style={{ color: data.primaryColor }}
              >
                {data.theme} Theme Preview
              </div>
              <div className={`${
                data.fontSize === 'small' ? 'text-sm' : 
                data.fontSize === 'medium' ? 'text-base' : 'text-lg'
              }`}>
                Your booking page will use this color scheme and font size
              </div>
              <Button 
                style={{ backgroundColor: data.primaryColor }}
                className="text-white"
                data-testid="button-preview-cta"
              >
                Book Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}