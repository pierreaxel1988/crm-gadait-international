
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/pipeline" />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/leads/new" element={<LeadNew />} />
          <Route path="/leads/import" element={<LeadImport />} />
          <Route path="/import-lead" element={<MobileLeadImport />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
