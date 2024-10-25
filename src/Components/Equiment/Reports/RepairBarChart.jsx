import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';  // Import datalabels plugin

const RepairBarChart = ({ data }) => {
  const barChartOptions = {
    responsive: true, // Biểu đồ tự động điều chỉnh kích thước
    maintainAspectRatio: false, // Đảm bảo biểu đồ có thể thay đổi kích thước phù hợp với component cha
    scales: {
      x: {
        stacked: true, // Bật tính năng stacked trên trục x
        barThickness: 30, // Điều chỉnh độ dày của thanh (giảm kích thước thanh)
      },
      y: {
        beginAtZero: true,
        stacked: true, // Bật tính năng stacked trên trục y
        ticks: {
          stepSize: 1, // Khoảng cách giữa các giá trị là 1 giờ
          callback: function(value) {
            return value + ' giờ'; // Hiển thị đơn vị giờ trên trục y
          },
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Hiển thị datalabels trên đỉnh cột
        anchor: 'end',
        align: 'top',
        formatter: (value) => value + ' giờ', // Định dạng datalabels để hiển thị giá trị + chữ "giờ"
      },
      legend: {
        display: false, // Hiển thị legend
        position: 'bottom', // Đặt legend ở dưới cùng (bottom)
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '200px' }}> {/* Đặt chiều cao tùy chỉnh */}
      <Bar data={data} options={barChartOptions} />
    </div>
  );
};

export default RepairBarChart;
