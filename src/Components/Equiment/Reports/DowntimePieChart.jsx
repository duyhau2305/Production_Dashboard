import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

const DowntimePieChart = ({ data }) => {
  console.log('downtimepiechart', data);

  // Helper function to format seconds to HH:mm:ss
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Time',
        data: data.values, // Use numeric values in seconds
        backgroundColor: ['#00C8D7', '#FFC107', 'red'],
        hoverBackgroundColor: ['#00C8D7', '#FFC107', 'red'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = chartData.labels[tooltipItem.dataIndex];
            const value = formatTime(chartData.datasets[0].data[tooltipItem.dataIndex]);
            return `${label}: ${value}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '280px' }} className="flex justify-center">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default DowntimePieChart;
