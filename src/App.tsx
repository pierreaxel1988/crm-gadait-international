import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { correctAllLeadAssignments } from './services/leadService';
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import PipelinePage from './pages/PipelinePage';
import LeadDetailPage from './pages/LeadDetailPage';
import NewLeadPage from './pages/NewLeadPage';
import ActionsPage from './pages/ActionsPage';
import SettingsPage from './pages/SettingsPage';
import TeamMembersPage from './pages/TeamMembersPage';
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

const App = () => {
  useEffect(() => {
    // Corriger les assignations de leads au démarrage de l'application
    const fixLeadAssignments = async () => {
      try {
        console.log("Correcting lead assignments at application startup...");
        await correctAllLeadAssignments();
        console.log("Lead assignments correction completed successfully");
      } catch (error) {
        console.error("Error correcting lead assignments:", error);
      }
    };
    
    fixLeadAssignments();
  }, []);
  
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><DashboardLayout><PipelinePage /></DashboardLayout></RequireAuth>} />
        <Route path="/pipeline" element={<RequireAuth><DashboardLayout><PipelinePage /></DashboardLayout></RequireAuth>} />
        <Route path="/leads/:leadId" element={<RequireAuth><DashboardLayout><LeadDetailPage /></DashboardLayout></RequireAuth>} />
        <Route path="/leads/new" element={<RequireAuth><DashboardLayout><NewLeadPage /></DashboardLayout></RequireAuth>} />
        <Route path="/actions" element={<RequireAuth><DashboardLayout><ActionsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/team-members" element={<RequireAuth><DashboardLayout><TeamMembersPage /></DashboardLayout></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
