import React, { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, Check, Building2, MapPin, Zap, LayoutGrid, User, Phone, Mail, ShieldCheck, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../business';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import businessBg from '../photos/job-construction-scaled.jpg';

interface ClaimPageProps {
  onClaimComplete?: () => void;
}

export default function ClaimPage({ onClaimComplete }: ClaimPageProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { businesses, cities, isLoading: directoryLoading } = useDirectoryData();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [claimData, setClaimData] = useState({
    claimantName: '',
    claimantEmail: user?.email || '',
    claimantPhone: '',
    relationshipToBusiness: 'owner',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());

  useEffect(() => {
    if (user?.email) {
      setClaimData((current) => ({
        ...current,
        claimantEmail: current.claimantEmail || user.email || '',
      }));
    }
  }, [user?.email]);

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return businesses
      .filter(b => b.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [businesses, searchQuery]);

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setSearchQuery('');
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBusiness) return;

    setError(null);
    setSubmitting(true);

    try {
      if (!claimsAvailable || !supabase) {
        setError('Claim submission is not available in this environment.');
        return;
      }

      const { error: insertError } = await supabase
        .from('business_claims')
        .insert({
          user_id: user.id,
          business_id: selectedBusiness.id,
          claimant_name: claimData.claimantName,
          claimant_email: claimData.claimantEmail,
          claimant_phone: claimData.claimantPhone || null,
          relationship_to_business: claimData.relationshipToBusiness,
          message: claimData.message || null,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already submitted a claim for this business.');
        } else {
          setError(insertError.message);
        }
        return;
      }

      setSuccess(true);
      onClaimComplete?.();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading(true);

    const { error } = await signInWithGoogle('/claim');

    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  if (authLoading || directoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && !claimsAvailable) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center py-24 relative overflow-hidden font-sans">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white border-2 border-zinc-900 p-12 max-w-xl w-full mx-4 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] text-center z-10">
          <div className="w-16 h-16 bg-zinc-50 border-2 border-zinc-900 flex items-center justify-center mx-auto mb-8">
            <Zap className="w-8 h-8 text-zinc-900" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-zinc-900 leading-none">System Offline</h2>
          <p className="text-zinc-500 font-sans text-lg font-medium leading-relaxed">
            Claim submission requires a configured environment. Please contact support.
          </p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center py-24 relative overflow-hidden font-sans">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white border-2 border-zinc-900 p-12 max-w-xl w-full mx-4 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] text-center z-10">
          <div className="w-16 h-16 bg-orange-500 border-2 border-zinc-900 flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-zinc-900 leading-none">Claim Submitted</h2>
          <p className="text-zinc-500 mb-10 font-sans text-lg font-medium leading-relaxed">
            Your verification data for <strong className="text-zinc-900">{selectedBusiness?.name}</strong> has been transmitted. 
            Our team will notify you once approval is complete.
          </p>
          <Link to="/claim/status" className="inline-flex items-center justify-center gap-3 w-full bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-orange-500 active:scale-95 shadow-[8px_8px_0px_0px_rgba(24,24,27,0.2)] group">
            Monitor Status <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 flex flex-col">
        {/* Homepage-matched Hero Section */}
        <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 flex items-center bg-zinc-900 overflow-visible text-white flex-grow">
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 2, ease: "easeOut" }}
              src={businessBg}
              alt="Business Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
          </div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex flex-col items-start text-left max-w-2xl flex-1">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-zinc-300" />
                  Claim Process
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.95] text-white drop-shadow-2xl"
                >
                  Locate Your <br /> <span className="font-serif italic font-light text-zinc-200">Enterprise.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl text-zinc-300 mb-12 font-sans font-medium leading-relaxed text-balance drop-shadow-md"
                >
                  You must have an active system account to initiate a listing claim process. Authenticate to proceed.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full lg:w-[450px] bg-white border-2 border-zinc-900 p-8 lg:p-12 shadow-[16px_16px_0px_0px_rgba(24,24,27,1)] text-zinc-900"
              >
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={oauthLoading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-900 px-8 py-5 font-sans text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-50 active:scale-[0.98] shadow-[6px_6px_0px_0px_rgba(24,24,27,0.1)] disabled:opacity-50"
                  >
                    <GoogleIcon />
                    {oauthLoading ? 'Connecting...' : 'Continue with Google'}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-200"></div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">Security Gateway</span>
                    <div className="h-px flex-1 bg-zinc-200"></div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/login" 
                      className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-orange-500 hover:text-zinc-900 active:scale-[0.98] shadow-[6px_6px_0px_0px_rgba(24,24,27,0.2)] group"
                    >
                      Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to="/register" 
                      className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-200 px-8 py-4 font-sans text-xs font-black uppercase tracking-[0.2em] hover:border-zinc-900 transition-all"
                    >
                      New Account
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <header className="bg-white border-b-2 border-zinc-900 py-12 md:py-20 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 border-2 border-zinc-900 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">
                <Building2 className="h-3.5 w-3.5 text-orange-600" /> Ownership Verification
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                {step === 1 ? 'Locate Enterprise.' : 'Verify Assets.'}
              </h1>
              <p className="text-lg md:text-xl font-sans font-medium leading-relaxed text-zinc-500">
                {step === 1 
                  ? 'Identify your trade business within the regional infrastructure database.'
                  : 'Establish administrative control through structural documentation.'}
              </p>
            </div>
            
            <div className="shrink-0">
              <div className="font-mono text-xs font-bold tracking-[0.2em] text-zinc-400 border-2 border-zinc-100 p-4 uppercase backdrop-blur-sm">
                Step <span className="text-zinc-900">0{step}</span> / 02
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-zinc-400 group-focus-within:text-orange-500 transition-colors" strokeWidth={2} />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operational database..."
                  className="w-full bg-white border-2 border-zinc-900 px-16 py-6 text-xl font-bold text-zinc-900 outline-none shadow-[8px_8px_0px_0px_rgba(24,24,27,0.05)] focus:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all"
                  autoFocus
                />
              </div>

              {filteredBusinesses.length > 0 ? (
                <div className="bg-white border-2 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] overflow-hidden">
                  <div className="bg-zinc-50 border-b-2 border-zinc-900 px-6 py-3 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Results Matching Query
                  </div>
                  {filteredBusinesses.map((business, i) => (
                    <button
                      key={business.id}
                      onClick={() => handleSelectBusiness(business)}
                      className={`w-full text-left px-8 py-6 hover:bg-zinc-50 transition-all group flex items-center justify-between ${i !== filteredBusinesses.length - 1 ? 'border-b-2 border-zinc-100' : ''}`}
                    >
                      <div>
                        <p className="font-black text-xl text-zinc-900 group-hover:text-orange-600 uppercase tracking-tight transition-colors">{business.name}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="font-mono text-[10px] font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            {cities.find(c => c.id === business.cityId)?.name || business.cityId}
                          </p>
                          <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                          <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {business.categoryId}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-2 transition-all" strokeWidth={3} />
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-xl">
                  <Search className="w-12 h-12 text-zinc-200 mx-auto mb-6" strokeWidth={1.5} />
                  <p className="text-zinc-900 font-black uppercase tracking-tight text-2xl mb-2 leading-none">No Matches Found</p>
                  <p className="text-zinc-400 font-medium">Verify your query or <Link to="/claim-business" className="text-orange-600 underline font-bold">submit a new listing</Link>.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Find by Name', desc: 'Enter the registered trade name of your enterprise.', icon: Search },
                    { title: 'Global Reach', desc: 'Every verified business in the Okanagan is indexed.', icon: MapPin }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border-2 border-zinc-100 p-8 group hover:border-zinc-900 transition-all duration-300">
                      <item.icon className="w-8 h-8 text-zinc-200 mb-6 group-hover:text-orange-500 transition-colors" strokeWidth={2} />
                      <h4 className="font-black uppercase tracking-tight mb-2">{item.title}</h4>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              <div className="bg-zinc-900 text-white p-8 flex items-center gap-6 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] border-2 border-zinc-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Building2 className="w-32 h-32" />
                </div>
                <div className="w-16 h-16 bg-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-8 w-8 text-zinc-900" strokeWidth={2} />
                </div>
                <div className="relative z-10">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-2 leading-none text-zinc-400">Target Entity</p>
                  <p className="font-black text-3xl uppercase tracking-tighter leading-none">{selectedBusiness?.name}</p>
                </div>
              </div>

              <div className="bg-white border-2 border-zinc-900 p-8 lg:p-12 shadow-[12px_12px_0px_0px_rgba(24,24,27,0.05)] space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest">
                      <User className="w-3 h-3" /> Claimant Name *
                    </label>
                    <input 
                      type="text"
                      value={claimData.claimantName}
                      onChange={(e) => setClaimData({...claimData, claimantName: e.target.value})}
                      required
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-lg font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-transparent transition-all"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest">
                      <Mail className="w-3 h-3" /> Email Address *
                    </label>
                    <input 
                      type="email"
                      value={claimData.claimantEmail}
                      onChange={(e) => setClaimData({...claimData, claimantEmail: e.target.value})}
                      required
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-lg font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-transparent transition-all"
                      placeholder="operator@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={claimData.claimantPhone}
                      onChange={(e) => setClaimData({...claimData, claimantPhone: e.target.value})}
                      className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-lg font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-transparent transition-all"
                      placeholder="(250) 555-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest">
                      <ShieldCheck className="w-3 h-3" /> Authority Level *
                    </label>
                    <div className="relative">
                      <select 
                        value={claimData.relationshipToBusiness}
                        onChange={(e) => setClaimData({...claimData, relationshipToBusiness: e.target.value})}
                        required
                        className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-lg font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="authorized">Authorized Rep</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest block">Additional Verification Notes</label>
                  <textarea
                    value={claimData.message}
                    onChange={(e) => setClaimData({...claimData, message: e.target.value})}
                    rows={2}
                    className="w-full bg-zinc-50 border-b-2 border-zinc-200 px-0 py-3 text-lg font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-transparent transition-all resize-none"
                    placeholder="Provide details to verify your structural ownership..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-zinc-100">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-20 flex items-center justify-center bg-zinc-50 border-2 border-zinc-900 py-5 text-zinc-900 hover:bg-zinc-100 transition-all active:scale-95"
                  >
                    <ArrowLeft className="h-6 w-6" strokeWidth={3} />
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-black uppercase tracking-widest transition-all group shadow-[8px_8px_0px_0px_rgba(249,115,22,0.3)] hover:bg-orange-500 hover:text-zinc-900 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting...' : <>Submit for Verification <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} /></>}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </div>
      </main>
    </div>
  );
}
