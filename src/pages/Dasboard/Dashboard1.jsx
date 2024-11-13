import React, { useState, useRef, useEffect, useContext } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';
import { OrderedListContext } from '../../context/OrderedListContext';

const Dashboard1 = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { orderedList, setOrderedList } = useContext(OrderedListContext);
  const [deviceOptions, setDeviceOptions] = useState([]);
  
  const cardsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Hàm applyFilter để lọc và sắp xếp thiết bị theo khu vực và orderedList
  const applyFilter = (machinesData, area) => {
    let filtered = machinesData;
    if (area === 'PHAY') {
      filtered = machinesData.filter(machine => machine.deviceId.startsWith("P"));
    } else if (area === 'TIEN') {
      filtered = machinesData.filter(machine => machine.deviceId.startsWith("T"));
    }

    // Sắp xếp thiết bị theo `orderedList`
    return filtered.sort((a, b) => {
      const indexA = orderedList.indexOf(a.deviceId);
      const indexB = orderedList.indexOf(b.deviceId);

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      setLoading(true);
      try {
        const [devicesResponse, areasResponse] = await Promise.all([
          axios.get(`${apiUrl}/device`),
          axios.get(`${apiUrl}/areas`),
        ]);
        setAreas(areasResponse.data);
        setDeviceOptions(devicesResponse.data);

        const initialMachines = await fetchMachineDetails();
        setMachines(initialMachines);
        setFilteredMachines(applyFilter(initialMachines, selectedArea)); // Áp dụng filter theo khu vực ban đầu
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

  // Cập nhật `filteredMachines` khi `selectedArea` hoặc `machines` thay đổi
  useEffect(() => {
    setFilteredMachines(applyFilter(machines, selectedArea));
  }, [selectedArea, machines, orderedList]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedMachines = await fetchMachineDetails();
      setMachines(updatedMachines);
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedOrder = localStorage.getItem('orderedList');
    if (savedOrder) {
      setOrderedList(JSON.parse(savedOrder));
    }
  }, []);

  const handleAreaChange = (e) => {
    const area = e.target.value;
    setSelectedArea(area); // Thay đổi khu vực và kích hoạt `useEffect` để cập nhật `filteredMachines`
  };

  // Phần còn lại không thay đổi
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (cardsRef.current.requestFullscreen) {
        cardsRef.current.requestFullscreen();
      } else if (cardsRef.current.mozRequestFullScreen) {
        cardsRef.current.mozRequestFullScreen();
      } else if (cardsRef.current.webkitRequestFullscreen) {
        cardsRef.current.webkitRequestFullscreen();
      } else if (cardsRef.current.msRequestFullscreen) {
        cardsRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleOrderSubmit = () => {
    const selectedOrder = Array.from(document.querySelectorAll('.order-input'))
      .map(input => input.value)
      .filter(value => value !== '');
  
    const hasDuplicates = new Set(selectedOrder).size !== selectedOrder.length;
    if (hasDuplicates) {
      alert("Danh sách có thiết bị bị trùng lặp. Vui lòng kiểm tra lại.");
      return;
    }
  
    setOrderedList(selectedOrder);
    localStorage.setItem('orderedList', JSON.stringify(selectedOrder));
    closeModal();
  };

  return (
    <div className="w-full h-full relative bg-gray-100 p-6 overflow-auto">
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
          <button onClick={openModal} className="bg-blue-500 text-white rounded-lg py-2 px-4 leading-tight">
            Sắp xếp thiết bị theo layout
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Chọn thứ tự thiết bị</h2>
            <h5 className="text-xs  mb-4">Layout được sắp xếp theo hướng nhìn vào màn hình ti vi, từ trái qua phải</h5>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  defaultValue={orderedList[index] || ''}
                  placeholder={deviceOptions[index]?.deviceId || `Thiết bị ${index + 1}`}
                  className="border p-2 order-input"
                />
              ))}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={handleOrderSubmit} className="bg-blue-500 text-white rounded-lg py-2 px-4">Xác nhận</button>
              <button onClick={closeModal} className="bg-gray-400 text-white rounded-lg py-2 px-4">Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div ref={cardsRef} className="">
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-64">Loading...</div>
        ) : (
          <DashboardGrid machines={filteredMachines} orderedList={orderedList} />
        )}
      </div>

      <button
        className="fixed bottom-4 right-16 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <AiOutlineFullscreenExit size={30} /> : <AiOutlineFullscreen size={30} />}
      </button>

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

export default Dashboard1;
