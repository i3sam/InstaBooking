import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Scale, ArrowLeft, FileText, Shield, AlertTriangle } from 'lucide-react';

export default function Terms() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using BookingGen's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.",
        "These terms apply to all users of our platform, including visitors, registered users, and paying customers.",
        "If you do not agree with any part of these terms, you must discontinue use of our services immediately."
      ]
    },
    {
      title: "2. Service Description",
      content: [
        "BookingGen provides online booking page creation and management services for businesses and professionals.",
        "Our services include custom booking page design, appointment scheduling, payment processing, and customer management tools.",
        "We reserve the right to modify, suspend, or discontinue any part of our services at any time with reasonable notice."
      ]
    },
    {
      title: "3. User Accounts and Registration",
      content: [
        "You must create an account to access certain features of our platform.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        "You must provide accurate, current, and complete information during registration and keep your account information updated.",
        "You may not share your account with others or allow unauthorized access to your account."
      ]
    },
    {
      title: "4. Acceptable Use Policy",
      content: [
        "You agree to use BookingGen's services only for lawful purposes and in accordance with these Terms.",
        "Prohibited activities include but are not limited to: violating any laws, infringing intellectual property rights, transmitting harmful content, or attempting to gain unauthorized access to our systems.",
        "You may not use our services to create booking pages for illegal services, adult content, or any activities that could harm our reputation.",
        "We reserve the right to suspend or terminate accounts that violate our acceptable use policy."
      ]
    },
    {
      title: "5. Payment Terms",
      content: [
        "Subscription fees are billed in advance on a monthly or annual basis, depending on your chosen plan.",
        "All payments are processed securely through our payment partners and are subject to their terms and conditions.",
        "Fees are non-refundable except as expressly stated in our Refund Policy.",
        "We reserve the right to change our pricing with 30 days' advance notice to existing subscribers."
      ]
    },
    {
      title: "6. Data and Privacy",
      content: [
        "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.",
        "You retain ownership of all content and data you provide through our platform.",
        "By using our services, you grant us a limited license to use your data to provide and improve our services.",
        "We implement appropriate security measures to protect your data, but cannot guarantee absolute security."
      ]
    },
    {
      title: "7. Intellectual Property",
      content: [
        "BookingGen and all related trademarks, logos, and service marks are owned by us or our licensors.",
        "You may not use our intellectual property without our express written permission.",
        "You retain ownership of your custom content, but grant us a license to use it to provide our services.",
        "We respect intellectual property rights and will respond to valid takedown notices."
      ]
    },
    {
      title: "8. Limitation of Liability",
      content: [
        "Our services are provided 'as is' without warranties of any kind, either express or implied.",
        "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.",
        "Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months preceding the claim.",
        "Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability."
      ]
    },
    {
      title: "9. Service Availability",
      content: [
        "We strive to maintain high service availability but cannot guarantee uninterrupted service.",
        "Scheduled maintenance will be announced in advance when possible.",
        "We are not responsible for service interruptions due to circumstances beyond our control.",
        "Service level agreements may be available for enterprise customers."
      ]
    },
    {
      title: "10. Termination",
      content: [
        "You may terminate your account at any time by following the cancellation process in your account settings.",
        "We may terminate or suspend your account for violation of these terms or for any other reason with reasonable notice.",
        "Upon termination, your right to use our services ceases immediately.",
        "Data retention and deletion policies are outlined in our Privacy Policy."
      ]
    },
    {
      title: "11. Changes to Terms",
      content: [
        "We reserve the right to modify these Terms and Conditions at any time.",
        "Significant changes will be communicated to users via email or platform notifications.",
        "Continued use of our services after changes constitutes acceptance of the new terms.",
        "You should review these terms periodically for updates."
      ]
    },
    {
      title: "12. Governing Law and Disputes",
      content: [
        "These terms are governed by and construed in accordance with applicable laws.",
        "Any disputes arising from these terms or use of our services will be resolved through binding arbitration.",
        "Class action lawsuits and jury trials are waived.",
        "If any provision of these terms is deemed invalid, the remaining provisions remain in effect."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms & Conditions | BookingGen" 
        description="Read BookingGen's Terms and Conditions. Understand our service terms, user agreements, and legal policies for using our booking platform."
        ogTitle="Terms & Conditions - BookingGen"
        ogDescription="Complete terms and conditions for using BookingGen's booking platform services."
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
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Terms & Conditions
              </h1>
              <p className="text-xl text-muted-foreground">
                Last updated: September 17, 2025
              </p>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Please read these Terms and Conditions carefully before using BookingGen's services. 
                These terms govern your use of our platform and services.
              </p>
            </div>

            {/* Important Notice */}
            <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      Important Legal Agreement
                    </h3>
                    <p className="text-orange-800 dark:text-orange-200 text-sm">
                      By using BookingGen, you agree to these legally binding terms. If you don't agree 
                      with any part of these terms, please don't use our services. Contact us at 
                      team@bookinggen.xyz if you have questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {section.content.map((paragraph, pIndex) => (
                      <p 
                        key={pIndex} 
                        className="text-muted-foreground leading-relaxed"
                        data-testid={`text-section-${index}-paragraph-${pIndex}`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <div className="max-w-4xl mx-auto mt-12">
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Questions About These Terms?</h3>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setLocation('/contact')}
                    data-testid="button-contact-us"
                  >
                    Contact Us
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/legal')}
                    data-testid="button-legal-center"
                  >
                    Legal Center
                  </Button>
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