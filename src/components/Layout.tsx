import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
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
  const location = useLocation();
  const { source, businesses, cities, isLoading, error } = useDirectoryData();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      <header className="relative sticky top-0 z-50 border-b-2 border-zinc-900 bg-[#FAFAFA]">
        <div className="border-b border-zinc-900/10 bg-white">
          <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:px-6 lg:px-10">
            <span className="sm:hidden">Okanagan Trades</span>
            <span className="hidden sm:inline">Okanagan Valley Contractor Directory</span>
            <Link to="/for-business" className="hidden transition-colors hover:text-zinc-950 md:inline-flex">
              For Business Owners
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
          <div className="grid min-h-[5.25rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:min-h-[6rem] sm:gap-4 lg:grid-cols-[minmax(19rem,1.1fr)_minmax(0,1fr)_auto] lg:gap-8">
            <Link to="/" className="group flex min-w-0 items-center gap-3 py-4 sm:gap-5 sm:py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-zinc-900 bg-zinc-900 text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] sm:h-14 sm:w-14">
                <LayoutGrid className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="font-sans text-[1.15rem] font-black uppercase tracking-[-0.04em] leading-none text-zinc-950 sm:text-[1.55rem]">Okanagan Trades</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors group-hover:text-orange-600 sm:text-[10px] sm:tracking-[0.24em]">Verified Regional Network</div>
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

            <div className="flex items-center justify-end gap-2 py-3 sm:gap-3 sm:py-4 lg:gap-4">
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
                className="flex h-11 w-11 items-center justify-center border-2 border-zinc-900 bg-white text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white active:scale-95 lg:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-5 w-5" strokeWidth={2.2} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-zinc-900/30 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              id="mobile-site-navigation"
              className="absolute inset-x-0 top-full z-50 border-y-2 border-zinc-900 bg-white shadow-[0_14px_30px_rgba(24,24,27,0.18)] lg:hidden"
            >
              <div className="mx-auto flex max-h-[calc(100dvh-8.5rem)] max-w-7xl flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="grid gap-2">
                  {primaryLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `flex min-h-12 items-center justify-between border-2 px-4 py-4 font-sans text-base font-bold uppercase tracking-[0.12em] transition-colors ${
                          isActive ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">Open</span>
                    </NavLink>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-zinc-200 pt-5">
                  <Link
                    to="/claim-business"
                    className="inline-flex min-h-12 items-center justify-center border-2 border-zinc-900 bg-zinc-900 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all hover:border-orange-500 hover:bg-orange-500 hover:shadow-none"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Claim Business
                  </Link>
                  <Link
                    to="/for-business"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    For Business Owners
                  </Link>
                  <UserMenu />
                </div>
              </div>
            </div>
          </>
        )}

      </header>

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
