import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Seo from '../components/Seo';
import SectionEyebrow from '../components/SectionEyebrow';

type Claim = {
  id: string;
  business_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string;
  relationship_to_business: string;
  message: string;
  created_at: string;
};

export default function AdminClaimsPage() {
  const { profile } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [businessNames, setBusinessNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchClaims = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const [claimsResult, businessesResult] = await Promise.all([
        supabase
          .from('business_claims')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true }),
        supabase
          .from('businesses')
          .select('id, name')
      ]);

      if (claimsResult.error) {
        setError(claimsResult.error.message);
      } else {
        setClaims(claimsResult.data || []);
      }

      if (businessesResult.data) {
        const nameMap: Record<string, string> = {};
        businessesResult.data.forEach((b) => {
          nameMap[b.id] = b.name;
        });
        setBusinessNames(nameMap);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClaims();
  }, []);

  const handleAction = async (claimId: string, status: 'approved' | 'rejected') => {
    if (!supabase || !profile) return;
    
    const reason = status === 'rejected' ? rejectionReason[claimId] : null;
    if (status === 'rejected' && (!reason || reason.trim() === '')) {
      setClaimErrors({ ...claimErrors, [claimId]: 'Please provide a rejection reason.' });
      return;
    }
    
    setClaimErrors({ ...claimErrors, [claimId]: '' });

    setProcessingId(claimId);
    setError(null);

    const { error: updateError } = await supabase
      .from('business_claims')
      .update({
        status,
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', claimId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setClaims(claims.filter(c => c.id !== claimId));
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="h-12 w-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative selection:bg-indigo-200 selection:text-indigo-900">
      <Seo title="Admin Claim Review | Okanagan Trades" description="Review pending business claims." path="/admin/claims" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionEyebrow icon={ShieldCheck} className="mb-6 inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm rounded-sm">
          Admin Operations
        </SectionEyebrow>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 text-zinc-900">Claim Queue</h1>
        <p className="text-zinc-600 font-sans font-medium text-lg mb-12">Review and verify ownership requests.</p>

        {error && (
          <div className="mb-8 border-2 border-red-900 bg-red-50 rounded-xl p-4 font-mono text-xs font-bold uppercase tracking-wider text-red-900 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {claims.length === 0 ? (
          <div className="border border-zinc-200 bg-white p-12 text-center rounded-xl shadow-sm">
            <ShieldCheck className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Queue is Empty</p>
            <p className="text-zinc-500">There are no pending claims to review at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <motion.div key={claim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-zinc-200 bg-white p-6 rounded-xl shadow-sm">
                <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                  <div>
                    <div className="mb-4">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">Target Business</p>
                      <p className="font-sans font-medium text-zinc-900 text-lg">{businessNames[claim.business_id] || claim.business_id}</p>
                      <p className="font-mono text-[10px] text-zinc-400 mt-1">ID: {claim.business_id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Claimant</p>
                        <p className="font-medium text-zinc-900">{claim.claimant_name}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Role</p>
                        <p className="font-medium text-zinc-900 capitalize">{claim.relationship_to_business}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Email</p>
                        <p className="font-medium text-zinc-900">{claim.claimant_email}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone</p>
                        <p className="font-medium text-zinc-900">{claim.claimant_phone || 'N/A'}</p>
                      </div>
                    </div>
                    {claim.message && (
                      <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 rounded-md">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Verification Notes</p>
                        <p className="text-sm text-zinc-700 italic">"{claim.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 justify-end border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 md:pl-6">
                    <button
                      onClick={() => handleAction(claim.id, 'approved')}
                      disabled={processingId === claim.id}
                      className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    
                    <div className="space-y-2 mt-4">
                      <input
                        type="text"
                        placeholder="Reason for rejection (required)"
                        value={rejectionReason[claim.id] || ''}
                        onChange={(e) => setRejectionReason({ ...rejectionReason, [claim.id]: e.target.value })}
                        className="w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-400 focus:bg-white rounded-md transition-colors"
                      />
                      {claimErrors[claim.id] && (
                        <p className="text-xs text-red-600 font-medium px-1">
                          {claimErrors[claim.id]}
                        </p>
                      )}
                      <button
                        onClick={() => handleAction(claim.id, 'rejected')}
                        disabled={processingId === claim.id}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-100 px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider rounded-md hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
