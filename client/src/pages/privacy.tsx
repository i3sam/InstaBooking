import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SEO from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  Shield, 
  ArrowLeft, 
  Eye, 
  Lock, 
  UserCheck, 
  Database, 
  Globe, 
  Mail,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function Privacy() {
  const [, setLocation] = useLocation();

  const principles = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "We use industry-standard security measures to protect your personal information"
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We're clear about what data we collect and how we use it"
    },
    {
      icon: UserCheck,
      title: "User Control",
      description: "You have control over your data and can request changes or deletion"
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "Your data is encrypted and stored in secure, compliant facilities"
    }
  ];

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: [
        "Personal Information: When you create an account, we collect your name, email address, and contact details you provide.",
        "Business Information: Details about your business, services, and booking preferences to customize your booking pages.",
        "Billing Information: We collect billing information through secure processors for subscription management. We do not store full credit card details on our servers.",
        "Usage Data: We automatically collect information about how you use our platform, including IP address, browser type, pages visited, and interaction data.",
        "Customer Data: When your clients make bookings, we collect the information they provide, which you control and own."
      ]
    },
    {
      title: "2. How We Use Your Information",
      icon: Globe,
      content: [
        "Service Provision: To provide, maintain, and improve our booking platform services.",
        "Communication: To send important updates, notifications, and respond to your inquiries.",
        "Customization: To personalize your experience and optimize our platform for your needs.",
        "Analytics: To analyze usage patterns and improve our services (using anonymized data when possible).",
        "Legal Compliance: To comply with legal obligations and protect against fraud or abuse.",
        "Marketing: To send promotional materials (only with your consent, and you can opt out anytime)."
      ]
    },
    {
      title: "3. Data Sharing and Disclosure",
      icon: UserCheck,
      content: [
        "We do not sell your personal information to third parties under any circumstances.",
        "Service Providers: We may share data with trusted third-party services that help us operate our platform (hosting, billing services, email services).",
        "Legal Requirements: We may disclose information if required by law, court order, or to protect our rights and safety.",
        "Business Transfers: In the event of a merger or acquisition, user data may be transferred as part of the business assets.",
        "Your Clients: Information you collect through your booking pages is shared with you as the business owner.",
        "With Your Consent: We may share information for other purposes with your explicit consent."
      ]
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: [
        "Encryption: All data transmission is protected using SSL/TLS encryption.",
        "Secure Storage: Data is stored in secure, access-controlled environments with regular security updates.",
        "Access Controls: Only authorized personnel have access to your data, and access is logged and monitored.",
        "Regular Audits: We conduct regular security assessments and vulnerability testing.",
        "Incident Response: We have procedures in place to detect, respond to, and notify users of security incidents.",
        "Industry Standards: Our security practices follow industry standards and compliance requirements."
      ]
    },
    {
      title: "5. Your Rights and Choices",
      icon: Eye,
      content: [
        "Access: You can request access to the personal information we hold about you.",
        "Correction: You can update or correct your personal information through your account settings.",
        "Deletion: You can request deletion of your personal data (subject to legal retention requirements).",
        "Portability: You can request a copy of your data in a portable format.",
        "Objection: You can object to certain types of data processing, including marketing communications.",
        "Restriction: You can request that we restrict the processing of your data in certain circumstances."
      ]
    },
    {
      title: "6. Cookies and Tracking",
      icon: Globe,
      content: [
        "Essential Cookies: We use necessary cookies to operate our platform and maintain your session.",
        "Analytics Cookies: We use analytics tools to understand how our platform is used (you can opt out).",
        "Preference Cookies: We store your settings and preferences to enhance your experience.",
        "Third-party Cookies: Some third-party services we use may set their own cookies.",
        "Cookie Controls: You can manage cookie preferences through your browser settings.",
        "Do Not Track: We respect Do Not Track signals where technically feasible."
      ]
    },
    {
      title: "7. Data Retention",
      icon: Database,
      content: [
        "Account Data: We retain your account information while your account is active.",
        "Booking Data: Customer booking data is retained according to your business needs and legal requirements.",
        "Usage Logs: Technical logs are typically retained for 12 months for security and improvement purposes.",
        "Deleted Data: When you delete your account, we remove or anonymize your personal data within 30 days.",
        "Legal Holds: Some data may be retained longer if required for legal compliance or dispute resolution.",
        "Backup Data: Data in backups is deleted according to our backup retention schedule."
      ]
    },
    {
      title: "8. International Data Transfers",
      icon: Globe,
      content: [
        "Global Services: Our services may involve data transfers to countries outside your location.",
        "Safeguards: We implement appropriate safeguards for international transfers, including standard contractual clauses.",
        "EU-US Privacy Framework: We comply with applicable privacy frameworks for international transfers.",
        "Data Localization: We strive to keep data within appropriate geographical boundaries where required by law."
      ]
    },
    {
      title: "9. Children's Privacy",
      icon: UserCheck,
      content: [
        "Age Restrictions: Our services are not intended for children under 16 years of age.",
        "No Knowing Collection: We do not knowingly collect personal information from children under 16.",
        "Parental Rights: If we become aware of child data collection, we will take steps to remove the information.",
        "Verification: We may implement age verification measures where appropriate."
      ]
    },
    {
      title: "10. Privacy Policy Changes",
      icon: Shield,
      content: [
        "Updates: We may update this Privacy Policy to reflect changes in our practices or legal requirements.",
        "Notification: Significant changes will be communicated via email or prominent platform notices.",
        "Review: We encourage you to review this policy periodically.",
        "Effective Date: Changes become effective on the date specified in the updated policy."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy | BookingGen" 
        description="Learn how BookingGen protects your privacy and handles your personal data. Our comprehensive privacy policy explains data collection, usage, and security measures."
        ogTitle="Privacy Policy - BookingGen"
        ogDescription="Comprehensive privacy policy explaining how BookingGen handles and protects your personal information."
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
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                Last updated: September 17, 2025
              </p>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect 
                your personal information when you use BookingGen.
              </p>
            </div>

            {/* Privacy Commitment */}
            <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Our Privacy Commitment
                    </h3>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      We are committed to protecting your privacy and handling your data responsibly. 
                      We only collect information necessary to provide our services and never sell your personal data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Privacy Principles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {principles.map((principle, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                      <principle.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{principle.title}</h3>
                    <p className="text-muted-foreground text-sm" data-testid={`text-principle-${index}`}>
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                      <section.icon className="h-4 w-4 text-primary" />
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
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Questions About Your Privacy?</h3>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about this Privacy Policy or how we handle your data, 
                  we're here to help. Contact our privacy team directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setLocation('/contact')}
                    data-testid="button-contact-privacy"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/legal')}
                    data-testid="button-back-legal"
                  >
                    Legal Center
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Email us directly at: <span className="font-medium" data-testid="text-privacy-email">team@bookinggen.xyz</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}