import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trophy } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: '€ Euro', symbol: '€' },
  { value: 'USD', label: '$ Dollar US', symbol: '$' },
  { value: 'MUR', label: 'Rs Roupie mauricienne', symbol: 'Rs' },
];

export interface DealInitialData {
  sale_price?: number;
  commission_percentage?: number;
  notes?: string;
  currency?: string;
}

interface DealDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  leadSource?: string;
  pipelineType?: string;
  assignedTo?: string;
  status: string;
  initialData?: DealInitialData;
}

const DEAL_STATUSES: Record<string, string> = {
  'Deposit': 'deposit',
  'Signed': 'signed',
  'Gagné': 'won',
};

const DealDialog: React.FC<DealDialogProps> = ({
  open,
  onClose,
  leadId,
  leadName,
  leadSource,
  pipelineType,
  assignedTo,
  status,
  initialData,
}) => {
  const [salePrice, setSalePrice] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('0.00');
  const [currency, setCurrency] = useState('EUR');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!initialData;
  const isRental = pipelineType === 'rental';
  const currencySymbol = CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol || '€';

  useEffect(() => {
    if (isRental) {
      // Rental: commission = 2 × monthly rent (1 month tenant + 1 month landlord)
      const monthlyRent = parseFloat(salePrice) || 0;
      setCommissionAmount((monthlyRent * 2).toFixed(2));
    } else {
      const price = parseFloat(salePrice) || 0;
      const pct = parseFloat(commissionPercentage) || 0;
      setCommissionAmount((price * pct / 100).toFixed(2));
    }
  }, [salePrice, commissionPercentage, isRental]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSalePrice(initialData?.sale_price?.toString() || '');
      setCommissionPercentage(initialData?.commission_percentage?.toString() || '');
      setCurrency(initialData?.currency || 'EUR');
      setNotes(initialData?.notes || '');
    }
  }, [open, initialData]);

  const handleSave = async () => {
    const price = parseFloat(salePrice);

    if (!price || price <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: isRental ? 'Veuillez saisir un loyer mensuel valide.' : 'Veuillez saisir un prix de vente valide.' });
      return;
    }

    if (!isRental) {
      const pct = parseFloat(commissionPercentage);
      if (!pct || pct <= 0 || pct > 100) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez saisir un % de commission valide (0-100).' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const pct = isRental ? 200 : parseFloat(commissionPercentage); // 200% = 2 months for display
      const dealData = {
        lead_id: leadId,
        lead_name: leadName,
        lead_source: leadSource || null,
        pipeline_type: pipelineType || null,
        agent_id: assignedTo || null,
        sale_price: price,
        commission_percentage: pct,
        commission_amount: parseFloat(commissionAmount),
        status: DEAL_STATUSES[status] || 'deposit',
        currency: currency,
        notes: notes.trim() || null,
        deal_date: new Date().toISOString().split('T')[0],
      };

      const { data: existing } = await supabase
        .from('deals')
        .select('id')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deals')
          .insert(dealData);
        if (error) throw error;
      }

      toast({
        title: '🎉 Deal enregistré !',
        description: `Commission de ${parseFloat(commissionAmount).toLocaleString('fr-FR')} ${currencySymbol} enregistrée.`,
      });
      onClose();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'enregistrer le deal.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {isEditing ? 'Modifier le deal' : 'Félicitations !'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifiez les détails financiers du deal pour' : 'Renseignez les détails financiers du deal pour'} <strong>{leadName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="deal-currency" className="text-sm font-medium">Devise</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="deal-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-sale-price" className="text-sm font-medium">
              {isRental ? `Loyer mensuel (${currencySymbol})` : `Prix de vente (${currencySymbol})`}
            </Label>
            <Input
              id="deal-sale-price"
              type="number"
              min="0"
              step={isRental ? '100' : '1000'}
              placeholder={isRental ? 'Ex: 2 500' : 'Ex: 1 500 000'}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>

          {!isRental && (
            <div className="space-y-2">
              <Label htmlFor="deal-commission-pct" className="text-sm font-medium">Commission (%)</Label>
              <Input
                id="deal-commission-pct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex: 5"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
              />
            </div>
          )}

          {isRental && (
            <div className="p-3 bg-muted/50 rounded-md border text-xs text-muted-foreground">
              Commission = 1 mois locataire + 1 mois preneur = <strong>2 mois de loyer</strong>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Commission calculée ({currencySymbol})</Label>
            <div className="p-3 bg-muted rounded-md border text-sm font-semibold text-foreground">
              {parseFloat(commissionAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currencySymbol}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-notes" className="text-sm font-medium">Notes (optionnel)</Label>
            <Textarea
              id="deal-notes"
              placeholder="Détails supplémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Passer
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer le deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealDialog;
