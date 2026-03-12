import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight, LayoutGrid, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, ReactNode } from 'react';

import UserMenu from './UserMenu';
import { useDirectoryData } from '../directory-data';

const primaryLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/trades', label: 'Trades' },
  { to: '/regions', label: 'Regions' },
  { to: '/verified', label: 'Verified' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isMobileHeaderHidden, setIsMobileHeaderHidden] = useState(false);
  const location = useLocation();
  const { source, businesses, cities, isLoading, error } = useDirectoryData();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isDesktopViewport = window.innerWidth >= 1024;

      setIsHeaderCollapsed(currentScrollY > 24);

      if (isDesktopViewport) {
        setIsMobileHeaderHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 24 || currentScrollY < lastScrollY - 8) {
        setIsMobileHeaderHidden(false);
      } else if (currentScrollY > 80 && currentScrollY > lastScrollY + 8) {
        setIsMobileHeaderHidden(true);
      }

      lastScrollY = currentScrollY;
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
    if (isMenuOpen) {
      setIsMobileHeaderHidden(false);
    }
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      <header className="relative sticky top-0 z-50 border-b-2 border-zinc-900 bg-[#FAFAFA]">
        <motion.div
          animate={{ y: isMobileHeaderHidden && !isMenuOpen ? '-100%' : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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
            <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 transition-all duration-200 sm:min-h-[6rem] sm:gap-4 lg:grid-cols-[minmax(19rem,1.1fr)_minmax(0,1fr)_auto] lg:gap-8 ${isHeaderCollapsed ? 'min-h-[3.75rem]' : 'min-h-[4.35rem] sm:min-h-[6rem]'}`}>
              <Link to="/" className={`group flex min-w-0 items-center gap-2.5 transition-all duration-200 sm:gap-5 sm:py-5 ${isHeaderCollapsed ? 'py-2' : 'py-2.5 sm:py-5'}`}>
                <div className={`flex shrink-0 items-center justify-center border-2 border-zinc-900 bg-zinc-900 text-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] sm:h-14 sm:w-14 sm:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] ${isHeaderCollapsed ? 'h-9 w-9' : 'h-11 w-11'}`}>
                  <LayoutGrid className={`sm:h-5 sm:w-5 ${isHeaderCollapsed ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} strokeWidth={2.4} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className={`truncate font-sans font-black uppercase leading-none tracking-[-0.03em] text-zinc-950 transition-all duration-200 sm:text-[1.55rem] ${isHeaderCollapsed ? 'text-[0.94rem]' : 'text-[1.02rem]'}`}>Okanagan Trades</div>
                  <div className={`truncate font-mono text-[9px] font-bold uppercase text-zinc-400 transition-all duration-200 group-hover:text-orange-600 sm:text-[10px] sm:tracking-[0.24em] ${isHeaderCollapsed ? 'tracking-[0.14em]' : 'tracking-[0.16em] sm:tracking-[0.18em]'}`}>Verified Regional Network</div>
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

              <div className={`flex items-center justify-end gap-2 transition-all duration-200 sm:gap-3 sm:py-4 lg:gap-4 ${isHeaderCollapsed ? 'py-1.5' : 'py-1.5 sm:py-2'}`}>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-900 bg-white text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white active:scale-95 sm:h-11 sm:w-11 lg:hidden"
                >
                  {isMenuOpen ? <X className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.2} /> : <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.2} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-md lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              id="mobile-site-navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col overflow-hidden border-l-2 border-zinc-900 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-[#FAFAFA] px-5 py-4">
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Menu
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex flex-grow flex-col justify-between overflow-hidden px-5 py-5">
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '1.5rem 1.5rem' }}></div>

                <nav className="relative z-10 flex flex-col">
                  {primaryLinks.map((link, idx) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `group flex items-center justify-between border-b border-zinc-100 py-4 transition-all ${
                          isActive ? 'text-orange-600' : 'text-zinc-900 hover:text-orange-500'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] font-black text-zinc-300 transition-colors group-hover:text-orange-400">0{idx + 1}</span>
                        <span className="font-sans text-xl font-black uppercase leading-none tracking-tighter">{link.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </NavLink>
                  ))}
                </nav>

                <div className="relative z-10 mt-5 flex flex-col gap-3">
                    <Link
                      to="/claim-business"
                      className="group flex w-full items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Claim Business
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
                      <Link
                        to="/for-business"
                        className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-950"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Business Owner Portal
                      </Link>
                      <div className="flex items-center justify-between">
                        <UserMenu />
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-300">v2.4.0</div>
                      </div>
                    </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 bg-[#FAFAFA] px-5 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                Precision Operational Network &copy; 2026
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {import.meta.env.DEV ? (
        <div className="border-b border-zinc-200 bg-amber-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 sm:px-6 lg:px-10">
          Data: {isLoading ? 'loading' : source} | Businesses: {businesses.length} | Cities: {cities.length}
          {error ? ` | Error: ${error}` : ''}
        </div>
      ) : null}

      <main className="flex-grow relative">
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
  );
}
