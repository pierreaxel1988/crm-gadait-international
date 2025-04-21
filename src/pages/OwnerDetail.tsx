
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Tag, Clipboard, User, MessageSquare, Check, Plus, ListChecks } from "lucide-react";
import { getOwnerById, updateOwner, updateOwnerStatus } from "@/services/ownerService";
import { LeadStatus } from "@/components/common/StatusBadge";
import Navbar from "@/components/layout/Navbar";
import SubNavigation from "@/components/layout/SubNavigation";
import OwnerInfoForm from "@/components/owners/OwnerInfoForm";
import OwnerPropertiesSection from "@/components/owners/OwnerPropertiesSection";
import OwnerActionsSection from "@/components/owners/OwnerActionsSection";
import OwnerNotes from "@/components/owners/OwnerNotes";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { toast } from "@/hooks/use-toast";

const OwnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchOwner = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const ownerData = await getOwnerById(id);
      
      if (ownerData) {
        setOwner(ownerData);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de trouver ce propriétaire."
        });
        navigate("/pipeline?tab=owner");
      }
      
      setIsLoading(false);
    };

    fetchOwner();
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/pipeline?tab=owner");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    const success = await updateOwnerStatus(id, newStatus);
    if (success && owner) {
      setOwner({
        ...owner,
        relationship_status: newStatus
      });
    }
  };

  const handleOwnerUpdate = async (data: any) => {
    if (!id) return;
    
    const success = await updateOwner(id, data);
    if (success) {
      setOwner({
        ...owner,
        ...data
      });
      
      toast({
        title: "Propriétaire mis à jour",
        description: "Les informations ont été enregistrées avec succès."
      });
    }
  };

  const handleCall = () => {
    if (owner?.phone) {
      window.open(`tel:${owner.phone}`);
    }
  };

  const handleMail = () => {
    if (owner?.email) {
      window.open(`mailto:${owner.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (owner?.phone) {
      const phoneNumber = owner.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}`);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-xl font-bold">{owner?.full_name || "Fiche propriétaire"}</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="properties">Biens</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="notes">Observations</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OwnerInfoForm owner={owner} onSubmit={handleOwnerUpdate} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="properties" className="mt-0">
                  <OwnerPropertiesSection ownerId={id!} properties={owner?.properties || []} />
                </TabsContent>

                <TabsContent value="actions" className="mt-0">
                  <OwnerActionsSection ownerId={id!} />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <OwnerNotes 
                    owner={owner}
                    onUpdate={handleOwnerUpdate}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statut et actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Statut de la relation</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Nouveau contact", "En cours de qualification", "Mandat proposé", "Mandat signé", "Mandat expiré", "Inactif / En pause"].map((status) => (
                        <Button 
                          key={status} 
                          variant={owner?.relationship_status === status ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleStatusChange(status)}
                          className="text-xs"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Type de mandat</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Simple", "Exclusif", "Semi-exclusif"].map((type) => (
                        <Button 
                          key={type} 
                          variant={owner?.mandate_type === type ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleOwnerUpdate({ mandate_type: type })}
                          className="text-xs"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={handleCall}
                      disabled={!owner?.phone}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={handleMail}
                      disabled={!owner?.email}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={handleWhatsApp}
                      disabled={!owner?.phone}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerDetail;
