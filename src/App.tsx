
import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import LoadingScreen from './components/layout/LoadingScreen';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// Lazy load all pages to use suspense
const Auth = lazy(() => import('./pages/Auth'));
const Pipeline = lazy(() => 
  import('./pages/Pipeline')
    .catch(error => {
      console.error('Erreur de chargement du composant Pipeline:', error);
      throw error;
    })
);
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
const PropertiesPage = lazy(() => import('./pages/Properties'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary fallback={<LoadingScreen />}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Navigate to="/pipeline" />} />
              
              {/* Routes accessibles à tous */}
              <Route path="/pipeline" element={
                <ProtectedRoute commercialAllowed={true}>
                  <ErrorBoundary fallback={<LoadingScreen />}>
                    <Pipeline />
                  </ErrorBoundary>
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
              {/* Nouvelle route pour les propriétés */}
              <Route path="/properties" element={
                <ProtectedRoute commercialAllowed={true}>
                  <PropertiesPage />
                </ProtectedRoute>
              } />
              {/* Nouvelle route pour le profil */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
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
              
              {/* Route d'authentification */}
              <Route path="/auth" element={<Auth />} />
            </Routes>
            <Toaster />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
