import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

const DowntimePieChart = ({ data }) => {
  console.log('downtimepiechart' ,data)
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Hours',
        data: data.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#ed0905'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#ed0905'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 10,
          },
          // Đảm bảo legend hiển thị nhiều dòng
          boxWidth: 25, // Kích thước ô màu nhỏ gọn hơn
          padding: 12, // Khoảng cách giữa các mục trong legend
        },
        align: 'center', // Căn giữa các mục trong legend
        maxHeight: 60, // Giới hạn chiều cao legend để buộc xuống dòng
      },
      datalabels: {
        display: false, // Disable datalabels
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 5,
      },
    },
  };

  return (
    <div>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default DowntimePieChart;
