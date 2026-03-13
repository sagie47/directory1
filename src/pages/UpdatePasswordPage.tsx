import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import Seo from '../components/Seo';

export default function UpdatePasswordPage() {
  const { updatePassword, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If auth has finished loading and there's no session, the link is invalid
    if (!authLoading && !session && status !== 'success') {
      setStatus('error');
      setErrorMessage('Invalid or expired recovery link. Please request a new password reset.');
    }
  }, [authLoading, session, status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setStatus('loading');
    const { error } = await updatePassword(password);

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('success');
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Verifying session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-200 selection:text-indigo-900 relative overflow-hidden">
      <Seo
        title="Update Password | Okanagan Trades"
        description="Set a new password for your account."
        path="/update-password"
      />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-zinc-200 p-10 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm relative z-10"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center rounded-full mb-6">
            <Lock className="h-5 w-5 text-zinc-900" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-3">Set New Password</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Please enter your new password below.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-sm text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-emerald-900 mb-2">Password Updated</h3>
            <p className="text-emerald-700 text-sm">
              Your password has been successfully changed. Redirecting...
            </p>
          </div>
        ) : status === 'error' && errorMessage.includes('Invalid or expired') ? (
          <div className="text-center">
             <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex flex-col items-center gap-3 mb-6">
                <AlertCircle className="h-8 w-8 text-red-500 shrink-0" strokeWidth={1.5} />
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
              <button
                onClick={() => navigate('/reset-password')}
                className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium transition-all hover:bg-zinc-800 rounded-sm shadow-md"
              >
                Request New Link
              </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-800 active:scale-[0.98] rounded-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {status === 'loading' ? 'Updating...' : (
                <>
                  Update Password
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
