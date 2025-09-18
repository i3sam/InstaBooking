import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { CalendarDays, PieChart, FileText, CalendarCheck, BarChart3, Settings, Crown, User } from 'lucide-react';
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
    <div className="w-64 glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-r border-white/20 h-screen flex flex-col shadow-2xl animate-slide-in-left">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 glass-prism rounded-xl flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/30">
            <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">BookingGen</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="px-4 py-6 space-y-2 flex-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">Dashboard</p>
          <button
            onClick={() => onSectionChange('overview')}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
              activeSection === 'overview'
                ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md'
            }`}
            data-testid="nav-overview"
          >
            <PieChart className="h-5 w-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </button>
        </div>
        
        <div className="space-y-1">
          {navigation.slice(1, 3).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
        
        <div className="pt-6 border-t border-white/10 mt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">Settings</p>
          {navigation.slice(3).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Enhanced Upgrade Card at Bottom */}
      {profile && profile.membershipStatus !== 'pro' && (
        <div className="p-4 mt-auto">
          <div className="relative glass-prism-card backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-white/20 rounded-2xl p-5 overflow-hidden shadow-2xl animate-float">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 blur-xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Upgrade</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Upgrade to Pro to access all features
              </p>
              <Button 
                className="w-full glass-prism-button text-white shadow-lg text-xs h-9 font-semibold" 
                data-testid="button-upgrade"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                Upgrade
              </Button>
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
