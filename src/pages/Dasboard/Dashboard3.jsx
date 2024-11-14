import React, { useState, useRef, useEffect, useContext } from 'react';
import DashboardGrid3 from './DashboardGrid3';
import axios from 'axios';
import { OrderedListContext } from '../../context/OrderedListContext';

const Dashboard3 = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

    fetchMachines();
  }, [apiUrl, orderedList]); // Chạy lại khi orderedList thay đổi
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
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
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
