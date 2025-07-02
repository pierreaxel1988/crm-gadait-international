
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Pipeline from "./pages/Pipeline";
import Calendar from "./pages/Calendar";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import LeadDetailDesktop from "./pages/LeadDetailDesktop";
import LeadDetailMobile from "./pages/LeadDetailMobile";
import LeadNew from "./pages/LeadNew";
import LeadImport from "./pages/LeadImport";
import Actions from "./pages/Actions";
import ApiGuide from "./pages/ApiGuide";
import Leads from "./pages/Leads";
import { ThemeProvider } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/leads/new" element={<LeadNew />} />
      <Route path="/import-lead" element={<LeadImport />} />
      <Route path="/actions" element={<Actions />} />
      <Route path="/api-docs" element={<ApiGuide />} />
      <Route path="/search" element={<Leads />} />
      <Route 
        path="/leads/:id" 
        element={isMobile ? <LeadDetailMobile /> : <LeadDetailDesktop />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
