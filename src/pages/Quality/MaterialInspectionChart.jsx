import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function MaterialInspectionChart() {
  // Dữ liệu giả lập cho kiểm tra nguyên liệu đầu vào
  const materialInspectionData = {
    'Đường': { achieved: 8, warning: 1, failed: 1 },
    'Bột mì': { achieved: 7, warning: 2, failed: 1 },
    'Sữa': { achieved: 5, warning: 4, failed: 1 },
    'Bơ': { achieved: 9, warning: 0, failed: 1 },
    'Socola': { achieved: 6, warning: 3, failed: 1 },
  };

  const [selectedMaterial, setSelectedMaterial] = useState('Đường');

  const handleMaterialChange = (e) => {
    setSelectedMaterial(e.target.value);
  };

  const selectedData = materialInspectionData[selectedMaterial];

  const chartData = {
    labels: ['Đạt', 'Chưa đạt', 'Không đạt'],
    datasets: [
      {
        data: [selectedData.achieved, selectedData.warning, selectedData.failed],
        backgroundColor: ['#4A90E2', '#FFC107', '#FF5252'],
        hoverBackgroundColor: ['#4A90E2', '#FFC107', '#FF5252'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
       
       
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#4A90E2',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="bg-white p-4 ">
      <div className="flex justify-between  items-center mb-4">
        <h3 className="text-sm font-semibold">Chất lượng nguyên liệu</h3>
        <select value={selectedMaterial} onChange={handleMaterialChange} className="p-1 border rounded text-sm">
          {Object.keys(materialInspectionData).map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>
      <div style={{ height: '250px' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4">
        <ul className="flex flex-wrap justify-between">
          <li className="flex items-center text-sm w-1/2 md:w-auto">
            <span
              className="block w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: '#4A90E2' }}
            ></span>
            <span className="font-medium">Đạt</span>
            <span className="ml-2 font-semibold">{selectedData.achieved}</span>
          </li>
          <li className="flex items-center text-sm w-1/2 md:w-auto">
            <span
              className="block w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: '#FFC107' }}
            ></span>
            <span className="font-medium">Chưa đạt</span>
            <span className="ml-2 font-semibold">{selectedData.warning}</span>
          </li>
          <li className="flex items-center text-sm w-1/2 md:w-auto">
            <span
              className="block w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: '#FF5252' }}
            ></span>
            <span className="font-medium">Không đạt</span>
            <span className="ml-2 font-semibold">{selectedData.failed}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MaterialInspectionChart;
