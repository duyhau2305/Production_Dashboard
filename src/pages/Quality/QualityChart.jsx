import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

function QualityChart() {
  const [period, setPeriod] = useState('month');

  const defectData = {
    month: {
      labels: ['Cháy', 'Chưa chín', 'Đóng gói sai', 'Khác'],
      datasets: [
        {
          data: [320, 60, 160, 279],
          backgroundColor: ['#4A90E2', '#50B83C', '#FFC107', '#FF5252'],
        },
      ],
    },
    week: {
      labels: ['Cháy', 'Chưa chín', 'Đóng gói sai', 'Khác'],
      datasets: [
        {
          data: [30, 10, 50, 100],
          backgroundColor: ['#4A90E2', '#50B83C', '#FFC107', '#FF5252'],
        },
      ],
    },
    year: {
      labels: ['Cháy', 'Chưa chín', 'Đóng gói sai', 'Khác'],
      datasets: [
        {
          data: [4000, 2000, 1500, 1000],
          backgroundColor: ['#4A90E2', '#50B83C', '#FFC107', '#FF5252'],
        },
      ],
    },
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const totalDefects = defectData[period].datasets[0].data.reduce((acc, val) => acc + val, 0);

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,  // Tắt datalabels cho biểu đồ Bar này
      },
   
      tooltip: {
        enabled: true,
        backgroundColor: '#4A90E2',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    cutout: '70%',
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="bg-white p-4 h-full flex flex-col">
        
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold ">Phân tích lỗi </h3>
        <select value={period} onChange={handlePeriodChange} className="p-2 border rounded text-sm">
          <option value="month">This month</option>
          <option value="week">This week</option>
          <option value="year">This year</option>
        </select>
      </div>
      <div className="flex-grow relative">
        <Doughnut data={defectData[period]} options={chartOptions} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h3 className="text-center font-bold text-xl">{totalDefects}</h3>
          <p className="text-center text-sm text-gray-500">Tổng số</p>
        </div>
      </div>
      <div className="mt-4">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {defectData[period].labels.map((label, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span
                  className="block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: defectData[period].datasets[0].backgroundColor[index] }}
                ></span>
                <div>
                  <span className="font-medium">{label}</span>
                  <p className="font-semibold  text-sm">{defectData[period].datasets[0].data[index]}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default QualityChart;
