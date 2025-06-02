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
import { FactorsCorrelation } from '@/services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FactorsChartProps {
  data: FactorsCorrelation;
}

const FactorsChart: React.FC<FactorsChartProps> = ({ data }) => {
  // Process the data to sort by correlation value
  const sortedData = [...data.factors.map((factor, index) => ({
    factor,
    correlation: data.correlations[index]
  }))].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  const chartData = {
    labels: sortedData.map(item => item.factor),
    datasets: [
      {
        label: 'Correlation with Attrition',
        data: sortedData.map(item => item.correlation),
        backgroundColor: sortedData.map(item => 
          item.correlation > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
        ),
        borderColor: sortedData.map(item => 
          item.correlation > 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Correlation: ${context.raw.toFixed(3)}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Correlation Coefficient'
        }
      }
    }
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default FactorsChart;
