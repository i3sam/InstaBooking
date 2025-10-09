import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { CalendarDays, PieChart, FileText, CalendarCheck, BarChart3, Settings, Crown, User, ChevronUp, LogOut, Sparkles, Calendar, StickyNote, HelpCircle } from 'lucide-react';
import { SiGooglecalendar } from 'react-icons/si';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UpgradeModal from '@/components/modals/upgrade-modal';
import TrialActivationModal from '@/components/modals/trial-activation-modal';
import { useLocation } from 'wouter';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, profile, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const isTrialAvailable = profile && (profile as any).trialStatus === 'available' && profile.membershipStatus !== 'pro';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigation = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'pages', label: 'Booking Pages', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck, badge: 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const toolsNav = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'google-calendar', label: 'Google Calendar', icon: SiGooglecalendar },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'help-center', label: 'Help Center', icon: HelpCircle },
  ];

  const settingsNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-r border-white/20 h-screen flex flex-col shadow-2xl animate-slide-in-left fixed left-0 top-0 z-40 overflow-y-auto overscroll-contain mobile-no-blur">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 glass-prism rounded-xl flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/30 mobile-no-blur">
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
                ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg mobile-no-blur'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md mobile-no-blur'
            }`}
            data-testid="nav-overview"
          >
            <PieChart className="h-5 w-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </button>
        </div>
        
        <div className="space-y-1">
          {navigation.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg mobile-no-blur'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md mobile-no-blur'
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
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">Tools</p>
          <div className="space-y-1">
            {toolsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                  activeSection === item.id
                    ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg mobile-no-blur'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md mobile-no-blur'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-white/10 mt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">Settings</p>
          {settingsNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg mobile-no-blur'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md mobile-no-blur'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Enhanced Upgrade/Trial Card at Bottom */}
      {profile && profile.membershipStatus !== 'pro' && (
        <div className="p-4">
          <div className={`relative glass-prism-card backdrop-blur-xl ${isTrialAvailable ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-500/10' : 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10'} border border-white/20 rounded-2xl p-5 overflow-hidden shadow-2xl animate-float sm:animate-float mobile-no-blur`}>
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${isTrialAvailable ? 'bg-gradient-to-br from-purple-400/20 to-pink-400/20' : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'} rounded-full -translate-y-10 translate-x-10 blur-xl mobile-hide`}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 blur-xl mobile-hide"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                {isTrialAvailable ? (
                  <>
                    <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Free Trial</h4>
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Upgrade</h4>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {isTrialAvailable ? '7 days free - No card required' : 'Upgrade to Pro to access all features'}
              </p>
              <Button 
                className={`w-full ${isTrialAvailable ? 'glass-prism-button backdrop-blur-lg bg-gradient-to-r from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 hover:from-purple-200 hover:via-purple-300 hover:to-purple-400 dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-500 text-purple-800 dark:text-purple-100 border border-purple-300/50 dark:border-purple-600/50' : 'glass-prism-button text-white'} shadow-lg text-xs h-9 font-semibold`}
                data-testid={isTrialAvailable ? "button-trial-sidebar" : "button-upgrade"}
                onClick={() => isTrialAvailable ? setIsTrialModalOpen(true) : setIsUpgradeModalOpen(true)}
              >
                {isTrialAvailable ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Start Free Trial
                  </>
                ) : 'Upgrade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <TrialActivationModal 
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />

      {/* Account Switcher */}
      <div className="p-4 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="w-full glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 shadow-lg hover:shadow-xl group mobile-no-blur"
              data-testid="button-account-switcher"
            >
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 glass-prism border-2 border-white/30 flex-shrink-0">
                    <AvatarFallback className="glass-prism-button text-white text-sm font-semibold">
                      {profile?.fullName ? getInitials(profile.fullName) : getInitials(user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-full" title={profile?.fullName || 'User'}>
                      {profile?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>
                <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors flex-shrink-0" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="w-64 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl mobile-no-blur"
          >
            <div className="p-3">
              <div className="flex items-center space-x-3 mb-3 min-w-0">
                <Avatar className="h-12 w-12 glass-prism border-2 border-white/30 flex-shrink-0">
                  <AvatarFallback className="glass-prism-button text-white font-semibold">
                    {profile?.fullName ? getInitials(profile.fullName) : getInitials(user?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={profile?.fullName || 'User'}>
                    {profile?.fullName || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={user?.email}>
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${profile?.membershipStatus === 'pro' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {profile?.membershipStatus === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem 
              onClick={() => onSectionChange('settings')}
              className="cursor-pointer hover:bg-white/10 dark:hover:bg-black/10 focus:bg-white/10 dark:focus:bg-black/10"
              data-testid="menu-account-settings"
            >
              <User className="h-4 w-4 mr-3" />
              Account Settings
            </DropdownMenuItem>
            {profile?.membershipStatus !== 'pro' && (
              <DropdownMenuItem 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="cursor-pointer hover:bg-white/10 dark:hover:bg-black/10 focus:bg-white/10 dark:focus:bg-black/10"
                data-testid="menu-upgrade"
              >
                <Crown className="h-4 w-4 mr-3 text-yellow-500" />
                Upgrade to Pro
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem 
              onClick={() => {
                logout();
                setLocation('/');
              }}
              className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-600 dark:text-red-400"
              data-testid="menu-logout"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
}
