
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyFilter } from '@/types/property';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyGrid from '@/components/properties/PropertyGrid';
import { getProperties, createPropertySelection, sendSelectionByEmail } from '@/services/propertyService';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import CustomButton from '@/components/ui/CustomButton';
import { ArrowLeft, Send, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const PropertySelection = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [selectionName, setSelectionName] = useState('');
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadDetailed | null>(null);
  const [leads, setLeads] = useState<LeadDetailed[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
    fetchLeads();
  }, []);

  const fetchProperties = async (currentFilters: PropertyFilter = {}) => {
    setLoading(true);
    try {
      const data = await getProperties(currentFilters);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    // Ici, vous pouvez utiliser votre service de leads existant
    // pour récupérer la liste des leads
    try {
      // Placeholder: dans un cas réel, vous récupéreriez les leads depuis votre API/service
      // const leadsList = await getLeads();
      
      // Pour l'exemple, nous utilisons un lead fictif (à remplacer par vos données réelles)
      const lead = await getLead('1');
      if (lead) {
        setLeads([lead]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleFilterChange = (newFilters: PropertyFilter) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const handleSendSelection = async () => {
    if (!selectedLead || !selectionName || selectedProperties.length === 0) {
      return;
    }

    setSending(true);
    try {
      const selection = await createPropertySelection(
        selectionName,
        selectedLead,
        selectedProperties
      );

      if (selection && selectedLead.email) {
        await sendSelectionByEmail(selection.id, selectedLead.email);
        setIsSendDialogOpen(false);
        navigate('/properties');
      }
    } catch (error) {
      console.error('Error sending selection:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center text-loro-navy hover:text-loro-navy/80 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Retour aux propriétés</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-times text-loro-navy">Créer une sélection de propriétés</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Input 
            type="text" 
            placeholder="Nom de la sélection"
            value={selectionName}
            onChange={(e) => setSelectionName(e.target.value)}
            className="min-w-[200px]"
          />
          <CustomButton
            variant="chocolate"
            onClick={() => setIsSendDialogOpen(true)}
            disabled={selectedProperties.length === 0 || !selectionName}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Envoyer ({selectedProperties.length})
          </CustomButton>
        </div>
      </div>
      
      <PropertyFilters onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-chocolate-dark border-t-transparent"></div>
        </div>
      ) : (
        <PropertyGrid 
          properties={properties} 
          selectedProperties={selectedProperties}
          onSelectProperty={handlePropertySelect}
          showSelectButton={true}
        />
      )}
      
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer la sélection</DialogTitle>
            <DialogDescription>
              Choisissez un lead à qui envoyer cette sélection de {selectedProperties.length} propriétés.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <div className="max-h-[200px] overflow-y-auto">
              {filteredLeads.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucun lead trouvé</p>
              ) : (
                filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    className={`p-3 rounded-md mb-2 cursor-pointer flex items-center ${
                      selectedLead?.id === lead.id ? 'bg-chocolate-light/20' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center mr-3">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <DialogFooter>
            <CustomButton
              variant="outline"
              onClick={() => setIsSendDialogOpen(false)}
            >
              Annuler
            </CustomButton>
            <CustomButton
              variant="chocolate"
              onClick={handleSendSelection}
              disabled={!selectedLead || sending}
              className="flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer
                </>
              )}
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertySelection;
