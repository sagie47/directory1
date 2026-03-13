import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useDirectoryData } from '../directory-data';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getOwnerRecommendation } from '../lib/recommendations';
import { trackEvent } from '../lib/analytics';

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
  const [error, setError] = useState<string | null>(null);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const viewedRecommendationKeys = useRef<Set<string>>(new Set());

  const businessesById = useMemo(() => {
    return new Map(businesses.map((b) => [b.id, b]));
  }, [businesses]);

  useEffect(() => {
    trackEvent('claim_status_viewed');
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!claimsAvailable || !supabase || !user) {
        setClaims([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_claims')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else if (data) {
          setClaims(data as BusinessClaim[]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load claims');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClaims();
    }
  }, [claimsAvailable, user]);

  useEffect(() => {
    if (loading || directoryLoading || claims.length === 0) {
      return;
    }

    for (const claim of claims) {
      if (claim.status === 'revoked') {
        continue;
      }

      const business = businessesById.get(claim.business_id);
      const recommendation = getOwnerRecommendation({
        business,
        claimStatus: claim.status,
      });
      const key = `${claim.id}:${recommendation.type}`;

      if (viewedRecommendationKeys.current.has(key)) {
        continue;
      }

      viewedRecommendationKeys.current.add(key);
      trackEvent('claim_status_recommendation_viewed', {
        claimId: claim.id,
        businessId: claim.business_id,
        claimStatus: claim.status,
        recommendationType: recommendation.type,
        hasPrimaryCta: Boolean(recommendation.href && recommendation.ctaLabel),
        ctaTarget: recommendation.href ?? null,
      });
    }
  }, [businesses, claims, directoryLoading, loading]);

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

  const hasBusinessHours = (hours?: Record<string, string>) =>
    Boolean(hours && Object.values(hours).some((value) => Boolean(value?.trim())));

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

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
      >
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 p-6 rounded-sm text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="text-xl font-medium tracking-tight mb-2 text-red-900">Error Loading Claims</h2>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-2"
            >
              Try again
            </button>
          </motion.div>
        </div>
      </motion.div>
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
              {claims.map((claim) => {
                const business = businessesById.get(claim.business_id);
                const recommendation = getOwnerRecommendation({
                  business,
                  claimStatus: claim.status,
                });

                return (
                <div 
                  key={claim.id}
                  className="border border-zinc-200 p-4 rounded-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-900">{business?.name ?? claim.business_id}</h3>
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

                  {claim.status === 'pending' && (
                    <div className="pt-6 border-t border-zinc-100 mt-4">
                      <p className="text-zinc-900 font-medium mb-1">What happens next?</p>
                      <p className="text-sm text-zinc-500 mb-6">We are reviewing your ownership request. While you wait, you can review your profile status.</p>
                      
                      {business && (
                        <div className="bg-zinc-50 p-5 rounded-sm mb-6 border border-zinc-100">
                          <p className="text-sm font-medium text-zinc-900 mb-3">Profile Completeness</p>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm">
                              <Check className={`h-4 w-4 ${business.description && business.description.length > 10 ? 'text-green-500' : 'text-zinc-300'}`} />
                              <span className={business.description && business.description.length > 10 ? 'text-zinc-700' : 'text-zinc-500'}>Business description</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                              <Check className={`h-4 w-4 ${business.contact?.phone ? 'text-green-500' : 'text-zinc-300'}`} />
                              <span className={business.contact?.phone ? 'text-zinc-700' : 'text-zinc-500'}>Phone number</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                              <Check className={`h-4 w-4 ${business.contact?.website ? 'text-green-500' : 'text-zinc-300'}`} />
                              <span className={business.contact?.website ? 'text-zinc-700' : 'text-zinc-500'}>Website</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                              <Check className={`h-4 w-4 ${business.serviceAreas && business.serviceAreas.length > 0 ? 'text-green-500' : 'text-zinc-300'}`} />
                              <span className={business.serviceAreas && business.serviceAreas.length > 0 ? 'text-zinc-700' : 'text-zinc-500'}>Service areas</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                              <Check className={`h-4 w-4 ${hasBusinessHours(business.hours) ? 'text-green-500' : 'text-zinc-300'}`} />
                              <span className={hasBusinessHours(business.hours) ? 'text-zinc-700' : 'text-zinc-500'}>Business hours</span>
                            </li>
                          </ul>
                        </div>
                      )}

                      <div className="bg-white border border-zinc-200 p-5 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900"></div>
                        <h4 className="font-bold text-zinc-900 mb-2">{recommendation.title}</h4>
                        <p className="text-sm text-zinc-500 mb-4">{recommendation.description}</p>
                        {recommendation.href && recommendation.ctaLabel ? (
                          <Link 
                            to={recommendation.href}
                            onClick={() => trackEvent('claim_status_recommendation_clicked', {
                              claimId: claim.id,
                              businessId: claim.business_id,
                              claimStatus: claim.status,
                              recommendationType: recommendation.type,
                              ctaTarget: recommendation.href,
                            })}
                            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors"
                          >
                            {recommendation.ctaLabel} <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-zinc-700">
                            You’ll be able to complete this after approval.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {claim.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <Link 
                        to="/owner/dashboard" 
                        className="inline-block bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm"
                      >
                        Go to Dashboard
                      </Link>
                      {recommendation.href && (
                        <div className="text-sm text-zinc-500">
                          <span className="mr-2">Next step:</span>
                          <Link 
                            to={recommendation.href}
                            onClick={() => trackEvent('claim_status_recommendation_clicked', {
                              claimId: claim.id,
                              businessId: claim.business_id,
                              claimStatus: claim.status,
                              recommendationType: recommendation.type,
                              ctaTarget: recommendation.href,
                            })}
                            className="font-medium text-zinc-900 hover:text-orange-600 underline underline-offset-4 decoration-zinc-300 hover:decoration-orange-600 transition-all"
                          >
                            {recommendation.title}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {claim.status === 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      {claim.rejection_reason && (
                        <p className="text-sm text-red-600 mb-3">
                          Reason: {claim.rejection_reason}
                        </p>
                      )}
                      <p className="text-sm text-zinc-600 mb-4">
                        Review the reason above and submit a new claim if you have updated ownership details.
                      </p>
                      {recommendation.href && recommendation.ctaLabel && (
                        <Link
                          to={recommendation.href}
                          onClick={() => trackEvent('claim_status_recommendation_clicked', {
                            claimId: claim.id,
                            businessId: claim.business_id,
                            claimStatus: claim.status,
                            recommendationType: recommendation.type,
                            ctaTarget: recommendation.href,
                          })}
                          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors"
                        >
                          {recommendation.ctaLabel} <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  )}

                  {claim.status === 'revoked' && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <p className="text-sm text-red-600 mb-3">
                        Your claim has been revoked. This may mean the business ownership has been transferred or there was a violation of our terms.
                      </p>
                      <p className="text-sm text-zinc-600 mb-4">
                        Please contact support if you believe this is an error.
                      </p>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors"
                      >
                        Contact Support <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
