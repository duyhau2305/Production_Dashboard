import React, { useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import MachineTabs from '../../Components/Equiment/Analysis/MachineTabs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import TitleChart from '../../Components/TitleChart/TitleChart'; // Import TitleChart component
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { text } from 'd3';
import MachineStatusHistory from '../../Components/Equiment/MachineStatusHistory';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, ChartDataLabels);

const MachineReport = () => {
  const [currentMachine, setCurrentMachine] = useState('Tham Số Máy Cắt');

  // Refs for each chart to handle fullscreen and printing
  const oeeChartRef = useRef(null);
  const productionChartRef = useRef(null);
  const energyChartRef = useRef(null);
  const runtimeChartRef = useRef(null);

  // Common chart options
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        
        display: true,
        position: 'bottom',
        text:'green'
        
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Chart data
  const chartData = {
    labels: ['Aug 24', 'Aug 27', 'Aug 30', 'Sep 02', 'Sep 05', 'Sep 08', 'Sep 11', 'Sep 14', 'Sep 17', 'Sep 20'],
    datasets: [
     
      {
        label: 'Availability',
        data: [90, 92, 91, 89, 88, 89, 90, 88, 89, 88],
        borderColor: 'green',
        fill: false,
        backgroundColor: 'green'
      },
     
    ],
  };

  const productionData = {
    labels: ['Aug 24', 'Aug 27', 'Aug 30', 'Sep 02', 'Sep 05', 'Sep 08', 'Sep 11', 'Sep 14', 'Sep 17', 'Sep 20'],
    datasets: [
      {
        label: 'Sản Lượng',
        data: [60, 80, 90, 100, 70, 92, 85, 87, 91, 92],
        backgroundColor: 'purple',
      },
    ],
  };

  const energyData = {
    labels: ['Aug 24', 'Aug 27', 'Aug 30', 'Sep 02', 'Sep 05', 'Sep 08', 'Sep 11', 'Sep 14', 'Sep 17', 'Sep 20'],
    datasets: [
      {
        label: 'Điện Năng',
        data: [757, 800, 820, 900, 750, 1000, 950, 1100, 1050, 1156],
        backgroundColor: 'green',
      },
    ],
  };

  const runtimeData = {
    labels: ['Aug 24', 'Aug 27', 'Aug 30', 'Sep 02', 'Sep 05', 'Sep 08', 'Sep 11', 'Sep 14', 'Sep 17', 'Sep 20'],
    datasets: [
      {
        label: 'Run Time',
        data: [18, 20, 19, 18, 20, 19, 18, 19, 18, 20],
        backgroundColor: 'green',
      },
      {
        label: 'Idle Time',
        data: [2, 3, 2, 2, 1, 2, 3, 2, 2, 1],
        backgroundColor: 'yellow',
      },
    ],
  };

  const tableData = [
    { timestamp: '2024-09-20 03:39:18', sanLuong: '60 pcs', dienNang: '757.00 kWh', thoiGianMayChay: '20 giờ 29 phút 15 giây' },
    { timestamp: '2024-09-19 03:39:18', sanLuong: '92 pcs', dienNang: '1156.00 kWh', thoiGianMayChay: '19 giờ 16 phút 24 giây' },
    { timestamp: '2024-09-18 03:39:18', sanLuong: '99 pcs', dienNang: '1242.00 kWh', thoiGianMayChay: '18 giờ 28 phút 14 giây' },
  ];

  // Fullscreen and print handlers
  const handleFullscreen = (ref) => {
    if (ref.current) {
      if (ref.current.requestFullscreen) {
        ref.current.requestFullscreen();
      }
    }
  };

  const handlePrint = (ref) => {
    if (ref.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Print Chart</title></head><body>');
      printWindow.document.write(ref.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Stack bar options for runtime chart
  const runtimeChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      datalabels: {
        display: false,
      },
    },
  };

  return (
    <div className="p-2 space-y-4">
      {/* Hàng 1: Tabs máy */}
     

      {/* Hàng 2: Ba biểu đồ */}
      <div className="grid grid-cols-2 gap-2">
        {/* Biểu đồ 1: Xu Hướng Hiệu Suất OEE */}
        <div className="bg-white p-4 rounded-lg shadow" ref={oeeChartRef}>
          <TitleChart 
            title="Xu Hướng Hiệu Suất OEE"
            timeWindow="Realtime - Current week (Mon - Sun)"
            onFullscreen={() => handleFullscreen(oeeChartRef)}
            onPrint={() => handlePrint(oeeChartRef)}
          />
          <Line data={chartData} options={commonOptions} />
        </div>

        {/* Biểu đồ 2: Biểu Đồ Sản Lượng */}
      

        {/* Biểu đồ 3: Biểu Đồ Tổng Thời Gian  */}
        <div className=" bg-white p-4 rounded-lg shadow" ref={runtimeChartRef}>
          <TitleChart 
            title="Biểu Đồ Tổng Thời Gian"
            timeWindow="Realtime - Current week (Mon - Sun)"
            onFullscreen={() => handleFullscreen(runtimeChartRef)}
            onPrint={() => handlePrint(runtimeChartRef)}
          />
          <Bar data={runtimeData} options={runtimeChartOptions} />
        </div>
       
      </div>

      {/* Hàng 3: 1 Biểu đồ + Bảng */}
      <div className="grid grid-cols-5 gap-2">
        {/* Bảng Thống Kê */}
        <div className="col-span-5 bg-white p-4 rounded-lg shadow">
        <TitleChart 
            title="Biểu Đồ Trạng Thái"
            timeWindow="Realtime - Current week (Mon - Sun)"
            onFullscreen={() => handleFullscreen(runtimeChartRef)}
            onPrint={() => handlePrint(runtimeChartRef)}
          />
         <MachineStatusHistory />
        </div>
      </div>
    </div>
  );
};

export default MachineReport;
