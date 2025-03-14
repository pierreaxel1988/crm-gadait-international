
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import StatsSection from '@/components/dashboard/StatsSection';
import ActivitySection from '@/components/dashboard/ActivitySection';
import ImportedLeadsSection from '@/components/dashboard/ImportedLeadsSection';
import { useAuth } from '@/hooks/useAuth';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from 'sonner';

const Index = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Add debug logging to help diagnose
    console.log("Index page rendering", { user });
    
    // Let the user know the page is loaded
    toast.info("Dashboard loaded", {
      description: "Welcome to your luxury real estate management dashboard",
      duration: 3000
    });
  }, [user]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-loro-navy">Tableau de bord</h1>
          <p className="text-loro-hazel">Bienvenue dans votre espace de gestion immobilière de luxe</p>
        </div>
        
        <Link to="/lead-import">
          <CustomButton className="flex items-center gap-2 bg-loro-navy hover:bg-loro-navy/90">
            <Upload size={18} />
            <span>Importer des leads</span>
          </CustomButton>
        </Link>
      </div>
      
      <StatsSection />
      
      <ActivitySection />

      {user && (
        <ImportedLeadsSection />
      )}
    </div>
  );
};

export default Index;
