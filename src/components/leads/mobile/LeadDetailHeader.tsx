
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Save, MapPin, Euro } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
import { formatBudget } from '@/services/utils/leadMappers';

interface LeadDetailHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  onBackClick,
  onSave,
  isSaving,
  hasChanges
}) => {
  return (
    <div className="flex flex-col p-3 gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="truncate">
            <h1 className="text-lg font-futura leading-tight truncate">{name}</h1>
            <p className="text-xs text-muted-foreground">
              {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phone && (
            <a href={`tel:${phone}`} className="p-2 rounded-full bg-green-100 text-green-600">
              <Phone className="h-4 w-4" />
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Mail className="h-4 w-4" />
            </a>
          )}
          <CustomButton
            variant="chocolate"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving || !hasChanges}
            onClick={onSave}
            className="p-2 rounded-full"
            fontStyle="optima"
          >
            <Save className="h-4 w-4" />
          </CustomButton>
        </div>
      </div>
      
      {/* New section for budget and location tags */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {budget && (
          <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800">
            <Euro className="h-2.5 w-2.5" />
            <span>{formatBudget("", budget, currency || "EUR")}</span>
          </div>
        )}
        
        {desiredLocation && (
          <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800">
            <MapPin className="h-2.5 w-2.5" />
            <span>{desiredLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
