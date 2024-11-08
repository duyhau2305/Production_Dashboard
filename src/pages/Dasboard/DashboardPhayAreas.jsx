import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';

const DashboardPhayAreas = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const applyFilter = (machinesData) => {
    // Chỉ lọc máy Phay (deviceId bắt đầu với "P")
    return machinesData.filter(machine => machine.deviceId.startsWith("P"));
  };

  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      setLoading(true);
      try {
        const initialMachines = await fetchMachineDetails();
        setMachines(initialMachines);
        setFilteredMachines(applyFilter(initialMachines));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesAndAreas();
  }, [apiUrl]);

  const fetchMachineDetails = async () => {
    try {
      const response = await axios.get(`${apiUrl}/machine-operations/machine-information`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết máy:', error);
      return [];
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedMachines = await fetchMachineDetails();
      setMachines(updatedMachines);
      setFilteredMachines(applyFilter(updatedMachines));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="w-full h-screen  bg-[#35393c]  overflow-hidden">
      
      {/* Dòng chứa tiêu đề và các nút
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-3xl text-center ml-10 flex-1">Nhà máy chuyển đổi số cơ khí Q.C.S</h2>
        <div className="flex items-center space-x-2">
          <button className="bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight text-gray-800">
            Tổng số máy chạy: {filteredMachines.filter(m => m.currentStatus === 'Run').length}/{filteredMachines.length} máy
          </button>
          <button
            value="PHAY"
            className="appearance-none bg-white border border-gray-100 rounded-lg py-2 px-8 leading-tight"
            disabled // Vô hiệu hóa dropdown để người dùng không thể thay đổi
          >
            <option value="PHAY">Khu vực PHAY</option>
          </button>
        </div>
      </div> */}

      <div ref={cardsRef} >
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-64">
            Loading...
          </div>
        ) : (
          <DashboardGrid machines={filteredMachines} />
        )}
      </div>
            {/* Nút bật/tắt fullscreen */}
            {/* <button
                    className="fixed bottom-4 right-16 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? <AiOutlineFullscreenExit size={30} /> : <AiOutlineFullscreen size={30} />}
                </button> */}

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

export default DashboardPhayAreas;
