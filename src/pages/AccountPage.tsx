import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Save, CheckCircle, AlertCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { hasApprovedClaim } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
          <p className="text-zinc-500 text-sm">Loading...</p>
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
        className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
      >
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-medium tracking-tight mb-4">Sign In Required</h2>
            <p className="text-zinc-500 mb-6">
              Please sign in to view your account.
            </p>
            <Link 
              to="/login" 
              className="inline-block bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
            >
              Sign In
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
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
    >
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-8 uppercase rounded-sm shadow-sm">
            <Activity className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Account
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Your Account
          </h1>
          <p className="text-zinc-500 font-sans text-lg max-w-xl mx-auto leading-relaxed">
            Manage your account settings and preferences.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-zinc-900">{profile?.full_name || 'User'}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
              <p className="text-xs text-zinc-400 capitalize mt-1">
                {profile?.role?.replace('_', ' ') || 'Consumer'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-sm">
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm rounded-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Account updated successfully!
              </div>
            )}

            <div>
              <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Full Name</label>
              <input 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Email Address</label>
              <input 
                type="email"
                value={user.email || ''}
                disabled
                className="w-full border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-500 outline-none rounded-sm cursor-not-allowed"
              />
              <p className="text-xs text-zinc-400 mt-1">Email cannot be changed.</p>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full md:w-auto bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 rounded-sm shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><Save className="h-4 w-4" strokeWidth={1.5} /> Save Changes</>}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100">
            <h3 className="font-medium text-zinc-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                to="/claim/status" 
                className="block text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                → View Claim Status
              </Link>
              {canAccessOwnerDashboard && (
                <Link 
                  to="/owner/dashboard" 
                  className="block text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  → Owner Dashboard
                </Link>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
