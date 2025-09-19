import { CalendarDays } from 'lucide-react';
import { Link } from 'wouter';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features', isSection: true },
      { name: 'Pricing', href: '/pricing', isSection: false },
      { name: 'How It Works', href: '/#how-it-works', isSection: true },
    ],
    support: [
      { name: 'Legal & Support', href: '/legal' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cancellation & Refunds', href: '/refunds' },
      { name: 'Contact Us', href: '/contact' },
    ],
  };


  return (
    <footer className="bg-muted/50 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BookingGen</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Create beautiful booking pages that convert visitors into customers.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  {link.isSection ? (
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="text-muted-foreground">
              <span data-testid="connect-coming-soon">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 BookingGen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
