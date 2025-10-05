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

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isOpen
  });

  const { data: pages } = useQuery<BookingPage[]>({
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

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello ${userName}! 👋 How can I assist you today?`;
    }

    if (message.includes('pro') || message.includes('upgrade') || message.includes('subscription')) {
      if (isPro) {
        if (isTrialActive) {
          return "You're currently on a Pro trial! You have access to all premium features. Your trial will automatically convert to a paid subscription unless you cancel.";
        }
        return "You're a Pro member! 🌟 You have unlimited access to all features including unlimited booking pages, advanced analytics, and priority support.";
      }
      return "You're currently on the Free plan. Upgrade to Pro to unlock unlimited booking pages, advanced analytics, custom branding, and more! Click the upgrade button in the sidebar to get started.";
    }

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

    if (message.includes('stats') || message.includes('analytics') || message.includes('revenue') || message.includes('booking')) {
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

    if (message.includes('page') || message.includes('pages')) {
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

    if (message.includes('help') || message.includes('what can you do')) {
      return `I can help you with:\n\n• Account & subscription info\n• Analytics & statistics\n• Booking pages overview\n• Pricing & plans\n• General questions about BookingGen\n\nJust ask me anything!`;
    }

    if (message.includes('pricing') || message.includes('price') || message.includes('cost')) {
      return "BookingGen offers a Pro plan at just $14.99/month (50% off the regular price)! This includes unlimited booking pages, unlimited appointments, advanced analytics, custom branding, and priority support. New users can try it free for 7 days!";
    }

    if (message.includes('cancel') || message.includes('cancellation')) {
      if (isPro) {
        return "You can cancel your Pro subscription anytime from the Settings section. If you're on a trial, canceling will stop auto-renewal but you'll keep Pro access until the trial ends.";
      }
      return "You're on the Free plan, so there's nothing to cancel. If you upgrade to Pro, you can cancel anytime with no penalties.";
    }

    if (message.includes('payment') || message.includes('billing')) {
      if (isPro) {
        return "Manage your payment methods and billing details in the Settings section. Click 'Billing & Payments' to view your subscription and update payment information.";
      }
      return "You're on the Free plan, so there are no billing details yet. When you upgrade to Pro, you'll be able to manage your payment methods in Settings.";
    }

    if (message.includes('feature') || message.includes('limit')) {
      if (isPro) {
        return "As a Pro member, you have:\n• Unlimited booking pages\n• Unlimited appointments\n• Advanced analytics\n• Custom branding\n• Priority support\n• All future features!";
      }
      return "Free plan includes:\n• 1 booking page\n• Up to 10 appointments/month\n• Basic analytics\n\nUpgrade to Pro for unlimited everything!";
    }

    if (message.includes('contact') || message.includes('support') || message.includes('email')) {
      return "For personalized support, you can reach our team through the Contact page. We typically respond within 24 hours. Pro members get priority support!";
    }

    if (message.includes('custom domain') || message.includes('domain')) {
      if (isPro) {
        return "You can add a custom domain to your booking pages! Go to Settings and look for the 'Custom Domain' section to set it up.";
      }
      return "Custom domains are a Pro feature. Upgrade to Pro to use your own domain for your booking pages!";
    }

    if (message.includes('notification') || message.includes('email')) {
      return "BookingGen sends automatic notifications for:\n• New booking requests\n• Appointment confirmations\n• Cancellations\n\nYou can customize these in Settings > Notifications.";
    }

    if (message.includes('calendar') || message.includes('google calendar') || message.includes('sync')) {
      return "You can sync your booking pages with Google Calendar! Add your calendar link in the page settings, and all appointments will automatically sync.";
    }

    const faqResponses = [
      {
        keywords: ['how', 'create', 'page', 'booking'],
        response: "To create a booking page: Click 'Create New Page' in the Booking Pages section, customize your page with services, branding, and availability, then publish it!"
      },
      {
        keywords: ['accept', 'appointment', 'approve'],
        response: "To manage appointments: Go to the Appointments section, review pending bookings, and click Accept or Reject. Customers get notified automatically!"
      },
      {
        keywords: ['share', 'link', 'url'],
        response: "Each booking page has a unique link you can share. Find it in your Booking Pages list - just copy and share it on your website, social media, or email!"
      },
      {
        keywords: ['theme', 'color', 'brand', 'customize'],
        response: "Customize your booking page by editing it! You can change colors, themes, fonts, upload your logo, and make it match your brand perfectly."
      }
    ];

    for (const faq of faqResponses) {
      if (faq.keywords.every(keyword => message.includes(keyword))) {
        return faq.response;
      }
    }

    const casualResponses = [
      "I'm not sure about that, but I'd be happy to help with your account info, analytics, or booking pages. What would you like to know?",
      "That's a great question! For detailed assistance, you can contact our support team. I can help you with account stats, pages, and general BookingGen questions.",
      "I can help you with information about your account, subscription, analytics, and booking pages. Try asking about your stats or pages!"
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
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] glass-prism-card backdrop-blur-xl border-white/20 shadow-2xl flex flex-col z-50 animate-scale-in mobile-no-blur">
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full glass-prism-button shadow-2xl z-50 p-0"
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
