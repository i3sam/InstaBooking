import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import BusinessInfoStep from './steps/BusinessInfoStep';
import AppearanceStep from './steps/AppearanceStep';
import ServicesStep from './steps/ServicesStep';
import PreviewStep from './steps/PreviewStep';

const DEMO_STORAGE_KEY = 'bookinggen_demo_v1';

interface DemoWizardProps {
  open: boolean;
  onClose: () => void;
}

interface DemoData {
  // Step 1: Business Info
  businessName: string;
  tagline: string;
  contactPhone: string;
  logoBase64: string;
  businessType: string;
  
  // Step 2: Appearance
  theme: string;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  showLogo: boolean;
  showPhone: boolean;
  
  // Step 3: Services & Availability
  services: Array<{
    name: string;
    duration: number;
    price: number;
  }>;
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

const initialDemoData: DemoData = {
  businessName: '',
  tagline: '',
  contactPhone: '',
  logoBase64: '',
  businessType: 'salon',
  theme: 'Ocean Blue',
  primaryColor: '#2563eb',
  fontSize: 'medium',
  showLogo: true,
  showPhone: true,
  services: [{ name: '', duration: 60, price: 0 }],
  businessHours: {
    monday: '9:00-17:00',
    tuesday: '9:00-17:00',
    wednesday: '9:00-17:00',
    thursday: '9:00-17:00',
    friday: '9:00-17:00',
    saturday: 'Closed',
    sunday: 'Closed'
  }
};

const steps = [
  { id: 1, title: 'Business Info', description: 'Tell us about your business' },
  { id: 2, title: 'Appearance', description: 'Customize your look' },
  { id: 3, title: 'Services & Hours', description: 'Add your services' },
  { id: 4, title: 'Preview', description: 'See your booking page' }
];

export default function DemoWizard({ open, onClose }: DemoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [demoData, setDemoData] = useState<DemoData>(initialDemoData);
  const [demoId, setDemoId] = useState<string | null>(null);
  const [convertToken, setConvertToken] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load demo data from localStorage on mount
  useEffect(() => {
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setDemoData({ ...initialDemoData, ...parsed.demoData });
        setCurrentStep(parsed.currentStep || 1);
        setDemoId(parsed.demoId || null);
        setConvertToken(parsed.convertToken || null);
      } catch (error) {
        console.error('Failed to load demo data:', error);
      }
    }
  }, []);

  // Save demo data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
      demoData,
      currentStep,
      demoId,
      convertToken
    }));
  }, [demoData, currentStep, demoId, convertToken]);

  const createDemoMutation = useMutation({
    mutationFn: async (params: { data: DemoData; createDemoUser?: boolean; email?: string; fullName?: string }) => {
      const response = await apiRequest('POST', '/api/demo', params);
      return response.json();
    },
    onSuccess: (response: any) => {
      setDemoId(response.id);
      setConvertToken(response.convertToken);
      
      // If demo user was created, we need to update local state/auth
      if (response.demoUser) {
        if (response.demoUser.magicLink) {
          toast({
            title: 'Demo Account Created!',
            description: 'Your demo booking page has been saved! Redirecting you to your dashboard...'
          });
          // Auto-redirect to magic link after a short delay
          setTimeout(() => {
            window.location.href = response.demoUser.magicLink;
          }, 2000);
        } else {
          toast({
            title: 'Demo Account Created!',
            description: 'Your demo booking page has been saved! Please check your email for login instructions to access your dashboard.'
          });
        }
        // Demo user is created in Supabase and can log in normally
      } else {
        toast({
          title: 'Demo Created',
          description: 'Your demo booking page has been created!'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create demo. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const convertDemoMutation = useMutation({
    mutationFn: async () => {
      if (!demoId || !convertToken) throw new Error('No demo to convert');
      const response = await apiRequest('POST', '/api/demo/convert', { demoId, convertToken });
      return response.json();
    },
    onSuccess: (response: any) => {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      toast({
        title: 'Success!',
        description: `Your booking page has been created! Slug: ${response.slug}`
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert demo. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const updateDemoData = (updates: Partial<DemoData>) => {
    setDemoData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDemo = (userInfo?: { email: string; fullName?: string }) => {
    console.log('handleSaveDemo called with userInfo:', userInfo);
    try {
      if (userInfo) {
        // Save demo with demo user account
        console.log('Saving demo with user account');
        createDemoMutation.mutate({
          data: demoData,
          createDemoUser: true,
          email: userInfo.email,
          fullName: userInfo.fullName
        });
      } else {
        // Save demo without user account (anonymous)
        console.log('Saving demo anonymously');
        createDemoMutation.mutate({ data: demoData });
      }
    } catch (error) {
      console.error('Error in handleSaveDemo:', error);
    }
  };

  const handleCreateAccount = () => {
    console.log('Create Account clicked. User:', user);
    try {
      if (user) {
        // User is logged in, convert directly
        console.log('User is logged in, converting demo directly');
        convertDemoMutation.mutate();
      } else {
        // Redirect to signup
        console.log('User not logged in, redirecting to signup');
        localStorage.setItem('redirect_after_signup', 'convert_demo');
        window.location.href = '/signup';
      }
    } catch (error) {
      console.error('Error in handleCreateAccount:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep data={demoData} updateData={updateDemoData} />;
      case 2:
        return <AppearanceStep data={demoData} updateData={updateDemoData} />;
      case 3:
        return <ServicesStep data={demoData} updateData={updateDemoData} />;
      case 4:
        return (
          <PreviewStep 
            data={demoData} 
            onSaveDemo={handleSaveDemo}
            onCreateAccount={handleCreateAccount}
            onRestart={() => {
              // Reset demo data and go to step 1
              setDemoData(initialDemoData);
              setCurrentStep(1);
              setDemoId(null);
              setConvertToken(null);
              localStorage.removeItem(DEMO_STORAGE_KEY);
            }}
            isSaving={createDemoMutation.isPending}
            isConverting={convertDemoMutation.isPending}
            demoCreated={!!demoId}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col" data-testid="dialog-demo-wizard">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-demo-wizard-title">Test before you Launch</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <Progress value={progress} className="w-full" data-testid="progress-wizard" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`text-center ${currentStep === step.id ? 'text-foreground font-medium' : ''}`}
                >
                  <div className="text-xs">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-1">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < steps.length && (
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              data-testid="button-prev-step"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground" data-testid="text-step-counter">
              Step {currentStep} of {steps.length}
            </span>
            
            <Button onClick={nextStep} data-testid="button-next-step">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}