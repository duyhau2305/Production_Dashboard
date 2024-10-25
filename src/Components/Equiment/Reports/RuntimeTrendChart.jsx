import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

const RuntimeTrendChart = ({ data }) => {
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Giới hạn trục y đến 100%
        ticks: {
          callback: function(value) {
            return value + "%"; // Hiển thị đơn vị phần trăm
          },
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,  // Disable datalabels here
      },
      legend: {
        display: false,
      },
    },
    datasets: [
      {
        label: "",
        data: data, // Sử dụng dữ liệu được truyền từ component cha
        fill: false,
        borderWidth: 4,
        backgroundColor: 'green', // Màu nền
        borderColor: 'green', // Màu đường biểu đồ
        responsive: true,
      },
    ],
  };

  return (
    <div>
      <div>
        {/* Biểu đồ Line nhận data từ component cha */}
        <Line data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default RuntimeTrendChart;
