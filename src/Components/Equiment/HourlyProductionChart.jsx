import React from 'react';
import { Bar } from 'react-chartjs-2';

const HourlyProductionChart = () => {
  const data = {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Sản lượng theo giờ (pcs)',
        data: [20, 30, 50, 60, 40, 70, 80, 90, 60, 50, 40, 30],
        backgroundColor: 'rgba(54, 162, 235, 1)',
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
          text: 'Số lượng (pcs)',
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
      <h2 className="text-xl font-bold mb-4">Sản Lượng Theo Giờ</h2>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default HourlyProductionChart;
