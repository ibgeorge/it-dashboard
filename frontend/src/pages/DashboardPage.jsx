import { Activity, CheckCircle2, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { metricsService } from '../services/dataService';
import StatusChart from '../components/StatusChart';
import PriorityChart from '../components/PriorityChart';
import TrendsChart from '../components/TrendsChart';
import CategoryChart from '../components/CategoryChart';
import MetricsFilter from '../components/MetricsFilter';
import ActiveTickets from '../components/ActiveTickets';
import { useFilterStore } from '../stores/filterStore';

export default function DashboardPage() {
  const { filters: filterParams, setFilters: setFilterParams } = useFilterStore();

  const { data: metrics, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary-metrics', filterParams],
    queryFn: () => metricsService.getSummary(filterParams.startDate, filterParams.endDate, filterParams.excludeAnomalies, filterParams.maxResolutionDays),
    refetchInterval: 60000, // Refresh every minute
  });

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>Error loading metrics:</strong> {error.message}
            </p>
            <button 
              onClick={handleRefresh}
              className="mt-2 btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = metrics?.data || {};
  const totalTickets = summary.totalTickets || 0;
  const openTickets = summary.openTickets || 0;
  const closedTickets = summary.closedTickets || 0;
  const avgResolutionTime = summary.avgResolutionTime ? (summary.avgResolutionTime / 24).toFixed(1) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          {filterParams.excludeAnomalies && (
            <p className="text-sm text-gray-600 mt-1">
              Showing current year data, excluding tickets over {filterParams.maxResolutionDays} days
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <MetricsFilter 
            onFilterChange={handleFilterChange}
            initialFilters={filterParams}
          />
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tickets</h3>
              <p className="text-3xl font-bold text-primary-700">
                {isLoading ? '...' : totalTickets}
              </p>
            </div>
            <Activity className="h-10 w-10 text-primary-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Open Tickets</h3>
              <p className="text-3xl font-bold text-warning-700">
                {isLoading ? '...' : openTickets}
              </p>
            </div>
            <Clock className="h-10 w-10 text-warning-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Closed Tickets</h3>
              <p className="text-3xl font-bold text-success-700">
                {isLoading ? '...' : closedTickets}
              </p>
              <p className="text-sm text-success-600 mt-1">Successfully resolved</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-success-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Resolution</h3>
              <p className="text-3xl font-bold text-primary-700">
                {isLoading ? '...' : `${avgResolutionTime}d`}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary-600" />
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusChart />
        <PriorityChart />
      </div>
      
      {/* Active Work Section */}
      <div className="mt-8">
        <ActiveTickets />
      </div>
      
      {/* Trends Section */}
      <div className="mt-8">
        <TrendsChart days={30} />
      </div>
      
      {/* Category Section */}
      <div className="mt-8">
        <CategoryChart />
      </div>
    </div>
  )
}
