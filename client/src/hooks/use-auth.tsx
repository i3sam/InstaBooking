import { useState, useEffect, createContext, useContext } from 'react';
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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // If Supabase is not available, just set loading to false
      console.warn('Supabase not available, skipping authentication');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
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
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
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
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await apiRequest('GET', `/api/profile?userId=${userId}`);
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Don't logout on profile fetch failure
    }
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication not available');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      throw new Error('Authentication not available');
    }
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
    if (!supabase) {
      throw new Error('Authentication not available');
    }
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
    if (!supabase) {
      throw new Error('Authentication not available');
    }
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