import React from 'react';
import { Line } from 'react-chartjs-2';
import { Empty } from 'antd'; // Import Empty từ Ant Design
import 'chartjs-plugin-datalabels';

const RuntimeTrendChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
    console.error("Data format is incorrect or missing properties.", data);
    return <Empty description="No data available for chart" />;
  }

  // Convert hh:mm to total minutes for Chart.js compatibility
  const processedData = data.datasets[0].data.map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Convert to total minutes
  });

  // Check if all values are 0
  const isAllValuesZero = processedData.every(value => value === 0);

  if (isAllValuesZero) {
    return <Empty description="Không có dữ liệu hiển thị" />;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const hours = Math.floor(value / 60);
            const minutes = value % 60; // Correctly calculate minutes
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          },
        },
        title: {
          display: true,
          text: "Runtime (hh:mm)", // Label for the Y-axis
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable labels on the chart
      },
      legend: {
        display: false, // Disable legend
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw; // Total minutes
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          },
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Daily Runtime (hh:mm)", // Label for the dataset
        data: processedData, // Use the converted data here
        fill: false,
        borderWidth: 4,
        backgroundColor: 'green',
        borderColor: 'green',
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '250px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default RuntimeTrendChart;
