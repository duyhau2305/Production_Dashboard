import React, { useState, useEffect } from 'react';
import MachineSelection from './MachineSelection';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MachineStatusHistory from './MachineStatusHistory';
import ErrorHistoryChart from './ErrorHistoryChart';
import { FaFilter } from 'react-icons/fa';
import { addDays } from 'date-fns';
import axios from 'axios';

import MayTron from '../../assets/image/May_tron.png';
import MayDinhHinh from '../../assets/image/May_Dinh_Hinh.png';
import MayNuong from '../../assets/image/May_nuong_banh.webp';


const machineImages = {
  'Máy Cắt': MayTron,
  'Máy Dập': MayDinhHinh,
  'Máy Uốn': MayNuong,
  
};

// Hàm lấy dữ liệu từ API
const fetchMachineData = async (startDate, endDate) => {
  try {
    // Thay thế API_URL và JWT_TOKEN bằng giá trị thật của bạn
    const response = await axios.get('API_URL', {
      headers: {
        Authorization: `Bearer YOUR_JWT_TOKEN`, // Sử dụng token hợp lệ
      },
    });
    return response.data; // Trả về dữ liệu đã lấy
  } catch (error) {
    console.error('Error fetching machine data:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

// Component chính để hiển thị chi tiết máy
const MachineDetails = () => {
  const [currentMachine, setCurrentMachine] = useState('Máy Cắt'); // Lưu trạng thái máy hiện tại
  const [startDate, setStartDate] = useState(new Date()); // Ngày bắt đầu
  const [endDate, setEndDate] = useState(addDays(new Date(), 7)); // Ngày kết thúc
  const [historyData, setHistoryData] = useState([]); // Dữ liệu trạng thái máy từ API

  // Hàm áp dụng bộ lọc ngày và cập nhật dữ liệu
  const applyDateFilter = async () => {
    const newHistoryData = await fetchMachineData(startDate, endDate); // Lấy dữ liệu từ API
    setHistoryData(newHistoryData); // Cập nhật dữ liệu mới sau khi lọc
  };

  // Khởi tạo dữ liệu khi component mount
  useEffect(() => {
    const loadData = async () => {
      const initialHistoryData = await fetchMachineData(new Date(), addDays(new Date(), 7)); // Lấy dữ liệu mặc định
      setHistoryData(initialHistoryData); // Lưu dữ liệu vào state
    };

    loadData(); // Gọi hàm lấy dữ liệu khi component được mount
  }, []);

  // Trạng thái của máy (có thể lấy từ API nếu cần)
  const machineStatus = 'RUN';
  const machineMode = 'AUTO';

  // Định màu cho trạng thái của máy
  const statusColor = machineStatus === 'RUN' ? 'bg-green-500' : machineStatus === 'STOP' ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className="p-1 rounded-lg shadow-md grid gap-2 w-full grid-rows-auto">
  {/* Phần trên hiển thị trạng thái máy và lựa chọn máy */}
  <div className="grid grid-cols-12 gap-2">

   {/* Cột 2: Hình ảnh máy và tên */}
  <div className="col-span-3 flex flex-col items-center bg-white p-2 rounded-lg shadow">
    <img
      src={machineImages[currentMachine]}
      alt={`${currentMachine} image`}
      className="w-full h-auto object-contain object-center rounded "
    />
    <h2 className="text-center text-xl font-bold mt-1">{currentMachine}</h2>
  </div>

  {/* Cột 3: Trạng thái và chế độ máy */}
  <div className="col-span-2 bg-white p-2 rounded-lg shadow">
    <div className="mb-2">
      <h3 className="font-semibold text-sm mb-1 text-left">Trạng Thái Máy</h3>
      <div className={`py-8 px-4 rounded shadow text-white text-center text-xl font-bold ${statusColor}`}>
        {machineStatus}
      </div>
    </div>
    <div>
      <h3 className="font-semibold text-sm mb-1 text-left">Chế Độ Máy</h3>
      <div className="py-8 px-3 rounded shadow text-center text-xl font-semibold text-black">
        {machineMode}
      </div>
    </div>
  </div>

  <div className="col-span-6 bg-white p-2 rounded-lg shadow">
  {/* Grid gồm 4 cột cho hàng đầu tiên */}
  <div className="grid grid-cols-4 gap-2">
    {/* Lịch sử lỗi chiếm 3 cột */}
    <div className="col-span-3 bg-white p-2 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Lịch sử lỗi</h3>
      <ErrorHistoryChart />
    </div>
    {/* Cycle Times chiếm 1 cột */}
    <div className="col-span-1 bg-white p-2 rounded-lg shadow">
      <h3 className="font-semibold mb-2 text-sm">Cycle Times</h3>
      <div className="text-center text-sm text-blue-600">8 giờ 24 phút 47 giây</div>
    </div>
  </div>

  {/* Hàng thứ 2: Lịch sử trạng thái máy */}
  <div className="bg-white p-2 mt-3 rounded-lg shadow w-full max-h-[600px] overflow-y-auto">
    <div className="mb-4 flex items-center justify-between gap-1">
      <div className="flex items-center gap-1">
        <h3 className="font-semibold mr-2 text-sm">Lịch sử trạng thái máy</h3>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd/MM/yyyy"
          className="p-1 border rounded-md text-sm w-[60%]"
          placeholderText="Từ ngày"
        />
        <span className="-translate-x-[72px]">-</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy"
          className="p-1 border text-sm rounded-md w-[60%] -translate-x-16"
          placeholderText="Đến ngày"
        />
        <button onClick={applyDateFilter} className="p-1 -translate-x-32 bg-green-500 text-white rounded">
          <FaFilter /> {/* Icon lọc */}
        </button>
      </div>
    </div>

    {/* Hiển thị lịch sử trạng thái máy */}
    <div className="w-full overflow-x-auto">
      <MachineStatusHistory historyData={historyData} />
    </div>
  </div>
</div>

</div>

  
</div>

  );
};

export default MachineDetails;
