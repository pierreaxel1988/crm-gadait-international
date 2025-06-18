
import React from 'react';
import { ArrowLeft, Phone, MessageCircle, Mail, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadDetailed } from '@/types/lead';
import LeadTag from '@/components/common/LeadTag';

interface LeadDetailHeaderProps {
  name: string;
  createdAt: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  country?: string;
  purchaseTimeframe?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: string[];
  onPhoneCall: (e: React.MouseEvent) => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
  onEmailClick: (e: React.MouseEvent) => void;
  onCallComplete: () => void;
  // Add lead prop to access all lead data including desired_price and pipeline_type
  lead?: LeadDetailed;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency = 'EUR',
  desiredLocation,
  country,
  purchaseTimeframe,
  onBackClick,
  onSave,
  isSaving,
  hasChanges,
  tags,
  onPhoneCall,
  onWhatsAppClick,
  onEmailClick,
  onCallComplete,
  lead
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (symbol: string) => {
    switch (symbol) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'CHF': return 'Fr';
      case 'AED': return 'د.إ';
      case 'MUR': return '₨';
      default: return symbol;
    }
  };

  // Get the appropriate price/budget display based on pipeline type
  const getPriceDisplay = () => {
    if (!lead) return budget;
    
    // For owners pipeline, use desired_price
    if (lead.pipelineType === 'owners') {
      return lead.desired_price;
    }
    
    // For leads pipeline, use budget
    return budget;
  };

  const priceToDisplay = getPriceDisplay();

  return (
    <div className="bg-[#051B30] text-white">
      <div className="flex items-center justify-between p-4 pt-2">
        <div className="flex items-center gap-3 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick}
            className="text-white hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium truncate">{name}</h1>
            <p className="text-sm text-white/70">{formatDate(createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {phone && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onPhoneCall}
              className="text-white hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {phone && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onWhatsAppClick}
              className="text-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          
          {email && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEmailClick}
              className="text-white hover:bg-white/10"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {priceToDisplay && (
            <LeadTag 
              label={`${priceToDisplay} ${formatCurrency(currency)}`}
              bgColor="bg-white/20" 
              textColor="text-white" 
              className="font-futura"
            />
          )}
          
          {desiredLocation && (
            <LeadTag 
              label={desiredLocation}
              bgColor="bg-white/20" 
              textColor="text-white" 
              className="font-futura"
            />
          )}
          
          {country && country !== desiredLocation && (
            <LeadTag 
              label={country}
              bgColor="bg-white/20" 
              textColor="text-white" 
              className="font-futura"
            />
          )}
          
          {purchaseTimeframe && (
            <LeadTag 
              label={purchaseTimeframe}
              bgColor="bg-white/20" 
              textColor="text-white" 
              className="font-futura"
            />
          )}
          
          {tags && tags.length > 0 && tags.map((tag, index) => (
            <LeadTag 
              key={index}
              label={tag}
              bgColor="bg-white/20" 
              textColor="text-white" 
              className="font-futura"
            />
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="px-4 pb-2">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-white text-[#051B30] hover:bg-white/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadDetailHeader;
