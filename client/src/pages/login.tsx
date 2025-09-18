import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Home, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password, '/dashboard');
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      // Redirect is now handled by the auth context
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Note: Supabase OAuth will handle the redirect, so no need to manually redirect
    } catch (error) {
      toast({
        title: "Google Sign In failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Glass Prism Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 bg-overlay"></div>
      <div className="absolute top-10 left-10 w-72 h-72 glass-prism rounded-full opacity-30 animate-float bg-overlay"></div>
      <div className="absolute top-32 right-20 w-96 h-96 glass-prism rounded-full opacity-20 animate-float bg-overlay" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-20 left-1/3 w-48 h-48 glass-prism rounded-full opacity-25 animate-float bg-overlay" style={{animationDelay: '3s'}}></div>
      
      <div className="relative flex items-center justify-center min-h-screen p-6 content-layer">
        <div className="w-full max-w-md glass-prism-card rounded-3xl p-8 hover-lift animate-fade-in-up">
          <div className="flex justify-start mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-lg"
              data-testid="button-back-home"
            >
              <Home className="h-4 w-4" />
              <span>Back to Homepage</span>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 glass-prism rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">BookingGen</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your BookingGen account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                data-testid="input-email"
                className="glass-input mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  data-testid="input-password"
                  className="glass-input pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remember: !!checked }))}
                />
                <Label htmlFor="remember" className="text-sm text-foreground">Remember me</Label>
              </div>
              <Button variant="link" className="text-sm p-0 text-primary hover:text-primary/80">
                Forgot password?
              </Button>
            </div>
            
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-12 glass-prism-button px-6 py-2 rounded-full font-semibold text-[15px] shadow-md"
              disabled={loading}
              data-testid="button-sign-in"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/5 backdrop-blur-sm text-muted-foreground rounded-full">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              className="w-full h-12 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-full"
              onClick={handleGoogleSignIn}
              data-testid="button-google-signin"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 text-primary hover:text-primary/80 font-medium"
                onClick={() => setLocation('/signup')}
                data-testid="link-signup"
              >
                Sign up
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}