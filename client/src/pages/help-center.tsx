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
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Detailed article content with step-by-step guides
  const articleContent = {
    "How to create your first booking page": {
      title: "How to create your first booking page",
      category: "Getting Started",
      readTime: "5 min read",
      content: [
        {
          type: "intro",
          text: "Creating your first booking page with BookingGen is simple and takes just a few minutes. This guide will walk you through every step to get your professional booking page live and ready to accept appointments."
        },
        {
          type: "step",
          number: 1,
          title: "Sign up or log into your account",
          content: "If you haven't already, create your BookingGen account at the signup page. If you already have an account, log in to access your dashboard.",
          tips: ["Use a professional email address for your account", "Choose a strong password for security"]
        },
        {
          type: "step",
          number: 2,
          title: "Access the Page Creator",
          content: "Once logged in, you'll see your dashboard. Look for the 'Create Page' button - it's usually prominently displayed on your dashboard. Click this button to start creating your booking page.",
          tips: ["The Create Page button may be in the top navigation or center of your dashboard"]
        },
        {
          type: "step",
          number: 3,
          title: "Choose your page name and URL",
          content: "Enter a name for your booking page that represents your business or service. This will also determine your unique BookingGen URL (e.g., yourname.bookinggen.com).",
          tips: ["Choose a memorable and professional name", "Keep it short and easy to type", "Avoid special characters or spaces"]
        },
        {
          type: "step",
          number: 4,
          title: "Add your services",
          content: "Define what services you offer. For each service, you'll need to specify the name, duration, and optionally the price and description.",
          tips: ["Be specific with service names", "Set realistic durations including buffer time", "Add descriptions to help clients choose"]
        },
        {
          type: "step",
          number: 5,
          title: "Set your availability",
          content: "Configure when you're available for bookings. Set your working days, hours, and any break times. You can also set buffer times between appointments.",
          tips: ["Be realistic about your availability", "Consider travel time between appointments", "Set buffer times to avoid back-to-back bookings"]
        },
        {
          type: "step",
          number: 6,
          title: "Customize your page appearance",
          content: "Upload your logo, choose your brand colors, and customize the layout to match your brand. This helps create a professional impression.",
          tips: ["Use high-quality images", "Stick to your brand colors", "Keep the design clean and professional"]
        },
        {
          type: "step",
          number: 7,
          title: "Preview and publish",
          content: "Before going live, preview your booking page to make sure everything looks correct. Once satisfied, click 'Publish' to make your page live.",
          tips: ["Test the booking process yourself", "Check on mobile devices", "Share with friends for feedback before going live"]
        },
        {
          type: "conclusion",
          text: "Congratulations! Your booking page is now live and ready to accept appointments. Share your unique URL with clients and start accepting bookings immediately."
        }
      ]
    },
    "Setting up your profile and business information": {
      title: "Setting up your profile and business information",
      category: "Getting Started",
      readTime: "3 min read",
      content: [
        {
          type: "intro",
          text: "A complete profile builds trust with potential clients and provides them with essential information about your business. Here's how to set up your profile properly."
        },
        {
          type: "step",
          number: 1,
          title: "Navigate to Profile Settings",
          content: "From your dashboard, click on 'Settings' or your profile picture in the top right corner, then select 'Profile Settings'.",
          tips: ["Settings may be in the main navigation or dropdown menu"]
        },
        {
          type: "step",
          number: 2,
          title: "Add your professional photo",
          content: "Upload a high-quality, professional headshot or business logo. This will appear on your booking pages and helps clients recognize and trust your brand.",
          tips: ["Use a photo with good lighting", "Smile and look professional", "Ensure the image is high resolution"]
        },
        {
          type: "step",
          number: 3,
          title: "Fill in your business information",
          content: "Complete all relevant fields including your business name, description, contact information, and location. Be thorough as this information helps with SEO and client trust.",
          tips: ["Write a compelling business description", "Include all contact methods", "Add your physical address if relevant"]
        },
        {
          type: "step",
          number: 4,
          title: "Set your timezone",
          content: "Make sure your timezone is set correctly so appointments are scheduled at the right times for both you and your clients.",
          tips: ["Double-check your timezone setting", "Consider daylight saving changes"]
        },
        {
          type: "step",
          number: 5,
          title: "Add social media links",
          content: "Connect your social media profiles to build credibility and allow clients to learn more about your business.",
          tips: ["Only add professional social media accounts", "Ensure your profiles are up-to-date"]
        },
        {
          type: "conclusion",
          text: "A complete profile increases booking conversions by up to 40%. Take time to fill out all sections thoroughly."
        }
      ]
    },
    "Understanding the dashboard layout": {
      title: "Understanding the dashboard layout",
      category: "Getting Started",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Your dashboard is your central hub for managing bookings, viewing analytics, and controlling your booking pages. Here's a complete guide to understanding each section."
        },
        {
          type: "step",
          number: 1,
          title: "Main navigation overview",
          content: "The top navigation bar contains your main menu items: Dashboard, Bookings, Pages, Settings, and your profile. Each section serves a specific purpose for managing your business.",
          tips: ["Bookmark your dashboard for quick access", "Use keyboard shortcuts when available"]
        },
        {
          type: "step",
          number: 2,
          title: "Dashboard overview section",
          content: "The main dashboard shows key metrics like today's bookings, upcoming appointments, recent activity, and quick action buttons for common tasks.",
          tips: ["Check your dashboard daily for updates", "Use quick actions for efficiency"]
        },
        {
          type: "step",
          number: 3,
          title: "Bookings management area",
          content: "The Bookings section shows all your appointments in calendar and list views. You can accept, decline, reschedule, or communicate with clients from here.",
          tips: ["Use calendar view for planning", "Set up notifications for new bookings"]
        },
        {
          type: "step",
          number: 4,
          title: "Pages management",
          content: "View and edit all your booking pages from the Pages section. You can create new pages, modify existing ones, and view page performance.",
          tips: ["Regularly update your page content", "Monitor page performance metrics"]
        },
        {
          type: "step",
          number: 5,
          title: "Settings and customization",
          content: "The Settings area contains all configuration options including profile settings, notification preferences, integrations, and billing information.",
          tips: ["Review settings regularly", "Keep payment information up to date"]
        },
        {
          type: "conclusion",
          text: "Familiarizing yourself with the dashboard layout will help you work more efficiently and make the most of BookingGen's features."
        }
      ]
    },
    "Advanced branding and styling options": {
      title: "Advanced branding and styling options",
      category: "Customization",
      readTime: "6 min read",
      content: [
        {
          type: "intro",
          text: "Take your booking pages to the next level with advanced branding and styling options. Create a seamless brand experience that matches your business perfectly."
        },
        {
          type: "step",
          number: 1,
          title: "Access advanced styling settings",
          content: "From your page editor, look for 'Advanced Styling' or 'Brand Settings'. This is usually found in the customization section of your page editor.",
          tips: ["Pro plans offer more advanced options", "Changes preview in real-time"]
        },
        {
          type: "step",
          number: 2,
          title: "Upload custom logos and images",
          content: "Upload your business logo, favicon, and header images. Use high-resolution images for the best quality across all devices.",
          tips: ["Use PNG format for logos with transparency", "Optimize images for web to reduce loading times"]
        },
        {
          type: "step",
          number: 3,
          title: "Customize color schemes",
          content: "Set your brand colors including primary color, accent colors, button colors, and background colors. Use your brand's color palette for consistency.",
          tips: ["Use a color palette generator for harmony", "Ensure good contrast for accessibility"]
        },
        {
          type: "step",
          number: 4,
          title: "Choose custom fonts",
          content: "Select fonts that match your brand personality. You can choose from Google Fonts or upload custom fonts if available in your plan.",
          tips: ["Limit to 2-3 font families maximum", "Ensure fonts are readable on all devices"]
        },
        {
          type: "step",
          number: 5,
          title: "Design custom layouts",
          content: "Arrange page elements, adjust spacing, and create custom layouts that reflect your brand's style and improve user experience.",
          tips: ["Keep layouts clean and intuitive", "Test on mobile devices"]
        },
        {
          type: "step",
          number: 6,
          title: "Add custom CSS (Pro feature)",
          content: "For ultimate customization, add custom CSS code to style your pages exactly how you want them. This gives you complete design control.",
          tips: ["Test CSS changes thoroughly", "Keep a backup of working CSS code"]
        },
        {
          type: "conclusion",
          text: "Advanced branding creates a professional impression and increases client trust. Spend time perfecting your brand presentation."
        }
      ]
    },
    "Managing subscription and billing": {
      title: "Managing subscription and billing",
      category: "Account Management",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Keep track of your subscription, update payment methods, and manage billing preferences with ease. Here's everything you need to know about managing your BookingGen account billing."
        },
        {
          type: "step",
          number: 1,
          title: "Access billing settings",
          content: "Navigate to Settings > Billing & Subscription from your dashboard. Here you'll find all your billing information and options.",
          tips: ["Bookmark this page for easy access", "Check billing details regularly"]
        },
        {
          type: "step",
          number: 2,
          title: "View current subscription",
          content: "See your current plan, billing cycle, next payment date, and included features. This helps you understand what you're paying for and when.",
          tips: ["Set calendar reminders before renewal dates", "Review feature usage regularly"]
        },
        {
          type: "step",
          number: 3,
          title: "Update payment methods",
          content: "Add, remove, or update credit cards and payment methods. Set a default payment method to ensure uninterrupted service.",
          tips: ["Keep multiple payment methods on file", "Update expiring cards promptly"]
        },
        {
          type: "step",
          number: 4,
          title: "Change subscription plans",
          content: "Upgrade or downgrade your plan based on your current needs. Changes typically take effect at the next billing cycle.",
          tips: ["Compare plan features before changing", "Consider usage patterns when choosing plans"]
        },
        {
          type: "step",
          number: 5,
          title: "Download invoices and receipts",
          content: "Access your billing history, download invoices, and get receipts for tax purposes or expense reporting.",
          tips: ["Save invoices for tax records", "Set up automatic receipt forwarding"]
        },
        {
          type: "step",
          number: 6,
          title: "Manage cancellation if needed",
          content: "If you need to cancel, you can do so from the billing settings. Your account remains active until the end of the current billing period.",
          tips: ["Export your data before canceling", "Consider downgrading instead of canceling"]
        },
        {
          type: "conclusion",
          text: "Proper billing management ensures uninterrupted service and helps you optimize your subscription based on your actual usage."
        }
      ]
    },
    "Understanding your analytics dashboard": {
      title: "Understanding your analytics dashboard",
      category: "Analytics & Reporting",
      readTime: "5 min read",
      content: [
        {
          type: "intro",
          text: "Make data-driven decisions with BookingGen's analytics dashboard. Learn how to interpret your booking data and use insights to grow your business."
        },
        {
          type: "step",
          number: 1,
          title: "Access your analytics dashboard",
          content: "Navigate to Analytics or Reports from your main dashboard. Pro users have access to more detailed analytics and longer data history.",
          tips: ["Check analytics weekly for trends", "Set up regular reporting schedules"]
        },
        {
          type: "step",
          number: 2,
          title: "Understanding key metrics",
          content: "Learn about important metrics like total bookings, conversion rates, popular services, peak booking times, and revenue tracking.",
          tips: ["Focus on trends rather than daily fluctuations", "Compare month-over-month data"]
        },
        {
          type: "step",
          number: 3,
          title: "Analyze booking patterns",
          content: "Identify peak booking days and times, seasonal trends, and popular services. Use this data to optimize your availability and service offerings.",
          tips: ["Adjust availability based on demand", "Promote slow periods with special offers"]
        },
        {
          type: "step",
          number: 4,
          title: "Track conversion rates",
          content: "Monitor how many page visitors actually book appointments. Low conversion rates might indicate issues with pricing, availability, or page design.",
          tips: ["A/B test different page layouts", "Simplify the booking process if conversion is low"]
        },
        {
          type: "step",
          number: 5,
          title: "Monitor revenue and growth",
          content: "Track your booking revenue over time, average booking value, and growth metrics to understand your business performance.",
          tips: ["Set monthly revenue goals", "Track metrics that matter to your business"]
        },
        {
          type: "step",
          number: 6,
          title: "Export and share data",
          content: "Export analytics data for deeper analysis or sharing with team members, accountants, or business partners.",
          tips: ["Regular data exports for record keeping", "Share insights with your team"]
        },
        {
          type: "conclusion",
          text: "Regular analytics review helps you make informed decisions about pricing, services, and business growth strategies."
        }
      ]
    },
    "Basic customization options": {
      title: "Basic customization options",
      category: "Getting Started", 
      readTime: "3 min read",
      content: [
        {
          type: "intro",
          text: "Start personalizing your booking page with these essential customization options. Make your page reflect your brand and improve client experience."
        },
        {
          type: "step",
          number: 1,
          title: "Update your page title and description",
          content: "Give your booking page a clear, professional title and description that explains your services and value proposition.",
          tips: ["Keep titles under 60 characters for SEO", "Write descriptions that convert visitors to bookers"]
        },
        {
          type: "step",
          number: 2,
          title: "Upload your business logo",
          content: "Add your logo to build brand recognition and trust. Your logo appears at the top of your booking page.",
          tips: ["Use PNG format for transparent backgrounds", "Ensure logos are high resolution"]
        },
        {
          type: "step",
          number: 3,
          title: "Choose your brand colors",
          content: "Select primary and secondary colors that match your brand. This affects buttons, headers, and accent colors.",
          tips: ["Use your brand's existing color palette", "Ensure good contrast for readability"]
        },
        {
          type: "step",
          number: 4,
          title: "Set up your contact information",
          content: "Add your phone number, email, and business address so clients can reach you directly if needed.",
          tips: ["Include all relevant contact methods", "Keep information up to date"]
        },
        {
          type: "conclusion",
          text: "These basic customizations create a professional first impression and help build trust with potential clients."
        }
      ]
    },
    "Adding custom fields to booking forms": {
      title: "Adding custom fields to booking forms",
      category: "Customization",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Collect additional information from clients by adding custom fields to your booking forms. This helps you prepare better for appointments and provide personalized service."
        },
        {
          type: "step",
          number: 1,
          title: "Access form customization settings",
          content: "Go to your page editor and look for 'Form Settings' or 'Custom Fields' section. This is where you can add, edit, and manage form fields.",
          tips: ["Changes preview in real-time", "Test forms after making changes"]
        },
        {
          type: "step",
          number: 2,
          title: "Choose field types",
          content: "Select from various field types including text input, dropdown menus, checkboxes, radio buttons, and text areas based on what information you need.",
          tips: ["Use dropdowns for limited options", "Text areas for longer responses"]
        },
        {
          type: "step",
          number: 3,
          title: "Set field properties",
          content: "Configure each field with labels, placeholder text, help text, and validation rules. Mark important fields as required.",
          tips: ["Use clear, specific labels", "Add help text for complex fields"]
        },
        {
          type: "step",
          number: 4,
          title: "Order and organize fields",
          content: "Arrange fields in logical order and group related fields together. This improves user experience and completion rates.",
          tips: ["Put required fields first", "Group related information"]
        },
        {
          type: "conclusion",
          text: "Custom fields help you gather the information needed to provide excellent service while keeping the booking process smooth."
        }
      ]
    },
    "Understanding membership plans": {
      title: "Understanding membership plans",
      category: "Account Management",
      readTime: "3 min read",
      content: [
        {
          type: "intro",
          text: "BookingGen offers different membership plans to suit various business needs. Understanding the features and limitations of each plan helps you choose the right one."
        },
        {
          type: "step",
          number: 1,
          title: "Free Plan features",
          content: "The free plan includes basic booking functionality, one booking page, limited customization, and BookingGen branding. Perfect for trying out the service.",
          tips: ["Great for testing BookingGen", "Limited to basic features"]
        },
        {
          type: "step",
          number: 2,
          title: "Pro Plan benefits",
          content: "Pro plan offers unlimited booking pages, advanced customization, analytics, priority support, custom branding, and removal of BookingGen branding.",
          tips: ["Best value for growing businesses", "All essential features included"]
        },
        {
          type: "step",
          number: 3,
          title: "Enterprise features",
          content: "Enterprise plans include everything in Pro plus team management, advanced integrations, custom development, and dedicated support.",
          tips: ["Contact sales for custom pricing", "Ideal for large organizations"]
        },
        {
          type: "step",
          number: 4,
          title: "Choosing the right plan",
          content: "Consider your booking volume, customization needs, team size, and required integrations when selecting a plan.",
          tips: ["Start with Pro for most businesses", "Upgrade as you grow"]
        },
        {
          type: "conclusion",
          text: "The right plan balances features and cost based on your current needs while allowing room for growth."
        }
      ]
    },
    "Booking conversion metrics": {
      title: "Booking conversion metrics",
      category: "Analytics & Reporting",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Understanding your booking conversion metrics helps identify areas for improvement and optimize your booking pages for better performance."
        },
        {
          type: "step",
          number: 1,
          title: "Understanding conversion rate",
          content: "Conversion rate is the percentage of page visitors who complete a booking. Industry average is typically 2-5% for service businesses.",
          tips: ["Track trends over time", "Compare different pages if you have multiple"]
        },
        {
          type: "step",
          number: 2,
          title: "Identifying conversion factors",
          content: "Factors affecting conversion include page load speed, service descriptions, pricing clarity, availability display, and booking process complexity.",
          tips: ["Test page speed regularly", "Simplify the booking process"]
        },
        {
          type: "step",
          number: 3,
          title: "Tracking abandonment points",
          content: "Identify where potential clients leave the booking process. Common abandonment points include pricing reveal, form filling, and payment processing.",
          tips: ["Address common objections upfront", "Minimize required form fields"]
        },
        {
          type: "step",
          number: 4,
          title: "Improving conversion rates",
          content: "Optimize by improving page speed, clarifying services, displaying social proof, simplifying forms, and testing different layouts.",
          tips: ["A/B test major changes", "Focus on high-impact improvements first"]
        },
        {
          type: "conclusion",
          text: "Regular conversion analysis and optimization can significantly increase your booking rates and business growth."
        }
      ]
    },
    "Setting up booking time slots": {
      title: "Setting up booking time slots",
      category: "Customization",
      readTime: "5 min read",
      content: [
        {
          type: "intro",
          text: "Configure precise time slots for your services to manage your schedule efficiently and provide clear availability to clients."
        },
        {
          type: "step",
          number: 1,
          title: "Access time slot settings",
          content: "Navigate to your page editor and find 'Time Slots' or 'Scheduling Settings'. This is where you'll configure when clients can book appointments.",
          tips: ["Changes may take a few minutes to reflect on your live page", "Test different configurations"]
        },
        {
          type: "step",
          number: 2,
          title: "Set service duration",
          content: "Define how long each service takes. This determines the length of each booking slot and spacing between appointments.",
          tips: ["Include setup and cleanup time", "Consider travel time for mobile services"]
        },
        {
          type: "step",
          number: 3,
          title: "Configure buffer times",
          content: "Add buffer time before and after appointments to prevent back-to-back bookings and allow for preparation or travel.",
          tips: ["15-30 minutes is common for most services", "Adjust based on your specific needs"]
        },
        {
          type: "step",
          number: 4,
          title: "Set working hours",
          content: "Define your daily working hours for each day of the week. Clients can only book appointments during these times.",
          tips: ["Be realistic about your availability", "Consider peak demand times"]
        },
        {
          type: "step",
          number: 5,
          title: "Handle breaks and lunch times",
          content: "Block out time for breaks, lunch, and administrative tasks to ensure a manageable schedule.",
          tips: ["Schedule breaks during low-demand periods", "Block time for follow-ups and prep"]
        },
        {
          type: "step",
          number: 6,
          title: "Preview and test",
          content: "Preview your booking page to see how time slots appear to clients. Test the booking process to ensure it works as expected.",
          tips: ["Check on mobile devices too", "Ask friends to test the process"]
        },
        {
          type: "conclusion",
          text: "Well-configured time slots improve client experience and help you maintain a balanced, efficient schedule."
        }
      ]
    },
    "Managing booking availability": {
      title: "Managing booking availability",
      category: "Customization",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Take control of your schedule by managing when clients can and cannot book appointments. This includes handling vacations, busy periods, and special availability."
        },
        {
          type: "step",
          number: 1,
          title: "Access availability settings",
          content: "Go to your dashboard and look for 'Availability', 'Schedule', or 'Calendar Settings'. This is your central hub for managing when you're available.",
          tips: ["Bookmark this page for quick access", "Check settings regularly"]
        },
        {
          type: "step",
          number: 2,
          title: "Set default availability",
          content: "Configure your standard working hours and days. This becomes your default schedule that applies unless you make specific overrides.",
          tips: ["Be consistent with your standard hours", "Consider client preferences for timing"]
        },
        {
          type: "step",
          number: 3,
          title: "Block unavailable dates",
          content: "Mark dates when you're unavailable due to vacations, holidays, or other commitments. Clients won't be able to book during these periods.",
          tips: ["Block dates as early as possible", "Consider partial day blocks for appointments"]
        },
        {
          type: "step",
          number: 4,
          title: "Add special availability",
          content: "Create exceptions for special hours, extended availability, or one-time availability outside your normal schedule.",
          tips: ["Useful for special events or high-demand periods", "Clear exceptions after the special period"]
        },
        {
          type: "step",
          number: 5,
          title: "Set booking windows",
          content: "Define how far in advance clients can book and any minimum notice required for bookings.",
          tips: ["Consider your preparation time needs", "Balance convenience with planning time"]
        },
        {
          type: "step",
          number: 6,
          title: "Monitor and adjust",
          content: "Regularly review your availability settings and adjust based on booking patterns, seasonal changes, or business needs.",
          tips: ["Track which times get booked most", "Adjust availability based on demand"]
        },
        {
          type: "conclusion",
          text: "Active availability management helps maintain work-life balance while maximizing booking opportunities."
        }
      ]
    },
    "Updating your account information": {
      title: "Updating your account information",
      category: "Account Management",
      readTime: "3 min read",
      content: [
        {
          type: "intro",
          text: "Keep your account information current to ensure smooth service delivery, proper communication, and accurate business representation."
        },
        {
          type: "step",
          number: 1,
          title: "Access account settings",
          content: "Click on your profile picture or name in the top right corner, then select 'Account Settings' or 'Profile' from the dropdown menu.",
          tips: ["Settings may also be accessible from the main navigation", "Keep this information updated monthly"]
        },
        {
          type: "step",
          number: 2,
          title: "Update personal information",
          content: "Review and update your name, email address, phone number, and other personal details. Ensure all information is current and accurate.",
          tips: ["Use a professional email address", "Keep contact information up to date"]
        },
        {
          type: "step",
          number: 3,
          title: "Modify business details",
          content: "Update your business name, description, address, and other business-related information that appears on your booking pages.",
          tips: ["Keep business description compelling and current", "Update address if you move locations"]
        },
        {
          type: "step",
          number: 4,
          title: "Review timezone settings",
          content: "Verify your timezone is correct, especially if you've moved or if daylight saving time has changed. This affects all booking times.",
          tips: ["Double-check during daylight saving changes", "Consider client timezones for online services"]
        },
        {
          type: "step",
          number: 5,
          title: "Update notification preferences",
          content: "Configure how and when you want to receive notifications about new bookings, cancellations, and other important updates.",
          tips: ["Enable critical notifications", "Customize frequency to avoid overload"]
        },
        {
          type: "conclusion",
          text: "Regular account updates ensure accurate communication and professional presentation to your clients."
        }
      ]
    },
    "Account security settings": {
      title: "Account security settings",
      category: "Account Management",
      readTime: "4 min read",
      content: [
        {
          type: "intro",
          text: "Protect your BookingGen account and client data with proper security settings. Strong security builds trust and protects your business."
        },
        {
          type: "step",
          number: 1,
          title: "Update your password",
          content: "Use a strong, unique password for your BookingGen account. Consider using a password manager to generate and store secure passwords.",
          tips: ["Use at least 12 characters with mixed case, numbers, and symbols", "Change passwords periodically"]
        },
        {
          type: "step",
          number: 2,
          title: "Enable two-factor authentication",
          content: "Add an extra layer of security by enabling 2FA. This requires a second verification step when logging in from new devices.",
          tips: ["Use authenticator apps rather than SMS when possible", "Save backup codes securely"]
        },
        {
          type: "step",
          number: 3,
          title: "Review login activity",
          content: "Regularly check your account's login history to identify any suspicious activity or unauthorized access attempts.",
          tips: ["Log out from unfamiliar devices", "Report suspicious activity immediately"]
        },
        {
          type: "step",
          number: 4,
          title: "Manage connected devices",
          content: "Review and manage devices that have access to your account. Remove access from devices you no longer use or recognize.",
          tips: ["Regularly audit connected devices", "Remove old or unused device access"]
        },
        {
          type: "step",
          number: 5,
          title: "Set up security alerts",
          content: "Configure alerts for important security events like password changes, new device logins, or account modifications.",
          tips: ["Enable immediate alerts for critical changes", "Use a secure email for alerts"]
        },
        {
          type: "step",
          number: 6,
          title: "Regular security checkups",
          content: "Periodically review all security settings and update them as needed. Stay informed about security best practices.",
          tips: ["Schedule monthly security reviews", "Keep recovery information current"]
        },
        {
          type: "conclusion",
          text: "Strong account security protects your business data and maintains client trust in your professional services."
        }
      ]
    },
    "Customer engagement insights": {
      title: "Customer engagement insights",
      category: "Analytics & Reporting",
      readTime: "5 min read",
      content: [
        {
          type: "intro",
          text: "Understand how clients interact with your booking pages and use these insights to improve engagement and increase bookings."
        },
        {
          type: "step",
          number: 1,
          title: "Access engagement analytics",
          content: "Navigate to your analytics dashboard and look for the 'Engagement' or 'Client Insights' section to view detailed interaction data.",
          tips: ["Pro plans offer more detailed engagement data", "Check analytics weekly for trends"]
        },
        {
          type: "step",
          number: 2,
          title: "Analyze page interaction patterns",
          content: "Review how visitors navigate your booking page, which sections they spend time on, and where they typically exit.",
          tips: ["Look for patterns in user behavior", "Identify popular and ignored sections"]
        },
        {
          type: "step",
          number: 3,
          title: "Track service popularity",
          content: "Identify which services get the most views and bookings. This helps you understand client preferences and adjust your offerings.",
          tips: ["Promote popular services more prominently", "Consider why some services get less attention"]
        },
        {
          type: "step",
          number: 4,
          title: "Monitor time-based engagement",
          content: "Analyze when clients are most active on your booking page and when they're most likely to complete bookings.",
          tips: ["Adjust your availability based on high-engagement times", "Send marketing during peak activity periods"]
        },
        {
          type: "step",
          number: 5,
          title: "Evaluate content effectiveness",
          content: "Assess how well your service descriptions, images, and other content engage visitors and encourage bookings.",
          tips: ["Update content that doesn't perform well", "A/B test different descriptions"]
        },
        {
          type: "step",
          number: 6,
          title: "Implement improvements",
          content: "Use engagement insights to make data-driven improvements to your booking page layout, content, and service offerings.",
          tips: ["Make gradual changes and measure impact", "Focus on high-impact improvements first"]
        },
        {
          type: "conclusion",
          text: "Regular engagement analysis helps you optimize your booking experience and increase client satisfaction and conversions."
        }
      ]
    },
    "Exporting booking data": {
      title: "Exporting booking data",
      category: "Analytics & Reporting",
      readTime: "3 min read",
      content: [
        {
          type: "intro",
          text: "Export your booking data for deeper analysis, record keeping, tax purposes, or integration with other business tools."
        },
        {
          type: "step",
          number: 1,
          title: "Access export features",
          content: "Go to your analytics or reports section and look for 'Export Data', 'Download Reports', or similar options.",
          tips: ["Export capabilities may vary by plan level", "Pro plans typically offer more export options"]
        },
        {
          type: "step",
          number: 2,
          title: "Choose export format",
          content: "Select the appropriate format for your needs: CSV for spreadsheets, PDF for reports, or JSON for technical integrations.",
          tips: ["CSV is most versatile for analysis", "PDF is best for sharing reports"]
        },
        {
          type: "step",
          number: 3,
          title: "Set date ranges",
          content: "Specify the time period for your export. You can export data for specific months, quarters, or custom date ranges.",
          tips: ["Export regularly for backup purposes", "Match date ranges to your reporting periods"]
        },
        {
          type: "step",
          number: 4,
          title: "Select data fields",
          content: "Choose which information to include: booking details, client information, service data, payment information, etc.",
          tips: ["Include relevant fields for your analysis", "Be mindful of client privacy when sharing data"]
        },
        {
          type: "step",
          number: 5,
          title: "Download and organize",
          content: "Download your exported data and organize it properly. Create a consistent naming convention and storage system.",
          tips: ["Use descriptive file names with dates", "Store exports securely"]
        },
        {
          type: "step",
          number: 6,
          title: "Analyze and utilize",
          content: "Use exported data for business analysis, accounting, tax preparation, or integration with other business tools and systems.",
          tips: ["Regular exports help with business planning", "Consider automated export options if available"]
        },
        {
          type: "conclusion",
          text: "Regular data exports provide valuable insights and ensure you have complete records for business management and compliance."
        }
      ]
    }
  };

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of BookingGen",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      articles: [
        { title: "How to create your first booking page", id: "create-booking-page" },
        { title: "Setting up your profile and business information", id: "setup-profile" },
        { title: "Understanding the dashboard layout", id: "dashboard-layout" },
        { title: "Basic customization options", id: "basic-customization" }
      ]
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Customize your booking pages",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      articles: [
        { title: "Advanced branding and styling options", id: "advanced-branding" },
        { title: "Adding custom fields to booking forms", id: "custom-fields" },
        { title: "Setting up booking time slots", id: "time-slots" },
        { title: "Managing booking availability", id: "booking-availability" }
      ]
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Manage your account settings",
      color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      articles: [
        { title: "Updating your account information", id: "update-account" },
        { title: "Managing subscription and billing", id: "subscription-billing" },
        { title: "Understanding membership plans", id: "membership-plans" },
        { title: "Account security settings", id: "security-settings" }
      ]
    },
    {
      icon: Monitor,
      title: "Analytics & Reporting",
      description: "Track your booking performance",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      articles: [
        { title: "Understanding your analytics dashboard", id: "analytics-dashboard" },
        { title: "Booking conversion metrics", id: "conversion-metrics" },
        { title: "Customer engagement insights", id: "engagement-insights" },
        { title: "Exporting booking data", id: "export-data" }
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

  // Article display component
  const ArticleView = ({ articleKey }: { articleKey: string }) => {
    const article = (articleContent as any)[articleKey];
    if (!article) return null;

    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title={`${article.title} | Help Center - BookingGen`}
          description={article.content[0]?.text || `Learn about ${article.title.toLowerCase()}`}
          ogTitle={`${article.title} - BookingGen Help`}
          ogDescription={article.content[0]?.text || `Complete guide for ${article.title.toLowerCase()}`}
        />
        <Header />
        
        {/* Article Header */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedArticle(null)}
                className="mb-6"
                data-testid="button-back-to-help-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
              
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-4">
                  {article.category}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center text-muted-foreground mb-8">
                <Clock className="h-4 w-4 mr-2" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {article.content.map((section: any, index: number) => {
                  if (section.type === 'intro') {
                    return (
                      <div key={index} className="text-xl text-muted-foreground mb-8 p-6 bg-muted/30 rounded-lg">
                        {section.text}
                      </div>
                    );
                  }
                  
                  if (section.type === 'step') {
                    return (
                      <Card key={index} className="mb-6">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                              {section.number}
                            </div>
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground mb-4">{section.content}</p>
                          {section.tips && section.tips.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Pro Tips
                              </h4>
                              <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                {section.tips.map((tip: string, tipIndex: number) => (
                                  <li key={tipIndex}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  if (section.type === 'conclusion') {
                    return (
                      <div key={index} className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-8">
                        <div className="flex items-start">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Summary</h4>
                            <p className="text-green-800 dark:text-green-200">{section.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              {/* Related Articles */}
              <div className="mt-12 p-6 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Need more help?</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/contact')}
                    data-testid="button-contact-from-article"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedArticle(null)}
                    data-testid="button-browse-more-articles"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse More Articles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  };

  // Main help center view
  if (selectedArticle) {
    return <ArticleView articleKey={selectedArticle} />;
  }

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
                        <div 
                          key={articleIndex} 
                          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          onClick={() => setSelectedArticle(article.title)}
                          data-testid={`article-link-${article.id}`}
                        >
                          <ChevronRight className="h-4 w-4 mr-2" />
                          {article.title}
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