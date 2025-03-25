import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toast } from '@/components/ui/use-toast';
import Auth from './pages/Auth';
import Pipeline from './pages/Pipeline';
import LeadsPage from './pages/LeadsPage';
import LeadDetail from './pages/LeadDetail';
import LeadNew from './pages/LeadNew';
import LeadImport from './pages/LeadImport';
import MobileLeadImport from './pages/MobileLeadImport';

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
          <Route path="/auth" element={<Auth />} />
        </Routes>
        <Toast />
      </Router>
    </AuthProvider>
  );
}

export default App;
