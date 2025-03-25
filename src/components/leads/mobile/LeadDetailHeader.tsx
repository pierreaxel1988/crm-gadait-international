
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

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
  tags?: LeadTag[];
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
  hasChanges,
  tags
}) => {
  return <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="truncate">
          <h1 className="text-lg font-futura leading-tight truncate">{name}</h1>
          <p className="text-xs text-muted-foreground">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {budget && `${budget} ${currency || ''}`}
            {budget && desiredLocation && ' • '}
            {desiredLocation}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {phone && <a href={`tel:${phone}`} className="p-2 rounded-full bg-green-100 text-green-600">
            <Phone className="h-4 w-4" />
          </a>}
        {email && <a href={`mailto:${email}`} className="p-2 rounded-full bg-blue-100 text-blue-600">
            <Mail className="h-4 w-4" />
          </a>}
        {tags && tags.length > 0 && <TagBadge tag={tags[0]} />}
      </div>
    </div>;
};

export default LeadDetailHeader;
