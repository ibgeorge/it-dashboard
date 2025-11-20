import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { metricsService } from '../services/dataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TeamMetricsPage() {
  const { data: teamData, isLoading, error, refetch } = useQuery({
    queryKey: ['team-metrics'],
    queryFn: async () => {
      const response = await metricsService.getTeamMetrics();
      return response.data;
    },
    refetchInterval: 120000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load team metrics. Please try again.</p>
      </div>
    );
  }

  const teams = teamData || [];

  // Calculate totals
  const totalTeams = teams.length;
  const totalTickets = teams.reduce((sum, team) => sum + (team.total_tickets || 0), 0);
  const totalClosed = teams.reduce((sum, team) => sum + (team.closed_tickets || 0), 0);
  const avgResolution = teams.reduce((sum, team) => sum + (team.avg_resolution_hours || 0), 0) / totalTeams || 0;
  const avgResolutionDays = (avgResolution / 24).toFixed(1);

  // Chart data - tickets by team
  const chartData = {
    labels: teams.map(team => team.teamname),
    datasets: [
      {
        label: 'Open Tickets',
        data: teams.map(team => team.open_tickets),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Closed Tickets',
        data: teams.map(team => team.closed_tickets),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Metrics</h1>
          <p className="text-gray-600 mt-1">Performance overview across IT teams</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTeams}</p>
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
              <Target className="h-6 w-6 text-purple-600" />
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

      {/* Team Performance Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Team Performance Comparison</h2>
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Team Details Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Team Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => {
                const closeRate = team.total_tickets > 0
                  ? ((team.closed_tickets / team.total_tickets) * 100).toFixed(1)
                  : 0;

                return (
                  <tr key={team.teamid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.teamname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{team.total_tickets}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {team.open_tickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {team.closed_tickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{closeRate}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
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
                      {team.avg_resolution_hours ? `${(team.avg_resolution_hours / 24).toFixed(1)}d` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.team_members || 0}
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
