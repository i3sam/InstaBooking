import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/use-currency';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface DashboardStats {
  pagesCount: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  conversionRate: number;
  avgBookingValue: number;
}

interface BookingPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

export default function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "👋 Hi! I'm your BookingGen assistant. I'm here to help you with your account, bookings, and answer any questions you have. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const { formatPrice } = useCurrency();

  const { data: stats, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isOpen
  });

  const { data: pages, error: pagesError } = useQuery<BookingPage[]>({
    queryKey: ['/api/pages'],
    enabled: isOpen
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isPro = profile?.membershipStatus === 'pro';
  const isTrialActive = (profile as any)?.trialStatus === 'active';
  const userName = profile?.fullName || user?.email?.split('@')[0] || 'there';

  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello ${userName}! 👋 How can I assist you today?`;
    }

    // Delete booking page
    if ((message.includes('delete') || message.includes('remove')) && (message.includes('page') || message.includes('booking'))) {
      return "To delete a booking page:\n1. Go to 'Booking Pages' in the sidebar\n2. Find the page you want to delete\n3. Click the three dots menu (⋮) on the page card\n4. Select 'Delete Page'\n5. Confirm the deletion\n\nNote: This action cannot be undone, and all associated appointments will be removed.";
    }

    // Edit booking page
    if ((message.includes('edit') || message.includes('modify') || message.includes('change')) && (message.includes('page') || message.includes('booking'))) {
      return "To edit a booking page:\n1. Go to 'Booking Pages' in the sidebar\n2. Find the page you want to edit\n3. Click the 'Edit' button on the page card\n4. Make your changes (services, branding, availability, etc.)\n5. Click 'Save Changes' when done\n\nYour changes will be reflected immediately on the live page!";
    }

    // Publish/Unpublish page
    if ((message.includes('publish') || message.includes('unpublish') || message.includes('live')) && message.includes('page')) {
      return "To publish or unpublish a page:\n1. Go to 'Booking Pages' in the sidebar\n2. Find your page\n3. Toggle the 'Published' switch on the page card\n\n• Published pages are live and can accept bookings\n• Draft pages are only visible to you for editing";
    }

    // Add services
    if (message.includes('add') && (message.includes('service') || message.includes('offering'))) {
      return "To add services to your booking page:\n1. Edit your booking page\n2. Scroll to the 'Services' section\n3. Click 'Add Service'\n4. Enter service details:\n   • Name (e.g., '1-Hour Consultation')\n   • Description\n   • Duration in minutes\n   • Price and currency\n5. Click 'Save Service'\n6. Save your page changes\n\nYou can add multiple services per page!";
    }

    // Manage appointments
    if ((message.includes('manage') || message.includes('handle')) && (message.includes('appointment') || message.includes('booking'))) {
      return "To manage appointments:\n1. Go to 'Appointments' in the sidebar\n2. View all pending, accepted, and rejected bookings\n3. For each appointment you can:\n   • Accept it (customer gets notified)\n   • Reject it (customer gets notified)\n   • View customer details\n   • See booking information\n\nCustomers receive automatic email notifications!";
    }

    // Accept/Reject appointments
    if ((message.includes('accept') || message.includes('reject') || message.includes('approve') || message.includes('decline')) && message.includes('appointment')) {
      return "To accept or reject appointments:\n1. Go to 'Appointments' section\n2. Find the pending appointment\n3. Click 'Accept' to confirm or 'Reject' to decline\n4. The customer receives an automatic notification\n\nAccepted appointments show in your revenue, rejected ones don't!";
    }

    // Customize branding
    if (message.includes('customize') || message.includes('brand') || message.includes('theme') || message.includes('color')) {
      return "To customize your booking page branding:\n1. Edit your booking page\n2. Use the customization options:\n   • Choose a theme (Ocean Blue, Sunset, etc.)\n   • Select primary color\n   • Pick background style\n   • Upload your logo\n   • Choose font family\n3. Preview your changes in real-time\n4. Save when you're happy with the look!";
    }

    // Set availability
    if (message.includes('availability') || message.includes('hours') || (message.includes('set') && message.includes('time'))) {
      return "To set your availability:\n1. Edit your booking page\n2. Scroll to 'Business Hours'\n3. Set hours for each day:\n   • Enter opening time (e.g., 9:00)\n   • Enter closing time (e.g., 17:00)\n   • Or mark as 'Closed' for days off\n4. Save your changes\n\nCustomers can only book during your available hours!";
    }

    // Share booking link
    if (message.includes('share') || message.includes('link') || message.includes('url')) {
      return "To share your booking page:\n1. Go to 'Booking Pages'\n2. Find your published page\n3. Click 'Copy Link' button\n4. Share the link via:\n   • Your website\n   • Social media\n   • Email signature\n   • Business cards\n\nAnyone with the link can book your services!";
    }

    // View statistics - only show when specifically asking for stats
    if (message.includes('show') && (message.includes('stats') || message.includes('analytics') || message.includes('revenue'))) {
      if (statsError) {
        return "I'm having trouble loading your analytics data right now. Please try again in a moment, or check the Analytics section directly.";
      }
      if (!stats) {
        return "I'm loading your analytics data. Please try again in a moment.";
      }
      let response = `Here's a summary of your account:\n\n`;
      response += `📊 **Statistics**\n`;
      response += `• Booking Pages: ${stats.pagesCount}\n`;
      response += `• Total Appointments: ${stats.totalAppointments}\n`;
      response += `• Pending Appointments: ${stats.pendingAppointments}\n`;
      response += `• Total Revenue: ${formatPrice(stats.totalRevenue)}\n`;
      response += `• Conversion Rate: ${stats.conversionRate}%\n`;
      if (stats.avgBookingValue > 0) {
        response += `• Average Booking Value: ${formatPrice(stats.avgBookingValue)}`;
      }
      return response;
    }

    // View pages info
    if (message.includes('show') && (message.includes('page') || message.includes('pages'))) {
      if (pagesError) {
        return "I'm having trouble loading your booking pages right now. Please try again in a moment, or check the Booking Pages section directly.";
      }
      if (!pages || pages.length === 0) {
        return "You don't have any booking pages yet. Click 'Create New Page' to get started!";
      }
      const publishedPages = pages.filter(p => p.published).length;
      const draftPages = pages.filter(p => !p.published).length;
      let response = `You have ${pages.length} booking page${pages.length !== 1 ? 's' : ''}:\n`;
      response += `• Published: ${publishedPages}\n`;
      response += `• Drafts: ${draftPages}\n\n`;
      if (pages.length > 0) {
        response += `Your pages:\n`;
        pages.slice(0, 3).forEach(page => {
          response += `• ${page.title} ${page.published ? '(Live)' : '(Draft)'}\n`;
        });
        if (pages.length > 3) {
          response += `...and ${pages.length - 3} more`;
        }
      }
      return response;
    }

    // Upload logo
    if (message.includes('upload') && (message.includes('logo') || message.includes('image'))) {
      return "To upload your logo:\n1. Edit your booking page\n2. Find the 'Logo' section\n3. Click 'Upload Logo'\n4. Select your logo file (JPG, PNG, or SVG)\n5. The logo will appear on your booking page\n6. Save your changes\n\nFor best results, use a square logo with transparent background!";
    }

    // Add payment method
    if (message.includes('payment') && (message.includes('add') || message.includes('setup') || message.includes('method'))) {
      return "To add payment processing to your bookings:\n1. Currently, BookingGen tracks payments for record-keeping\n2. You can set prices for your services when creating them\n3. Payment collection happens outside BookingGen\n4. Track your revenue in the Analytics section\n\nFull payment integration coming soon!";
    }

    // Create booking page
    if (message.includes('create') && (message.includes('page') || message.includes('booking'))) {
      return "To create a booking page:\n1. Click 'Booking Pages' in the sidebar\n2. Click 'Create New Page' button\n3. Fill in:\n   • Page title\n   • Tagline\n   • Services you offer\n   • Business hours\n   • Branding (colors, logo, theme)\n4. Click 'Create Page'\n5. Toggle 'Published' to make it live!\n\nYour page will have a unique shareable link!";
    }

    // Account & subscription
    if (message.includes('pro') || message.includes('upgrade') || message.includes('subscription')) {
      if (isPro) {
        if (isTrialActive) {
          return "You're currently on a Pro trial! You have access to all premium features. Your trial will automatically convert to a paid subscription unless you cancel.";
        }
        return "You're a Pro member! 🌟 You have unlimited access to all features including unlimited booking pages, advanced analytics, and priority support.";
      }
      return "You're currently on the Free plan. Upgrade to Pro to unlock unlimited booking pages, advanced analytics, custom branding, and more! Click the upgrade button in the sidebar to get started.";
    }

    // Trial info
    if (message.includes('trial')) {
      if (isTrialActive) {
        return "You're currently enjoying your 7-day Pro trial! All premium features are unlocked. Remember to add your payment details before the trial ends to continue enjoying Pro benefits.";
      }
      if ((profile as any)?.trialStatus === 'used') {
        return "You've already used your free trial. You can upgrade to Pro anytime to access all premium features!";
      }
      if ((profile as any)?.trialStatus === 'available') {
        return "You're eligible for a 7-day free trial! Click the trial button in the sidebar to activate it and enjoy all Pro features.";
      }
      return "Your trial status is currently unavailable. Please contact support for assistance.";
    }

    // Pricing
    if (message.includes('pricing') || message.includes('price') || message.includes('cost')) {
      return "BookingGen offers a Pro plan at just $14.99/month (50% off the regular price)! This includes unlimited booking pages, unlimited appointments, advanced analytics, custom branding, and priority support. New users can try it free for 7 days!";
    }

    // Cancellation
    if (message.includes('cancel') && message.includes('subscription')) {
      if (isPro) {
        return "To cancel your subscription:\n1. Go to Settings in the sidebar\n2. Click 'Billing & Payments'\n3. Click 'Cancel Subscription'\n4. Confirm cancellation\n\nYou'll keep Pro access until the end of your billing period!";
      }
      return "You're on the Free plan, so there's nothing to cancel. If you upgrade to Pro, you can cancel anytime with no penalties.";
    }

    // Features & limits
    if (message.includes('feature') || message.includes('limit') || message.includes('can i')) {
      if (isPro) {
        return "As a Pro member, you have:\n• Unlimited booking pages\n• Unlimited appointments\n• Advanced analytics\n• Custom branding\n• Priority support\n• All future features!";
      }
      return "Free plan includes:\n• 1 booking page\n• Up to 10 appointments/month\n• Basic analytics\n\nUpgrade to Pro for unlimited everything!";
    }

    // Contact support
    if (message.includes('contact') || message.includes('support')) {
      return "For personalized support, you can reach our team through the Contact page. We typically respond within 24 hours. Pro members get priority support!";
    }

    // Custom domain
    if (message.includes('domain')) {
      if (isPro) {
        return "You can add a custom domain to your booking pages! Go to Settings and look for the 'Custom Domain' section to set it up.";
      }
      return "Custom domains are a Pro feature. Upgrade to Pro to use your own domain for your booking pages!";
    }

    // Notifications
    if (message.includes('notification')) {
      return "BookingGen sends automatic notifications for:\n• New booking requests\n• Appointment confirmations\n• Appointment rejections\n• Cancellations\n\nCustomers and you get notified via email automatically!";
    }

    // Calendar sync
    if (message.includes('calendar') || message.includes('google calendar') || message.includes('sync')) {
      return "To sync with Google Calendar:\n1. Edit your booking page\n2. Find 'Calendar Integration'\n3. Add your Google Calendar link\n4. Save changes\n\nAll appointments will sync to your calendar!";
    }

    // Help menu
    if (message.includes('help') || message.includes('what can you do')) {
      return `I can help you with:\n\n📄 **Booking Pages**\n• Create, edit, delete pages\n• Publish/unpublish pages\n• Customize branding & themes\n• Share booking links\n\n📅 **Appointments**\n• Accept/reject bookings\n• Manage appointments\n• View customer details\n\n⚙️ **Settings**\n• Add services\n• Set availability\n• Upload logo\n• Manage subscription\n\n📊 **Analytics**\n• View statistics\n• Track revenue\n• Monitor conversions\n\nJust ask me anything!`;
    }

    // Fallback
    const casualResponses = [
      "I'm not sure about that specific question. Try asking about:\n• Creating or editing booking pages\n• Managing appointments\n• Customizing your branding\n• Account settings\n• Or type 'help' to see what I can do!",
      "That's a great question! For detailed assistance, contact our support team. I can help you with booking pages, appointments, customization, and settings. What would you like to know?",
      "I can help you with booking pages, appointments, and account settings. Try asking about creating a page, managing bookings, or customizing your brand!"
    ];

    return casualResponses[Math.floor(Math.random() * casualResponses.length)];
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-[calc(100vw-2rem)] sm:w-96 sm:right-6 sm:bottom-24 h-[500px] sm:h-[600px] max-w-[400px] glass-prism-card backdrop-blur-xl border-white/20 shadow-2xl flex flex-col z-50 animate-scale-in mobile-no-blur">
          <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-prism rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Support Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
              data-testid="button-close-support"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'glass-prism backdrop-blur-md text-foreground'
                  }`}
                  data-testid={`message-${message.type}-${message.id}`}
                >
                  <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t border-white/10 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 glass-prism backdrop-blur-md border-white/20"
                data-testid="input-support-message"
              />
              <Button
                onClick={handleSend}
                size="sm"
                className="glass-prism-button"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <Sparkles className="h-3 w-3 inline mr-1" />
              Powered by smart assistance
            </p>
          </div>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full glass-prism-button shadow-2xl z-50 p-0"
        data-testid="button-toggle-support"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
