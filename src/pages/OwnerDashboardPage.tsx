import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Business, BusinessHours } from '../business';

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

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { businesses, cities, isLoading: directoryLoading, refresh } = useDirectoryData();
  const [approvedClaim, setApprovedClaim] = useState<BusinessClaim | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownerToolsAvailable = Boolean(supabase && isSupabaseConfigured());

  const [formData, setFormData] = useState({
    description: '',
    phone: '',
    website: '',
    email: '',
    serviceAreas: '',
    hours: { ...defaultHours },
  });

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
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!claimsData) {
        setLoading(false);
        return;
      }

      setApprovedClaim(claimsData as BusinessClaim);

      const businessData = businesses.find(
        b => b.id === (claimsData as BusinessClaim).business_id
      );
      setBusiness(businessData || null);

      const { data: overrideData } = await supabase
        .from('business_overrides')
        .select('*')
        .eq('business_id', (claimsData as BusinessClaim).business_id)
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

    fetchData();
  }, [businesses, directoryLoading, ownerToolsAvailable, user]);

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
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
    >
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-4 uppercase rounded-sm shadow-sm">
              <Activity className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Owner Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
              {business.name}
            </h1>
            <p className="text-zinc-500 mt-1">
              {city?.name} • {business.categoryId}
            </p>
          </div>
          <Link 
            to={`/${business.cityId}/${business.categoryId}/${business.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View Listing →
          </Link>
        </div>

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
    </motion.div>
  );
}
