
import React from 'react';
import { SourceStats } from '../utils/statsUtils';
import SourceBarChart from './SourceBarChart';
import SourceDistributionChart from './SourceDistributionChart';
import SourcePerformanceTable from './SourcePerformanceTable';

interface StatsOverviewProps {
  sourceStats: SourceStats[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ sourceStats }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SourceBarChart sourceStats={sourceStats} />
        <SourceDistributionChart sourceStats={sourceStats} />
      </div>
      <SourcePerformanceTable sourceStats={sourceStats} />
    </div>
  );
};

export default StatsOverview;
