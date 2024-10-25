import React, { useState, useRef, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { addDays } from 'date-fns';
import FilterModal from '../../Components/Modal/FilterModal';
import { generateFakeData } from '../../data/generateFakeData'; 
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-trendline'; 

function ProductionChart() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 10));
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const chartRef = useRef(null);

  const formFields = [
    { name: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
    { name: 'endDate', label: 'Ngày kết thúc', type: 'date' },
   
  ];

  const applyFilter = (data) => {
    setStartDate(data.startDate);
    setEndDate(data.endDate);
    
    const filterParams = {
      startDate: data.startDate,
      endDate: data.endDate,
      productType: data.productType || null,
      productionLine: data.productionLine || null,
    };

    const newChartData = generateFakeData(filterParams.startDate, filterParams.endDate);
    setChartData(newChartData);
  };

  useEffect(() => {
    const initialChartData = generateFakeData(startDate, endDate);
    setChartData(initialChartData);
  }, [startDate, endDate]);

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
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
      trendlineLinear: { // Cấu hình cho trendline
        style: "rgba(255,105,180, .8)",
        lineStyle: "solid",
        width: 2,
        projection: true
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.3)',
        },
        ticks: {
          color: '#333',
          font: {
            size: 12,
          },
        },
        offset: true,
        categoryPercentage: 0.8,
        barPercentage: 0.7,
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        ticks: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md" style={{ width: '100%', height: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tổng sản lượng</h3>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className=" bg-green-500 text-white rounded-lg"
        >
          <FaFilter /> {/* Sử dụng icon filter */}
        </button>
      </div>
      <div style={{ width: '100%', height: '100%', minHeight: '300px', maxHeight: '500px' }}>
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={applyFilter}
        formFields={formFields}
      />
    </div>
  );
}

export default ProductionChart;
