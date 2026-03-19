import { useState, useRef, useEffect, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Building, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  mobile?: boolean;
}

export default function UserMenu({ mobile = false }: UserMenuProps) {
  const { user, profile, loading, signOut, hasApprovedClaim } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const canAccessOwnerDashboard = hasApprovedClaim || profile?.role === 'admin';
  const menuPanelId = `${useId()}-panel`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className={`${mobile ? 'h-12 w-full' : 'h-8 w-20'} bg-zinc-100 animate-pulse rounded-sm`}></div>
    );
  }

  if (!user) {
    if (mobile) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-[1.15rem] border border-zinc-900 bg-zinc-900 px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex min-h-12 items-center justify-center rounded-[1.15rem] border border-zinc-900/10 bg-white px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900/25 hover:bg-zinc-50 hover:text-zinc-950"
          >
            Create account
          </Link>
        </div>
      );
    }

    return null;
  }

  return (
    <div className={`relative ${mobile ? 'w-full' : ''}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={menuPanelId}
        className={`inline-flex items-center gap-3 border-2 border-zinc-200 bg-white px-3 py-2.5 font-sans text-[13px] font-semibold text-zinc-700 transition-all hover:border-zinc-900 hover:text-zinc-950 ${mobile ? 'w-full justify-between rounded-[1.15rem] px-4 py-3' : ''}`}
      >
        <span className="flex h-8 w-8 items-center justify-center border border-zinc-900 bg-zinc-900 text-white">
          <User className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className={`${mobile ? 'max-w-[unset] flex-1 truncate text-left' : 'hidden max-w-[180px] truncate sm:inline'}`}>{user.email}</span>
        <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${mobile ? 'hidden' : 'sm:hidden'}`}>Account</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div id={menuPanelId} className={`${mobile ? 'mt-3 w-full overflow-hidden rounded-[1.15rem] border border-zinc-200 bg-white shadow-sm' : 'absolute right-0 z-50 mt-2 w-56 rounded-sm border border-zinc-200 bg-white py-1 shadow-lg'}`}>
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

          {profile?.role === 'admin' && (
            <Link
              to="/admin/claims"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              Claims Admin
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
