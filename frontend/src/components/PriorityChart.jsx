import { useQuery } from '@tanstack/react-query';
import { metricsService } from '../services/dataService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PriorityChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets-by-priority'],
    queryFn: () => metricsService.getTicketsByPriority(),
    refetchInterval: 60000,
  });

  if (isError) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
        <p className="text-red-600">Failed to load priority data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const priorityData = data?.data || [];
  
  // Define color mapping for priorities
  const getColorForPriority = (priority) => {
    const lower = (priority || '').toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent')) return 'rgba(239, 68, 68, 0.8)'; // red
    if (lower.includes('high')) return 'rgba(245, 158, 11, 0.8)'; // amber
    if (lower.includes('medium') || lower.includes('normal')) return 'rgba(59, 130, 246, 0.8)'; // blue
    if (lower.includes('low')) return 'rgba(16, 185, 129, 0.8)'; // green
    return 'rgba(107, 114, 128, 0.8)'; // gray
  };

  const chartData = {
    labels: priorityData.map(item => item.priority || 'No Priority'),
    datasets: [
      {
        label: 'Tickets',
        data: priorityData.map(item => item.count),
        backgroundColor: priorityData.map(item => getColorForPriority(item.priority)),
        borderColor: priorityData.map(item => getColorForPriority(item.priority).replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} tickets`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
