import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, Check } from 'lucide-react';
import { motion } from 'motion/react';

import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, isConfigured, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authLoading || !isConfigured) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error, session } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (session) {
      navigate('/account', { replace: true });
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const visibleError = error ?? authError;

  if (success) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative overflow-hidden flex flex-col justify-center selection:bg-orange-500/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #d4d4d8 1px, transparent 1px), linear-gradient(to bottom, #d4d4d8 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

        <div className="relative max-w-xl w-full mx-auto px-4 sm:px-6 z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 p-8 sm:p-12 rounded-sm shadow-xl text-center relative z-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Check className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6 text-zinc-900">Check Your Email</h2>
            <p className="text-zinc-600 mb-10 font-sans text-lg font-medium leading-relaxed">
              We've sent a verification link to <strong className="text-zinc-900">{email}</strong>. 
              Click the link to verify your account and sign in.
            </p>
            <Link to="/login" className="inline-flex items-center justify-center gap-3 w-full bg-zinc-900 text-white rounded-xl px-8 py-4 font-sans text-sm font-semibold uppercase tracking-widest transition-all shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
              Back to Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
          <UserPlus className="w-4 h-4 text-zinc-400" fill="currentColor" />
          Registration
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6">
          Create Account.
        </h1>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
          Join the directory to claim your business, respond to reviews, and manage your profile.
        </p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 sm:p-12 rounded-sm shadow-xl text-left relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Confirm</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Verify password"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading || authLoading || !isConfigured}
                className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-xl px-8 py-4 font-sans text-sm font-semibold uppercase tracking-widest transition-all shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md active:scale-95 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Creating account...' : <>Create Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} /></>}
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest">
                Already have an account?{' '}
                <Link to="/login" className="text-zinc-900 hover:text-orange-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

      </div>
    </motion.div>
  );
}
