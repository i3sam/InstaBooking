import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Sparkles, Bot, HelpCircle, Zap, BookOpen, Settings, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/use-currency';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Pages',
    question: 'How do I create a booking page?',
    answer: "To create a booking page:\n1. Click 'Booking Pages' in the sidebar\n2. Click 'Create New Page' button\n3. Fill in:\n   • Page title\n   • Tagline\n   • Services you offer\n   • Business hours\n   • Branding (colors, logo, theme)\n4. Click 'Create Page'\n5. Toggle 'Published' to make it live!\n\nYour page will have a unique shareable link!",
    keywords: ['create', 'new', 'page', 'booking', 'make', 'build']
  },
  {
    id: '2',
    category: 'Pages',
    question: 'How do I delete a booking page?',
    answer: "To delete a booking page:\n1. Go to 'Booking Pages' in the sidebar\n2. Find the page you want to delete\n3. Click the three dots menu (⋮) on the page card\n4. Select 'Delete Page'\n5. Confirm the deletion\n\nNote: This action cannot be undone, and all associated appointments will be removed.\n\n💡 Tip: You can unpublish a page instead of deleting it to keep it as a draft.",
    keywords: ['delete', 'remove', 'archive', 'page', 'get rid']
  },
  {
    id: '3',
    category: 'Pages',
    question: 'How do I edit my booking page?',
    answer: "To edit a booking page:\n1. Go to 'Booking Pages' in the sidebar\n2. Find the page you want to edit\n3. Click the 'Edit' button on the page card\n4. Make your changes (services, branding, availability, etc.)\n5. Click 'Save Changes' when done\n\nYour changes will be reflected immediately on the live page!",
    keywords: ['edit', 'modify', 'change', 'update', 'page']
  },
  {
    id: '4',
    category: 'Pages',
    question: 'How do I share my booking link?',
    answer: "To share your booking page:\n1. Go to 'Booking Pages'\n2. Find your published page\n3. Click 'Copy Link' button\n4. Share the link via:\n   • Your website\n   • Social media\n   • Email signature\n   • Business cards\n\nAnyone with the link can book your services!",
    keywords: ['share', 'link', 'url', 'copy', 'send']
  },
  {
    id: '5',
    category: 'Services',
    question: 'How do I add services?',
    answer: "To add services to your booking page:\n1. Edit your booking page\n2. Scroll to the 'Services' section\n3. Click 'Add Service'\n4. Enter service details:\n   • Name (e.g., '1-Hour Consultation')\n   • Description\n   • Duration in minutes\n   • Price and currency\n5. Click 'Save Service'\n6. Save your page changes\n\nYou can add multiple services per page!",
    keywords: ['add', 'service', 'offering', 'new']
  },
  {
    id: '6',
    category: 'Appointments',
    question: 'How do I manage appointments?',
    answer: "To manage appointments:\n1. Go to 'Appointments' in the sidebar\n2. View all pending, accepted, and rejected bookings\n3. For each appointment you can:\n   • Accept it (customer gets notified)\n   • Reject it (customer gets notified)\n   • View customer details\n   • See booking information\n\nCustomers receive automatic email notifications!",
    keywords: ['manage', 'handle', 'appointment', 'booking', 'view']
  },
  {
    id: '7',
    category: 'Appointments',
    question: 'How do I accept or reject appointments?',
    answer: "To accept or reject appointments:\n1. Go to 'Appointments' section\n2. Find the pending appointment\n3. Click 'Accept' to confirm or 'Reject' to decline\n4. The customer receives an automatic notification\n\nAccepted appointments show in your revenue, rejected ones don't!",
    keywords: ['accept', 'reject', 'approve', 'decline', 'appointment']
  },
  {
    id: '8',
    category: 'Appointments',
    question: 'How do I reschedule an appointment?',
    answer: "To reschedule an appointment:\n1. Go to 'Appointments' in the sidebar\n2. Find the appointment you want to reschedule\n3. Click the 'Reschedule' button\n4. Select a new date and time\n5. Add an optional note for the customer\n6. Click 'Send Reschedule'\n\nThe customer receives an automatic email notification with the new details!",
    keywords: ['reschedule', 'change time', 'move', 'change date', 'appointment']
  },
  {
    id: '9',
    category: 'Customization',
    question: 'How do I customize my branding?',
    answer: "To customize your booking page branding:\n1. Edit your booking page\n2. Use the customization options:\n   • Choose a theme (Ocean Blue, Sunset, etc.)\n   • Select primary color\n   • Pick background style\n   • Upload your logo\n   • Choose font family\n3. Preview your changes in real-time\n4. Save when you're happy with the look!",
    keywords: ['customize', 'brand', 'theme', 'color', 'logo', 'style']
  },
  {
    id: '10',
    category: 'Customization',
    question: 'How do I set my availability?',
    answer: "To set your availability:\n1. Edit your booking page\n2. Scroll to 'Business Hours'\n3. Set hours for each day:\n   • Enter opening time (e.g., 9:00)\n   • Enter closing time (e.g., 17:00)\n   • Or mark as 'Closed' for days off\n4. Save your changes\n\nCustomers can only book during your available hours!",
    keywords: ['availability', 'hours', 'time', 'schedule', 'business hours']
  },
  {
    id: '11',
    category: 'Payment',
    question: 'How do I set up payments?',
    answer: "BookingGen uses Razorpay for payment processing!\n\n**To set up payments:**\n1. Go to Settings in the sidebar\n2. Click 'Payment Integration'\n3. Enter your Razorpay API credentials:\n   • Key ID\n   • Key Secret\n4. Save settings\n5. Set prices when creating services\n\nCustomers can now pay directly when booking!\n\n**Troubleshooting:**\n• Make sure your Razorpay account is active\n• Verify API keys are correct\n• Test with a small amount first",
    keywords: ['payment', 'setup', 'razorpay', 'integration', 'money']
  },
  {
    id: '12',
    category: 'Account',
    question: 'What features are included in Pro?',
    answer: "As a Pro member, you have:\n• Unlimited booking pages\n• Unlimited appointments\n• Advanced analytics\n• Custom branding\n• Priority support\n• All future features!\n\nUpgrade anytime from the sidebar!",
    keywords: ['pro', 'upgrade', 'subscription', 'features', 'premium']
  },
  {
    id: '13',
    category: 'Account',
    question: 'How much does Pro cost?',
    answer: "BookingGen offers a Pro plan at just $14.99/month (50% off the regular price)! This includes unlimited booking pages, unlimited appointments, advanced analytics, custom branding, and priority support. New users can try it free for 7 days!",
    keywords: ['pricing', 'price', 'cost', 'how much', 'subscription']
  },
  {
    id: '14',
    category: 'Calendar',
    question: 'How do I sync with Google Calendar?',
    answer: "To sync with Google Calendar:\n1. Edit your booking page\n2. Find 'Calendar Integration'\n3. Add your Google Calendar link\n4. Save changes\n\nAll appointments will sync to your calendar!",
    keywords: ['calendar', 'sync', 'google', 'connect', 'integration']
  }
];

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
  const [showFAQs, setShowFAQs] = useState(false);
  const [faqCategory, setFaqCategory] = useState<string>('all');
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

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello ${userName}! 👋 How can I assist you today?`;
    }

    for (const faq of faqs) {
      const hasKeyword = faq.keywords.some(keyword => message.includes(keyword));
      if (hasKeyword) {
        return faq.answer;
      }
    }

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

    if (message.includes('help') || message.includes('what can you do')) {
      return `I can help you with:\n\n📄 **Booking Pages**\n• Create, edit, delete pages\n• Publish/unpublish pages\n• Customize branding & themes\n• Share booking links\n\n📅 **Appointments**\n• Accept/reject bookings\n• Manage appointments\n• View customer details\n\n⚙️ **Settings**\n• Add services\n• Set availability\n• Upload logo\n• Manage subscription\n\n📊 **Analytics**\n• View statistics\n• Track revenue\n• Monitor conversions\n\nType 'faqs' to browse frequently asked questions or just ask me anything!`;
    }

    if (message.includes('faq') || message.includes('frequently asked')) {
      setShowFAQs(true);
      return "I've opened the FAQ section for you. Browse through common questions or ask me directly!";
    }

    const casualResponses = [
      "I'm not sure about that specific question. Try:\n• Asking 'help' to see what I can do\n• Type 'faqs' to browse common questions\n• Or ask about pages, appointments, or settings!",
      "That's a great question! For detailed assistance, try typing 'faqs' or ask about:\n• Creating booking pages\n• Managing appointments\n• Customizing your branding\n• Account settings",
      "I can help you with booking pages, appointments, and account settings. Try typing 'faqs' to see common questions or ask me directly!"
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

  const handleQuickAction = (question: string) => {
    setInputValue(question);
    handleSend();
  };

  const handleFAQClick = (faq: FAQ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: faq.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 300);

    setShowFAQs(false);
  };

  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category)))];
  const filteredFAQs = faqCategory === 'all' ? faqs : faqs.filter(f => f.category === faqCategory);

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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFAQs(!showFAQs)}
                className="h-8 w-8 p-0"
                data-testid="button-toggle-faqs"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                data-testid="button-close-support"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {showFAQs ? (
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFAQs(false)}
                    data-testid="button-back-to-chat"
                  >
                    Back to Chat
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={faqCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFaqCategory(cat)}
                      className={faqCategory === cat ? 'glass-prism-button' : 'glass-prism'}
                      data-testid={`button-category-${cat}`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredFAQs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-3 rounded-xl glass-prism hover:glass-prism-button transition-all duration-300 group"
                      data-testid={`faq-item-${faq.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-white transition-colors">
                            {faq.question}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          ) : (
            <>
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
                {messages.length === 1 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('How do I create a page?')}
                        className="glass-prism text-xs justify-start"
                        data-testid="quick-action-create-page"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Create Page
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('How do I manage appointments?')}
                        className="glass-prism text-xs justify-start"
                        data-testid="quick-action-appointments"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Appointments
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('How do I customize branding?')}
                        className="glass-prism text-xs justify-start"
                        data-testid="quick-action-branding"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Branding
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFAQs(true)}
                        className="glass-prism text-xs justify-start"
                        data-testid="quick-action-faqs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        View FAQs
                      </Button>
                    </div>
                  </div>
                )}
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
              </div>
            </>
          )}
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
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
