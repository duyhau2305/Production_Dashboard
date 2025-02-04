import React from 'react';
import { Bar } from 'react-chartjs-2';

// Hàm chuyển đổi giờ sang định dạng hh:mm:ss
const formatHoursToTime = (hours) => {
  const totalSeconds = Math.round(hours * 3600); // Chuyển đổi giờ sang giây
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

const TopEmployeeChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.name), // Tên nhân viên
    datasets: [
      {
        label: '',
        data: data.map((item) => item.hours), // Thời gian đứng máy (giờ)
        backgroundColor: [
          '#1f77b4',
          '#ff7f0e',
          '#2ca02c',
          '#d62728',
          '#9467bd',
          '#8c564b',
          '#e377c2',
          '#7f7f7f',
          '#bcbd22',
          '#17becf',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y', // Hiển thị theo trục Oy
    plugins: {
      legend: {
        display: false,
        position: 'top', // Vị trí legend
      },
      title: {
        display: false,
        text: 'Top 10 Nhân Viên Đứng Máy Nhiều Nhất',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const rawValue = context.raw; // Lấy giá trị thô
            const formattedValue = formatHoursToTime(rawValue); // Chuyển đổi sang hh:mm:ss
            return `Thời gian: ${formattedValue}`; // Tooltip hiển thị thời gian định dạng
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true, // Kích hoạt chế độ stacked
        title: {
          display: false,
          text: 'Thời gian (hh:mm:ss)', // Nhãn trục Ox
        },
        beginAtZero: true,
        ticks: {
          callback: (value) => formatHoursToTime(value), // Định dạng trục Ox
        },
      },
      y: {
        stacked: true, // Kích hoạt chế độ stacked
        title: {
          display: true,
          text: 'Nhân viên', // Nhãn trục Oy
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default TopEmployeeChart;
