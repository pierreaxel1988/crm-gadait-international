import React from 'react';
import { DealInitialData } from './DealDialog';

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  MUR: 'Rs',
};

interface DealSummaryProps {
  dealData: DealInitialData;
  pipelineType?: string;
}

const DealSummary: React.FC<DealSummaryProps> = ({ dealData, pipelineType }) => {
  const symbol = CURRENCY_SYMBOLS[dealData.currency || 'EUR'] || '€';
  const price = dealData.sale_price || 0;
  const pct = dealData.commission_percentage || 0;
  const isRental = pipelineType === 'rental';
  const months = isRental && pct === 100 ? 1 : isRental ? 2 : 0;
  const commission = isRental ? price * (months || 2) : price * pct / 100;

  return (
    <div className="p-3 bg-muted/50 rounded-md border text-sm space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{isRental ? 'Loyer mensuel' : 'Prix de vente'}</span>
        <span className="font-medium">{price.toLocaleString('fr-FR')} {symbol}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          {isRental ? `Commission (${months || 2} mois${months === 1 ? ' — co-agence' : ''})` : `Commission (${pct}%)`}
        </span>
        <span className="font-medium">{commission.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
      </div>
    </div>
  );
};

export default DealSummary;
