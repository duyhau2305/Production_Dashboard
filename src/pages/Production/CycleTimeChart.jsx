import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { addDays } from 'date-fns';

const generateCycleTimeData = (startDate, endDate) => {
  const daysDifference = Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24);
  const labels = Array.from({ length: daysDifference + 1 }).map((_, i) => addDays(startDate, i).toLocaleDateString('en-GB'));

  const stages = ['Chuẩn bị nguyên liệu', 'Trộn và nhồi bột', 'Định hình bánh', 'Nướng bánh', 'Làm mát và đóng gói'];
  const datasets = stages.map((stage, index) => ({
    label: stage,
    data: labels.map(() => Math.floor(Math.random() * 50 + 30)), // Dữ liệu cycle time từ 30 đến 80 phút
    backgroundColor: `rgba(${index * 60}, 162, 235, 0.6)`,
    borderColor: `rgba(${index * 60}, 162, 235, 1)`,
    borderWidth: 1,
  }));

  return {
    labels,
    datasets,
  };
};

const CycleTimeBarChart = () => {
  const [startDate] = useState(new Date());
  const [endDate] = useState(addDays(new Date(), 10));
  const [chartData, setChartData] = useState(generateCycleTimeData(startDate, endDate));

  useEffect(() => {
    setChartData(generateCycleTimeData(startDate, endDate));
  }, [startDate, endDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ngày sản xuất',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Thời gian (phút)',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        display: false,  // Tắt datalabels cho biểu đồ Bar này
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw} phút`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md" style={{ width: '100%', height: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Cycle Time theo Công đoạn sản xuất</h3>
      </div>
      <div style={{ width: '100%', height: '100%', minHeight: '300px', maxHeight: '500px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CycleTimeBarChart;
