import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'consumer' | 'business_owner' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; session: Session | null; user: User | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildFallbackProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email ?? '',
    role: 'consumer',
    full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();
  const mountedRef = useRef(true);
  const profileRequestRef = useRef(0);

  const fetchProfile = useCallback(async (authUser: User) => {
    if (!supabase) {
      return buildFallbackProfile(authUser);
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return buildFallbackProfile(authUser);
    }

    if (!data) {
      return buildFallbackProfile(authUser);
    }

    return data as Profile;
  }, []);

  const loadProfile = useCallback(async (authUser: User) => {
    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;

    try {
      const nextProfile = await fetchProfile(authUser);

      if (!mountedRef.current || profileRequestRef.current !== requestId) {
        return;
      }

      setProfile(nextProfile);
    } catch (profileError) {
      console.error('Unexpected profile load failure:', profileError);

      if (!mountedRef.current || profileRequestRef.current !== requestId) {
        return;
      }

      setProfile(buildFallbackProfile(authUser));
    }
  }, [fetchProfile]);

  const syncSessionState = useCallback((nextSession: Session | null) => {
    const nextUser = nextSession?.user ?? null;

    setSession(nextSession);
    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile((currentProfile) => currentProfile?.id === nextUser.id ? currentProfile : buildFallbackProfile(nextUser));
    setLoading(false);

    window.setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      void loadProfile(nextUser);
    }, 0);
  }, [loadProfile]);

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase || !configured) {
      setLoading(false);
      setError('Authentication is not configured.');
      return;
    }

    const initAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setError(null);
        syncSessionState(data.session ?? null);
      } catch (sessionError) {
        console.error('Error restoring auth session:', sessionError);

        if (!mountedRef.current) {
          return;
        }

        setSession(null);
        setUser(null);
        setProfile(null);
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to restore your session.');
        setLoading(false);
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mountedRef.current) {
          return;
        }

        setError(null);
        syncSessionState(currentSession);
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [configured, syncSessionState]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }

      return { error: signInError };
    } catch (signInError) {
      const normalizedError = signInError instanceof Error ? signInError : new Error('Unable to sign in right now.');
      setError(normalizedError.message);
      return { error: normalizedError };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured'), session: null, user: null };
    }

    try {
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      }

      return {
        error: signUpError,
        session: data.session,
        user: data.user,
      };
    } catch (signUpError) {
      const normalizedError = signUpError instanceof Error ? signUpError : new Error('Unable to create your account right now.');
      setError(normalizedError.message);
      return { error: normalizedError, session: null, user: null };
    }
  };

  const signInWithGoogle = async (redirectPath = '/account') => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const safeRedirectPath = redirectPath.startsWith('/') ? redirectPath : '/account';
      const redirectTo = new URL(safeRedirectPath, window.location.origin).toString();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }

      return { error: oauthError };
    } catch (oauthError) {
      const normalizedError = oauthError instanceof Error ? oauthError : new Error('Unable to start Google sign-in right now.');
      setError(normalizedError.message);
      return { error: normalizedError };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    try {
      setError(null);
      await supabase.auth.signOut();
      setProfile(null);
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out right now.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        error,
        isConfigured: configured,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
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
