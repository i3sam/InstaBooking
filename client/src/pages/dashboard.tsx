import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Overview from '@/components/dashboard/overview';
import PagesList from '@/components/dashboard/pages-list';
import AppointmentsList from '@/components/dashboard/appointments-list';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Crown, LogOut, Home, Menu, X, Bug, Lightbulb, User, Shield, CreditCard, AlertTriangle, Calendar, RefreshCw, CheckCircle, Zap, Smartphone, Palette, Database, Search, Mail, Globe, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import UpgradeModal from '@/components/modals/upgrade-modal';
import BillingModal from '@/components/modals/billing-modal';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'pages':
        return <PagesList />;
      case 'appointments':
        return <AppointmentsList />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <Overview onSectionChange={setActiveSection} />;
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when section changes
  };

  return (
    <div className="min-h-screen page-gradient animate-fade-in relative overflow-hidden">
      {/* Glass prism background effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden mobile-hide">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-green-400/10 via-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>
      
      <div className="flex relative z-10">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm mobile-no-blur" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="relative w-64 h-full animate-slide-in-left">
              <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
            </div>
          </div>
        )}
        
        <div className="flex-1 w-full lg:w-auto lg:ml-64">
          {/* Header */}
          <header className="glass-prism-card mx-3 lg:mx-8 my-4 lg:my-6 px-4 lg:px-6 py-3 lg:py-4 backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl shadow-2xl mobile-no-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl glass-prism backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 min-touch-target"
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                  )}
                </button>
                
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base break-words">Manage your booking pages and appointments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full glass-prism flex items-center justify-center backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30">
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200">
                      {(user?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words" data-testid="text-username">
                      {profile?.fullName || user?.email}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="text-membership-status">
                      {profile?.membershipStatus === 'pro' ? 'Pro Plan' : 'Starter Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-3 lg:p-8">
            <div className="animate-slide-up">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardStats {
  pagesCount: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  conversionRate: number;
  avgBookingValue: number;
}

function AnalyticsSection() {
  const { formatPrice } = useCurrency();

  // Fetch dashboard statistics for analytics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true
  });

  // Check for errors first
  if (!statsLoading && dashboardStats === undefined) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
          <p className="text-muted-foreground">Track your booking performance and revenue</p>
        </div>
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-red-300/20 shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-4xl text-red-500 mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">Track your booking performance and revenue</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 lg:gap-6 mb-8">
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift mobile-no-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</h3>
              <div className="w-8 h-8 rounded-lg glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">📊</span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {statsLoading ? "..." : `${dashboardStats?.conversionRate || 0}%`}
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {statsLoading 
                ? "Loading..." 
                : (dashboardStats?.totalAppointments || 0) === 0 
                  ? "Create pages to track conversions" 
                  : `From ${dashboardStats?.totalAppointments || 0} total bookings`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift mobile-no-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Booking Value</h3>
              <div className="w-8 h-8 rounded-lg glass-prism backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400">📈</span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {statsLoading ? "..." : formatPrice(dashboardStats?.avgBookingValue || 0)}
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {statsLoading 
                ? "Loading..." 
                : (dashboardStats?.totalAppointments || 0) === 0 
                  ? "No bookings yet" 
                  : `Total revenue: ${formatPrice(dashboardStats?.totalRevenue || 0)}`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl mobile-no-blur">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Key Metrics</h3>
          {statsLoading ? (
            <div className="h-64 glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
              </div>
            </div>
          ) : dashboardStats?.totalAppointments === 0 ? (
            <div className="h-64 glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-4">📊</div>
                <p className="text-gray-600 dark:text-gray-400">Analytics will appear here once you have booking data</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <div className="text-center p-3 lg:p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl mobile-no-blur">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{dashboardStats?.pagesCount || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Pages</p>
              </div>
              <div className="text-center p-3 lg:p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-white/20 rounded-xl mobile-no-blur">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{dashboardStats?.totalAppointments || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              </div>
              <div className="text-center p-3 lg:p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-white/20 rounded-xl mobile-no-blur">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">{dashboardStats?.pendingAppointments || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
              </div>
              <div className="text-center p-3 lg:p-4 glass-prism backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/20 rounded-xl mobile-no-blur">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">{formatPrice(dashboardStats?.totalRevenue || 0)}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface BugFixesChangelogSectionProps {
  onReportBug: () => void;
}

function BugFixesChangelogSection({ onReportBug }: BugFixesChangelogSectionProps) {
  const changelogData = [
    {
      version: "2.1.0",
      date: "September 2025",
      type: "feature",
      title: "Enhanced Glass Prism UI Design",
      description: "Redesigned the entire interface with our beautiful glass prism effect, featuring improved transparency, blur effects, and white/blue gradients throughout the app.",
      icon: Palette,
      items: [
        "Updated all components with glass prism styling",
        "Improved responsive design for mobile devices",
        "Added subtle animations and hover effects",
        "Enhanced color consistency across the platform"
      ]
    },
    {
      version: "2.0.5",
      date: "September 2025",
      type: "fix",
      title: "Payment Processing Improvements",
      description: "Fixed critical issues with Razorpay integration and improved payment success rates.",
      icon: CreditCard,
      items: [
        "Fixed upgrade modal payment flow",
        "Improved error handling for failed payments",
        "Added better loading states during payment processing",
        "Enhanced subscription management features"
      ]
    },
    {
      version: "2.0.4",
      date: "September 2025", 
      type: "feature",
      title: "Advanced Booking Page Customization",
      description: "Added powerful customization options for booking pages with new themes and layout options.",
      icon: Smartphone,
      items: [
        "New booking page themes and color schemes",
        "Custom logo upload functionality",
        "Advanced typography options",
        "Mobile-optimized booking forms",
        "Real-time preview while editing"
      ]
    },
    {
      version: "2.0.3",
      date: "August 2025",
      type: "fix",
      title: "Database Performance Optimization",
      description: "Significantly improved app performance through database optimizations and caching.",
      icon: Database,
      items: [
        "Optimized database queries for faster loading",
        "Implemented intelligent caching system",
        "Fixed memory leaks in data fetching",
        "Improved connection pooling for better stability"
      ]
    },
    {
      version: "2.0.2",
      date: "August 2025",
      type: "feature",
      title: "Smart Analytics Dashboard",
      description: "Introduced comprehensive analytics with conversion tracking and revenue insights.",
      icon: Search,
      items: [
        "Real-time booking conversion analytics",
        "Revenue tracking and forecasting",
        "Customer behavior insights",
        "Exportable reports and data",
        "Custom date range filtering"
      ]
    },
    {
      version: "2.0.1",
      date: "August 2025",
      type: "fix",
      title: "Authentication & Security Enhancements", 
      description: "Strengthened security measures and improved user authentication experience.",
      icon: Shield,
      items: [
        "Enhanced JWT token security",
        "Improved password reset flow",
        "Added two-factor authentication support",
        "Fixed session timeout issues",
        "Strengthened API endpoint security"
      ]
    },
    {
      version: "2.0.0",
      date: "July 2025",
      type: "feature",
      title: "Multi-Currency Support & Internationalization",
      description: "Added support for multiple currencies and international payment methods.",
      icon: Globe,
      items: [
        "Support for 50+ currencies worldwide",
        "Automatic currency conversion",
        "Region-specific payment methods",
        "Localized date and time formatting",
        "International tax calculation support"
      ]
    },
    {
      version: "1.9.8",
      date: "July 2025",
      type: "feature",
      title: "Email Automation & Notifications",
      description: "Powerful email automation system for booking confirmations and reminders.",
      icon: Mail,
      items: [
        "Automated booking confirmation emails",
        "Customizable email templates",
        "Smart reminder scheduling",
        "Email deliverability improvements",
        "Customer communication tracking"
      ]
    },
    {
      version: "1.9.7",
      date: "June 2025",
      type: "fix",
      title: "Mobile Responsiveness Fixes",
      description: "Fixed various mobile responsiveness issues and improved touch interactions.",
      icon: Smartphone,
      items: [
        "Fixed mobile navigation menu issues",
        "Improved touch target sizes",
        "Fixed form input focus on mobile devices",
        "Enhanced mobile booking flow",
        "Optimized loading speeds on slower connections"
      ]
    },
    {
      version: "1.9.6",
      date: "June 2025",
      type: "feature",
      title: "Advanced Calendar Integration",
      description: "Seamless integration with popular calendar applications and scheduling tools.",
      icon: Calendar,
      items: [
        "Google Calendar synchronization",
        "Outlook calendar integration",
        "iCal export functionality",
        "Automatic timezone detection",
        "Conflict detection and prevention",
        "Bulk calendar operations"
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent mb-2">
              Bug Fixes & Changelogs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with the latest features, improvements, and bug fixes
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onReportBug}
              className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30"
              data-testid="button-report-bug-header"
            >
              <Bug className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 shadow-xl hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              {changelogData.filter(item => item.type === 'feature').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">New Features</p>
          </CardContent>
        </Card>
        
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 shadow-xl hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              {changelogData.filter(item => item.type === 'fix').length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bug Fixes</p>
          </CardContent>
        </Card>
        
        <Card className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 shadow-xl hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 glass-prism rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              {changelogData.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Changelog Items */}
      <div className="space-y-6">
        {changelogData.map((item, index) => (
          <Card key={index} className="glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 shadow-xl hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 glass-prism rounded-xl flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30 flex-shrink-0`}>
                  <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">
                        {item.title}
                      </h4>
                      <div className={`glass-prism backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/30 ${
                        item.type === 'feature' 
                          ? 'bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 text-blue-800 dark:text-blue-100'
                          : 'bg-gradient-to-r from-white/60 via-blue-50/40 to-white/50 text-blue-800 dark:text-blue-100'
                      }`}>
                        {item.type === 'feature' ? 'New Feature' : 'Bug Fix'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      v{item.version} • {item.date}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {item.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.items.map((subItem, subIndex) => (
                      <div key={subIndex} className="flex items-center space-x-2">
                        <div className="w-4 h-4 glass-prism rounded-full flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/50 to-white/40 border border-white/30 flex-shrink-0">
                          <CheckCircle className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-gradient-to-br from-white/90 via-blue-50/70 to-white/80 dark:from-gray-900/90 dark:via-blue-950/70 dark:to-gray-900/80 border border-white/30 dark:border-white/20 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-gradient-to-br from-white/60 via-blue-50/40 to-white/50 border border-white/30">
            <Bug className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent mb-2">
            Found a Bug or Have Feedback?
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Help us improve BookingGen by reporting bugs or suggesting new features. Your feedback is valuable to us!
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onReportBug}
              className="glass-prism-button backdrop-blur-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-blue-800 dark:text-blue-100 shadow-lg hover:scale-105 transition-all duration-300 border border-white/30"
              data-testid="button-report-bug-footer"
            >
              <Bug className="h-4 w-4 mr-2" />
              Report a Bug
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('mailto:team@bookinggen.xyz?subject=Feature Request', '_blank')}
              className="glass-prism backdrop-blur-md bg-gradient-to-r from-white/40 via-blue-50/30 to-white/30 dark:from-gray-800/40 dark:via-blue-950/30 dark:to-gray-800/30 border border-white/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 text-blue-700 dark:text-blue-300"
              data-testid="button-request-feature-footer"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Request Feature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSection() {
  const { user, profile, logout, resetPassword } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [cancelSubscriptionLoading, setCancelSubscriptionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: user?.email || '',
    timezone: 'pacific'
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string; timezone: string }) => {
      const response = await apiRequest('PATCH', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated!",
        description: "Your profile changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setResetPasswordLoading(true);
    try {
      await resetPassword(user.email);
      toast({
        title: "Password reset email sent!",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelSubscriptionLoading(true);
    try {
      const response = await apiRequest('POST', '/api/razorpay/cancel-subscription', {});
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
        toast({
          title: "Subscription cancelled",
          description: "Your subscription will remain active until the end of your billing period.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelSubscriptionLoading(false);
    }
  };

  const handleManageBilling = () => {
    setShowBillingModal(true);
  };
  
  const settingsTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'changelog', label: 'Bug Fixes & Changelogs', icon: Bug },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="mb-8">
        <div className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl p-2 shadow-xl">
          <div className="flex space-x-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'glass-prism-button text-white shadow-lg backdrop-blur-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:backdrop-blur-md'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'account' ? (
        <div className="max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Profile Information</h3>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                updateProfileMutation.mutate({
                  fullName: formData.fullName,
                  timezone: formData.timezone
                });
              }}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="h-12"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    value={formData.email}
                    disabled
                    className="h-12 bg-muted/50"
                    data-testid="input-email"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pacific">UTC-08:00 (Pacific Time)</SelectItem>
                      <SelectItem value="eastern">UTC-05:00 (Eastern Time)</SelectItem>
                      <SelectItem value="gmt">UTC+00:00 (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 glass-prism-button text-white shadow-lg backdrop-blur-lg" 
                  data-testid="button-save-changes"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive booking confirmations and updates via email</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">SMS Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get text reminders for upcoming appointments</p>
                  </div>
                  <Checkbox className="mt-1" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">Marketing Updates</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive product updates and helpful tips</p>
                  </div>
                  <Checkbox defaultChecked className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">Password</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reset your account password</p>
                </div>
                <Button
                  onClick={handlePasswordReset}
                  disabled={resetPasswordLoading}
                  className="glass-prism-button text-white shadow-lg backdrop-blur-lg h-10 px-4"
                  data-testid="button-reset-password"
                >
                  {resetPasswordLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl hover-lift">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription Management
            </h3>
            
            {profile?.membershipStatus === 'pro' ? (
              <div className="space-y-6">
                {/* Plan Status */}
                <div className={`glass-prism backdrop-blur-md ${(profile as any)?.trialStatus === 'active' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20'} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 glass-prism rounded-xl flex items-center justify-center mr-3 backdrop-blur-md ${(profile as any)?.trialStatus === 'active' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                        {(profile as any)?.trialStatus === 'active' ? (
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Crown className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            {(profile as any)?.trialStatus === 'active' ? 'Free Trial' : 'Pro Plan'}
                          </h4>
                          {(profile as any)?.trialStatus === 'active' && (
                            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs">
                              Trial
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">All features unlocked</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium mb-1 flex items-center ${(profile as any)?.trialStatus === 'active' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${(profile as any)?.trialStatus === 'active' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                        Active
                      </div>
                      {profile?.membershipExpires && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {(profile as any)?.trialStatus === 'active' 
                            ? `Trial ends ${new Date(profile.membershipExpires).toLocaleDateString()}`
                            : `Renews ${new Date(profile.membershipExpires).toLocaleDateString()}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Plan Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {['Unlimited pages', 'Custom branding', 'Analytics', 'Priority support'].map((feature) => (
                      <div key={feature} className="flex items-center">
                        <div className="w-4 h-4 glass-prism rounded-full flex items-center justify-center mr-2 backdrop-blur-md bg-green-500/20 border border-green-500/30">
                          <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12"
                    onClick={handleManageBilling}
                    data-testid="button-manage-billing"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                  <Button
                    variant="destructive"
                    className="glass-prism backdrop-blur-md bg-red-500/20 dark:bg-red-600/20 border border-red-500/30 hover:bg-red-500/30 dark:hover:bg-red-600/30 text-red-700 dark:text-red-400 font-medium transition-all duration-300 flex items-center justify-center h-12"
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscriptionLoading}
                    data-testid="button-cancel-subscription"
                  >
                    {cancelSubscriptionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md bg-blue-500/20 border border-blue-500/30">
                  <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Starter Plan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Limited features available</p>
                <Button
                  className="glass-prism-button text-white shadow-lg backdrop-blur-lg"
                  onClick={() => setShowUpgradeModal(true)}
                  data-testid="button-upgrade-to-pro"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extras Section */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Extras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 text-left"
                onClick={() => setLocation('/report-bug')}
                data-testid="button-report-bug"
              >
                <Bug className="h-4 w-4 mr-2 text-red-500" />
                Report a Bug
              </Button>
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 text-left"
                onClick={() => setLocation('/request-feature')}
                data-testid="button-request-feature"
              >
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                Request a Feature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="mt-8 glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Account Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="glass-prism backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 flex items-center justify-center h-12 w-full"
                onClick={() => setLocation('/')}
                data-testid="button-back-home"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
              <Button
                variant="destructive"
                className="glass-prism backdrop-blur-md bg-red-500 dark:bg-red-600 border-2 border-red-400 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold transition-all duration-300 flex items-center justify-center h-12 w-full shadow-lg hover:shadow-xl"
                onClick={() => {
                  logout();
                  setLocation('/');
                }}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      ) : (
        <BugFixesChangelogSection onReportBug={() => setLocation('/report-bug')} />
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

      <BillingModal 
        isOpen={showBillingModal} 
        onClose={() => setShowBillingModal(false)} 
      />
    </div>
  );
}
