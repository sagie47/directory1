import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, LayoutGrid, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import UserMenu from './UserMenu';

const primaryLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/trades', label: 'Trades' },
  { to: '/regions', label: 'Regions' },
  { to: '/verified', label: 'Verified' },
];

type LayoutChromeContextValue = {
  isMobileMenuOpen: boolean;
  isMobileHeaderVisible: boolean;
  openMobileMenu: () => void;
};

const LayoutChromeContext = createContext<LayoutChromeContextValue>({
  isMobileMenuOpen: false,
  isMobileHeaderVisible: true,
  openMobileMenu: () => {},
});

export function useLayoutChrome() {
  return useContext(LayoutChromeContext);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isMobileHeaderHidden, setIsMobileHeaderHidden] = useState(false);
  const location = useLocation();
  const isMobileHeaderVisible = !isMobileHeaderHidden;
  const mobileHeaderHeight = isHeaderCollapsed ? '4rem' : '4.65rem';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isDesktopViewport = window.innerWidth >= 1024;

      setIsHeaderCollapsed(currentScrollY > 0);

      if (isDesktopViewport) {
        setIsMobileHeaderHidden(false);
        return;
      }

      if (currentScrollY <= 4) {
        setIsMobileHeaderHidden(false);
      } else {
        setIsMobileHeaderHidden(true);
      }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const mobileSearchOffset = isMobileHeaderVisible ? mobileHeaderHeight : '0.75rem';

    root.style.setProperty('--mobile-header-height', mobileHeaderHeight);
    root.style.setProperty('--mobile-search-offset', mobileSearchOffset);

    return () => {
      root.style.removeProperty('--mobile-header-height');
      root.style.removeProperty('--mobile-search-offset');
    };
  }, [isMobileHeaderVisible, mobileHeaderHeight]);

  return (
    <LayoutChromeContext.Provider
      value={{
        isMobileHeaderVisible,
        isMobileMenuOpen: isMenuOpen,
        openMobileMenu: () => setIsMenuOpen(true),
      }}
    >
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      <motion.header
        animate={{ y: isMobileHeaderVisible ? 0 : '-100%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 border-b-2 border-zinc-900 bg-[#FAFAFA] will-change-transform lg:sticky"
      >
          <div className="hidden border-b border-zinc-900/10 bg-white sm:block">
            <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-2 px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 lg:px-10">
              <span>Okanagan Valley Contractor Directory</span>
              <Link to="/for-business" className="hidden transition-colors hover:text-zinc-950 md:inline-flex">
                For Business Owners
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
            <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 transition-all duration-200 sm:min-h-[6rem] sm:gap-4 lg:grid-cols-[minmax(19rem,1.1fr)_minmax(0,1fr)_auto] lg:gap-8 ${isHeaderCollapsed ? 'min-h-[4rem]' : 'min-h-[4.65rem] sm:min-h-[6rem]'}`}>
              <Link to="/" className={`group flex min-w-0 items-center gap-3 transition-all duration-200 sm:gap-5 sm:py-5 ${isHeaderCollapsed ? 'py-2' : 'py-2.5 sm:py-5'}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-900 bg-zinc-900 text-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] sm:h-14 sm:w-14 sm:rounded-none sm:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]`}>
                  <LayoutGrid className={`h-4 w-4 sm:h-5 sm:w-5 ${isHeaderCollapsed ? 'sm:h-[1.125rem] sm:w-[1.125rem]' : ''}`} strokeWidth={2.4} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className={`truncate font-sans font-black uppercase leading-none tracking-[-0.03em] text-zinc-950 transition-all duration-200 sm:text-[1.55rem] ${isHeaderCollapsed ? 'text-[0.92rem]' : 'text-[0.98rem]'}`}>Okanagan Trades</div>
                  <div className={`truncate font-mono text-[8px] font-bold uppercase text-zinc-400 transition-all duration-200 group-hover:text-orange-600 sm:text-[10px] sm:tracking-[0.24em] ${isHeaderCollapsed ? 'tracking-[0.14em]' : 'tracking-[0.14em] sm:tracking-[0.18em]'}`}>Verified Regional Network</div>
                </div>
              </Link>

              <nav className="hidden min-w-0 items-center justify-center lg:flex">
                <div className="flex items-center gap-9 border-b-2 border-zinc-200 px-2">
                  {primaryLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `relative py-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                          isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive ? (
                            <motion.span
                              layoutId="nav-underline"
                              className="absolute inset-x-0 bottom-[-2px] h-[2px] bg-zinc-900"
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                            />
                          ) : null}
                          <span className="relative z-10">{link.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </nav>

              <div className={`flex items-center justify-end gap-2 transition-all duration-200 sm:gap-3 sm:py-4 lg:gap-4 ${isHeaderCollapsed ? 'py-1' : 'py-1.5 sm:py-2'}`}>
                <div className="hidden items-center gap-3 md:flex">
                  <Link
                    to="/claim-business"
                    className="inline-flex min-h-11 items-center justify-center border-2 border-zinc-900 bg-zinc-900 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:shadow-none active:scale-[0.98]"
                  >
                    Claim Business
                  </Link>
                  <UserMenu />
                </div>

                <button
                  onClick={() => setIsMenuOpen((current) => !current)}
                  aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-site-navigation"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-zinc-900 bg-white text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white active:scale-95 sm:h-11 sm:w-11 sm:rounded-full lg:hidden"
                >
                  {isMenuOpen ? <X className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.2} /> : <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.2} />}
                </button>
              </div>
            </div>
          </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-zinc-950/72 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              id="mobile-site-navigation"
              initial={{ x: '110%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '110%', opacity: 0 }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-0 z-[70] flex w-full flex-col overflow-hidden bg-[#f3f0e9] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-900/8 bg-white/80 px-5 py-4">
                <div>
                  <div className="font-mono text-[8.5px] font-black uppercase tracking-[0.24em] text-zinc-400">
                    Navigation
                  </div>
                  <div className="mt-1 text-sm font-semibold tracking-[-0.02em] text-zinc-900">
                    Okanagan Trades
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-white text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex flex-grow flex-col justify-between overflow-y-auto px-5 py-5">
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '1.35rem 1.35rem' }}></div>

                <nav className="relative z-10 flex flex-col gap-2">
                  {primaryLinks.map((link, idx) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-[1.35rem] border px-4 py-4 transition-all ${
                          isActive
                            ? 'border-zinc-900/15 bg-white text-zinc-900 shadow-[0_12px_24px_rgba(24,24,27,0.08)]'
                            : 'border-transparent bg-white/45 text-zinc-700 hover:border-zinc-900/10 hover:bg-white hover:text-zinc-950'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-900/10 bg-white/80 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover:text-orange-500">0{idx + 1}</span>
                        <span className="font-sans text-[1.05rem] font-semibold uppercase leading-none tracking-[-0.03em]">{link.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-900" />
                    </NavLink>
                  ))}
                </nav>

                <div className="relative z-10 mt-5 flex flex-col gap-4 border-t border-zinc-900/8 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/claim-business"
                      className="group flex min-h-12 items-center justify-center gap-2 rounded-[1.15rem] border border-zinc-900 bg-zinc-900 px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_28px_rgba(24,24,27,0.16)] transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Claim</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                      <Link
                        to="/for-business"
                        className="flex min-h-12 items-center justify-center rounded-[1.15rem] border border-zinc-900/10 bg-white/78 px-3 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900/25 hover:bg-white hover:text-zinc-950"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        For Business
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <UserMenu />
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-300">v2.4.0</div>
                    </div>
                </div>
              </div>

              <div className="border-t border-zinc-900/8 bg-white/70 px-5 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                Precision Operational Network &copy; 2026
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative flex-grow pt-[var(--mobile-header-height,4.65rem)] lg:pt-0">
        {children}
      </main>

      <footer className="bg-white border-t border-zinc-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 mb-16">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-6 h-6 bg-zinc-900 flex items-center justify-center rounded-sm">
                  <LayoutGrid className="h-3 w-3 text-white" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-sm tracking-tight text-zinc-900">Okanagan Trades</span>
              </div>
              <p className="text-zinc-500 font-sans text-sm leading-relaxed max-w-sm">
                A refined directory connecting homeowners and developers with verified trades professionals across the Okanagan Valley. Precision, reliability, and scale.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:col-span-5 md:col-start-7 md:grid-cols-2">
              <div>
              <h3 className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mb-4 uppercase font-semibold">Locations</h3>
              <ul className="space-y-3">
                <li><Link to="/kelowna" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Kelowna</Link></li>
                <li><Link to="/vernon" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Vernon</Link></li>
                <li><Link to="/penticton" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Penticton</Link></li>
                <li><Link to="/west-kelowna" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">West Kelowna</Link></li>
              </ul>
              </div>
            
              <div>
              <h3 className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mb-4 uppercase font-semibold">For Business</h3>
              <ul className="space-y-3">
                <li><Link to="/claim" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Claim Your Profile</Link></li>
                <li><Link to="/never-miss-a-lead" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Lead Capture System</Link></li>
                <li><Link to="/websites-for-trades" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Websites for Trades</Link></li>
                <li><Link to="/managed-growth" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Managed Growth</Link></li>
                <li><Link to="/for-business" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">For Business</Link></li>
                <li><Link to="/book-demo" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Book Demo</Link></li>
                <li><Link to="/book-call?offer=website" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Book Call</Link></li>
                <li><Link to="/terms" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Privacy</Link></li>
              </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 uppercase">
              &copy; {new Date().getFullYear()} Okanagan Trades. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </LayoutChromeContext.Provider>
  );
}
