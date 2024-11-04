import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';
import moment from 'moment';

const Dashboard1 = () => {
  const [machines, setMachines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fixedDate = moment().format('YYYY-MM-DD');

  // Hàm lấy thiết bị và khu vực
  const fetchDevicesAndAreas = async () => {
    try {
      const [devicesResponse, areasResponse] = await Promise.all([
        axios.get(`${apiUrl}/device`),
        axios.get(`${apiUrl}/areas`),
      ]);
      return { devices: devicesResponse.data, areas: areasResponse.data };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thiết bị và khu vực:', error);
      return { devices: [], areas: [] };
    }
  };

  // Hàm lấy thông tin chi tiết về máy
  const fetchMachineDetails = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/machine-operations/machine-information?startTime=2024-11-02T17:00:00Z&endTime=2024-11-04T16:59:59Z`
      );
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết máy:', error);
      return [];
    }
  };

  // Hàm tổng hợp dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesAndAreas, machinesWithDetails] = await Promise.all([
        fetchDevicesAndAreas(),
        fetchMachineDetails(),
      ]);

      const { devices, areas } = devicesAndAreas;
      setAreas(areas);
      setMachines(machinesWithDetails);

      console.log('Dữ liệu thiết bị:', devices);
      console.log('Dữ liệu khu vực:', areas);
      console.log('Dữ liệu cho từng máy:', machinesWithDetails);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRealTimeStatusAndElapsed = (intervals) => {
    if (!intervals || intervals.length === 0) {
      return { status: 'Không xác định', elapsedTime: '0 phút' };
    }

    const now = moment();
    const latestInterval = intervals[intervals.length - 1];
    const intervalEnd = moment(latestInterval.endTime, 'HH:mm');

    const status = latestInterval.status || 'Không xác định';
    const elapsedMinutes = now.diff(intervalEnd, 'minutes');

    const elapsedTime = `${Math.floor(elapsedMinutes / 60)} giờ ${
      elapsedMinutes % 60
    } phút`;

    return { status, elapsedTime };
  };

  const handleAreaChange = (e) => setSelectedArea(e.target.value);

  const filteredMachines = machines.filter(
    (machine) =>
      selectedArea === 'All Areas' || machine.areaName === selectedArea
  );

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (cardsRef.current.requestFullscreen) {
        cardsRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full h-full mx-auto relative bg-gray-100 p-6 overflow-hidden">
      <div className="flex justify-end items-center mb-4 px-1">
        <div className="relative flex justify-end items-center space-x-2">
          <button className="bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight text-gray-800">
            Tổng số máy chạy: {filteredMachines.filter((m) => m.status === 'Chạy').length}/{machines.length} máy
          </button>
          <select
            value={selectedArea}
            onChange={handleAreaChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-8 leading-tight"
          >
            <option value="All Areas">Tất cả khu vực</option>
            {areas.map((area) => (
              <option key={area.areaName} value={area.areaName}>
                {area.areaName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={cardsRef} className="overflow-auto h-[calc(100vh)]">
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-64">
            Loading...
          </div>
        ) : (
          <DashboardGrid machines={filteredMachines} />
        )}
      </div>

      <button
        className="fixed bottom-4 right-16 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <AiOutlineFullscreenExit size={30} />
        ) : (
          <AiOutlineFullscreen size={30} />
        )}
      </button>
    </div>
  );
};

export default Dashboard1;
