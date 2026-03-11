import { Link, NavLink } from 'react-router-dom';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, ReactNode } from 'react';

import UserMenu from './UserMenu';

const primaryLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/trades', label: 'Trades' },
  { to: '/regions', label: 'Regions' },
  { to: '/verified', label: 'Verified' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      <header className="sticky top-0 z-50 border-b-2 border-zinc-900 bg-[#FAFAFA]">
        <div className="border-b border-zinc-900/10 bg-white">
          <div className="mx-auto flex max-w-[96rem] items-center justify-between px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 sm:px-6 lg:px-10">
            <span>Okanagan Valley Contractor Directory</span>
            <Link to="/for-business" className="hidden transition-colors hover:text-zinc-950 md:inline-flex">
              For Business Owners
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
          <div className="grid min-h-[6rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid-cols-[minmax(19rem,1.1fr)_minmax(0,1fr)_auto] lg:gap-8">
            <Link to="/" className="group flex min-w-0 items-center gap-5 py-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-zinc-900 bg-zinc-900 text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
                <LayoutGrid className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="font-sans text-[1.55rem] font-black uppercase tracking-[-0.04em] leading-none text-zinc-950">Okanagan Trades</div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400 transition-colors group-hover:text-orange-600">Verified Regional Network</div>
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

            <div className="flex items-center justify-end gap-3 py-4 lg:gap-4">
              <div className="hidden items-center gap-4 md:flex">
                <UserMenu />
              </div>

              <button
                onClick={() => setIsMenuOpen((current) => !current)}
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="flex h-11 w-11 items-center justify-center border-2 border-zinc-900 bg-white text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white active:scale-95 lg:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-5 w-5" strokeWidth={2.2} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t-2 border-zinc-900 bg-white lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6">
              <div className="grid gap-2">
                {primaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between border-2 px-4 py-4 font-sans text-base font-bold uppercase tracking-[0.12em] transition-colors ${
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
        )}
      </header>

      <main className="flex-grow relative">
        {children}
      </main>

      <footer className="bg-white border-t border-zinc-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
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
            
            <div className="md:col-span-2 md:col-start-7">
              <h3 className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mb-4 uppercase font-semibold">Locations</h3>
              <ul className="space-y-3">
                <li><Link to="/kelowna" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Kelowna</Link></li>
                <li><Link to="/vernon" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Vernon</Link></li>
                <li><Link to="/penticton" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Penticton</Link></li>
                <li><Link to="/west-kelowna" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">West Kelowna</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mb-4 uppercase font-semibold">Directory</h3>
              <ul className="space-y-3">
                <li><Link to="/claim-business" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Add Business</Link></li>
                <li><Link to="/claim-business" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Claim Listing</Link></li>
                <li><Link to="/for-business" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">For Business</Link></li>
                <li><Link to="/terms" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Privacy</Link></li>
                <li><Link to="/contact" className="font-sans text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Contact</Link></li>
              </ul>
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
