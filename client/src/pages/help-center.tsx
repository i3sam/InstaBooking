import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Settings, 
  Users, 
  CreditCard,
  Shield,
  Mail,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';

export default function HelpCenter() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of BookingGen",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      articles: [
        "How to create your first booking page",
        "Setting up your profile and business information",
        "Understanding the dashboard layout",
        "Basic customization options"
      ]
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Customize your booking pages",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      articles: [
        "Advanced branding and styling options",
        "Adding custom fields to booking forms",
        "Setting up booking time slots",
        "Managing booking availability"
      ]
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Manage your account settings",
      color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      articles: [
        "Updating your account information",
        "Managing subscription and billing",
        "Understanding membership plans",
        "Account security settings"
      ]
    },
    {
      icon: Monitor,
      title: "Analytics & Reporting",
      description: "Track your booking performance",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      articles: [
        "Understanding your analytics dashboard",
        "Booking conversion metrics",
        "Customer engagement insights",
        "Exporting booking data"
      ]
    }
  ];

  const commonQuestions = [
    {
      question: "How do I create my first booking page?",
      answer: "To create your first booking page, log into your dashboard and click 'Create Page'. You'll be guided through setting up your services, availability, and customizing the look and feel of your booking page.",
      category: "Getting Started"
    },
    {
      question: "Can I customize the appearance of my booking page?",
      answer: "Yes! BookingGen offers extensive customization options including custom branding, colors, fonts, and layout options. Pro users have access to advanced styling features.",
      category: "Customization"
    },
    {
      question: "How do I manage my booking availability?",
      answer: "In your dashboard, go to 'Settings' and then 'Availability'. Here you can set your working hours, block out unavailable times, and set buffer times between bookings.",
      category: "Customization"
    },
    {
      question: "What's included in the Pro plan?",
      answer: "The Pro plan includes unlimited booking pages, advanced customization options, analytics dashboard, priority support, custom branding, and removal of BookingGen branding.",
      category: "Account Management"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from your account settings. Go to 'Billing & Subscription' and click 'Cancel Subscription'. Your account will remain active until the end of your current billing period.",
      category: "Account Management"
    },
    {
      question: "How can I track my booking performance?",
      answer: "Pro users have access to a comprehensive analytics dashboard showing booking conversion rates, customer engagement, popular time slots, and more detailed insights about their booking pages.",
      category: "Analytics & Reporting"
    }
  ];

  const quickActions = [
    {
      icon: FileText,
      title: "User Guide",
      description: "Complete step-by-step documentation",
      action: () => setLocation('/legal')
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Send us a message for personalized help",
      action: () => setLocation('/contact')
    },
    {
      icon: AlertCircle,
      title: "Report a Bug",
      description: "Help us improve by reporting issues",
      action: () => setLocation('/report-bug')
    },
    {
      icon: HelpCircle,
      title: "Request a Feature",
      description: "Suggest new features for BookingGen",
      action: () => setLocation('/request-feature')
    }
  ];

  const filteredQuestions = commonQuestions.filter(q => 
    searchTerm === '' || 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Help Center | BookingGen" 
        description="Find answers to common questions, browse comprehensive guides, and get the help you need to make the most of BookingGen's booking page platform."
        ogTitle="BookingGen Help Center - Self-Service Support"
        ogDescription="Get instant help with BookingGen. Browse our knowledge base, read step-by-step guides, and find solutions to common questions."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/legal')}
              className="mb-6"
              data-testid="button-back-to-legal"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legal & Support
            </Button>
            
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to your questions and learn how to make the most of BookingGen
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                className="pl-12 pr-4 py-6 text-lg rounded-2xl border-2 border-border focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-help"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                      <action.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.articles.slice(0, 3).map((article, articleIndex) => (
                        <div key={articleIndex} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          {article}
                        </div>
                      ))}
                      <div className="pt-2">
                        <span className="text-xs text-primary cursor-pointer hover:underline">
                          View all {category.articles.length} articles
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {searchTerm ? `Search Results (${filteredQuestions.length})` : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-4">
              {filteredQuestions.map((qa, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                        <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{qa.question}</h3>
                        <p className="text-muted-foreground mb-3">{qa.answer}</p>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {qa.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredQuestions.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any articles matching "{searchTerm}". Try a different search term or browse our categories above.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')} data-testid="button-clear-search">
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Help */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                onClick={() => setLocation('/contact')}
                data-testid="button-contact-support"
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setLocation('/report-bug')}
                data-testid="button-report-bug"
                className="flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Report a Bug
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Average response time: 24-48 hours
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}