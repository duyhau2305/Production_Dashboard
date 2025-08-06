import React, { useState, useRef, useEffect, useContext } from 'react';
import DashboardGrid3 from './DashboardGrid3';
import axios from 'axios';
import { OrderedListContext } from '../../context/OrderedListContext';

const Dashboard3 = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const wsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const socketUrl = import.meta.env.VITE_API_BASE_SOCKET;

  // Truy cập orderedList từ OrderedListContext
  const { orderedList } = useContext(OrderedListContext);

  // Hàm sắp xếp machines theo orderedList
  const applyOrder = (machinesData) => {
    if (!orderedList || orderedList.length === 0) return machinesData;

    return machinesData.sort((a, b) => {
      const indexA = orderedList.indexOf(a.deviceId);
      const indexB = orderedList.indexOf(b.deviceId);

      // Đặt máy không có trong orderedList xuống cuối
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };
useEffect(() => {
  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/machine-operations/machine-information`);
      const initialMachines = response.data.data;
      setMachines(applyOrder(initialMachines));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchMachines ngay khi component mount
  fetchMachines();

  // Thiết lập interval để gọi lại fetchMachines mỗi 5 phút
  const intervalId = setInterval(fetchMachines, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 milliseconds

  // Xóa interval khi component unmount
  return () => clearInterval(intervalId);
}, [apiUrl, orderedList]); // Chạy lại khi apiUrl hoặc orderedList thay đổi

  useEffect(() => {
   console.log(`🔌 Connecting to WebSocket: ${socketUrl}`);
    
    // Sử dụng socketUrl trực tiếp cho relative URL
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'current_status_update' && Array.isArray(msg.data)) {
          setMachines((prevMachines) => {
            // Cập nhật currentStatus cho từng máy, giữ nguyên các thông tin khác
            return prevMachines.map((machine) => {
              const found = msg.data.find((m) => m.machineId === machine._id || m.machineId === machine.deviceId);
              if (found) {
                return { ...machine, currentStatus: found.status };
              }
              return machine;
            });
          });
        }
      } catch (err) {
        // console.error('WebSocket message error:', err);
      }
    };
    ws.onclose = () => {
      // console.log('WebSocket disconnected');
    };
    return () => {
      ws.close();
    };
  }, [socketUrl]);
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      cardsRef.current.requestFullscreen?.();
      cardsRef.current.mozRequestFullScreen?.();
      cardsRef.current.webkitRequestFullscreen?.();
      cardsRef.current.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.();
      document.mozCancelFullScreen?.();
      document.webkitExitFullscreen?.();
      document.msExitFullscreen?.();
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
    <div className="w-full h-screen relative overflow-hidden">
      <div ref={cardsRef}>
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-full">
            Loading...
          </div>
        ) : (
          <DashboardGrid3 machines={machines} orderedList={orderedList} />
        )}
      </div>

      {isFullscreen && (
        <button
          className="fixed bottom-4 right-4 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-red-500 hover:bg-red-600"
          onClick={toggleFullscreen}
        >
          <span className="text-white">&#8722;</span>
        </button>
      )}
    </div>
  );
};

export default Dashboard3;
