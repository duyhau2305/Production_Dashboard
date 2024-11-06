import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';
import { text } from 'd3';

const RuntimeTrendChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
    console.error("Data format is incorrect or missing properties.", data);
    return <p>No data available for chart.</p>;
  }

  // Convert hh:mm to total minutes for Chart.js compatibility
  const processedData = data.datasets[0].data.map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Convert to total minutes
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            const hours = Math.floor(value / 60);
            const minutes =Math.floor(value / 3600);
            return `${hours.toString().padStart(2, )}:${minutes.toString().padStart(2,"0")}` ;
            
          },
           },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
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
        label: "Daily Runtime (hh:mm)",
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
