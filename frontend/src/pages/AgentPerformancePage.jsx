import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { metricsService } from '../services/dataService';
import MetricsFilter from '../components/MetricsFilter';
import { useState, useEffect } from 'react';

export default function AgentPerformancePage() {
  // Agent page defaults to "All Time" instead of current year
  // Load from localStorage or use defaults
  const [filterParams, setFilterParams] = useState(() => {
    const saved = localStorage.getItem('agent-filters');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      startDate: new Date('1970-01-01').toISOString(),
      endDate: new Date().toISOString(),
      excludeAnomalies: false,
      maxResolutionDays: 365,
    };
  });

  // Save to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem('agent-filters', JSON.stringify(filterParams));
  }, [filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };
  const { data: agentData, isLoading, error, refetch } = useQuery({
    queryKey: ['agent-performance', filterParams],
    queryFn: async () => {
      const response = await metricsService.getAgentPerformance(filterParams);
      return response.data;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load agent performance data. Please try again.</p>
      </div>
    );
  }

  const agents = agentData || [];

  // Calculate summary stats
  const totalAgents = agents.length;
  const totalTickets = agents.reduce((sum, agent) => sum + (agent.total_tickets || 0), 0);
  const totalClosed = agents.reduce((sum, agent) => sum + (agent.closed_tickets || 0), 0);
  const avgResolutionTime = agents.reduce((sum, agent) => sum + (agent.avg_resolution_hours || 0), 0) / totalAgents || 0;
  const avgResolutionDays = (avgResolutionTime / 24).toFixed(1);

  // Sort agents by total tickets
  const sortedAgents = [...agents].sort((a, b) => b.total_tickets - a.total_tickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Performance</h1>
          <p className="text-gray-600 mt-1">Track individual agent metrics and performance</p>
        </div>
        <div className="flex gap-2">
          <MetricsFilter 
            onFilterChange={handleFilterChange} 
            defaultRange="allTime"
            initialFilters={filterParams}
          />
          <button
            onClick={() => refetch()}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAgents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTickets}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tickets Closed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalClosed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{avgResolutionDays}d</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Leaderboard */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Agent Leaderboard</h2>
          <p className="text-gray-600 text-sm mt-1">Ranked by total tickets handled</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Close Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAgents.map((agent, index) => {
                const closeRate = agent.total_tickets > 0 
                  ? ((agent.closed_tickets / agent.total_tickets) * 100).toFixed(1)
                  : 0;
                
                return (
                  <tr key={agent.agentid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-gray-700 font-medium">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{agent.total_tickets}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {agent.open_tickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {agent.closed_tickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{closeRate}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              closeRate >= 75 ? 'bg-green-500' : 
                              closeRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${closeRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.avg_resolution_hours ? `${(agent.avg_resolution_hours / 24).toFixed(1)}d` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
