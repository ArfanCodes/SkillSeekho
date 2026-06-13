import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/api/auth';
import type { Profile } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isMockMode) {
      const savedProfile = localStorage.getItem('mock_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      return;
    }
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) return;
    const p = await getProfile(currentUser.id);
    setProfile(p);
  }, []);

  useEffect(() => {
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (isMockMode) {
      const isSignedOut = localStorage.getItem('mock_signed_out') === 'true';
      const savedSession = localStorage.getItem('mock_session');
      const savedProfile = localStorage.getItem('mock_profile');

      if (isSignedOut) {
        setSession(null);
        setUser(null);
        setProfile(null);
      } else if (savedSession && savedProfile) {
        setSession(JSON.parse(savedSession));
        setUser(JSON.parse(savedSession).user);
        setProfile(JSON.parse(savedProfile));
      } else {
        const defaultUser = {
          id: 'mock-user-id',
          email: 'aarav@skillseekho.com',
        } as User;

        const defaultProfile = {
          id: 'mock-user-id',
          name: 'Aarav Mehta',
          phone: '+91 98765 43210',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: 'customer',
          bio: 'Aspiring coder and designer from Bangalore.',
          languages: ['English', 'Hindi'],
          location_lat: 12.9352,
          location_lng: 77.6245,
          location_name: 'Koramangala, Bangalore',
          verified: true,
          onboarding_complete: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const defaultSession = {
          access_token: 'mock-token',
          user: defaultUser,
        } as unknown as Session;

        setSession(defaultSession);
        setUser(defaultUser);
        setProfile(defaultProfile as any);

        localStorage.setItem('mock_session', JSON.stringify(defaultSession));
        localStorage.setItem('mock_profile', JSON.stringify(defaultProfile));
      }
      setLoading(false);
      return;
    }

    // Safety timeout — if Supabase isn't configured (.env missing), resolve after 1s
    const timeout = setTimeout(() => setLoading(false), 1000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      clearTimeout(timeout);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        try { const p = await getProfile(s.user.id); setProfile(p); } catch { /* no-op */ }
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          const p = await getProfile(s.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
