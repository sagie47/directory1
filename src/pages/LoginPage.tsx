import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, MailCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

import GoogleIcon from '../components/GoogleIcon';
import Seo from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    error: authError,
    isConfigured,
    signIn,
    signInWithGoogle,
    signInWithMagicLink,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/account';
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/account';

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, navigate, redirectTo, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (authLoading || !isConfigured) {
      return;
    }

    setError(null);
    setMagicLinkSent(false);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate(redirectTo);
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (authLoading || !isConfigured) {
      return;
    }

    if (!email.trim()) {
      setError('Enter your email to get a secure sign-in link.');
      return;
    }

    setError(null);
    setMagicLinkSent(false);
    setLoading(true);

    const { error: magicLinkError } = await signInWithMagicLink(email, redirectTo);

    if (magicLinkError) {
      setError(magicLinkError.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (authLoading || !isConfigured) {
      return;
    }

    setError(null);
    setMagicLinkSent(false);
    setLoading(true);

    const { error: googleError } = await signInWithGoogle(redirectTo);

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
  };

  const visibleError = error ?? authError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative overflow-hidden flex flex-col justify-center selection:bg-indigo-200 selection:text-indigo-900"
    >
      <Seo
        title="Login | Okanagan Trades"
        description="Sign in to manage your directory account, business claims, and profile settings."
        path="/login"
        robots="noindex,nofollow"
      />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="relative max-w-xl w-full mx-auto px-4 sm:px-6 z-10 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-600 mb-8 border-2 border-zinc-900 bg-zinc-50 px-4 py-2 uppercase rounded-sm">
          <ShieldCheck className="w-4 h-4 text-zinc-900" strokeWidth={2} />
          Authentication
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6">
          Welcome Back.
        </h1>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          Access your dashboard to manage your business profile, respond to reviews, and update your services.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border-2 border-zinc-200 p-8 sm:p-12 rounded-sm shadow-xl text-left relative z-10"
        >
          <div className="space-y-6">
            {magicLinkSent ? (
              <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-sm px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
                <MailCheck className="w-4 h-4" />
                Magic link sent. Check your inbox to continue.
              </div>
            ) : null}

            {visibleError ? (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-sm px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                {visibleError}
              </div>
            ) : null}

            {!isConfigured ? (
              <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-sm px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                Authentication is not configured in this environment.
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || authLoading || !isConfigured}
              className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-200 rounded-sm px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <GoogleIcon />
              Continue With Google
            </button>

            <div className="flex items-center gap-4">
              <div className="h-0.5 flex-1 bg-zinc-200"></div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">or</span>
              <div className="h-0.5 flex-1 bg-zinc-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-sm px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                  <Link to="/reset-password" className="font-mono text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-sm px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleMagicLinkSignIn}
                  disabled={loading || authLoading || !isConfigured}
                  className="w-full inline-flex items-center justify-center gap-3 bg-zinc-100 text-zinc-900 border-2 border-zinc-200 rounded-sm px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all shadow-sm hover:bg-zinc-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <MailCheck className="h-5 w-5" strokeWidth={2.5} />
                  {loading ? 'Sending magic link...' : 'Email Me a Magic Link'}
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || authLoading || !isConfigured}
                  className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-sm px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'Authenticating...' : (
                    <>
                      Secure Login
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest">
                  Don&apos;t have an account?{' '}
                  <Link
                    to={`/register${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-zinc-900 hover:text-orange-500 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
