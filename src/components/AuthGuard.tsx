import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { hasApprovedClaim } from '../lib/auth';

interface AuthGuardProps {
  children: ReactNode;
  requireRole?: UserRole[];
  requireApprovedClaim?: boolean;
}

export default function AuthGuard({ children, requireRole, requireApprovedClaim = false }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const [claimLoading, setClaimLoading] = useState(requireApprovedClaim);
  const [approvedClaim, setApprovedClaim] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!requireApprovedClaim || !user || profile?.role === 'admin') {
      setApprovedClaim(profile?.role === 'admin');
      setClaimLoading(false);
      return () => {
        isActive = false;
      };
    }

    setClaimLoading(true);

    hasApprovedClaim(user.id).then((hasClaim) => {
      if (!isActive) {
        return;
      }

      setApprovedClaim(hasClaim);
      setClaimLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [profile?.role, requireApprovedClaim, user]);

  if (loading || claimLoading) {
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
    return <Navigate to="/login" replace />;
  }

  if (requireRole && requireRole.length > 0) {
    const hasRequiredRole = profile && requireRole.includes(profile.role);
    if (!hasRequiredRole) {
      return <Navigate to="/account" replace />;
    }
  }

  if (requireApprovedClaim && !approvedClaim) {
    return <Navigate to="/claim/status" replace />;
  }

  return <>{children}</>;
}
