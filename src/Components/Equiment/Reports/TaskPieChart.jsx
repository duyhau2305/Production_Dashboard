import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Empty } from 'antd'; // Import Empty từ Ant Design

const TaskPieChart = ({ data }) => {
  console.log('TaskPieChart', data);

  // Hàm chuyển đổi từ giờ thập phân sang định dạng HH:mm:ss
  const convertHoursToHHMMSS = (hoursDecimal) => {
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.floor((hoursDecimal - hours) * 60);
    const seconds = Math.floor((((hoursDecimal - hours) * 60) - minutes) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Kiểm tra nếu tổng tất cả các giá trị là 0
  const isAllValuesZero = data.values && data.values.reduce((acc, value) => acc + value, 0) === 0;

  if (!data || !data.labels || data.labels.length === 0 || !data.values || data.values.length === 0 || isAllValuesZero) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Empty description="Không có dữ liệu để hiển thị" />
      </div>
    );
  }

  // Cấu hình dữ liệu biểu đồ
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Total Time (HH:mm:ss)',
        data: data.values,
        backgroundColor: ['#8ff28f', '#fafa98', 'red'],
        hoverBackgroundColor: ['#8ff28f', '#fafa98', 'red'],
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
            const timeFormatted = convertHoursToHHMMSS(chartData.datasets[0].data[tooltipItem.dataIndex]);
            return `${label}: ${timeFormatted}`;
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
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default TaskPieChart;
