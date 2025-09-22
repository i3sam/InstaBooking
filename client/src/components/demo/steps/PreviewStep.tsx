import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Monitor, Smartphone, Save, UserPlus, Rocket, Clock, DollarSign, Phone, Calendar, Scissors, Coffee, Heart, User, Camera, Palette, Zap, Target, Shield, Briefcase, Wrench, Headphones, Music, BookOpen, Leaf, Award, ArrowLeft } from 'lucide-react';
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
  onSaveDemo: (userInfo?: { email: string; fullName?: string }) => void;
  onCreateAccount: () => void;
  onRestart?: () => void;
  isSaving: boolean;
  isConverting: boolean;
  demoCreated: boolean;
  user: any;
}

export default function PreviewStep({
  data,
  onSaveDemo,
  onCreateAccount,
  onRestart,
  isSaving,
  isConverting,
  demoCreated,
  user
}: PreviewStepProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showSaveDemoDialog, setShowSaveDemoDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSaveDemoClick = () => {
    setShowSaveDemoDialog(true);
  };

  const handleSaveDemoConfirm = () => {
    console.log('Save Demo clicked with email:', email);
    if (email.trim()) {
      try {
        onSaveDemo({ email: email.trim(), fullName: fullName.trim() || undefined });
        setShowSaveDemoDialog(false);
        setEmail('');
        setFullName('');
      } catch (error) {
        console.error('Error saving demo:', error);
      }
    }
  };

  const openBusinessHours = Object.entries(data.businessHours)
    .filter(([, hours]) => hours !== 'Closed')
    .slice(0, 3);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '37, 99, 235'; // fallback to blue
  };

  // Create dynamic styles based on theme data (matching real booking page)
  const getThemeStyles = () => {
    const primaryColor = data.primaryColor || '#2563eb';
    const backgroundType = 'gradient'; // Demo always uses gradient
    const backgroundValue = data.theme || 'blue';
    const fontFamily = 'inter'; // Demo always uses inter
    
    // Background style mapping (from real booking page)
    const backgroundClasses = {
      'blue': backgroundType === 'gradient' ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-blue-50',
      'green': backgroundType === 'gradient' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-emerald-50',
      'purple': backgroundType === 'gradient' ? 'bg-gradient-to-br from-violet-50 to-violet-100' : 'bg-violet-50',
      'rose': backgroundType === 'gradient' ? 'bg-gradient-to-br from-rose-50 to-rose-100' : 'bg-rose-50',
      'white': 'bg-white',
      'gray': 'bg-gray-50',
      'teal': backgroundType === 'gradient' ? 'bg-gradient-to-br from-teal-50 to-teal-100' : 'bg-teal-50',
      'orange': backgroundType === 'gradient' ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-orange-50',
      'indigo': backgroundType === 'gradient' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' : 'bg-indigo-50',
      'amber': backgroundType === 'gradient' ? 'bg-gradient-to-br from-amber-50 to-amber-100' : 'bg-amber-50',
      'ocean': 'bg-gradient-to-r from-cyan-50 to-blue-100',
      'sunset': 'bg-gradient-to-r from-orange-50 to-pink-100',
      'forest': 'bg-gradient-to-r from-green-50 to-emerald-100',
      'lavender': 'bg-gradient-to-r from-purple-50 to-pink-100',
      'rainbow': 'bg-gradient-to-r from-red-50 via-yellow-50 to-green-50',
      'tropical': 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50',
      'warm-sunset': 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
      'cool-mint': 'bg-gradient-to-br from-green-50 via-teal-50 to-blue-50',
      'cream': 'bg-amber-50',
      'ice': 'bg-blue-50',
      'soft-mint': 'bg-green-50',
      'light-lavender': 'bg-purple-50'
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

  // Smart icon assignment based on service name (matching real booking page with Lucide icons)
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

  const BookingPagePreview = () => {
    const themeStyles = getThemeStyles();
    
    return (
    <div 
      className={`min-h-screen ${themeStyles.backgroundColor} ${themeStyles.fontClass} overflow-hidden scroll-smooth ${
        viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
      }`}
      style={{
        ...themeStyles.cssVariables,
        fontSize: data.fontSize === 'small' ? '14px' : data.fontSize === 'medium' ? '16px' : '18px'
      }}
    >
      {/* Enhanced Header (matching real booking page) */}
      <header className="border-b border-border/10 bg-card/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.primaryColor}dd 100%)`
                }}
              >
                {data.showLogo && data.logoBase64 ? (
                  <img
                    src={data.logoBase64}
                    alt="Logo"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {data.businessName?.charAt(0) || 'B'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-bold text-foreground truncate block">{data.businessName || 'Your Business'}</span>
                {data.tagline && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{data.tagline}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section (matching real booking page) */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center px-4">
        {/* Dynamic layered background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb(data.primaryColor)}, 0.15) 0%, rgba(${hexToRgb(data.primaryColor)}, 0.05) 25%, transparent 60%), linear-gradient(135deg, rgba(${hexToRgb(data.primaryColor)}, 0.08) 0%, rgba(${hexToRgb(data.primaryColor)}, 0.02) 50%, rgba(${hexToRgb(data.primaryColor)}, 0.08) 100%)`
            }}
          ></div>
          
          {/* Animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-70 animate-pulse"
              style={{
                background: `radial-gradient(circle, rgba(${hexToRgb(data.primaryColor)}, 0.1) 0%, transparent 70%)`,
                animationDuration: '4s'
              }}
            ></div>
            <div 
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-60 animate-pulse"
              style={{
                background: `radial-gradient(circle, rgba(${hexToRgb(data.primaryColor)}, 0.08) 0%, transparent 70%)`,
                animationDuration: '6s',
                animationDelay: '1s'
              }}
            ></div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Professional badge */}
            <div className="mb-8">
              <div 
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-md shadow-xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, rgba(${hexToRgb(data.primaryColor)}, 0.15) 0%, rgba(${hexToRgb(data.primaryColor)}, 0.08) 100%)`,
                  color: data.primaryColor
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-3 animate-pulse"
                  style={{ backgroundColor: data.primaryColor }}
                ></div>
                ✨ Premium Professional Services
              </div>
            </div>
            
            {/* Enhanced main heading */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight">
                <span className="block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {data.businessName || 'Your Business'}
                </span>
              </h1>
              
              {data.tagline && (
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed opacity-95">
                  {data.tagline}
                </p>
              )}
            </div>
            
            {/* Enhanced CTA section */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button 
                  className="px-8 py-4 rounded-xl text-lg h-auto font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Book Appointment
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="flex items-center justify-center p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/20">
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2 flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      <span className="text-white text-xs">⭐</span>
                    </div>
                    <span className="font-semibold text-foreground text-sm">Professional Service</span>
                  </div>
                </div>

                <div className="flex items-center justify-center p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/20">
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2 flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-semibold text-foreground text-sm">Easy Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section (matching real booking page) */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose from our range of professional services</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {data.services.filter(s => s.name).map((service, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-border/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${data.primaryColor}20 0%, ${data.primaryColor}10 100%)`
                        }}
                      >
                        <Calendar className="w-6 h-6" style={{ color: data.primaryColor }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                        <div className="flex items-center gap-6 text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Business Hours Section (matching real booking page) */}
      {openBusinessHours.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="border-0 shadow-lg bg-card/80 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${data.primaryColor}20 0%, ${data.primaryColor}10 100%)`
                    }}
                  >
                    <Clock className="h-5 w-5" style={{ color: data.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">When we're available to serve you</p>
                  </div>
                </div>
                <div className="grid gap-2 ml-12">
                  {openBusinessHours.map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 px-4 rounded-lg bg-background/50">
                      <span className="capitalize font-medium text-foreground">{day}</span>
                      <span className="text-muted-foreground">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Contact Section */}
      {data.showPhone && data.contactPhone && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20">
                <h3 className="text-xl font-bold text-foreground mb-4">Get in Touch</h3>
                <div className="flex items-center justify-center gap-2 text-lg">
                  <Phone className="w-5 h-5" style={{ color: data.primaryColor }} />
                  <a 
                    href={`tel:${data.contactPhone}`} 
                    className="font-semibold hover:underline"
                    style={{ color: data.primaryColor }}
                  >
                    {data.contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
  };

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
                  onClick={handleSaveDemoClick}
                  disabled={isSaving || !data.businessName?.trim()}
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
                  disabled={isConverting || !data.businessName?.trim()}
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

          {/* Restart Option */}
          {onRestart && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <h4 className="font-medium">Start Over</h4>
                <p className="text-sm text-muted-foreground">
                  Want to create a different booking page? Start the wizard from the beginning.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onRestart}
                data-testid="button-restart-wizard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
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

      {/* Save Demo Dialog */}
      <Dialog open={showSaveDemoDialog} onOpenChange={setShowSaveDemoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Demo</DialogTitle>
            <DialogDescription>
              Enter your email to create a demo account and save your booking page. You'll be able to access it from your dashboard and upgrade later to make it live.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email Address</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-demo-email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-name">Full Name (Optional)</Label>
              <Input
                id="demo-name"
                type="text"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                data-testid="input-demo-name"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSaveDemoDialog(false)}
                className="flex-1"
                data-testid="button-cancel-save-demo"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDemoConfirm}
                disabled={!email.trim() || isSaving}
                className="flex-1"
                data-testid="button-confirm-save-demo"
              >
                {isSaving ? 'Creating Account...' : 'Save Demo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}