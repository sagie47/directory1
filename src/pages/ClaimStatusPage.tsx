import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface BusinessClaim {
  id: string;
  business_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  claimant_name: string;
  claimant_email: string;
  claimant_phone?: string;
  relationship_to_business: string;
  message?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export default function ClaimStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const { businesses, isLoading: directoryLoading } = useDirectoryData();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());

  useEffect(() => {
    const fetchClaims = async () => {
      if (!claimsAvailable || !supabase || !user) {
        setClaims([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClaims(data as BusinessClaim[]);
      }
      setLoading(false);
    };

    if (user) {
      fetchClaims();
    }
  }, [claimsAvailable, user]);

  const getBusinessName = (businessId: string) => {
    const business = businesses.find((entry) => entry.id === businessId);
    return business?.name || businessId;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" strokeWidth={1.5} />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" strokeWidth={1.5} />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" strokeWidth={1.5} />;
      case 'revoked':
        return <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={1.5} />;
      default:
        return <Clock className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'revoked':
        return 'Revoked';
      default:
        return status;
    }
  };

  if (authLoading || loading || directoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full"></div>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!claimsAvailable) {
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
            <h2 className="text-2xl font-medium tracking-tight mb-4">Claims Unavailable</h2>
            <p className="text-zinc-500">
              Claim status requires a configured Supabase environment.
            </p>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-8 uppercase rounded-sm shadow-sm">
            <Activity className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Claim Status
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Your Claims
          </h1>
          <p className="text-zinc-500 font-sans text-lg max-w-xl mx-auto leading-relaxed">
            Track the status of your business listing claims.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm">
          {claims.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-6">You haven't submitted any claims yet.</p>
              <Link 
                to="/claim" 
                className="inline-block bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
              >
                Claim a Business
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div 
                  key={claim.id}
                  className="border border-zinc-200 p-4 rounded-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-900">{getBusinessName(claim.business_id)}</h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Submitted on {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Relationship: {claim.relationship_to_business}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <span className={`text-sm font-medium ${
                        claim.status === 'approved' ? 'text-green-600' :
                        claim.status === 'pending' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  </div>
                  
                  {claim.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <Link 
                        to="/owner/dashboard" 
                        className="inline-block bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  )}
                  
                  {claim.status === 'rejected' && claim.rejection_reason && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <p className="text-sm text-red-600">
                        Reason: {claim.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
