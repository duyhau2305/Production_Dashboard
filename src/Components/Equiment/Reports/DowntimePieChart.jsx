import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Empty } from 'antd'; // Import Empty từ Ant Design
import 'chartjs-plugin-datalabels';

const DowntimePieChart = ({ data, loading }) => {
  console.log('DowntimePieChart Data:', data);

  // Helper function to format seconds to HH:mm:ss
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Kiểm tra nếu dữ liệu có giá trị hợp lệ và tổng giá trị không bằng 0
  const hasValidData =
    data &&
    data.labels &&
    data.labels.length > 0 &&
    data.values &&
    data.values.length > 0 &&
    data.values.reduce((sum, value) => sum + value, 0) > 0;

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Time',
        data: data?.values || [],
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
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '280px' }} className="flex justify-center">
      {hasValidData ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <Empty description="Không có dữ liệu để hiển thị" />
      )}
    </div>
  );
};

export default DowntimePieChart;
