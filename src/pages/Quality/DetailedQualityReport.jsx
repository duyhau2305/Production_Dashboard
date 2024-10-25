import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const DetailedErrorChart = ({ detailedErrorData }) => {
  const options = {
    plugins: {
      legend: {
        display: false, // Ẩn phần legend
      },
     
      datalabels: {
        
        color: '#ff00ff', // Màu sắc của text (giống màu trong hình)
        anchor: 'end', // Vị trí của label
        align: 'start', // Căn lề của label
        offset: 10, // Khoảng cách từ pie đến label
        borderColor: 'rgba(0, 0, 0, 0.1)', // Màu đường kẻ
        borderWidth: 1, // Độ dày của đường kẻ
        borderRadius: 25, // Bo tròn label
        backgroundColor: (context) => context.dataset.backgroundColor, // Màu nền của label theo màu của pie
        font: {
          size: 14, // Kích thước font chữ
          weight: 'bold',
        },
        padding: {
          top: 10,
          left: 10,
          right: 10,
          bottom: 10,
        },
        formatter: (value, context) => {
          return context.chart.data.labels[context.dataIndex] + '\n' + value;
        },
      },
    },
    maintainAspectRatio: false, // Đảm bảo biểu đồ phản hồi tốt
    responsive: true,
  };

  return (
    <div className="h-60 flex justify-center items-center">
      <Pie data={detailedErrorData} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default DetailedErrorChart;
