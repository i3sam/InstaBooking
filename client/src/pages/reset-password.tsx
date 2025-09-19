import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Home, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if we have a valid session for password reset
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        setLocation('/login');
      }
    });
  }, [setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });

      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              onClick={() => setLocation('/login')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-lg"
              data-testid="button-back-login"
            >
              <Home className="h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 glass-prism rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">BookingGen</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Reset your password</h1>
            <p className="text-muted-foreground">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-foreground font-medium">New Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
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
            
            <div>
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                  data-testid="input-confirm-password"
                  className="glass-input pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="glass-prism backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-sm">
                  {formData.password.length >= 6 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-400 rounded-full" />
                  )}
                  <span className={formData.password.length >= 6 ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                    At least 6 characters
                  </span>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-sm mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-400 rounded-full" />
                    )}
                    <span className={formData.password === formData.confirmPassword ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-12 glass-prism-button px-6 py-2 rounded-full font-semibold text-[15px] shadow-md"
              disabled={loading || formData.password !== formData.confirmPassword || formData.password.length < 6}
              data-testid="button-update-password"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}