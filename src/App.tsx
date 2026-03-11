import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import CityPage from './pages/CityPage';
import CategoryPage from './pages/CategoryPage';
import BusinessPage from './pages/BusinessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClaimPage from './pages/ClaimPage';
import ClaimStatusPage from './pages/ClaimStatusPage';
import ClaimBusinessPage from './pages/ClaimBusinessPage';
import ForBusinessPage from './pages/ForBusinessPage';
import AccountPage from './pages/AccountPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import TradesPage from './pages/TradesPage';
import RegionsPage from './pages/RegionsPage';
import VerifiedPage from './pages/VerifiedPage';
import SearchPage from './pages/SearchPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import { DirectoryDataProvider } from './directory-data';

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
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="signup" element={<Navigate to="/claim" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
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
        
        {/* City/Category/Business routes */}
        <Route path=":cityId" element={<CityPage />} />
        <Route path=":cityId/:categoryId" element={<CategoryPage />} />
        <Route path=":cityId/:categoryId/:businessId" element={<BusinessPage />} />
      </Routes>
    </AnimatePresence>
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
