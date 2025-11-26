
import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from './components/layout/LoadingScreen';
import { usePageTracking } from '@/hooks/usePageTracking';
import Auth from './pages/Auth';
import Pipeline from './pages/Pipeline';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import '@/utils/testDatoCmsSync'; // Utilitaire de test disponible via window.testDatoCmsSync()

// Lazy load other pages to use suspense
const LeadsPage = lazy(() => import('./pages/Leads'));
const LeadDetail = lazy(() => import('./pages/LeadDetailMobile'));
const LeadNew = lazy(() => import('./pages/LeadNew'));
const LeadImport = lazy(() => import('./pages/LeadImport'));
const MobileLeadImport = lazy(() => import('./pages/MobileLeadImport'));
const ActionsPage = lazy(() => import('./pages/Actions'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Admin = lazy(() => import('./pages/Admin'));
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ChatGadaitPage = lazy(() => import('./pages/ChatGadaitPage'));
const LeadsAnalytics = lazy(() => import('./pages/LeadsAnalytics'));

const AppContent = () => {
  const { user } = useAuth();
  usePageTracking(user?.id);
  
  return (
    <Suspense fallback={<LoadingScreen fullscreen={true} />}>
      <Routes>
            <Route path="/" element={<Navigate to="/pipeline" />} />
            
            {/* Route d'authentification - Auth component loaded directly */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Routes accessibles à tous */}
            <Route path="/pipeline" element={
              <ProtectedRoute commercialAllowed={true}>
                <Pipeline />
              </ProtectedRoute>
            } />
            <Route path="/properties" element={
              <ProtectedRoute commercialAllowed={true}>
                <Properties />
              </ProtectedRoute>
            } />
            <Route path="/properties/:slug" element={
              <ProtectedRoute commercialAllowed={true}>
                <PropertyDetail />
              </ProtectedRoute>
            } />
            <Route path="/properties/id/:id" element={
              <ProtectedRoute commercialAllowed={true}>
                <PropertyDetail />
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute commercialAllowed={true}>
                <LeadsPage />
              </ProtectedRoute>
            } />
            <Route path="/leads/:id" element={
              <ProtectedRoute commercialAllowed={true}>
                <LeadDetail />
              </ProtectedRoute>
            } />
            <Route path="/leads/new" element={
              <ProtectedRoute commercialAllowed={true}>
                <LeadNew />
              </ProtectedRoute>
            } />
            <Route path="/actions" element={
              <ProtectedRoute commercialAllowed={true}>
                <ActionsPage />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute commercialAllowed={true}>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute commercialAllowed={true}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute commercialAllowed={true}>
                <ChatGadaitPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute commercialAllowed={true}>
                <LeadsAnalytics />
              </ProtectedRoute>
            } />
            
            {/* Routes réservées aux administrateurs */}
            <Route path="/leads/import" element={
              <ProtectedRoute adminOnly={true} commercialAllowed={false}>
                <LeadImport />
              </ProtectedRoute>
            } />
            <Route path="/import-lead" element={
              <ProtectedRoute adminOnly={true} commercialAllowed={false}>
                <MobileLeadImport />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true} commercialAllowed={false}>
                <Admin />
              </ProtectedRoute>
            } />
            
            {/* Fallback pour les routes non trouvées */}
            <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
