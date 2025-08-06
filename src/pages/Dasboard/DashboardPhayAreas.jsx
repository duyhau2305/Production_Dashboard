import React, { useState, useRef, useEffect, useContext } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import axios from 'axios';
import { OrderedListContext } from '../../context/OrderedListContext'; // Import OrderedListContext

const DashboardPhayAreas = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);
  const wsRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const socketUrl = import.meta.env.VITE_API_BASE_SOCKET;
  
  // Truy cập orderedList từ OrderedListContext
  const { orderedList } = useContext(OrderedListContext);
  

  // Hàm lọc và sắp xếp máy Phay theo orderedList
  const applyFilter = (machinesData) => {
    const phayMachines = machinesData.filter(machine => machine.deviceId.startsWith("P"));
    return orderedList.length
      ? phayMachines.sort((a, b) => {
          const indexA = orderedList.indexOf(a.deviceId);
          const indexB = orderedList.indexOf(b.deviceId);

          // Nếu không tìm thấy trong orderedList, đặt máy ở cuối
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        })
      : phayMachines.sort((a, b) => {
          const regex = /^([a-zA-Z]+)(\d+)(.*)$/; // Tách chữ, số và ký tự đặc biệt
          const [, aLetter, aNumber, aSpecial] = a.deviceId.match(regex) || [];
          const [, bLetter, bNumber, bSpecial] = b.deviceId.match(regex) || [];

          // So sánh theo chữ trước, số sau, rồi đến ký tự đặc biệt
          if (aLetter === bLetter) {
            if (parseInt(aNumber, 10) === parseInt(bNumber, 10)) {
              return (aSpecial || '').localeCompare(bSpecial || '');
            }
            return parseInt(aNumber, 10) - parseInt(bNumber, 10);
          }
          return aLetter.localeCompare(bLetter);
        });
  };

  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      setLoading(true);
      try {
        const initialMachines = await fetchMachineDetails();
        setMachines(initialMachines);
        setFilteredMachines(applyFilter(initialMachines)); // Áp dụng filter ban đầu
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesAndAreas();
  }, [apiUrl, orderedList]); // Cập nhật khi orderedList thay đổi

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
            const updated = prevMachines.map((machine) => {
              const found = msg.data.find((m) => m.machineId === machine._id || m.machineId === machine.deviceId);
              if (found) {
                return { ...machine, currentStatus: found.status };
              }
              return machine;
            });
            // Áp dụng filter lại cho filteredMachines
            setFilteredMachines(applyFilter(updated));
            return updated;
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
  }, [socketUrl, orderedList]);

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
  return (
    <div className="w-full h-screen bg-[#35393c] overflow-hidden">
      <div ref={cardsRef}>
        {loading ? (
          <div className="flex justify-center text-2xl items-center h-64">
            Loading...
          </div>
        ) : (
          <DashboardGrid machines={filteredMachines} orderedList={orderedList} />
        )}
      </div>
    </div>
  );
};

export default DashboardPhayAreas;
