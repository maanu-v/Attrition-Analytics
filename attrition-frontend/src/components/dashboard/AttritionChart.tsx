import React from 'react';
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
import { AttritionData } from '@/services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AttritionChartProps {
  data: AttritionData;
}

const AttritionChart: React.FC<AttritionChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Attrition Yes',
        data: data.yesCount,
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // red
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Attrition No',
        data: data.noCount,
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterTitle: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return `Attrition Rate: ${data.rates[index]}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      }
    }
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default AttritionChart;
