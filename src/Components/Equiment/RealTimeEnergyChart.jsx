import React from 'react';
import { Bar } from 'react-chartjs-2';

const RealTimeEnergyChart = () => {
  const data = {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Energy kWh',
        data: [20, 30, 40, 50, 60, 50, 40, 50, 60, 70, 80, 90],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy kWh',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
    plugins : {
      datalabels: {
        display: false,  // Tắt datalabels cho biểu đồ Bar này
      },
    }
    
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Điện Năng Real-Time</h2>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RealTimeEnergyChart;
