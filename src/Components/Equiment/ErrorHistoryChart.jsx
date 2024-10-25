import React from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chart.js/auto';

const ErrorHistoryChart = () => {
  
  const data = {
    labels: ['00:00', '00:30','01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    datasets: [
      {
        label: 'Lỗi Máy',
        data: [
          { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 },
          
        ],
        backgroundColor: 'red',
        pointRadius: 5,
      },
      {
        label: 'Lỗi Chất Lượng',
        data: [
          { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 },
          
        ],
        backgroundColor: 'blue',
        pointRadius: 5,
      },
      {
        label: 'Lỗi Vận Hành',
        data: [
          { x: 6, y: 3 }, { x: 8, y: 3 }, { x: 10, y: 3 },
          
        ],
        backgroundColor: 'yellow',
        pointRadius: 5,
      },
      {
        label: 'Lỗi Khác',
        data: [
          { x: 7, y: 4 }, { x: 9, y: 4 }, { x: 11, y: 4 },
          
        ],
        backgroundColor: 'green',
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        ticks: {
          callback: (value) => `${value}:00`,
        },
        title: {
          display: false,
          text: 'Giờ trong ngày',
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      datalabels: {
        display: false,  // Tắt datalabels cho biểu đồ Bar này
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Giờ: ${tooltipItem.xLabel}:00`,
        },
      },
    },
  };

  return (
    <div className="w-full h-16"> 
      <Scatter data={data} options={options} />
    </div>
  );
};

export default ErrorHistoryChart;
