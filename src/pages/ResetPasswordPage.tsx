import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import Seo from '../components/Seo';

export default function ResetPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const { error } = await resetPassword(email);

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('success');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-200 selection:text-indigo-900 relative overflow-hidden">
      <Seo
        title="Reset Password | Okanagan Trades"
        description="Request a password reset link to regain access to your account."
        path="/reset-password"
      />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-zinc-200 p-10 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm relative z-10"
      >
        <div className="mb-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
            Back to login
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-3">Reset Password</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-sm text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-emerald-900 mb-2">Check your inbox</h3>
            <p className="text-emerald-700 text-sm">
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-sm text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-800 active:scale-[0.98] rounded-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {status === 'loading' ? 'Sending...' : (
                <>
                  Send Reset Link
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
