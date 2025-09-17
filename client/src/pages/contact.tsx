import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Clock, 
  MapPin,
  Phone,
  Users,
  HeadphonesIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['general', 'technical', 'billing', 'feature', 'bug', 'refund'])
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    }
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help from our support team",
      contact: "team@bookinggen.xyz",
      response: "We typically respond within 24-48 hours",
      action: () => window.open('mailto:team@bookinggen.xyz', '_blank')
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available in your dashboard",
      response: "Instant response during business hours",
      action: () => setLocation('/dashboard')
    },
    {
      icon: HeadphonesIcon,
      title: "Priority Support",
      description: "Dedicated support for Pro subscribers",
      contact: "Available for Pro users",
      response: "Priority queue with faster response times",
      action: () => setLocation('/pricing')
    }
  ];

  const supportCategories = [
    { value: 'general', label: 'General Questions' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Account' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'refund', label: 'Refund Request' }
  ];

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate form submission - in a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24-48 hours.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly at team@bookinggen.xyz",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact Us | BookingGen" 
        description="Get help from BookingGen's support team. Contact us via email, live chat, or our contact form. We respond within 24-48 hours to all inquiries."
        ogTitle="Contact BookingGen Support"
        ogDescription="Contact BookingGen's support team for help with your booking platform. Multiple support options available."
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/legal')}
              className="mb-6"
              data-testid="button-back-to-legal"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Legal & Support
            </Button>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions, need support, or want to share feedback? We're here to help! 
                Reach out to our team and we'll get back to you quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium" data-testid={`text-contact-method-${index}`}>
                          {method.contact}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{method.response}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={method.action}
                      className="w-full"
                      data-testid={`button-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Send us a Message</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                data-testid="input-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your@email.com"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief description of your inquiry"
                              data-testid="input-subject"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide as much detail as possible about your question or issue..."
                              className="min-h-[120px]"
                              data-testid="textarea-message"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">What happens next?</p>
                        <p className="text-muted-foreground">
                          We'll review your message and respond within 24-48 hours. For urgent issues, 
                          please email us directly at{' '}
                          <span className="font-medium text-primary">team@bookinggen.xyz</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-send-message"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Direct Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Direct Contact</h3>
                  <p className="text-muted-foreground">
                    Prefer to reach out directly? Here's how to contact our team.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-3">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Email Us</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Send us an email anytime
                    </p>
                    <a 
                      href="mailto:team@bookinggen.xyz" 
                      className="text-primary hover:underline font-medium"
                      data-testid="link-email-direct"
                    >
                      team@bookinggen.xyz
                    </a>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Response Time</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      We aim to respond to all inquiries
                    </p>
                    <p className="text-primary font-medium">Within 24-48 hours</p>
                  </div>
                </div>

                <div className="text-center mt-8 pt-8 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Need immediate help?</span>
                  </div>
                  <p className="text-sm">
                    For urgent technical issues, include "URGENT" in your subject line to prioritize your request.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}