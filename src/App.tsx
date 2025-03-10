import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Leads from '@/pages/Leads';
import LeadNew from '@/pages/LeadNew';
import LeadEdit from '@/pages/LeadEdit';
import Pipeline from '@/pages/Pipeline';
import Calendar from '@/pages/Calendar';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';
import Layout from '@/components/layout/Layout';
import { cn as cx } from "@/lib/utils";
import Properties from '@/pages/Properties';
import PropertySelection from '@/pages/PropertySelection';
import PropertySelectionView from '@/pages/PropertySelectionView';
import { Loader } from 'lucide-react';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cx('App')}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/selections/:token" element={<PropertySelectionView />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/new" element={<LeadNew />} />
            <Route path="/leads/:id" element={<LeadEdit />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/lead-selection" element={<PropertySelection />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  )
}

export default App;
