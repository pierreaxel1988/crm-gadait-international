
import React, { useState, useEffect } from "react";
import OwnersList from "@/components/owners/OwnersList";
import OwnerForm from "@/components/owners/OwnerForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getOwners } from "@/services/ownerService";

const OwnersPage = () => {
  const [owners, setOwners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    (async () => {
      setOwners(await getOwners());
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Propriétaires</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? "Annuler" : "Créer un propriétaire"}
        </Button>
      </div>
      {showForm && (
        <div className="mb-8">
          <OwnerForm onComplete={() => setShowForm(false)} />
        </div>
      )}
      <OwnersList owners={owners} />
    </div>
  );
};

export default OwnersPage;
