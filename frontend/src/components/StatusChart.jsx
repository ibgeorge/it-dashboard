import { useQuery } from '@tanstack/react-query';
import { metricsService } from '../services/dataService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets-by-status'],
    queryFn: () => metricsService.getTicketsByStatus(),
    refetchInterval: 60000,
  });

  if (isError) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h3>
        <p className="text-red-600">Failed to load status data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const statusData = data?.data || [];
  
  const chartData = {
    labels: statusData.map(item => item.status),
    datasets: [
      {
        data: statusData.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue
          'rgba(16, 185, 129, 0.8)',   // green
          'rgba(245, 158, 11, 0.8)',   // amber
          'rgba(239, 68, 68, 0.8)',    // red
          'rgba(139, 92, 246, 0.8)',   // purple
          'rgba(236, 72, 153, 0.8)',   // pink
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h3>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
