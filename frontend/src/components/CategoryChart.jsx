import { useQuery } from '@tanstack/react-query';
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

function CategoryChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets-by-category'],
    queryFn: async () => {
      const response = await metricsService.getTicketsByCategory();
      return response.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">Failed to load category data</p>
        </div>
      </div>
    );
  }

  const categoryData = data || [];

  const chartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        label: 'Tickets',
        data: categoryData.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h3>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default CategoryChart;
