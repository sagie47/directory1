import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hasApprovedClaim as checkApprovedClaim } from '../lib/auth';

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
  signInWithMagicLink: (email: string, redirectPath?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; session: Session | null; user: User | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  hasApprovedClaim: boolean;
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

function isDuplicateOrConsumedPkceError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalizedMessage = message.toLowerCase();

  return normalizedMessage.includes('already been used')
    || normalizedMessage.includes('invalid flow state')
    || normalizedMessage.includes('code verifier')
    || normalizedMessage.includes('both auth code and code verifier should be non-empty');
}

const AUTH_CALLBACK_PARAM_KEYS = [
  'code',
  'type',
  'token_hash',
  'access_token',
  'refresh_token',
  'token_type',
  'expires_in',
  'expires_at',
  'provider_token',
  'provider_refresh_token',
  'error',
  'error_code',
  'error_description',
] as const;

function parseAuthCallbackParams(value: string) {
  const normalizedValue = value.startsWith('#') ? value.slice(1) : value;

  if (!normalizedValue) {
    return null;
  }

  const looksLikeAuthParams = normalizedValue.includes('=')
    || AUTH_CALLBACK_PARAM_KEYS.some((key) => normalizedValue.includes(`${key}=`));

  if (!looksLikeAuthParams) {
    return null;
  }

  return new URLSearchParams(normalizedValue);
}

function hasAuthCallbackParams(currentUrl: URL) {
  const hashParams = parseAuthCallbackParams(currentUrl.hash);

  return AUTH_CALLBACK_PARAM_KEYS.some((key) =>
    currentUrl.searchParams.has(key) || hashParams?.has(key) === true
  );
}


function getSafeInternalRedirectPath(redirectPath: string) {
  const candidateUrl = new URL(redirectPath, window.location.origin);
  const isSafeInternalPath =
    redirectPath.startsWith('/')
    && !redirectPath.startsWith('//')
    && candidateUrl.origin === window.location.origin;

  return isSafeInternalPath
    ? `${candidateUrl.pathname}${candidateUrl.search}${candidateUrl.hash}`
    : '/account';
}

function clearAuthCallbackParams(currentUrl: URL) {
  const hashParams = parseAuthCallbackParams(currentUrl.hash);
  let changedSearchParams = false;
  let changedHashParams = false;

  AUTH_CALLBACK_PARAM_KEYS.forEach((key) => {
    if (currentUrl.searchParams.has(key)) {
      currentUrl.searchParams.delete(key);
      changedSearchParams = true;
    }

    if (hashParams?.has(key)) {
      hashParams.delete(key);
      changedHashParams = true;
    }
  });

  if (changedHashParams && hashParams) {
    const nextHash = hashParams.toString();
    currentUrl.hash = nextHash ? `#${nextHash}` : '';
  }

  if (changedSearchParams || changedHashParams) {
    window.history.replaceState({}, document.title, `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }
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
  const [approvedClaim, setApprovedClaim] = useState(false);

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
        return null;
      }

      setProfile(nextProfile);
      return nextProfile;
    } catch (profileError) {
      console.error('Unexpected profile load failure:', profileError);

      if (!mountedRef.current || profileRequestRef.current !== requestId) {
        return null;
      }

      const fallbackProfile = buildFallbackProfile(authUser);
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, [fetchProfile]);

  const syncSessionState = useCallback((nextSession: Session | null) => {
    const nextUser = nextSession?.user ?? null;

    setSession(nextSession);
    setUser(nextUser);

    if (!nextUser) {
      profileRequestRef.current += 1;
      setProfile(null);
      setApprovedClaim(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setProfile((currentProfile) => currentProfile?.id === nextUser.id ? currentProfile : buildFallbackProfile(nextUser));

    window.setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      void (async () => {
        const [loadedProfile, hasClaim] = await Promise.all([
          loadProfile(nextUser),
          checkApprovedClaim(nextUser.id),
        ]);

        if (!mountedRef.current || !loadedProfile) {
          return;
        }

        setApprovedClaim(hasClaim);
        setLoading(false);
      })();
    }, 0);
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      const [loadedProfile, hasClaim] = await Promise.all([
        loadProfile(user),
        checkApprovedClaim(user.id),
      ]);

      if (mountedRef.current && loadedProfile) {
        setApprovedClaim(hasClaim);
        setLoading(false);
      }
    }
  }, [loadProfile, user]);

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase || !configured) {
      setLoading(false);
      setError('Authentication is not configured.');
      return;
    }

    const initAuth = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const hadAuthCallbackParams = hasAuthCallbackParams(currentUrl);
        const { error: initializeError } = await supabase.auth.initialize();

        if (initializeError) {
          if (isDuplicateOrConsumedPkceError(initializeError)) {
            console.warn('[auth] Supabase callback was already consumed before session restore; continuing with stored session.', initializeError);
          } else {
            throw initializeError;
          }
        }

        if (hadAuthCallbackParams) {
          clearAuthCallbackParams(currentUrl);
        }

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

        if (isDuplicateOrConsumedPkceError(sessionError)) {
          console.warn('[auth] Ignoring duplicate PKCE callback error while restoring session.', sessionError);

          const { data } = await supabase.auth.getSession();
          syncSessionState(data.session ?? null);
          setError(null);
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

  const signIn = useCallback(async (email: string, password: string) => {
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
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
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
  }, []);

  const signInWithGoogle = useCallback(async (redirectPath = '/account') => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const safeRedirectPath = getSafeInternalRedirectPath(redirectPath);
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
  }, []);

  const signInWithMagicLink = useCallback(async (email: string, redirectPath = '/account') => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const safeRedirectPath = getSafeInternalRedirectPath(redirectPath);
      const emailRedirectTo = new URL(safeRedirectPath, window.location.origin).toString();
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo,
        },
      });

      if (magicLinkError) {
        setError(magicLinkError.message);
      }

      return { error: magicLinkError };
    } catch (magicLinkError) {
      const normalizedError = magicLinkError instanceof Error ? magicLinkError : new Error('Unable to send a magic link right now.');
      setError(normalizedError.message);
      return { error: normalizedError };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const redirectTo = new URL('/update-password', window.location.origin).toString();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
      }

      return { error: resetError };
    } catch (resetError) {
      const normalizedError = resetError instanceof Error ? resetError : new Error('Unable to request password reset right now.');
      setError(normalizedError.message);
      return { error: normalizedError };
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      setError(null);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      }

      return { error: updateError };
    } catch (updateError) {
      const normalizedError = updateError instanceof Error ? updateError : new Error('Unable to update password right now.');
      setError(normalizedError.message);
      return { error: normalizedError };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    try {
      setError(null);
      await supabase.auth.signOut();
      profileRequestRef.current += 1;
      setProfile(null);
      setApprovedClaim(false);
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out right now.');
    }
  }, []);

  const authContextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    profile,
    loading,
    error,
    isConfigured: configured,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signUp,
    signOut,
    refreshProfile,
    resetPassword,
    updatePassword,
    hasApprovedClaim: approvedClaim,
  }), [
    approvedClaim,
    configured,
    error,
    loading,
    profile,
    refreshProfile,
    resetPassword,
    session,
    signIn,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    signUp,
    updatePassword,
    user,
  ]);

  return (
    <AuthContext.Provider value={authContextValue}>
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
