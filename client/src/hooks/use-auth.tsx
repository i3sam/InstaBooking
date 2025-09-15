import { useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { apiRequest } from '@/lib/queryClient';

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
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        
        // Handle redirect after successful login
        if (redirectAfterLogin && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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
  }, [redirectAfterLogin, setLocation]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await apiRequest('GET', '/api/profile');
      const profileData = await response.json();
      setProfile(profileData);
      console.log('Profile fetched successfully:', profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Set a default profile to unblock the UI if server is completely down
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
    setRedirectAfterLogin(redirectTo);
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
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Create profile in our database
    if (data.user) {
      try {
        await apiRequest('POST', '/api/profile', {
          userId: data.user.id,
          fullName: fullName,
        });
      } catch (error) {
        console.error('Failed to create profile:', error);
      }
    }
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