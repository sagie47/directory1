import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import { DirectoryDataProvider } from './directory-data';

const Home = lazy(() => import('./pages/Home'));
const CityPage = lazy(() => import('./pages/CityPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const BusinessPage = lazy(() => import('./pages/BusinessPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ClaimPage = lazy(() => import('./pages/ClaimPage'));
const ClaimStatusPage = lazy(() => import('./pages/ClaimStatusPage'));
const ClaimBusinessPage = lazy(() => import('./pages/ClaimBusinessPage'));
const ForBusinessPage = lazy(() => import('./pages/ForBusinessPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage'));
const TradesPage = lazy(() => import('./pages/TradesPage'));
const RegionsPage = lazy(() => import('./pages/RegionsPage'));
const VerifiedPage = lazy(() => import('./pages/VerifiedPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NeverMissLeadPage = lazy(() => import('./pages/NeverMissLeadPage'));
const BookDemoPage = lazy(() => import('./pages/BookDemoPage'));
const DemoRequestedPage = lazy(() => import('./pages/DemoRequestedPage'));
const WebsitesForTradesPage = lazy(() => import('./pages/WebsitesForTradesPage'));
const ManagedGrowthPage = lazy(() => import('./pages/ManagedGrowthPage'));
const BookCallPage = lazy(() => import('./pages/BookCallPage'));
const CallRequestedPage = lazy(() => import('./pages/CallRequestedPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));
const AdminClaimsPage = lazy(() => import('./pages/AdminClaimsPage'));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA] px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Loading page</p>
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="signup" element={<Navigate to="/claim" replace />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="update-password" element={<UpdatePasswordPage />} />
          <Route path="claim" element={<ClaimPage />} />
          <Route path="claim-business" element={<ClaimBusinessPage />} />
          <Route path="for-business" element={<ForBusinessPage />} />
          <Route path="trades" element={<TradesPage />} />
          <Route path="regions" element={<RegionsPage />} />
          <Route path="verified" element={<VerifiedPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="never-miss-a-lead" element={<NeverMissLeadPage />} />
          <Route path="book-demo" element={<BookDemoPage />} />
          <Route path="demo-requested" element={<DemoRequestedPage />} />
          <Route path="websites-for-trades" element={<WebsitesForTradesPage />} />
          <Route path="managed-growth" element={<ManagedGrowthPage />} />
          <Route path="book-call" element={<BookCallPage />} />
          <Route path="call-requested" element={<CallRequestedPage />} />

          {/* Protected routes */}
          <Route
            path="account"
            element={
              <AuthGuard>
                <AccountPage />
              </AuthGuard>
            }
          />
          <Route
            path="claim/status"
            element={
              <AuthGuard>
                <ClaimStatusPage />
              </AuthGuard>
            }
          />
          <Route
            path="owner/dashboard"
            element={
              <AuthGuard requireApprovedClaim>
                <OwnerDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="admin/claims"
            element={
              <AdminGuard>
                <AdminClaimsPage />
              </AdminGuard>
            }
          />

          {/* City/Category/Business routes */}
          <Route path=":cityId" element={<CityPage />} />
          <Route path=":cityId/:categoryId" element={<CategoryPage />} />
          <Route path=":cityId/:categoryId/:businessId" element={<BusinessPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DirectoryDataProvider>
      <AppShell />
    </DirectoryDataProvider>
  );
}
