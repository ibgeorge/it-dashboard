import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { metricsService } from '../services/dataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TrendsChart({ days = 30 }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket-trends', days],
    queryFn: async () => {
      const response = await metricsService.getTicketTrends(days);
      return response.data;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">Failed to load trends data</p>
        </div>
      </div>
    );
  }

  const trendsData = data || [];

  // Format dates for display
  const labels = trendsData.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tickets Opened',
        data: trendsData.map(item => item.opened),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tickets Closed',
        data: trendsData.map(item => item.closed),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Calculate summary stats
  const totalOpened = trendsData.reduce((sum, item) => sum + item.opened, 0);
  const totalClosed = trendsData.reduce((sum, item) => sum + item.closed, 0);
  const netChange = totalClosed - totalOpened;
  const avgOpened = (totalOpened / trendsData.length).toFixed(1);
  const avgClosed = (totalClosed / trendsData.length).toFixed(1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ticket Trends</h3>
          <p className="text-sm text-gray-600">Last {days} days</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Avg Opened/Day</p>
            <p className="text-lg font-semibold text-blue-600">{avgOpened}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Avg Closed/Day</p>
            <p className="text-lg font-semibold text-green-600">{avgClosed}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Net Change</p>
            <p className={`text-lg font-semibold ${netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {netChange > 0 ? '+' : ''}{netChange}
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>

      {netChange > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ <strong>Positive trend:</strong> Closed {netChange} more tickets than opened in this period
          </p>
        </div>
      )}
    </div>
  );
}

export default TrendsChart;
