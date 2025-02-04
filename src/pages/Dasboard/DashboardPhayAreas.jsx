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
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Truy cập orderedList từ OrderedListContext
  const { orderedList } = useContext(OrderedListContext);
  console.log("orderedList from context:", orderedList); 

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
      setFilteredMachines(applyFilter(updatedMachines)); // Áp dụng filter khi dữ liệu thay đổi
    }, 4500);

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
