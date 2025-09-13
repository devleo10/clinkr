import { StatsGrid } from './StatsGrid'
import { usePremiumDashboardData } from '../PremiumDashboardContext'
import LoadingScreen from '../../../ui/loadingScreen'

const Overview = () => {
  const { data, isLoading } = usePremiumDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingScreen compact />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
        <p className="text-gray-500 mb-4">Start sharing your links to see analytics here</p>
        <p className="text-sm text-gray-400">Create shortened links and share them to generate analytics data</p>
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