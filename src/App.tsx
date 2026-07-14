import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
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
const ClassifiedsPage = lazy(() => import('./pages/ClassifiedsPage'));
const ClassifiedsPostPage = lazy(() => import('./pages/ClassifiedsPostPage'));
const ClassifiedsSubmittedPage = lazy(() => import('./pages/ClassifiedsSubmittedPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NeverMissLeadPage = lazy(() => import('./pages/NeverMissLeadPage'));
const BookDemoPage = lazy(() => import('./pages/BookDemoPage'));
const DemoRequestedPage = lazy(() => import('./pages/DemoRequestedPage'));
const WebsitesForTradesPage = lazy(() => import('./pages/WebsitesForTradesPage'));
const ManagedGrowthPage = lazy(() => import('./pages/ManagedGrowthPage'));
const OnDemandDayLaborPage = lazy(() => import('./pages/OnDemandDayLaborPage'));
const BookCallPage = lazy(() => import('./pages/BookCallPage'));
const CallRequestedPage = lazy(() => import('./pages/CallRequestedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));
const AdminClaimsPage = lazy(() => import('./pages/AdminClaimsPage'));
const AdminClassifiedsPage = lazy(() => import('./pages/AdminClassifiedsPage'));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function DirectoryDataBoundary() {
  return (
    <DirectoryDataProvider>
      <Outlet />
    </DirectoryDataProvider>
  );
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
          <Route element={<DirectoryDataBoundary />}>
            <Route index element={<Home />} />
            <Route path="claim" element={<ClaimPage />} />
            <Route path="trades" element={<TradesPage />} />
            <Route path="regions" element={<RegionsPage />} />
            <Route path="verified" element={<VerifiedPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="classifieds" element={<ClassifiedsPage />} />
            <Route path="classifieds/post" element={<ClassifiedsPostPage />} />
            <Route path="classifieds/submitted" element={<ClassifiedsSubmittedPage />} />
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
            <Route
              path="admin/classifieds"
              element={
                <AdminGuard>
                  <AdminClassifiedsPage />
                </AdminGuard>
              }
            />
            <Route path=":cityId" element={<CityPage />} />
            <Route path=":cityId/:categoryId" element={<CategoryPage />} />
          </Route>

          {/* Public routes without directory data */}
          <Route path=":cityId/:categoryId/:businessId" element={<BusinessPage />} />
          <Route path="signup" element={<Navigate to="/claim" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="update-password" element={<UpdatePasswordPage />} />
          <Route path="claim-business" element={<ClaimBusinessPage />} />
          <Route path="for-business" element={<ForBusinessPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="never-miss-a-lead" element={<NeverMissLeadPage />} />
          <Route path="book-demo" element={<BookDemoPage />} />
          <Route path="demo-requested" element={<DemoRequestedPage />} />
          <Route path="websites-for-trades" element={<WebsitesForTradesPage />} />
          <Route path="managed-growth" element={<ManagedGrowthPage />} />
          <Route path="on-demand-day-labor" element={<OnDemandDayLaborPage />} />
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
            path="admin"
            element={
              <AdminGuard>
                <Navigate to="/admin/claims" replace />
              </AdminGuard>
            }
          />
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
    <AppShell />
  );
}
