import React, { useState, useEffect } from 'react';
import MachineTabs from '../../Components/Equiment/Analysis/MachineTabs';
import ChartSection from '../../Components/Equiment/Analysis/ChartSection';
import DowntimeTable from '../../Components/Equiment/Analysis/DowntimeTable';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb'
import MachineStatusHistory from '../../Components/Equiment/MachineStatusHistory';
import TitleChart from '../../Components/TitleChart/TitleChart';

const EquipmentAnalysis = () => {
  const [currentMachine, setCurrentMachine] = useState('Tham Số Máy Cắt');
  const [downtimeData, setDowntimeData] = useState({});
  const [errorOccurrenceData, setErrorOccurrenceData] = useState({});
  const [errorTimeData, setErrorTimeData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [selectedWorkcenter, setSelectedWorkcenter] = useState('All Workcenters');
  const [selectedOEE, setSelectedOEE] = useState('OEE');
  const [loading, setLoading] = useState(false);
  
  // Function to handle workcenter selection
  const handleWorkcenterChange = (e) => {
    setLoading(true);
    setSelectedWorkcenter(e.target.value);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Function to handle OEE selection
  const handleOEEChange = (e) => {
    setSelectedOEE(e.target.value);
  };

  // Giả lập dữ liệu
  useEffect(() => {
    const generateMockData = () => {
      // Giả lập dữ liệu Downtime
      const downtimeMockData = {
        labels: ['Bảo Trì Máy', 'Bảo Trì Khuôn', 'Thiếu Vật Tư', 'Thiếu Nhân Lực', 'Thiết Bị Hỏng', 'Đào Tạo'],
        data: [10, 15, 7, 5, 20, 12],
      };

      // Giả lập dữ liệu Số Lần Xảy Ra Lỗi
      const errorOccurrenceMockData = {
        labels: ['Kiểm Tra Chất Lượng', 'Ăn Phụ', 'Thiếu Vật Tư', 'Bảo Trì Máy', 'Thay Khuôn'],
        data: [3, 7, 2, 5, 4],
      };

      // Giả lập dữ liệu Thời Gian Xảy Ra Lỗi
      const errorTimeMockData = {
        labels: ['Bảo Trì Máy', 'Kiểm Tra Chất Lượng', 'Thiết Bị Hỏng', 'Thiếu Vật Tư'],
        data: [6000, 4000, 8000, 2000], // Thời gian tính theo giây
      };

      // Giả lập dữ liệu lịch sử Downtime
      const historyMockData = [
        { timestamp: '2024-09-20 11:17:26', reason: 'Sản Xuất', duration: '0 giờ 1 phút 5 giây' },
        { timestamp: '2024-09-20 11:16:21', reason: 'Bảo Trì Khuôn', duration: '0 giờ 3 phút 15 giây' },
        { timestamp: '2024-09-20 11:13:06', reason: 'Sản Xuất', duration: '0 giờ 2 phút 10 giây' },
        { timestamp: '2024-09-20 11:10:56', reason: 'Thay Khuôn', duration: '0 giờ 1 phút 50 giây' },
        { timestamp: '2024-09-20 11:09:51', reason: 'Sản Xuất', duration: '0 giờ 5 phút 30 giây' },
      ];

      setDowntimeData(downtimeMockData);
      setErrorOccurrenceData(errorOccurrenceMockData);
      setErrorTimeData(errorTimeMockData);
      setHistoryData(historyMockData);
    };

    generateMockData();
  }, [currentMachine]);

  return (
    
    <div className="p-2 space-y-4">
   
      {/* Hàng đầu tiên: Tab chọn máy */}
      <div className="flex justify-between items-center mb-4 px-2 ">
        <div className="text-gray-600">
          <Breadcrumb />
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <select
              value={selectedWorkcenter}
              onChange={handleWorkcenterChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-6 leading-tight focus:outline-none hover:bg-gray-50 transition duration-150"
            >
              <option value="All Workcenters">All Workcenters</option>
              <option value="Line 01">Line 01</option>
              <option value="Line 02">Line 02</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedOEE}
              onChange={handleOEEChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-6 text-left leading-tight focus:outline-none hover:bg-gray-50 transition duration-150"
            >
              <option value="OEE">OEE</option>
              <option value="DownTime">DownTime</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hàng thứ hai: Khu vực biểu đồ */}
      <div className="">
        <ChartSection 
          downtimeData={downtimeData} 
          errorOccurrenceData={errorOccurrenceData} 
          errorTimeData={errorTimeData} 
        />
      </div>

      {/* Hàng thứ ba: Bảng thống kê lịch sử Downtime */}
      <div className="bg-white p-2 rounded-lg shadow">
      <TitleChart 
            title="Biểu Đồ Chồng Trạng Thái"
            timeWindow="Realtime - Current week (Mon - Sun)"
            onFullscreen={() => handleFullscreen(runtimeChartRef)}
            onPrint={() => handlePrint(runtimeChartRef)}
          />
      {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-12 h-12 animate-spin" viewBox="0 0 16 16">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
              <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
            </svg>
          </div>
        ) : (
          <MachineStatusHistory  historyData={historyData} />
        )} 

      </div>
    </div>
  );
};

export default EquipmentAnalysis;
