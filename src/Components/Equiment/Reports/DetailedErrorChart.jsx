import React from 'react';
import { Pie } from 'react-chartjs-2';

const DetailedErrorChart = ({ detailedErrorData }) => {
  const options = {
    plugins: {
      legend: {
        position: 'right', // Di chuyển legend sang phải
        align: 'start',    // Canh legend ở đầu (trên cùng)
        labels: {
          boxWidth: 20, // Kích thước ô vuông màu
          padding: 15,  // Khoảng cách giữa các label
        },
      },
    },
    maintainAspectRatio: false, // Đảm bảo biểu đồ phản hồi tốt
    responsive: true,
  };

  return (
     <div  className=" h-60 flex justify-center items-center"> 
      <Pie data={detailedErrorData} options={options} />
      </div>
  )
  
};

export default DetailedErrorChart;
