import React from 'react';
import { Pie } from 'react-chartjs-2';

const ErrorFreeChart = ({ errorFreeData }) => {
  
  const options = {
    plugins: {
      legend: {
        position: 'right', // Di chuyển legend sang phải
        align: 'start',    // Canh legend ở đầu (trên cùng)
        labels: {
          boxWidth: 12, // Kích thước ô vuông màu nhỏ hơn
          padding: 15,  // Khoảng cách giữa các label
        },
      },
    },
    maintainAspectRatio: false, // Đảm bảo biểu đồ phản hồi tốt
    responsive: true,
  };

  return (
    <div className=" h-60 flex justify-center items-center">
      <Pie data={errorFreeData} options={options} />
    </div>
  );
};

export default ErrorFreeChart;
