import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, isConfigured, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (authLoading || !isConfigured) {
      return;
    }

    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/account');
    }
  };

  const handleGoogleSignIn = async () => {
    if (authLoading || !isConfigured) {
      return;
    }

    setError(null);
    setLoading(true);

    const { error } = await signInWithGoogle('/account');

    if (error) {
      setError(error.message);
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
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative overflow-hidden flex flex-col justify-center selection:bg-orange-500/20"
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #d4d4d8 1px, transparent 1px), linear-gradient(to bottom, #d4d4d8 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="relative max-w-xl w-full mx-auto px-4 sm:px-6 z-10 text-center">
        
        <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-zinc-500 mb-8 border border-zinc-200 rounded-full px-4 py-2 uppercase bg-white shadow-sm">
          <ShieldCheck className="w-4 h-4 text-zinc-400" fill="currentColor" />
          Authentication
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6">
          Welcome Back.
        </h1>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          Access your dashboard to manage your business profile, respond to reviews, and update your services.
        </p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 sm:p-12 rounded-sm shadow-xl text-left relative z-10">
          <div className="space-y-6">
            {visibleError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                {visibleError}
              </div>
            )}

            {!isConfigured && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                Authentication is not configured in this environment.
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || authLoading || !isConfigured}
              className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 rounded-xl px-8 py-4 font-sans text-sm font-semibold uppercase tracking-widest transition-all shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="mb-2">
                <label className="block font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading || authLoading || !isConfigured}
                className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-xl px-8 py-4 font-sans text-sm font-semibold uppercase tracking-widest transition-all shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md active:scale-95 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Authenticating...' : <>Secure Login <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} /></>}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest">
                Don't have an account?{' '}
                <Link to="/register" className="text-zinc-900 hover:text-orange-500 transition-colors">
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
