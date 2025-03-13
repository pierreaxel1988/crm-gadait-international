
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export interface ImportStat {
  id: string;
  source_type: string;
  total_count: number;
  imported_count: number;
  updated_count: number;
  error_count: number;
  duplicates_count: number;
  import_date: string;
  created_at: string;
}

export interface SourceStats {
  name: string;
  total: number;
  imported: number;
  updated: number;
  errors: number;
  duplicates: number;
}

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
  } catch (e) {
    return dateString;
  }
};

export const getSuccessRate = (stat: ImportStat) => {
  const successCount = stat.imported_count + stat.updated_count;
  const totalAttempted = stat.total_count;
  if (totalAttempted === 0) return 100;
  return Math.round((successCount / totalAttempted) * 100);
};

export const getSuccessRateFromSource = (source: SourceStats) => {
  const successCount = source.imported + source.updated;
  const totalAttempted = source.total;
  if (totalAttempted === 0) return 100;
  return Math.round((successCount / totalAttempted) * 100);
};

export const getStatusBadge = (successRate: number) => {
  if (successRate >= 90) return <Badge className="bg-green-100 text-green-800 border-0">Excellent</Badge>;
  if (successRate >= 70) return <Badge className="bg-blue-100 text-blue-800 border-0">Bon</Badge>;
  if (successRate >= 50) return <Badge className="bg-yellow-100 text-yellow-800 border-0">Moyen</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-0">Problématique</Badge>;
};

export const processSourceStats = (data: ImportStat[]): SourceStats[] => {
  // Group by source
  const sourceMap = new Map<string, SourceStats>();
  
  data.forEach(stat => {
    if (!sourceMap.has(stat.source_type)) {
      sourceMap.set(stat.source_type, {
        name: stat.source_type,
        total: 0,
        imported: 0,
        updated: 0,
        errors: 0,
        duplicates: 0
      });
    }
    
    const source = sourceMap.get(stat.source_type)!;
    source.total += stat.total_count;
    source.imported += stat.imported_count;
    source.updated += stat.updated_count;
    source.errors += stat.error_count;
    source.duplicates += stat.duplicates_count;
  });
  
  return Array.from(sourceMap.values());
};

export const COLORS = ['#2C3E50', '#34495E', '#3D5A80', '#446A9E', '#4A7ABB', '#5D8CAD', '#6F9EBF'];
