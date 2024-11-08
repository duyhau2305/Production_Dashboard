import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';
import moment from 'moment';

const Dashboard1 = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const applyFilter = (machinesData, area) => {
    if (area === 'PHAY') {
      return machinesData.filter(machine => machine.deviceId.startsWith("P"));
    } else if (area === 'TIEN') {
      return machinesData.filter(machine => machine.deviceId.startsWith("T"));
    } else {
      return machinesData; // Tất cả máy
    }
  };

  // Lấy danh sách thiết bị và khu vực khi component mount lần đầu
  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      setLoading(true);
      try {
        const [devicesResponse, areasResponse] = await Promise.all([
          axios.get(`${apiUrl}/device`),
          axios.get(`${apiUrl}/areas`),
        ]);
        setAreas(areasResponse.data);

        const initialMachines = await fetchMachineDetails();
        setMachines(initialMachines);
        setFilteredMachines(applyFilter(initialMachines, selectedArea));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesAndAreas();
  }, [apiUrl]);

  // Hàm gọi API lấy thông tin chi tiết máy
  const fetchMachineDetails = async () => {
    try {
      const response = await axios.get(`${apiUrl}/machine-operations/machine-information`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết máy:', error);
      return [];
    }
  };

  // Cập nhật danh sách máy liên tục với `setInterval`
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedMachines = await fetchMachineDetails();
      setMachines(updatedMachines);
      setFilteredMachines(applyFilter(updatedMachines, selectedArea));
    }, 70000); 

    return () => clearInterval(interval); // Xóa interval khi unmount
  }, [selectedArea]);

  const handleAreaChange = (e) => {
    const area = e.target.value;
    setSelectedArea(area);
    setFilteredMachines(applyFilter(machines, area));
  };
const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (cardsRef.current.requestFullscreen) {
        cardsRef.current.requestFullscreen();
      } else if (cardsRef.current.mozRequestFullScreen) { /* Firefox */
        cardsRef.current.mozRequestFullScreen();
      } else if (cardsRef.current.webkitRequestFullscreen) { /* Chrome, Safari, and Opera */
        cardsRef.current.webkitRequestFullscreen();
      } else if (cardsRef.current.msRequestFullscreen) { /* IE/Edge */
        cardsRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari, and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  return (
    <div className="w-full h-full mx-auto relative bg-gray-100 p-6 overflow-hidden">
      <div className="flex justify-end items-center mb-4 px-1">
        <div className="relative flex justify-end items-center space-x-2">
          <button className="bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight text-gray-800">
            Tổng số máy chạy: {filteredMachines.filter(m => m.currentStatus === 'Run').length}/{filteredMachines.length} máy
          </button>
          <select
            value={selectedArea}
            onChange={handleAreaChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-8 leading-tight"
          >
            <option value="All Areas">Tất cả khu vực</option>
            <option value="PHAY">Khu vực Phay</option>
            <option value="TIEN">Khu vực Tiện</option>
           
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
      {/* Nút bật/tắt fullscreen */}
      <button
              className="fixed bottom-4 right-16 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <AiOutlineFullscreenExit size={30} /> : <AiOutlineFullscreen size={30} />}
            </button>

            {/* Nút thu nhỏ màn hình */}
            {isFullscreen && (
              <button
                className="fixed bottom-4 right-4 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-red-500 hover:bg-red-600"
                onClick={toggleFullscreen} // Sử dụng lại hàm toggleFullscreen để thoát chế độ toàn màn hình
              >
                <span className="text-white">&#8722;</span> {/* Dấu trừ để thu nhỏ */}
              </button>
            )}    
          </div>
  );
};

export default Dashboard1;
