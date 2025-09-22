import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { apiRequest, setAuthHandler } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface Profile {
  id: string;
  fullName?: string;
  membershipStatus: string;
  membershipPlan?: string;
  membershipExpires?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Track auth error handling to prevent duplicate calls
  const authErrorRef = useRef(false);
  
  // Handle global 401 errors by logging out and redirecting to login
  const handleAuthError = async () => {
    // Debounce to prevent multiple simultaneous calls
    if (authErrorRef.current) {
      return;
    }
    authErrorRef.current = true;
    
    console.log('Authentication error detected, logging out...');
    // Clear local state immediately
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Redirect to login if not already there
    if (location !== '/login' && location !== '/' && location !== '/signup') {
      setRedirectAfterLogin(location);
      setLocation('/login');
    }
    
    // Reset the debounce flag after a short delay
    setTimeout(() => {
      authErrorRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    // Set up global auth error handler for 401 responses
    setAuthHandler(handleAuthError);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      if (session?.user) {
        // Store Supabase token for API calls
        localStorage.setItem('token', session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name
        });
        fetchProfile(session.user.id);
      } else {
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      
      if (session?.user) {
        // Store Supabase token for API calls
        localStorage.setItem('token', session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name
        });
        
        // Create profile if this is a new signup verification
        if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            // If profile doesn't exist, create it
            try {
              await apiRequest('POST', '/api/profile', {
                userId: session.user.id,
                fullName: session.user.user_metadata?.full_name || '',
              });
              await fetchProfile(session.user.id);
            } catch (createError) {
              console.error('Failed to create profile after email verification:', createError);
            }
          }
        } else {
          fetchProfile(session.user.id);
        }
        
        // Handle redirect after successful login
        // Don't redirect if user is on reset password page (they came from email link)
        if (redirectAfterLogin && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && location !== '/reset-password') {
          setTimeout(() => {
            setLocation(redirectAfterLogin);
            setRedirectAfterLogin(null);
          }, 100);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [redirectAfterLogin, setLocation, location]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await apiRequest('GET', '/api/profile');
      
      if (!response.ok) {
        // If profile doesn't exist (404), throw to trigger creation
        if (response.status === 404) {
          throw new Error('Profile not found');
        }
        // For other errors, set fallback profile
        console.error('Failed to fetch profile:', response.status);
        setProfile({
          id: userId,
          fullName: session?.user?.user_metadata?.full_name || '',
          membershipStatus: 'free',
          membershipPlan: undefined,
          membershipExpires: undefined
        });
        return;
      }
      
      const profileData = await response.json();
      setProfile(profileData);
      console.log('Profile fetched successfully:', profileData);
    } catch (error) {
      // Re-throw 404 errors to allow profile creation
      if (error instanceof Error && error.message === 'Profile not found') {
        throw error;
      }
      
      console.error('Failed to fetch profile:', error);
      // Set a default profile for network/server errors
      setProfile({
        id: userId,
        fullName: session?.user?.user_metadata?.full_name || '',
        membershipStatus: 'free',
        membershipPlan: undefined,
        membershipExpires: undefined
      });
    }
  };

  const login = async (email: string, password: string, redirectTo: string = '/dashboard') => {
    // Only set redirectAfterLogin if it's not already set (preserve auth handler's redirect)
    if (!redirectAfterLogin) {
      setRedirectAfterLogin(redirectTo);
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setRedirectAfterLogin(null);
      throw new Error(error.message);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if email confirmation is needed
    const needsEmailConfirmation = !data.session && data.user && !data.user.email_confirmed_at;

    // Create profile in our database only if user is immediately confirmed
    if (data.user && data.session) {
      try {
        await apiRequest('POST', '/api/profile', {
          userId: data.user.id,
          fullName: fullName,
        });
      } catch (error) {
        console.error('Failed to create profile:', error);
      }
    }

    return { needsEmailConfirmation: !!needsEmailConfirmation };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      login, 
      signup, 
      signInWithGoogle, 
      resetPassword, 
      resendConfirmation, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}