import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import UpgradeModal from '@/components/modals/upgrade-modal';

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
  
  // Step 1: Additional Business Info
  walkInsAccepted: string;
  parking: string;
  amenities: string;
  spokenLanguages: string;
  kidFriendly: string;
  appointmentCancellationPolicy: string;
  
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
  walkInsAccepted: 'accepted',
  parking: '',
  amenities: '',
  spokenLanguages: 'English',
  kidFriendly: 'yes',
  appointmentCancellationPolicy: '',
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
      
      // For the new flow: always redirect to signup regardless of demo type
      toast({
        title: 'Demo Created!',
        description: 'Your demo booking page has been created! Please sign up to access it in your dashboard.'
      });
      
      // Store demo info for post-signup redirect
      localStorage.setItem('pending_demo_info', JSON.stringify({
        demoId: response.id,
        convertToken: response.convertToken,
        demoUser: response.demoUser || null
      }));
      
      // Redirect to signup after short delay
      setTimeout(() => {
        window.location.href = '/signup?redirect_from=demo';
      }, 1500);
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
      // Check if this is an upgrade required error (403)
      const isUpgradeError = error.message && (
        error.message.startsWith('403:') || 
        error.message.includes('Upgrade Required') || 
        error.message.includes('You need a Pro subscription')
      );
      
      if (isUpgradeError) {
        // Show upgrade modal instead of ugly error toast
        setShowUpgradeModal(true);
      } else {
        // Show regular error toast for other errors
        toast({
          title: 'Error',
          description: error.message || 'Failed to convert demo. Please try again.',
          variant: 'destructive'
        });
      }
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
    console.log('🔥 CREATE ACCOUNT BUTTON CLICKED! User:', user);
    console.log('🔥 Demo data:', demoData);
    try {
      if (user) {
        // User is logged in, convert directly
        console.log('✅ User is logged in, converting demo directly');
        convertDemoMutation.mutate();
      } else {
        // For new flow: save demo first, then redirect to signup
        console.log('✅ User not logged in, saving demo and redirecting to signup');
        // Save the demo anonymously first, then redirect to signup
        createDemoMutation.mutate({ data: demoData });
      }
    } catch (error) {
      console.error('❌ Error in handleCreateAccount:', error);
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
            onCreateAccount={handleCreateAccount}
            onRestart={() => {
              // Reset demo data and go to step 1
              setDemoData(initialDemoData);
              setCurrentStep(1);
              setDemoId(null);
              setConvertToken(null);
              localStorage.removeItem(DEMO_STORAGE_KEY);
            }}
            isConverting={convertDemoMutation.isPending}
            isSaving={createDemoMutation.isPending}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col glass-prism-card border-none shadow-2xl animate-scale-in" data-testid="dialog-demo-wizard">
          {/* Glass Prism Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 glass-prism rounded-full opacity-20 animate-float bg-overlay"></div>
            <div className="absolute top-32 right-20 w-64 h-64 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute bottom-20 left-1/3 w-32 h-32 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '3s'}}></div>
          </div>
          
          <DialogHeader className="flex-shrink-0 relative z-10 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-blue-gradient flex items-center gap-3" data-testid="text-demo-wizard-title">
                <div className="w-10 h-10 rounded-xl glass-prism flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" opacity="0.3"/>
                    <path d="M21 16L12 21L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12L12 17L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Test before you Launch
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="glass-effect hover-lift rounded-xl" data-testid="button-close">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogDescription className="sr-only">
              Create and customize your booking page through our step-by-step wizard. Preview your page before making it live.
            </DialogDescription>
            
            {/* Progress Bar */}
            <div className="space-y-2 mt-6">
              <Progress value={progress} className="w-full h-2 glass-effect" data-testid="progress-wizard" />
              <div className="flex justify-between text-sm text-muted-foreground">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`text-center transition-all duration-300 animate-slide-in-left ${
                      currentStep === step.id ? 'text-foreground font-semibold scale-105' : ''
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-xs">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </DialogHeader>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-1 relative z-10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {renderStep()}
          </div>

          {/* Navigation */}
          {currentStep < steps.length && (
            <div className="flex-shrink-0 flex justify-between items-center pt-6 border-t border-border/20 relative z-10 animate-slide-in-right" style={{animationDelay: '0.3s'}}>
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="glass-effect hover-lift"
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground font-medium" data-testid="text-step-counter">
                Step {currentStep} of {steps.length}
              </span>
              
              <Button onClick={nextStep} className="glass-prism-button" data-testid="button-next-step">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
}