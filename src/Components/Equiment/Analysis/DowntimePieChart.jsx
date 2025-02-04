import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';

const DowntimePieChart = ({ data, isLoading }) => {
  if (isLoading) {
    // Hiển thị loading khi đang tải dữ liệu
    return (
      <div style={{ width: '100%', height: '280px' }} className="flex justify-center items-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!data || !data.labels || !data.labels.length) {
    // Hiển thị thông báo "Không có dữ liệu" khi data trống
    return (
      <div style={{ width: '100%', height: '280px' }} className="flex justify-center items-center">
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Hours',
        data: data.values,
        backgroundColor: ['#870e93', '#FF6384', '#36A2EB', '#FFCE56', '#ed0905', '#0e9387', '#930e1a'],
        hoverBackgroundColor: ['#870e93', '#FF6384', '#36A2EB', '#FFCE56', '#ed0905', '#0e9387', '#930e1a'],
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
          boxWidth: 20,
          padding: 10,
        },
        align: 'center',
        maxHeight: 40,
      },
      datalabels: {
        display: false,
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
    <div style={{ width: '100%', height: '280px' }} className="flex justify-center">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default DowntimePieChart;
