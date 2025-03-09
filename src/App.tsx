
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Leads from "./pages/Leads";
import LeadEdit from "./pages/LeadEdit";
import LeadNew from "./pages/LeadNew";
import Kanban from "./pages/Kanban";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import { useIsMobile } from "./hooks/use-mobile";
import { cn } from "./lib/utils";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed} 
        onClose={() => setSidebarOpen(false)} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        sidebarOpen && !sidebarCollapsed && !isMobile ? "ml-64" : "",
        sidebarOpen && sidebarCollapsed && !isMobile ? "ml-20" : ""
      )}>
        <Navbar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/new" element={<LeadNew />} />
            <Route path="/leads/:id" element={<LeadEdit />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
