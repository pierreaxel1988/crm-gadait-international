
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
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/pipeline" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
          <Route path="/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
          <Route path="/leads/new" element={<ProtectedRoute><LeadNew /></ProtectedRoute>} />
          <Route path="/leads/import" element={<ProtectedRoute><LeadImport /></ProtectedRoute>} />
          <Route path="/import-lead" element={<ProtectedRoute><MobileLeadImport /></ProtectedRoute>} />
          <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
