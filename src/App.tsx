
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Auth from './pages/Auth';
import Pipeline from './pages/Pipeline';
import LeadsPage from './pages/Leads';
import LeadDetail from './pages/LeadDetailMobile';
import LeadNew from './pages/LeadNew';
import LeadImport from './pages/LeadImport';
import MobileLeadImport from './pages/MobileLeadImport';
import ActionsPage from './pages/Actions';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LeadEdit from './pages/LeadEdit';
import ChatGadaitPage from './pages/ChatGadaitPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/pipeline" />} />
          
          {/* Routes accessibles à tous */}
          <Route path="/pipeline" element={
            <ProtectedRoute commercialAllowed={true}>
              <Pipeline />
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
          <Route path="/chat-gadait" element={
            <ProtectedRoute commercialAllowed={true}>
              <ChatGadaitPage />
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
          <Route path="/reports" element={
            <ProtectedRoute adminOnly={true} commercialAllowed={false}>
              <Reports />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
