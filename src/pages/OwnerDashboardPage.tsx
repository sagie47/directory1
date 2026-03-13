import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Save, AlertCircle, CheckCircle, Check, ArrowRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Business, BusinessHours } from '../business';
import { getOwnerRecommendation } from '../lib/recommendations';
import { trackEvent } from '../lib/analytics';
import businessBg from '../photos/businessown/thumbnail_G74A6639.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

interface BusinessClaim {
  id: string;
  business_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
}

interface BusinessOverride {
  business_id: string;
  description?: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  service_areas?: string[];
  hours?: BusinessHours;
  photos?: string[];
}

const defaultHours: BusinessHours = {
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '',
  saturday: '',
  sunday: '',
};

function hasBusinessHours(hours: BusinessHours) {
  return Object.values(hours).some((value) => Boolean(value?.trim()));
}

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { businesses, cities, isLoading: directoryLoading, refresh } = useDirectoryData();
  const [approvedClaims, setApprovedClaims] = useState<BusinessClaim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [approvedClaim, setApprovedClaim] = useState<BusinessClaim | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownerToolsAvailable = Boolean(supabase && isSupabaseConfigured());
  const businessBgSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessBg);

  const [formData, setFormData] = useState({
    description: '',
    phone: '',
    website: '',
    email: '',
    serviceAreas: '',
    hours: { ...defaultHours },
  });

  useEffect(() => {
    trackEvent('owner_dashboard_viewed');
  }, []);

  useEffect(() => {
    if (business) {
      const rec = getOwnerRecommendation({
        business,
        claimStatus: 'approved',
      });
      trackEvent('owner_dashboard_recommendation_viewed', { type: rec.type });
    }
  }, [business]);

  const normalizeHours = (hours?: BusinessHours) => {
    const normalized = { ...defaultHours };

    if (!hours) {
      return normalized;
    }

    for (const [day, value] of Object.entries(hours)) {
      const normalizedDay = day.toLowerCase() as keyof BusinessHours;
      if (normalizedDay in normalized) {
        normalized[normalizedDay] = value;
      }
    }

    return normalized;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (directoryLoading) {
        return;
      }

      if (!ownerToolsAvailable || !supabase || !user) {
        setLoading(false);
        return;
      }

      const { data: claimsData } = await supabase
        .from('business_claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false });

      if (!claimsData || claimsData.length === 0) {
        setLoading(false);
        return;
      }

      setApprovedClaims(claimsData as BusinessClaim[]);
      
      if (claimsData.length === 1) {
        setSelectedClaimId(claimsData[0].id);
        setApprovedClaim(claimsData[0] as BusinessClaim);
        loadBusinessForClaim(claimsData[0] as BusinessClaim);
      } else {
        setSelectedClaimId(null);
        setApprovedClaim(null);
        setBusiness(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [businesses, directoryLoading, ownerToolsAvailable, user]);

  const loadBusinessForClaim = async (claim: BusinessClaim) => {
    if (!supabase) return;

    const businessData = businesses.find(b => b.id === claim.business_id);
    setBusiness(businessData || null);

    const { data: overrideData } = await supabase
      .from('business_overrides')
      .select('*')
      .eq('business_id', claim.business_id)
      .maybeSingle();

    if (overrideData) {
      const o = overrideData as BusinessOverride;
      setFormData({
        description: o.description || businessData?.description || '',
        phone: o.contact?.phone || businessData?.contact?.phone || '',
        website: o.contact?.website || businessData?.contact?.website || '',
        email: o.contact?.email || businessData?.contact?.email || '',
        serviceAreas: o.service_areas?.join(', ') || businessData?.serviceAreas?.join(', ') || '',
        hours: normalizeHours(o.hours || businessData?.hours),
      });
    } else {
      setFormData({
        description: businessData?.description || '',
        phone: businessData?.contact?.phone || '',
        website: businessData?.contact?.website || '',
        email: businessData?.contact?.email || '',
        serviceAreas: businessData?.serviceAreas?.join(', ') || '',
        hours: normalizeHours(businessData?.hours),
      });
    }

    setLoading(false);
  };

  const handleSelectClaim = (claimId: string) => {
    const claim = approvedClaims.find(c => c.id === claimId);
    if (claim) {
      setSelectedClaimId(claimId);
      setApprovedClaim(claim);
      loadBusinessForClaim(claim);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !approvedClaim || !supabase || !ownerToolsAvailable) return;

    setError(null);
    setSaving(true);
    setSaveSuccess(false);

    const overrideData = {
      business_id: approvedClaim.business_id,
      description: formData.description || null,
      contact: {
        phone: formData.phone || null,
        website: formData.website || null,
        email: formData.email || null,
      },
      service_areas: formData.serviceAreas ? formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean) : [],
      hours: formData.hours,
      updated_by: user.id,
    };

    const { error: upsertError } = await supabase
      .from('business_overrides')
      .upsert(overrideData, { onConflict: 'business_id' });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    await refresh();
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleHoursChange = (day: keyof BusinessHours, value: string) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: value,
      },
    });
  };

  if (authLoading || directoryLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full"></div>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!ownerToolsAvailable) {
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
            <h2 className="text-2xl font-medium tracking-tight mb-4">Dashboard Unavailable</h2>
            <p className="text-zinc-500">
              The owner dashboard requires a configured Supabase environment.
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!approvedClaim || !business) {
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
            <h2 className="text-2xl font-medium tracking-tight mb-4">No Approved Claims</h2>
            <p className="text-zinc-500 mb-6">
              You don't have an approved business claim. Claim a business to access the owner dashboard.
            </p>
            <Link 
              to="/claim" 
              className="inline-block bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
            >
              Claim a Business
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const city = cities.find(c => c.id === business.cityId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 min-h-screen text-white font-sans relative"
    >
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={businessBgSrc}
          alt="" 
          className="w-full h-full object-cover"
          onError={createImageFallbackHandler(businessBg)}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.15em] mb-4 uppercase px-4 py-2 rounded-sm shadow-sm">
              <Activity className="h-3.5 w-3.5 text-zinc-300" strokeWidth={1.5} /> Owner Dashboard
            </div>
            {approvedClaims.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-400 mb-2">Select business to manage:</label>
                <select
                  value={selectedClaimId || ''}
                  onChange={(e) => handleSelectClaim(e.target.value)}
                  className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-md px-3 py-2 text-sm font-medium text-white bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="" disabled>Select a business...</option>
                  {approvedClaims.map((claim) => {
                    const b = businesses.find(bus => bus.id === claim.business_id);
                    return (
                      <option key={claim.id} value={claim.id}>
                        {b?.name || claim.business_id}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
              {business.name}
            </h1>
            <p className="text-zinc-400 mt-1">
              {city?.name} • {business.categoryId}
            </p>
          </div>
          <Link 
            to={`/${business.cityId}/${business.categoryId}/${business.id}`}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View Listing →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-sm">
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm rounded-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Changes saved successfully!
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Business Description</h2>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm resize-none"
                placeholder="Describe your business..."
              />
            </div>

            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Phone</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="(250) 555-0000"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Website</label>
                  <input 
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="contact@business.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Service Areas</h2>
              <input 
                type="text"
                value={formData.serviceAreas}
                onChange={(e) => setFormData({...formData, serviceAreas: e.target.value})}
                className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                placeholder="Kelowna, West Kelowna, Lake Country (comma separated)"
              />
              <p className="text-xs text-zinc-500 mt-2">Separate multiple service areas with commas.</p>
            </div>

            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Business Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-zinc-700 capitalize">{day}</label>
                    <input 
                      type="text"
                      value={formData.hours[day] || ''}
                      onChange={(e) => handleHoursChange(day, e.target.value)}
                      className="flex-1 border border-zinc-200 bg-[#FAFAFA] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                      placeholder="9:00 AM - 5:00 PM"
                    />
                  </div>
                ))}
              </div>
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

              <p className="text-xs text-zinc-400 pt-4 border-t border-zinc-100">
                Note: Only the fields above can be edited. Other business information is sourced from public records.
              </p>
            </form>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white border border-zinc-200 p-6 shadow-sm rounded-sm">
            <h3 className="font-medium text-zinc-900 mb-4 text-lg">Profile Completeness</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Check className={`h-4 w-4 ${formData.description && formData.description.length > 10 ? 'text-green-500' : 'text-zinc-300'}`} />
                <span className={formData.description && formData.description.length > 10 ? 'text-zinc-700' : 'text-zinc-500'}>Business description</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`h-4 w-4 ${formData.phone ? 'text-green-500' : 'text-zinc-300'}`} />
                <span className={formData.phone ? 'text-zinc-700' : 'text-zinc-500'}>Phone number</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`h-4 w-4 ${formData.website ? 'text-green-500' : 'text-zinc-300'}`} />
                <span className={formData.website ? 'text-zinc-700' : 'text-zinc-500'}>Website</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`h-4 w-4 ${formData.serviceAreas && formData.serviceAreas.length > 0 ? 'text-green-500' : 'text-zinc-300'}`} />
                <span className={formData.serviceAreas && formData.serviceAreas.length > 0 ? 'text-zinc-700' : 'text-zinc-500'}>Service areas</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`h-4 w-4 ${hasBusinessHours(formData.hours) ? 'text-green-500' : 'text-zinc-300'}`} />
                <span className={hasBusinessHours(formData.hours) ? 'text-zinc-700' : 'text-zinc-500'}>Business hours</span>
              </li>
            </ul>
          </motion.div>

          {(() => {
            const rec = getOwnerRecommendation({
              business,
              claimStatus: 'approved',
            });
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-white border border-zinc-200 p-6 shadow-sm rounded-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900"></div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Next Step</h3>
                <h4 className="font-bold text-zinc-900 mb-2 text-lg">{rec.title}</h4>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{rec.description}</p>
                {rec.href && rec.ctaLabel && (
                  <Link 
                    to={rec.href}
                    onClick={() => trackEvent('owner_dashboard_recommendation_clicked', { type: rec.type })}
                    className="inline-flex w-full items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-3 text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
                  >
                    {rec.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </motion.div>
            );
          })()}
        </div>
      </div>

      </div>
    </motion.div>
  );
}
