
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Leads from "./pages/Leads";
import LeadEdit from "./pages/LeadEdit";
import LeadNew from "./pages/LeadNew";
import Pipeline from "./pages/Pipeline";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ApiGuide from "./pages/ApiGuide";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import SubNavigation from "./components/layout/SubNavigation";
import AdminBadgeWrapper from "./components/layout/AdminBadgeWrapper";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LeadImport from "./pages/LeadImport";
import ChatGadaitPage from '@/pages/ChatGadaitPage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  // Define paths that should show the sub-navigation
  const showSubNav = ['/pipeline', '/calendar', '/chat-gadait', '/reports', '/leads', '/'].includes(location.pathname) || 
                      location.pathname.startsWith('/leads/') || 
                      location.pathname.startsWith('/lead-');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (location.pathname === '/auth') {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={false} 
        onClose={() => setSidebarOpen(false)} 
        onToggleCollapse={() => {}} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center">
          <Navbar toggleSidebar={toggleSidebar} />
          <AdminBadgeWrapper />
        </div>
        {showSubNav && <SubNavigation />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/leads/new" element={<ProtectedRoute><LeadNew /></ProtectedRoute>} />
            <Route path="/leads/:id" element={<ProtectedRoute><LeadEdit /></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/api" element={<ProtectedRoute><ApiGuide /></ProtectedRoute>} />
            <Route path="/lead-import" element={<ProtectedRoute><LeadImport /></ProtectedRoute>} />
            <Route path="/chat-gadait" element={<ChatGadaitPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
