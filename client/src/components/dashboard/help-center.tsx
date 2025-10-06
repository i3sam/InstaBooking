import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, BookOpen, MessageCircle, Search, ChevronRight, Sparkles, Clock, TrendingUp, Calendar, Palette, BarChart, ArrowRight, CheckCircle, Star, ChevronDown, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SupportBot from './support-bot';

function renderFormattedContent(content: string) {
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => {
    if (!line.trim()) {
      return <div key={lineIndex} className="h-4" />;
    }

    let formattedLine = line;
    const parts: JSX.Element[] = [];
    let currentText = '';
    let inBold = false;
    let key = 0;

    for (let i = 0; i < formattedLine.length; i++) {
      if (formattedLine[i] === '*' && formattedLine[i + 1] === '*') {
        if (currentText) {
          parts.push(
            inBold ? (
              <strong key={key++} className="font-bold text-gray-900 dark:text-white">
                {currentText}
              </strong>
            ) : (
              <span key={key++}>{currentText}</span>
            )
          );
          currentText = '';
        }
        inBold = !inBold;
        i++;
      } else {
        currentText += formattedLine[i];
      }
    }

    if (currentText) {
      parts.push(
        inBold ? (
          <strong key={key++} className="font-bold text-gray-900 dark:text-white">
            {currentText}
          </strong>
        ) : (
          <span key={key++}>{currentText}</span>
        )
      );
    }

    const trimmedLine = line.trim();
    const isNumberedList = /^\d+\./.test(trimmedLine);
    const isBulletList = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');

    if (isNumberedList) {
      return (
        <div key={lineIndex} className="ml-4 mb-2">
          {parts}
        </div>
      );
    } else if (isBulletList) {
      const textWithoutBullet = trimmedLine.startsWith('•') ? trimmedLine.slice(1).trim() : trimmedLine.slice(1).trim();
      
      const cleanParts: JSX.Element[] = [];
      let cleanText = '';
      let inBoldClean = false;
      let keyClean = 0;

      for (let i = 0; i < textWithoutBullet.length; i++) {
        if (textWithoutBullet[i] === '*' && textWithoutBullet[i + 1] === '*') {
          if (cleanText) {
            cleanParts.push(
              inBoldClean ? (
                <strong key={keyClean++} className="font-bold text-gray-900 dark:text-white">
                  {cleanText}
                </strong>
              ) : (
                <span key={keyClean++}>{cleanText}</span>
              )
            );
            cleanText = '';
          }
          inBoldClean = !inBoldClean;
          i++;
        } else {
          cleanText += textWithoutBullet[i];
        }
      }

      if (cleanText) {
        cleanParts.push(
          inBoldClean ? (
            <strong key={keyClean++} className="font-bold text-gray-900 dark:text-white">
              {cleanText}
            </strong>
          ) : (
            <span key={keyClean++}>{cleanText}</span>
          )
        );
      }

      return (
        <div key={lineIndex} className="ml-4 mb-2 flex items-start">
          <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
          <span className="flex-1">{cleanParts}</span>
        </div>
      );
    } else {
      return (
        <div key={lineIndex} className="mb-3">
          {parts}
        </div>
      );
    }
  });
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  icon: any;
  gradient: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with BookingGen',
    excerpt: 'Learn how to create your first booking page in minutes and start accepting appointments from clients.',
    content: `Welcome to BookingGen! This guide will help you get started.\n\n**Step 1: Create Your First Booking Page**\n1. Click on 'Booking Pages' in the sidebar\n2. Click 'Create New Page'\n3. Fill in your business details\n4. Add your services and pricing\n5. Customize your branding\n\n**Step 2: Set Your Availability**\nSet your business hours so clients know when they can book:\n• Go to your page settings\n• Set hours for each day\n• Mark days off as closed\n\n**Step 3: Share Your Link**\nOnce published, share your unique booking link:\n• Copy the link from your page\n• Add it to your website\n• Share on social media\n• Include in email signatures\n\n**Step 4: Manage Appointments**\nWhen bookings come in:\n• Review in the Appointments section\n• Accept or reject requests\n• Clients get automatic notifications\n\nYou're all set! Start accepting bookings today.`,
    category: 'Getting Started',
    readTime: '5 min read',
    date: 'Oct 1, 2025',
    icon: Sparkles,
    gradient: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: '2',
    title: 'Customize Your Booking Page Design',
    excerpt: 'Make your booking page stand out with custom themes, colors, and branding that matches your business.',
    content: `Your booking page is your digital storefront. Make it shine!\n\n**Choose a Theme**\nBookingGen offers beautiful pre-designed themes:\n• Ocean Blue - Professional and calm\n• Sunset - Warm and inviting\n• Forest - Natural and organic\n• Midnight - Sleek and modern\n• Rose - Elegant and sophisticated\n\n**Customize Colors**\n1. Pick your primary brand color\n2. Select background style\n3. Choose text colors\n4. Preview changes in real-time\n\n**Upload Your Logo**\n• Supports PNG, JPG, SVG\n• Recommended size: 200x200px\n• Displays prominently on your page\n\n**Advanced Customization**\n• Choose font families\n• Adjust spacing and layout\n• Mobile-responsive automatically\n• Preview on different devices\n\n**Pro Tip:** Keep your branding consistent across all platforms for better brand recognition!`,
    category: 'Customization',
    readTime: '4 min read',
    date: 'Sep 28, 2025',
    icon: Palette,
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: '3',
    title: 'Manage Your Appointments Like a Pro',
    excerpt: 'Master appointment management with our powerful tools for accepting, declining, and organizing bookings.',
    content: `Efficient appointment management is key to running a successful booking business.\n\n**The Appointments Dashboard**\nYour central hub for all bookings:\n• View all appointments at a glance\n• Filter by status (pending, accepted, rejected)\n• Search by client name or date\n• Quick actions for each appointment\n\n**Accept or Decline Bookings**\nSimple workflow:\n1. Review appointment details\n2. Click Accept or Reject\n3. Client gets instant notification\n4. Accepted bookings show in calendar\n\n**Reschedule Appointments**\nWhen plans change:\n• Click 'Reschedule' on any appointment\n• Pick a new date and time\n• Add a note for your client\n• Client receives update automatically\n\n**View Client Information**\nEvery booking includes:\n• Client name and contact\n• Service requested\n• Date and time\n• Special requests or notes\n• Payment status\n\n**Calendar Integration**\nSync with your favorite calendar apps to never miss an appointment!`,
    category: 'Appointments',
    readTime: '6 min read',
    date: 'Sep 25, 2025',
    icon: Calendar,
    gradient: 'from-green-500/20 to-cyan-500/20'
  },
  {
    id: '4',
    title: 'Track Your Success with Analytics',
    excerpt: 'Understand your booking performance with detailed analytics and insights to grow your business.',
    content: `Data-driven decisions lead to business growth. Here's how to use BookingGen analytics.\n\n**Dashboard Overview**\nYour analytics at a glance:\n• Total booking pages created\n• Total appointments received\n• Pending appointments count\n• Revenue tracking\n• Conversion rates\n\n**Key Metrics to Monitor**\n\n**Conversion Rate**\n• Percentage of page visits to bookings\n• Industry average: 2-5%\n• Higher is better!\n\n**Average Booking Value**\n• Your typical appointment value\n• Track trends over time\n• Identify high-value services\n\n**Booking Trends**\n• Peak booking times\n• Popular services\n• Client preferences\n• Seasonal patterns\n\n**Using Insights**\n1. Identify your best-performing pages\n2. Optimize underperforming services\n3. Adjust pricing based on demand\n4. Plan capacity for busy periods\n\n**Pro Tips:**\n• Review analytics weekly\n• A/B test different page designs\n• Track before and after changes\n• Set monthly growth goals`,
    category: 'Analytics',
    readTime: '7 min read',
    date: 'Sep 20, 2025',
    icon: BarChart,
    gradient: 'from-orange-500/20 to-yellow-500/20'
  },
  {
    id: '5',
    title: 'Best Practices for Service Descriptions',
    excerpt: 'Write compelling service descriptions that convert visitors into paying clients.',
    content: `Great service descriptions are the key to more bookings. Here's how to write them.\n\n**The Perfect Service Description Structure**\n\n**1. Headline (Service Name)**\n• Clear and descriptive\n• Include key benefit\n• Example: "60-Minute Deep Tissue Massage"\n\n**2. What's Included**\nBullet points work best:\n• Duration of service\n• What client can expect\n• Any materials or resources included\n• Follow-up support if applicable\n\n**3. Who It's For**\nHelp clients self-identify:\n• "Perfect for busy professionals"\n• "Ideal for beginners"\n• "Designed for advanced users"\n\n**4. Benefits Over Features**\nFocus on outcomes:\n❌ "Uses advanced techniques"\n✅ "Leave feeling relaxed and rejuvenated"\n\n**5. Clear Pricing**\n• Be upfront about costs\n• Explain what's included\n• Mention any packages or discounts\n\n**Writing Tips:**\n• Keep it concise (100-150 words)\n• Use action words\n• Address client pain points\n• Include social proof when possible\n• Make it scannable with formatting\n\n**Examples:**\n\n**Good:** "Transform your space with our 2-hour professional organizing session. We'll declutter one room, create custom storage solutions, and teach you systems to stay organized. Perfect for busy families struggling with clutter. You'll get a personalized action plan and 30 days of follow-up support."\n\n**Better:** "Reclaim your peace of mind with our Professional Home Organization package. In just 2 hours, we'll transform your most chaotic room into an organized oasis. You'll learn proven systems used by organizing experts, receive a custom maintenance plan, and enjoy 30 days of text support. Ideal for anyone feeling overwhelmed by clutter and ready for lasting change."`,
    category: 'Best Practices',
    readTime: '5 min read',
    date: 'Sep 15, 2025',
    icon: TrendingUp,
    gradient: 'from-pink-500/20 to-red-500/20'
  },
  {
    id: '6',
    title: 'Time Management Tips for Service Providers',
    excerpt: 'Optimize your schedule and maximize productivity with smart time management strategies.',
    content: `Running a booking business requires excellent time management. Here are proven strategies.\n\n**Set Realistic Availability**\n• Don't overbook yourself\n• Include buffer time between appointments\n• Block time for admin tasks\n• Reserve personal time\n\n**Use Business Hours Strategically**\nMorning vs Evening bookings:\n• Set peak hours for premium pricing\n• Offer off-peak discounts\n• Consider client preferences\n• Factor in your energy levels\n\n**Buffer Time is Essential**\nWhy you need it:\n• Travel between locations\n• Preparation and cleanup\n• Unexpected delays\n• Mental breaks\n\n**Batch Similar Services**\n• Group similar appointments together\n• Reduce context switching\n• Improve efficiency\n• Maintain focus\n\n**The Calendar View**\nBookingGen's calendar tool helps you:\n• Visualize your schedule\n• Spot gaps and opportunities\n• Prevent double-booking\n• Plan ahead effectively\n\n**Time Blocking Technique**\n1. Divide your day into blocks\n2. Assign specific tasks to each block\n3. Client appointments in prime hours\n4. Admin work in low-energy times\n5. Breaks are non-negotiable\n\n**Productivity Hacks:**\n• Turn off notifications during appointments\n• Use the Notes tool for quick reminders\n• Review tomorrow's schedule each evening\n• Prepare materials in advance\n• Set clear boundaries with clients\n\n**Remember:** A well-managed schedule means better service for your clients and less stress for you!`,
    category: 'Productivity',
    readTime: '6 min read',
    date: 'Sep 10, 2025',
    icon: Clock,
    gradient: 'from-indigo-500/20 to-blue-500/20'
  }
];

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is BookingGen?',
    answer: 'BookingGen is a modern SaaS platform that helps freelancers, consultants, and service providers create professional booking pages. Create custom pages, manage appointments, track analytics, and grow your business - all in one place.'
  },
  {
    id: '2',
    category: 'General',
    question: 'How do I create my first booking page?',
    answer: "It's simple! Click 'Booking Pages' in the sidebar, then 'Create New Page'. Fill in your details, add services, customize your branding, and publish. Your unique shareable link will be ready in minutes!"
  },
  {
    id: '3',
    category: 'Pages',
    question: 'Can I have multiple booking pages?',
    answer: 'Yes! Create unlimited booking pages with a Pro membership. Each page can have different services, branding, and availability settings. Perfect for offering different service types or targeting different client segments.'
  },
  {
    id: '4',
    category: 'Pages',
    question: 'How do I share my booking page?',
    answer: "Once your page is published, click 'Copy Link' on the page card. Share this link on your website, social media, email signature, or anywhere you connect with clients. Anyone with the link can view and book your services."
  },
  {
    id: '5',
    category: 'Customization',
    question: 'Can I customize the look of my booking page?',
    answer: 'Absolutely! Choose from beautiful themes, customize colors, upload your logo, select fonts, and more. All changes preview in real-time, and your page is automatically mobile-responsive.'
  },
  {
    id: '6',
    category: 'Appointments',
    question: 'How do clients book appointments?',
    answer: 'Clients visit your booking page, select a service, choose an available time slot that works for them, provide their details, and submit. You receive a notification and can accept or decline the booking.'
  },
  {
    id: '7',
    category: 'Appointments',
    question: 'Can I reschedule appointments?',
    answer: "Yes! From the Appointments section, click 'Reschedule' on any appointment, select a new date/time, add an optional note, and send. Your client receives an automatic notification with the updated details."
  },
  {
    id: '8',
    category: 'Appointments',
    question: 'What happens when I accept or reject a booking?',
    answer: 'When you accept or reject an appointment, your client receives an automatic email notification. Accepted appointments appear in your calendar and count toward your analytics. Rejected appointments do not.'
  },
  {
    id: '9',
    category: 'Calendar',
    question: 'How do I set my availability?',
    answer: "Edit your booking page and scroll to 'Business Hours'. Set opening and closing times for each day, or mark days as closed. Clients can only book during your available hours, preventing conflicts."
  },
  {
    id: '10',
    category: 'Calendar',
    question: 'Can I sync with Google Calendar?',
    answer: 'Yes! Add your Google Calendar link in the Calendar Integration section when editing your page. This helps you keep track of all appointments in one place.'
  },
  {
    id: '11',
    category: 'Analytics',
    question: 'What analytics are available?',
    answer: 'Track key metrics including total pages, appointments, revenue, conversion rates, and average booking values. Use these insights to optimize your services and grow your business.'
  },
  {
    id: '12',
    category: 'Account',
    question: 'What are the differences between Starter and Pro plans?',
    answer: 'Starter includes basic features for getting started. Pro unlocks unlimited booking pages, unlimited appointments, advanced analytics, custom branding, and priority support. New users can try Pro free for 7 days!'
  },
  {
    id: '13',
    category: 'Account',
    question: 'How does the 7-day free trial work?',
    answer: "If you're eligible, activate your free trial from the sidebar. Enjoy all Pro features for 7 days with no payment required upfront. If you love it, add payment details to continue; otherwise, you'll revert to Starter."
  },
  {
    id: '14',
    category: 'Services',
    question: 'How do I add services to my page?',
    answer: "Edit your booking page, scroll to 'Services', click 'Add Service', then enter the name, description, duration, and price. You can add multiple services per page, each with different pricing and durations."
  },
  {
    id: '15',
    category: 'Troubleshooting',
    question: 'My booking page is not showing up. What should I do?',
    answer: "First, ensure your page is published (toggle the 'Published' switch). If it's published but still not visible, try copying the link again and opening it in an incognito/private browser window. Contact support if issues persist."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('guides');
  const [botMessages, setBotMessages] = useState<Array<{ id: string; type: 'user' | 'bot'; content: string; timestamp: Date }>>([
    {
      id: '1',
      type: 'bot',
      content: "👋 Hi! I'm your BookingGen assistant. I'm here to help you with pages, appointments, and settings. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [botInput, setBotInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const blogCategories = Array.from(new Set(blogPosts.map(post => post.category)));
  const faqCategories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const groupedFAQs = faqCategories.reduce((acc, category) => {
    acc[category] = filteredFAQs.filter(faq => faq.category === category);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello! 👋 How can I assist you today?`;
    }

    if (message.includes('create') && message.includes('page')) {
      return "To create a booking page:\n1. Click 'Booking Pages' in the sidebar\n2. Click 'Create New Page'\n3. Fill in your details, services, and branding\n4. Click 'Create Page'\n5. Toggle 'Published' to make it live!";
    }

    if (message.includes('appointment') || message.includes('booking')) {
      return "To manage appointments:\n1. Go to 'Appointments' in the sidebar\n2. View pending, accepted, and rejected bookings\n3. Accept or reject appointments\n4. Customers get automatic notifications!";
    }

    if (message.includes('customize') || message.includes('brand') || message.includes('theme')) {
      return "To customize your page:\n1. Edit your booking page\n2. Choose a theme (Ocean Blue, Sunset, etc.)\n3. Select colors and upload your logo\n4. Preview changes in real-time\n5. Save when ready!";
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you with:\n\n📄 Booking Pages - Create, edit, customize\n📅 Appointments - Accept, reject, manage\n⚙️ Settings - Services, availability, branding\n📊 Analytics - Stats, revenue, conversions\n\nJust ask me anything!";
    }

    return "I'm here to help! Try asking about:\n• Creating booking pages\n• Managing appointments\n• Customizing branding\n• Or type 'help' to see what I can do!";
  };

  const handleBotSend = () => {
    if (!botInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: botInput,
      timestamp: new Date()
    };

    setBotMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: getBotResponse(botInput),
        timestamp: new Date()
      };
      setBotMessages(prev => [...prev, botResponse]);
    }, 500);

    setBotInput('');
  };

  const handleQuickQuestion = (question: string) => {
    setBotInput(question);
    setTimeout(() => handleBotSend(), 100);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Help Center
          </h2>
          <p className="text-muted-foreground mt-1">Get help, learn tips, and master BookingGen</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 p-1 mobile-no-blur">
          <TabsTrigger 
            value="guides" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:glass-prism-button data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            data-testid="tab-guides"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Guides & Tips
          </TabsTrigger>
          <TabsTrigger 
            value="faqs" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:glass-prism-button data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            data-testid="tab-faqs"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:glass-prism-button data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            data-testid="tab-support"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Support Bot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-6 space-y-6">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl mobile-no-blur">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search guides and tips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-prism bg-white/5 border-white/20"
                    data-testid="input-search-guides"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className={selectedCategory === 'all' ? 'glass-prism-button text-gray-900 dark:text-white' : 'glass-prism text-gray-700 dark:text-gray-300'}
                    data-testid="button-category-all"
                  >
                    All
                  </Button>
                  {blogCategories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 'glass-prism-button text-gray-900 dark:text-white' : 'glass-prism text-gray-700 dark:text-gray-300'}
                      data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedPost ? (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-up mobile-no-blur">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3" variant="secondary">{selectedPost.category}</Badge>
                    <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      {selectedPost.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedPost.readTime}
                      </span>
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(null)}
                    className="glass-prism"
                    data-testid="button-back-to-guides"
                  >
                    ← Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="glass-prism p-6 rounded-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                    {renderFormattedContent(selectedPost.content)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => {
                const Icon = post.icon;
                return (
                  <Card
                    key={post.id}
                    className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl hover-lift cursor-pointer group animate-fade-in mobile-no-blur"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedPost(post)}
                    data-testid={`blog-post-${post.id}`}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 glass-prism rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${post.gradient} border border-white/30 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                      </div>
                      <Badge className="mb-2 w-fit" variant="secondary">{post.category}</Badge>
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                        >
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!selectedPost && filteredPosts.length === 0 && (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl mobile-no-blur">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No guides found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faqs" className="mt-6 space-y-6">
          <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl mobile-no-blur">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-prism bg-white/5 border-white/20"
                  data-testid="input-search-faqs"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              categoryFAQs.length > 0 && (
                <Card key={category} className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-up mobile-no-blur">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {categoryFAQs.map((faq, index) => (
                        <AccordionItem 
                          key={faq.id} 
                          value={faq.id}
                          className="glass-prism rounded-xl border-0 animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          data-testid={`faq-item-${faq.id}`}
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline group [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-500/10 [&[data-state=open]]:to-purple-500/10 rounded-t-xl transition-all">
                            <div className="flex items-start gap-3 flex-1 text-left">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100 pr-4">
                                {faq.question}
                              </h4>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-4 pt-2">
                            <div className="ml-9 text-gray-700 dark:text-gray-300 leading-relaxed">
                              {faq.answer}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl mobile-no-blur">
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No FAQs found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-left mobile-no-blur">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start glass-prism hover:glass-prism-button transition-all"
                  onClick={() => handleQuickQuestion('How do I create a booking page?')}
                  data-testid="quick-action-create-page"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Create Booking Page</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Get started with your first page</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start glass-prism hover:glass-prism-button transition-all"
                  onClick={() => handleQuickQuestion('How do I manage appointments?')}
                  data-testid="quick-action-appointments"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Manage Appointments</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Accept and organize bookings</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start glass-prism hover:glass-prism-button transition-all"
                  onClick={() => handleQuickQuestion('How do I customize my branding?')}
                  data-testid="quick-action-branding"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Customize Branding</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Match your business style</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start glass-prism hover:glass-prism-button transition-all"
                  onClick={() => setActiveTab('faqs')}
                  data-testid="quick-action-browse-faqs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Browse FAQs</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Find answers by category</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl h-full animate-slide-in-right mobile-no-blur">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass-prism rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                      <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Support Assistant
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ask anything about BookingGen
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {botMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                              : 'glass-prism text-gray-800 dark:text-gray-200'
                          }`}
                          data-testid={`bot-message-${message.type}-${message.id}`}
                        >
                          <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.type === 'user' ? 'opacity-70' : 'opacity-60'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="border-t border-white/10 p-4">
                    <div className="flex gap-2">
                      <Input
                        value={botInput}
                        onChange={(e) => setBotInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleBotSend();
                          }
                        }}
                        placeholder="Ask me anything..."
                        className="flex-1 glass-prism bg-white/5 border-white/20"
                        data-testid="input-bot-message"
                      />
                      <Button
                        onClick={handleBotSend}
                        size="sm"
                        className="glass-prism-button text-white"
                        data-testid="button-send-bot-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SupportBot />
    </div>
  );
}
