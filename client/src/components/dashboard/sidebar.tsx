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
    <div className="w-64 bg-card border-r border-border h-screen">
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
      <nav className="px-6 space-y-2">
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
      
      {/* Upgrade Card */}
      {profile?.membershipStatus !== 'pro' && (
        <div className="p-6 mt-auto">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Crown className="h-5 w-5 text-primary mr-2" />
              <h4 className="font-semibold text-foreground">Upgrade to Pro</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Unlock unlimited pages and advanced features
            </p>
            <Button 
              variant="default"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md text-sm" 
              data-testid="button-upgrade"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              Upgrade Now
            </Button>
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
