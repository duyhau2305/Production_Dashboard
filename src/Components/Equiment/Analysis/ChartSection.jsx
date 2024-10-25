import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Đăng ký các thành phần cần thiết trong Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ChartSection = ({ downtimeData, errorOccurrenceData, errorTimeData }) => {
  
  // Cấu hình dữ liệu cho biểu đồ Donut (Phân Bố Tỷ Lệ Downtime)
  const downtimeChartData = {
    labels: ['Bảo Trì Máy', 'Bảo Trì Khuôn', 'Thiếu Vật Tư', 'Thiếu Nhân Lực', 'Thiết Bị Hỏng', 'Đào Tạo'],
    datasets: [
      {
        data: [10, 15, 7, 5, 20, 12], // Dữ liệu giả lập
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverOffset: 4,
      },
    ],
  };

  const downtimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = downtimeChartData.labels[tooltipItem.dataIndex];
            const currentValue = downtimeChartData.datasets[0].data[tooltipItem.dataIndex];
            const total = downtimeChartData.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Cấu hình dữ liệu cho biểu đồ Pareto (Tần Suất Dừng Máy)
  const errorOccurrenceChartData = {
    
    labels: ['Kiểm Tra Chất Lượng', 'Ăn Phụ', 'Thiếu Vật Tư', 'Bảo Trì Máy', 'Thay Khuôn'],
    datasets: [
      {
        type: 'bar',
        label: 'Số Lần Dừng Máy',
        data: [3, 7, 2, 5, 4], // Dữ liệu giả lập
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
        yAxisID: 'y',
      },
      
      {
        type: 'line',
        label: 'Tỷ Lệ Tích Lũy (%)',
        data: [20, 45, 60, 85, 100], // Dữ liệu giả lập cho tỷ lệ tích lũy
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  const paretoOccurrenceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear',
        position: 'left',
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: {
          max: 100,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            if (tooltipItem.dataset.type === 'line') {
              return `Tỷ Lệ Tích Lũy: ${tooltipItem.raw.toFixed(2)}%`;
            }
            return `Số Lần Dừng Máy: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  // Cấu hình dữ liệu cho biểu đồ Pareto (Thời Gian Dừng Máy)
  const errorTimeChartData = {
    labels: ['Bảo Trì Máy', 'Kiểm Tra Chất Lượng', 'Thiết Bị Hỏng', 'Thiếu Vật Tư'],
    datasets: [
      {
        type: 'bar',
        label: 'Thời Gian Dừng Máy (giây)',
        data: [6000, 4000, 8000, 2000], // Dữ liệu giả lập
        backgroundColor: '#FFCE56',
        borderColor: '#FFCE56',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Tỷ Lệ Tích Lũy (%)',
        data: [30, 50, 80, 100], // Dữ liệu giả lập cho tỷ lệ tích lũy
        backgroundColor: '#9966FF',
        borderColor: '#9966FF',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  const paretoTimeOptions = {
    responsive: true,
    
    maintainAspectRatio: false,
    aspectRatio: 7,
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear',
        position: 'left',
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: {
          max: 100,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            if (tooltipItem.dataset.type === 'line') {
              return `Tỷ Lệ Tích Lũy: ${tooltipItem.raw.toFixed(2)}%`;
            }
            return `Thời Gian Dừng Máy: ${tooltipItem.raw} giây`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Biểu đồ Donut (Phân Bố Tỷ Lệ Downtime) */}
      <div className="bg-white p-6 rounded-lg shadow" style={{ height: '500px' }}>
        <h3 className="text-sm font-semibold mb-2">Phân Bố Downtime</h3>
        <Doughnut data={downtimeChartData} options={downtimeOptions} />
      </div>

      {/* Biểu đồ Pareto (Tần Suất Dừng Máy) */}
      <div className="bg-white p-6 rounded-lg shadow" style={{ height: '500px' }}>
        <h3 className="text-sm font-semibold mb-2">Tần Suất Dừng Máy</h3>
        <Bar data={errorOccurrenceChartData} options={paretoOccurrenceOptions} className="mb-4" />
      </div>

      {/* Biểu đồ Pareto (Thời Gian Dừng Máy) */}
      <div className="bg-white p-6 rounded-lg shadow" style={{ height: '500px' }}>
        
        <h3 className="text-sm font-semibold mb-2">Thời Gian Dừng Máy</h3>
        <Bar data={errorTimeChartData} options={paretoTimeOptions} />
      </div>
    </div>
  );
};

export default ChartSection;
