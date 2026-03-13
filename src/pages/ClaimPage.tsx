import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, Check, Building2, MapPin, Zap, LayoutGrid, User, Phone, Mail, ShieldCheck, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import GoogleIcon from '../components/GoogleIcon';
import SectionEyebrow from '../components/SectionEyebrow';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../business';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import businessBg from '../photos/businessown/thumbnail_G74A6639.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

interface ClaimPageProps {
  onClaimComplete?: () => void;
}

export default function ClaimPage({ onClaimComplete }: ClaimPageProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { businesses, categories, cities, isLoading: directoryLoading, error: directoryError } = useDirectoryData();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const businessBgSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessBg);
  const selectedBusinessId = searchParams.get('businessId');

  useEffect(() => {
    if (user?.email) {
      setClaimData((current) => ({
        ...current,
        claimantEmail: current.claimantEmail || user.email || '',
      }));
    }
  }, [user?.email]);

  const cityNames = useMemo(
    () => new Map(cities.map((city) => [city.id, city.name])),
    [cities]
  );

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  useEffect(() => {
    if (!user || directoryLoading || !selectedBusinessId) {
      return;
    }

    const matchedBusiness = businesses.find((business) => business.id === selectedBusinessId);
    if (!matchedBusiness) {
      setError('That business listing could not be found. Search below to continue.');
      setSelectedBusiness(null);
      setStep(1);
      return;
    }

    setError(null);
    setSelectedBusiness(matchedBusiness);
    setStep(2);
  }, [businesses, directoryLoading, selectedBusinessId, user]);

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();

    return businesses
      .filter((business) => {
        const cityName = cityNames.get(business.cityId)?.toLowerCase() ?? '';
        const categoryName = categoryNames.get(business.categoryId)?.toLowerCase() ?? '';

        return [
          business.name,
          cityName,
          categoryName,
          business.contact.address ?? '',
        ].some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 10);
  }, [businesses, categoryNames, cityNames, searchQuery]);

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setSearchQuery('');
    setStep(2);
    setSearchParams({ businessId: business.id });
  };

  const handleBackToSearch = () => {
    setSelectedBusiness(null);
    setStep(1);
    setError(null);
    setSearchParams({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBusiness) return;

    setError(null);
    setSubmitting(true);

    try {
      if (!claimsAvailable || !supabase) {
        setError('Claim submission is not available in this environment.');
        setSubmitting(false);
        return;
      }

      const { data: existingClaims } = await supabase
        .from('business_claims')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('business_id', selectedBusiness.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (existingClaims) {
        if (existingClaims.status === 'pending') {
          setError('You already have a pending claim for this business.');
          setSubmitting(false);
          return;
        }
        if (existingClaims.status === 'approved') {
          setError('You have already claimed this business.');
          setSubmitting(false);
          return;
        }
      }

      const { data: otherApprovedClaim } = await supabase
        .from('business_claims')
        .select('id, claimant_name')
        .eq('business_id', selectedBusiness.id)
        .eq('status', 'approved')
        .neq('user_id', user.id)
        .maybeSingle();

      if (otherApprovedClaim) {
        setError('This business has already been claimed by another user.');
        setSubmitting(false);
        return;
      }

      const { data: rejectedClaim } = await supabase
        .from('business_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', selectedBusiness.id)
        .eq('status', 'rejected')
        .maybeSingle();

      if (rejectedClaim) {
        await supabase
          .from('business_claims')
          .delete()
          .eq('id', rejectedClaim.id);
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
        setSubmitting(false);
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

    const redirectPath = `${window.location.pathname}${window.location.search}`;
    const { error } = await signInWithGoogle(redirectPath);

    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  if (authLoading || (user && directoryLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && !claimsAvailable) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center py-24 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white border border-zinc-200 p-12 max-w-xl w-full mx-4 rounded-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center z-10">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-sm flex items-center justify-center mx-auto mb-8">
            <Zap className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-4 text-zinc-900">System Offline</h2>
          <p className="text-zinc-500 font-sans text-lg leading-relaxed">
            Claim submission requires a configured environment. Please contact support.
          </p>
        </motion.div>
      </div>
    );
  }

  if (user && !directoryLoading && businesses.length === 0) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center py-24 relative overflow-hidden font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-zinc-200 p-12 max-w-xl w-full mx-4 rounded-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center z-10"
        >
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-sm flex items-center justify-center mx-auto mb-8">
            <Search className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-4 text-zinc-900">No Listings Loaded</h2>
          <p className="text-zinc-500 font-sans text-lg leading-relaxed">
            The directory data is not available right now. Refresh and try again.
          </p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center py-24 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white border border-zinc-200 p-12 max-w-xl w-full mx-4 rounded-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center z-10">
          <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-sm flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Check className="w-8 h-8 text-orange-500" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-4 text-zinc-900">Claim Submitted</h2>
          <p className="text-zinc-600 mb-10 font-sans text-lg leading-relaxed">
            Your verification data for <strong className="text-zinc-900 font-semibold">{selectedBusiness?.name}</strong> has been transmitted. 
            Our team will notify you once approval is complete.
          </p>
          <Link to="/claim/status" className="inline-flex items-center justify-center gap-3 w-full bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-800 active:scale-[0.98] rounded-md shadow-md group">
            Monitor Status <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
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
              src={businessBgSrc}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              onError={createImageFallbackHandler(businessBg)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
          </div>
          
          <div className="relative z-20 max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-10 w-full">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex flex-col items-start text-left max-w-2xl flex-1">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionEyebrow
                    icon={Building2}
                    className="mb-8 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-100 shadow-sm backdrop-blur-md"
                    iconClassName="h-3.5 w-3.5 text-zinc-300"
                  >
                    Claim Process
                  </SectionEyebrow>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tighter mb-8 leading-[1.05] drop-shadow-2xl"
                >
                  Locate Your <br /> <span className="font-serif italic font-light text-zinc-200">Enterprise.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl text-zinc-300 mb-12 font-sans leading-relaxed text-balance drop-shadow-md"
                >
                  You must have an active system account to initiate a listing claim process. Authenticate to proceed.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full lg:w-[450px] bg-white border border-zinc-200 p-8 lg:p-12 rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] text-zinc-900"
              >
                <div className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md text-red-700 px-4 py-3 text-sm font-medium text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={oauthLoading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] rounded-md shadow-sm disabled:opacity-50"
                  >
                    <GoogleIcon />
                    {oauthLoading ? 'Connecting...' : 'Continue with Google'}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-200"></div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Security Gateway</span>
                    <div className="h-px flex-1 bg-zinc-200"></div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Link
                      to="/claim"
                      className="w-full inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-800 active:scale-[0.98] rounded-md shadow-md group"
                    >
                      Continue <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to="/register" 
                      className="w-full inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 hover:border-zinc-300 transition-all rounded-md"
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
      <header className="bg-white border-b border-zinc-200 py-16 md:py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>
        
        <div className="relative max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-10 z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <div className="max-w-3xl">
              <SectionEyebrow
                icon={Building2}
                className="mb-8 inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 rounded-full shadow-sm"
                iconClassName="h-3.5 w-3.5 text-zinc-500"
              >
                Ownership Verification
              </SectionEyebrow>
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter mb-6 leading-none">
                {step === 1 ? 'Locate Enterprise.' : 'Verify Assets.'}
              </h1>
              <p className="text-lg md:text-xl font-sans leading-relaxed text-zinc-600">
                {step === 1 
                  ? 'Identify your trade business within the regional infrastructure database.'
                  : 'Establish administrative control through structural documentation.'}
              </p>
            </div>
            
            <div className="shrink-0">
              <div className="font-mono text-xs font-bold tracking-[0.2em] text-zinc-500 border border-zinc-200 bg-white rounded-full px-6 py-2 uppercase shadow-sm">
                Step <span className="text-zinc-900">0{step}</span> / 02
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-24 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay z-0"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-12">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-zinc-400 group-focus-within:text-orange-500 transition-colors" strokeWidth={2} />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operational database..."
                  className="w-full bg-white border border-zinc-200 rounded-sm px-16 py-6 text-xl font-medium text-zinc-900 outline-none shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] focus:border-zinc-300 transition-all"
                  autoFocus
                />
              </div>

              {directoryError ? (
                <div className="rounded-sm border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
                  Live directory data is unavailable. Search is using the local fallback dataset right now.
                </div>
              ) : null}

              {filteredBusinesses.length > 0 ? (
                <div className="bg-white border border-zinc-200 rounded-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="bg-zinc-50 border-b border-zinc-100 px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Results Matching Query
                  </div>
                  {filteredBusinesses.map((business, i) => (
                    <button
                      key={business.id}
                      onClick={() => handleSelectBusiness(business)}
                      className={`w-full text-left px-8 py-6 hover:bg-zinc-50 transition-all group flex items-center justify-between ${i !== filteredBusinesses.length - 1 ? 'border-b border-zinc-100' : ''}`}
                    >
                      <div>
                        <p className="font-semibold text-xl text-zinc-900 group-hover:text-orange-600 tracking-tight transition-colors mb-1">{business.name}</p>
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                            {cityNames.get(business.cityId) || business.cityId}
                          </p>
                          <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                          <p className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {categoryNames.get(business.categoryId) || business.categoryId}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center group-hover:border-zinc-900 group-hover:bg-zinc-900 transition-all duration-300">
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-24 bg-white border border-zinc-200 rounded-sm shadow-sm">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-sm flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-zinc-900 font-semibold tracking-tight text-2xl mb-3 leading-none">No Matches Found</p>
                  <p className="text-zinc-500 text-lg">Verify your query or <Link to="/claim-business" className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-4 decoration-orange-200 hover:decoration-orange-500 transition-colors">submit a new listing</Link>.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Find by Name', desc: 'Enter the registered trade name of your enterprise.', icon: Search },
                    { title: 'Global Reach', desc: 'Every verified business in the Okanagan is indexed.', icon: MapPin }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-zinc-200 rounded-sm p-8 group hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 ease-[0.16,1,0.3,1]">
                      <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors duration-300">
                        <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                      </div>
                      <h4 className="font-semibold text-lg tracking-tight mb-2 text-zinc-900">{item.title}</h4>
                      <p className="text-zinc-500 text-base leading-relaxed">{item.desc}</p>
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
              <div className="bg-zinc-900 text-white p-8 lg:p-10 rounded-sm flex items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <Building2 className="w-48 h-48" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent z-0"></div>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-sm border border-white/20 flex items-center justify-center shrink-0 z-10">
                  <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400 mb-3">Target Entity</p>
                  <p className="font-medium text-3xl md:text-4xl tracking-tight leading-none text-white">{selectedBusiness?.name}</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-sm p-8 lg:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <User className="w-3.5 h-3.5" /> Claimant Name *
                    </label>
                    <input 
                      type="text"
                      value={claimData.claimantName}
                      onChange={(e) => setClaimData({...claimData, claimantName: e.target.value})}
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <Mail className="w-3.5 h-3.5" /> Email Address *
                    </label>
                    <input 
                      type="email"
                      value={claimData.claimantEmail}
                      onChange={(e) => setClaimData({...claimData, claimantEmail: e.target.value})}
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                      placeholder="operator@example.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={claimData.claimantPhone}
                      onChange={(e) => setClaimData({...claimData, claimantPhone: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm"
                      placeholder="(250) 555-0000"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5" /> Authority Level *
                    </label>
                    <div className="relative">
                      <select 
                        value={claimData.relationshipToBusiness}
                        onChange={(e) => setClaimData({...claimData, relationshipToBusiness: e.target.value})}
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="authorized">Authorized Rep</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Additional Verification Notes</label>
                  <textarea
                    value={claimData.message}
                    onChange={(e) => setClaimData({...claimData, message: e.target.value})}
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all resize-none shadow-sm"
                    placeholder="Provide details to verify your structural ownership..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-100">
                  <button 
                    type="button"
                    onClick={handleBackToSearch}
                    className="w-full sm:w-16 flex items-center justify-center bg-white border border-zinc-200 rounded-md py-4 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98] shadow-sm"
                    title="Back to search"
                  >
                    <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-zinc-900 text-white rounded-md px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all group shadow-md hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting...' : <>Submit for Verification <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} /></>}
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
