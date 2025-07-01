
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
import LeadDetail from "./pages/LeadDetail";
import LeadDetailMobile from "./pages/LeadDetailMobile";
import NewLead from "./pages/NewLead";
import ImportLead from "./pages/ImportLead";
import Actions from "./pages/Actions";
import ApiDocs from "./pages/ApiDocs";
import SearchPage from "./pages/SearchPage";
import { ThemeProvider } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/leads/new" element={<NewLead />} />
      <Route path="/import-lead" element={<ImportLead />} />
      <Route path="/actions" element={<Actions />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="/search" element={<SearchPage />} />
      <Route 
        path="/leads/:id" 
        element={isMobile ? <LeadDetailMobile /> : <LeadDetail />} 
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
