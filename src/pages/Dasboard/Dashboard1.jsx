import React, { useState, useRef, useEffect, useContext } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';
import { OrderedListContext } from '../../context/OrderedListContext';
import { Dropdown, Menu, Button, Modal, Input } from 'antd';

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
  const [sortOption, setSortOption] = useState('layout'); // Default: 'layout'

  const cardsRef = useRef(null);
  const wsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const socketUrl = import.meta.env.VITE_API_BASE_SOCKET;
  
  const naturalSort = (a, b) => {
    const getPrefixAndNumber = (deviceId) => {
      const match = deviceId.match(/^([A-Z]+)(\d+)/); // Tách prefix và số
      if (match) {
        const prefix = match[1];
        const number = parseInt(match[2], 10); // Lấy số dạng số nguyên
        return [prefix, number];
      }
      return [deviceId, Infinity]; // Nếu không khớp, xếp cuối danh sách
    };
  
    const [prefixA, numberA] = getPrefixAndNumber(a.deviceId);
    const [prefixB, numberB] = getPrefixAndNumber(b.deviceId);
  
    // So sánh tiền tố
    if (prefixA !== prefixB) {
      return prefixA.localeCompare(prefixB);
    }
  
    // So sánh số (ưu tiên số ít chữ số trước)
    return numberA - numberB;
  };
  
  const applyFilter = (machinesData, area) => {
    let filtered = machinesData;
  
    // Lọc theo khu vực
    if (area === 'PHAY') {
      filtered = machinesData.filter((machine) => machine.deviceId.startsWith('P'));
    } else if (area === 'TIEN') {
      filtered = machinesData.filter((machine) => machine.deviceId.startsWith('T'));
    }
  
    // Sắp xếp
    if (sortOption === 'asc') {
      return filtered.sort(naturalSort); // Sắp xếp tự nhiên
    } else if (sortOption === 'layout') {
      return filtered.sort((a, b) => {
        const indexA = orderedList.indexOf(a.deviceId);
        const indexB = orderedList.indexOf(b.deviceId);
  
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
  
    return filtered;
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
        setFilteredMachines(applyFilter(initialMachines, selectedArea)); 
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
//4 phút fetch lại Details
useEffect(() => {
  const updateMachineDetails = async () => {
    const updatedMachines = await fetchMachineDetails();
    setMachines(updatedMachines);
  };

  updateMachineDetails();
  const interval = setInterval(updateMachineDetails, 300000);
  return () => clearInterval(interval);
}, []);
  useEffect(() => {
    setFilteredMachines(applyFilter(machines, selectedArea));
  }, [selectedArea, machines, orderedList, sortOption]);



useEffect(() => {    
    
    
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
            return prevMachines.map((machine) => {
              const found = msg.data.find((m) => 
                m.machineId === machine._id || m.machineId === machine.deviceId
              );
              if (found) {
                return { ...machine, currentStatus: found.status };
              }
              return machine;
            });
          });
        } else if (msg.event === 'call_help' && msg.data) {
          setMachines((prevMachines) => prevMachines.map((machine) => {
            if (machine._id === msg.data.machineId || machine.deviceId === msg.data.machineId) {
              return { ...machine, isCalling: true, callingDepartment: msg.data.message };
            }
            return machine;
          }));
        } else if (msg.event === 'cancel_help' && msg.data) {
          setMachines((prevMachines) => prevMachines.map((machine) => {
            if (machine._id === msg.data.machineId || machine.deviceId === msg.data.machineId) {
              return { ...machine, isCalling: false, callingDepartment: '' };
            }
            return machine;
          }));
        }
      } catch (err) {
        console.error('❌ WebSocket message error:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
}, [socketUrl]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('orderedList');
    const savedSortOption = localStorage.getItem('sortOption') || 'layout';

    if (savedOrder) {
      setOrderedList(JSON.parse(savedOrder));
    } else {
      const defaultOrder = deviceOptions.map((device) => device.deviceId).sort();
      setOrderedList(defaultOrder);
    }
    setSortOption(savedSortOption);
  }, [deviceOptions]);

  const handleAreaChange = (e) => {
    const area = e.target.value;
    setSelectedArea(area);
  };

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

  const handleSortChange = ({ key }) => {
    setSortOption(key);
    localStorage.setItem('sortOption', key);
  
    if (key === 'layout') {
      openModal();
    } else {
      // Sử dụng naturalSort để đảm bảo sắp xếp đúng thứ tự tự nhiên
      const sortedOrder = machines
        .map((m) => m.deviceId)
        .sort((a, b) => {
          const getPrefixAndNumber = (deviceId) => {
            const match = deviceId.match(/^([A-Z]+)(\d+)/); // Tách tiền tố và số
            if (match) {
              return [match[1], parseInt(match[2], 10)];
            }
            return [deviceId, Infinity];
          };
  
          const [prefixA, numberA] = getPrefixAndNumber(a);
          const [prefixB, numberB] = getPrefixAndNumber(b);
  
          // So sánh tiền tố trước
          if (prefixA !== prefixB) {
            return prefixA.localeCompare(prefixB);
          }
  
          // So sánh số
          return numberA - numberB;
        });
  
      setOrderedList(sortedOrder);
      localStorage.setItem('orderedList', JSON.stringify(sortedOrder));
    }
  };
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleOrderSubmit = () => {
    const selectedOrder = Array.from(document.querySelectorAll('.order-input'))
      .map((input) => input.value)
      .filter((value) => value !== '');

    const hasDuplicates = new Set(selectedOrder).size !== selectedOrder.length;
    if (hasDuplicates) {
      alert('Danh sách có thiết bị bị trùng lặp. Vui lòng kiểm tra lại.');
      return;
    }

    setOrderedList(selectedOrder);
    localStorage.setItem('orderedList', JSON.stringify(selectedOrder));
    closeModal();
  };

  const menu = (
    <Menu onClick={handleSortChange}>
      <Menu.Item key="asc">Sắp xếp theo thứ tự tăng dần</Menu.Item>
      <Menu.Item key="layout">Sắp xếp theo layout</Menu.Item>
    </Menu>
  );

  return (
    <div className="w-full h-full relative bg-gray-100 p-6 overflow-auto">
      <div className="flex justify-end items-center mb-4 px-1">
        <div className="relative flex justify-end items-center space-x-2">
          <button className="bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight text-gray-800">
            Tổng số máy chạy: {filteredMachines.filter((m) => m.currentStatus === 'Run').length}/{filteredMachines.length} máy
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
          <Dropdown overlay={menu}>
            <Button className="bg-blue-500 text-white rounded-lg py-2 px-4 leading-tight">
              Sắp xếp thiết bị
            </Button>
          </Dropdown>
        </div>
      </div>

      <div ref={cardsRef}>
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-64">Loading...</div>
        ) : (
          <DashboardGrid machines={filteredMachines} orderedList={orderedList} />
        )}
      </div>

      <Modal
        title="Chọn thứ tự thiết bị"
        visible={isModalOpen}
        onCancel={closeModal}
        onOk={handleOrderSubmit}
        okText="Xác nhận"
        cancelText="Hủy"
        width={800}
      >
        <h5 className="text-xs mb-4">Layout được sắp xếp từ trái sang phải.</h5>
        <div className="grid grid-cols-6 gap-2 w-full">
          {deviceOptions.map((device, index) => (
            <Input
              key={index}
              defaultValue={orderedList[index] || ''}
              // placeholder={device.deviceId || `Thiết bị ${index + 1}`}
              className="order-input w-full"
            />
          ))}
        </div>
      </Modal>

      <button
        className="fixed bottom-4 right-16 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <AiOutlineFullscreenExit size={30} /> : <AiOutlineFullscreen size={30} />}
      </button>
    </div>
  );
};

export default Dashboard1;
