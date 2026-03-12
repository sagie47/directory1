import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasApprovedClaim } from '../lib/auth';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [canAccessOwnerDashboard, setCanAccessOwnerDashboard] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setCanAccessOwnerDashboard(false);
      return () => {
        isActive = false;
      };
    }

    if (profile?.role === 'admin') {
      setCanAccessOwnerDashboard(true);
      return () => {
        isActive = false;
      };
    }

    hasApprovedClaim(user.id)
      .then((hasClaim) => {
        if (!isActive) {
          return;
        }

        setCanAccessOwnerDashboard(hasClaim);
      })
      .catch((claimError) => {
        console.error('Error checking owner dashboard access:', claimError);

        if (!isActive) {
          return;
        }

        setCanAccessOwnerDashboard(false);
      });

    return () => {
      isActive = false;
    };
  }, [profile?.role, user]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-8 w-20 bg-zinc-100 animate-pulse rounded-sm"></div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
        <Link
          to="/login"
          className="inline-flex items-center justify-center border-2 border-zinc-200 bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-all hover:border-zinc-900 hover:text-zinc-950"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-3 border-2 border-zinc-200 bg-white px-3 py-2.5 font-sans text-[13px] font-semibold text-zinc-700 transition-all hover:border-zinc-900 hover:text-zinc-950"
      >
        <span className="flex h-8 w-8 items-center justify-center border border-zinc-900 bg-zinc-900 text-white">
          <User className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="hidden max-w-[180px] truncate sm:inline">{user.email}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] sm:hidden">Account</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-lg rounded-sm py-1 z-50">
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="font-sans text-sm text-zinc-900 truncate">{user.email}</p>
            <p className="font-sans text-xs text-zinc-500 capitalize">{profile?.role?.replace('_', ' ') || 'Consumer'}</p>
          </div>
          
          <Link
            to="/account"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" strokeWidth={1.5} />
            Account
          </Link>

          {canAccessOwnerDashboard && (
            <Link
              to="/owner/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Building className="h-4 w-4" strokeWidth={1.5} />
              Owner Dashboard
            </Link>
          )}

          <div className="border-t border-zinc-100 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
