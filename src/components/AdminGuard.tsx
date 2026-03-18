import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Verifying Clearance
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/account?denied=1" replace />;
  }

  return <>{children}</>;
}
