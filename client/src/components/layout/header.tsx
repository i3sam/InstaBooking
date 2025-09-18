import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { CalendarDays, Menu, X } from 'lucide-react';

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Solution', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setLocation(href);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="floating-glass-header-container">
      <header className="floating-glass-header">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setLocation('/')}
              data-testid="logo"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BookingGen</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="nav-link-animated text-muted-foreground hover:text-foreground font-medium text-[15px]"
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  {item.name}
                </button>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost"
                    onClick={() => setLocation('/dashboard')}
                    data-testid="nav-dashboard"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={logout}
                    data-testid="nav-logout"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost"
                    onClick={() => setLocation('/login')}
                    data-testid="nav-login"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => setLocation('/signup')}
                    className="glass-prism-button px-6 py-2 rounded-full font-semibold text-[15px]"
                    data-testid="nav-signup"
                  >
                    Start for Free
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="text-left text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.name}
                  </button>
                ))}
                
                {user ? (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setLocation('/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                      data-testid="mobile-nav-dashboard"
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                      data-testid="mobile-nav-logout"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setLocation('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                      data-testid="mobile-nav-login"
                    >
                      Login
                    </Button>
                    <Button 
                      onClick={() => {
                        setLocation('/signup');
                        setMobileMenuOpen(false);
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 justify-start rounded-full font-semibold"
                      data-testid="mobile-nav-signup"
                    >
                      Start for Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
