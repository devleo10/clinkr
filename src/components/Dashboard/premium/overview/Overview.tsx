import { StatsGrid } from './StatsGrid'
import { usePremiumDashboardData } from '../PremiumDashboardContext'
import LoadingScreen from '../../../ui/loadingScreen'

const Overview = () => {
  const { data, isLoading } = usePremiumDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact message="Loading overview data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ willChange: 'transform' }}>
      <StatsGrid 
        totalClicks={data.overview.totalClicks}
        uniqueVisitors={data.overview.uniqueVisitors}
        conversionRate={data.overview.conversionRate}
        totalViews={data.overview.totalViews}
        changes={data.overview.changes}
      />
    </div>
  );
};

export default Overview;