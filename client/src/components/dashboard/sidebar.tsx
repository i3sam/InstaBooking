import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { CalendarDays, PieChart, FileText, CalendarCheck, BarChart3, Settings, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UpgradeModal from '@/components/modals/upgrade-modal';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { profile } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const navigation = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'pages', label: 'Booking Pages', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck, badge: 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">BookingGen</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="px-6 space-y-2 flex-1">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${
              activeSection === item.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            data-testid={`nav-${item.id}`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>
      
      {/* Enhanced Upgrade Card at Bottom */}
      {profile && profile.membershipStatus !== 'pro' && (
        <div className="p-6 mt-auto">
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-xl p-5 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <Crown className="h-6 w-6 text-primary mr-2" />
                <h4 className="font-bold text-foreground">Upgrade to Pro</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Unlock unlimited booking pages, advanced analytics, and premium features
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                  Unlimited booking pages
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                  Payment processing
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                  Advanced analytics
                </div>
              </div>
              <Button 
                variant="default"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-sm h-10 font-semibold shake-animation pulse-glow-animation" 
                data-testid="button-upgrade"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                $10/month • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      )}
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
}
