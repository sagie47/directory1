import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireRole?: UserRole[];
  requireApprovedClaim?: boolean;
}

export default function AuthGuard({ children, requireRole, requireApprovedClaim = false }: AuthGuardProps) {
  const { user, profile, loading, hasApprovedClaim } = useAuth();
  const location = useLocation();

  if (loading) {
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
    const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

  if (requireRole && requireRole.length > 0) {
    const hasRequiredRole = profile && requireRole.includes(profile.role);
    if (!hasRequiredRole) {
      return <Navigate to="/account" replace />;
    }
  }

  if (requireApprovedClaim && !hasApprovedClaim && profile?.role !== 'admin') {
    return <Navigate to="/claim/status" replace />;
  }

  return <>{children}</>;
}
