
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './hooks/useAuth';
import Pipeline from './pages/Pipeline';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Leads from './pages/Leads';
import LeadNew from './pages/LeadNew';
import MobileLeadImport from './pages/MobileLeadImport';
import LeadImport from './pages/LeadImport';
import LeadEdit from './pages/LeadEdit';
import LeadDetailMobile from './pages/LeadDetailMobile';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Actions from './pages/Actions';
import ChatGadaitPage from './pages/ChatGadaitPage';
import Admin from './pages/Admin';
import ApiGuide from './pages/ApiGuide';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { useIsMobile } from './hooks/use-mobile';
import ChatGadaitButton from './components/chat/ChatGadaitButton';

import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Add effect to handle initialization
  useEffect(() => {
    if (!loading) {
      // Give a small delay to ensure everything is loaded properly
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Return early while auth is initializing
  if (loading || !appReady) {
    return (
      <div className="bg-slate-50 flex justify-center items-center h-screen">
        <div className="animate-pulse font-extralight text-2xl text-loro-navy">GADAIT</div>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <div className="flex h-screen bg-slate-50">
          {!isMobile && (
            <Sidebar 
              isOpen={sidebarOpen} 
              isCollapsed={sidebarCollapsed} 
              onClose={handleToggleSidebar} 
              onToggleCollapse={handleToggleCollapse}
            />
          )}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/leads/new" element={<ProtectedRoute><LeadNew /></ProtectedRoute>} />
              <Route path="/leads/import" element={<ProtectedRoute>{isMobile ? <MobileLeadImport /> : <LeadImport />}</ProtectedRoute>} />
              <Route path="/leads/:id" element={<ProtectedRoute>{isMobile ? <LeadDetailMobile /> : <LeadEdit />}</ProtectedRoute>} />
              <Route path="/actions" element={<ProtectedRoute><Actions /></ProtectedRoute>} />
              <Route path="/chat-gadait" element={<ProtectedRoute><ChatGadaitPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              <Route path="/api" element={<ProtectedRoute><ApiGuide /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {user && <ChatGadaitButton />}
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      )}
      <Toaster />
    </div>
  );
}

export default App;
