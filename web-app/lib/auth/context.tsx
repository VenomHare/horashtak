'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { User as CustomUser } from '@/lib/db/schema';

interface AuthContextType {
  user: User | null;
  customUser: CustomUser | null;
  loading: boolean;
  customUserLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [customUserLoading, setCustomUserLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      console.log('Auth context: Getting user');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth context: Supabase user:', user);
      setUser(user);

      if (user) {
        // Fetch custom user data
        console.log('Auth context: Fetching custom user data');
        setCustomUserLoading(true);
        const response = await fetch('/api/auth/user');
        console.log('Auth context: Custom user response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('Auth context: Custom user data:', userData);
          setCustomUser(userData);
        } else {
          const error = await response.json();
          console.error('Auth context: Failed to fetch custom user:', error);
        }
        setCustomUserLoading(false);
      } else {
        setCustomUserLoading(false);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth context: Auth state changed:', event, !!session?.user);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('Auth context: Fetching custom user after state change');
          setCustomUserLoading(true);
          fetch('/api/auth/user').then(res => res.json()).then(data => {
            console.log('Auth context: Custom user data after state change:', data);
            setCustomUser(data);
            setCustomUserLoading(false);
          });
        } else {
          setCustomUser(null);
          setCustomUserLoading(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCustomUser(null);
  };

  const refreshUser = async () => {
    const response = await fetch('/api/auth/user');
    if (response.ok) {
      const userData = await response.json();
      setCustomUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, customUser, loading, customUserLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
