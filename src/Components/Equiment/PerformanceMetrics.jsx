import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import MachineStatusHistory from './MachineStatusHistory';



const PerformanceMetrics = () => {
  const doughnutData = (value) => ({
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: ['#4bc0c0', '#e5e5e5'],
        borderWidth: 0,
      },
    ],
    labels: ['Tỉ lệ', ''],
  });

  const doughnutOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        display: false,
        color: 'black',
        formatter: function (value, context) {
          return context.chart.data.datasets[0].data[0] + '%';
        },
        font: {
          size: 14, 
          weight: 'bold',
        },
      },
    },
    maintainAspectRatio: false, 
  };

  return (
    <div className="grid grid-cols-12 gap-4 mt-4">
      {/* Các biểu đồ doughnut */}
      <div className="col-span-8 grid grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="font-semibold text-center text-xs mb-2">Tính Sẵn Sàng A (%)</h3>
          <div className="relative w-32 h-40"> 
            <Doughnut data={doughnutData(89.79)} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{89.79}%</div>
          </div>
        </div>
        {/*<div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="font-semibold text-center text-xs mb-2">Hiệu Suất P (%)</h3>
          <div className="relative w-32 h-40"> 
            <Doughnut data={doughnutData(89.79)} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{89.79}%</div>
          </div>
        </div>*/}
        {/* <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="font-semibold text-center text-xs mb-2">Chất Lượng Q (%)</h3>
          <div className="relative w-32 h-40"> {/* Điều chỉnh kích thước biểu đồ */}
            {/* <Doughnut data={doughnutData(100)} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{100}%</div>
          </div>
        </div> */} 
        {/* <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h3 className="font-semibold text-center text-xs mb-2">Hiệu Suất Tổng Thể OEE </h3>
          <div className="relative w-32 h-40"> {/* Điều chỉnh kích thước biểu đồ */}
            {/* <Doughnut data={doughnutData(80.62)} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{80.62}%</div>
          </div>
        </div> */} 
         
      </div>
       
       <div className="col-span-4 grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <h3 className="font-semibold text-xs text-left mb-4">Tổng Sản Lượng Hôm Nay</h3>
          <div className="text-center text-[2xl/3] text-red-600">1287 sp</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-2">
          <h3 className="font-semibold text-xs text-left mb-4">Thời Gian Bật Máy</h3>
          <div className="text-center text-[2xl/3] text-blue-600">0 giờ 0 phút 0 giây</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-2">
          <h3 className="font-semibold text-xs text-left mb-4">Thời Gian Chạy</h3>
          <div className="text-center text-[2xl/3] text-blue-600">8 giờ 24 phút 47 giây</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-2">
          <h3 className="font-semibold text-xs text-left mb-4">Thời Gian Chờ</h3>
          <div className="text-center text-[2xl/3] text-blue-600">0 giờ 57 phút 25 giây</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
