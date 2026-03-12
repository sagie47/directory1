import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Save, CheckCircle, AlertCircle, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { hasApprovedClaim } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import SectionEyebrow from '../components/SectionEyebrow';

export default function AccountPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [canAccessOwnerDashboard, setCanAccessOwnerDashboard] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setCanAccessOwnerDashboard(false);
      return () => {
        isActive = false;
      };
    }

    if (profile?.role === 'admin') {
      setCanAccessOwnerDashboard(true);
      return () => {
        isActive = false;
      };
    }

    hasApprovedClaim(user.id).then((hasClaim) => {
      if (!isActive) {
        return;
      }

      setCanAccessOwnerDashboard(hasClaim);
    });

    return () => {
      isActive = false;
    };
  }, [profile?.role, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !supabase || !isSupabaseConfigured()) return;

    setError(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full"></div>
          <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative selection:bg-indigo-200 selection:text-indigo-900"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="border border-zinc-200 bg-white p-8 md:p-12 shadow-xl rounded-sm text-center">
            <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-zinc-900" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4 text-zinc-900">Sign In Required</h2>
            <p className="text-zinc-600 mb-8 font-sans text-lg font-medium leading-relaxed">
              Please sign in to view your account.
            </p>
            <Link
              to="/claim"
              className="inline-flex w-full items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-orange-500 active:scale-95 group rounded-xl shadow-md hover:shadow-none hover:translate-x-1 hover:translate-y-1 border border-zinc-200"
            >
              Continue <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative selection:bg-indigo-200 selection:text-indigo-900"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-12">
          <SectionEyebrow
            icon={Activity}
            className="mb-6 inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm rounded-sm"
            iconClassName="h-3.5 w-3.5 text-zinc-900"
          >
            Account
          </SectionEyebrow>
          <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-4 text-zinc-900 leading-[0.95]">
            Your Account
          </h1>
          <p className="text-zinc-600 font-sans font-medium text-lg max-w-xl leading-relaxed">
            Manage your account settings and preferences.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="border border-zinc-200 bg-white p-8 md:p-12 shadow-xl rounded-sm">
          <div className="flex items-center gap-6 mb-10 pb-10 border-b-2 border-zinc-100">
            <div className="w-20 h-20 border border-zinc-200 bg-zinc-50 flex items-center justify-center rounded-sm shadow-md">
              <User className="w-10 h-10 text-zinc-900" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-sans text-2xl font-bold text-zinc-900 mb-1">{profile?.full_name || 'User'}</p>
              <p className="text-base font-medium text-zinc-500 mb-3">{user.email}</p>
              <div className="inline-block border border-zinc-200 bg-zinc-900 text-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md shadow-[2px_2px_0px_0px_rgba(24,24,27,0.5)]">
                {profile?.role?.replace('_', ' ') || 'Consumer'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="border-2 border-red-900 bg-red-50 rounded-xl p-4 font-mono text-xs font-bold uppercase tracking-wider text-red-900 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(127,29,29,1)]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="border-2 border-green-900 bg-green-50 rounded-xl p-4 font-mono text-xs font-bold uppercase tracking-wider text-green-900 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(20,83,45,1)]">
                <CheckCircle className="h-4 w-4" /> 
                <span>Account updated successfully!</span>
              </div>
            )}

            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Full Name</label>
              <input 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-2 border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white rounded-xl shadow-sm"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Email Address</label>
              <input 
                type="email"
                value={user.email || ''}
                disabled
                className="w-full border-2 border-zinc-200 bg-zinc-100 px-4 py-4 text-base font-medium text-zinc-500 outline-none cursor-not-allowed rounded-xl"
              />
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email cannot be changed.</p>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={saving}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-orange-500 active:scale-95 shadow-md hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:pointer-events-none rounded-xl border border-zinc-200 group"
              >
                {saving ? 'Saving...' : <><Save className="h-4 w-4" strokeWidth={2} /> Save Changes</>}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-10 border-t-2 border-zinc-100">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Quick Links</h3>
            <div className="space-y-4">
              <Link 
                to="/claim/status" 
                className="group flex items-center border-2 border-zinc-200 bg-zinc-50 px-6 py-4 rounded-xl font-sans text-base font-bold text-zinc-900 transition-all hover:border-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.1)]"
              >
                View Claim Status <ArrowRight className="ml-auto h-5 w-5 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-orange-500" strokeWidth={2.5} />
              </Link>
              {canAccessOwnerDashboard && (
                <Link 
                  to="/owner/dashboard" 
                  className="group flex items-center border-2 border-zinc-200 bg-zinc-50 px-6 py-4 rounded-xl font-sans text-base font-bold text-zinc-900 transition-all hover:border-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.1)]"
                >
                  Owner Dashboard <ArrowRight className="ml-auto h-5 w-5 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-orange-500" strokeWidth={2.5} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
