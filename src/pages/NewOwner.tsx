
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createOwner } from "@/services/ownerService";
import Navbar from "@/components/layout/Navbar";
import SubNavigation from "@/components/layout/SubNavigation";
import OwnerInfoForm from "@/components/owners/OwnerInfoForm";
import { toast } from "@/hooks/use-toast";

const NewOwner = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate("/pipeline?tab=owner");
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Ajouter le statut initial
      const ownerData = {
        ...data,
        relationship_status: "Nouveau contact"
      };
      
      const newOwnerId = await createOwner(ownerData);
      
      if (newOwnerId) {
        toast({
          title: "Propriétaire créé",
          description: "Le propriétaire a été créé avec succès."
        });
        
        navigate(`/owners/${newOwnerId}`);
      } else {
        throw new Error("Erreur lors de la création du propriétaire");
      }
    } catch (error) {
      console.error("Error creating owner:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le propriétaire. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="container max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-xl font-bold">Nouveau propriétaire</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent>
              <OwnerInfoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} isNew />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NewOwner;
