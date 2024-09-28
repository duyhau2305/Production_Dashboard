import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import DashboardGrid from './DashboardGrid';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';

const machines = [
  { id: '001', status: 'Chạy', time: '3 phút', oee: 78, oeeYesterday: 72, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '002', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 95, totalTimeToday: 9, totalTimeYesterday: 8, workcenter: 'Line 01' },
  { id: '003', status: 'Chờ', time: '3 phút', oee: 94, oeeYesterday: 94, totalTimeToday: 10, totalTimeYesterday: 9, workcenter: 'Line 01' },
  { id: '004', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '005', status: 'Chạy', time: '3 phút', oee: 96, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '006', status: 'Lỗi', time: '3giờ 3 phút', oee: 78, oeeYesterday: 96, totalTimeToday: 5, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '007', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '008', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '009', status: 'Chờ', time: '3 phút', oee: 95, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '010', status: 'Chạy', time: '3 phút', oee: 78, oeeYesterday: 72, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '011', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 95, totalTimeToday: 9, totalTimeYesterday: 8, workcenter: 'Line 01' },
  { id: '012', status: 'Chạy', time: '3 phút', oee: 94, oeeYesterday: 94, totalTimeToday: 10, totalTimeYesterday: 9, workcenter: 'Line 01' },
  { id: '013', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '014', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '015', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '016', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '017', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 01' },
  { id: '018', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '019', status: 'Chạy', time: '3 phút', oee: 78, oeeYesterday: 72, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '020', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 95, totalTimeToday: 9, totalTimeYesterday: 8, workcenter: 'Line 02' },
  { id: '021', status: 'Lỗi', time: '30 phút', oee: 89, oeeYesterday: 94, totalTimeToday: 10, totalTimeYesterday: 9, workcenter: 'Line 02' },
  { id: '022', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '023', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '024', status: 'Chạy', time: '3giờ 00 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '025', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '026', status: 'Chờ', time: '3 phút', oee: 94, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '027', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '028', status: 'Chạy', time: '3 phút', oee: 78, oeeYesterday: 72, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '029', status: 'Lỗi', time: '3 phút', oee: 84, oeeYesterday: 95, totalTimeToday: 9, totalTimeYesterday: 8, workcenter: 'Line 02' },
  { id: '030', status: 'Chạy', time: '3 phút', oee: 94, oeeYesterday: 94, totalTimeToday: 10, totalTimeYesterday: 9, workcenter: 'Line 02' },
  { id: '031', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '032', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '033', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '034', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
  { id: '035', status: 'Chạy', time: '3 phút', oee: 100, oeeYesterday: 98, totalTimeToday: 8, totalTimeYesterday: 7, workcenter: 'Line 02' },
 

  // Thêm các máy khác...
];

const Dashboard1 = () => {
  const [selectedWorkcenter, setSelectedWorkcenter] = useState('All Workcenters');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardsRef = useRef(null);

  // Hàm xử lý khi thay đổi workcenter
  const handleWorkcenterChange = (e) => {
    setLoading(true);
    setSelectedWorkcenter(e.target.value);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Lọc các máy dựa trên workcenter được chọn
  const filteredMachines = machines.filter(
    (machine) => selectedWorkcenter === 'All Workcenters' || machine.workcenter === selectedWorkcenter
  );

  // Fullscreen handling
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

  // Thêm event listener để phát hiện thay đổi fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="w-full h-full mx-auto relative bg-gray-100 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4 px-2">
        <Breadcrumb />
        <div className="relative">
          <select
            value={selectedWorkcenter}
            onChange={handleWorkcenterChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-8 leading-tight"
          >
            <option value="All Workcenters">All Workcenters</option>
            <option value="Line 01">Line 01</option>
            <option value="Line 02">Line 02</option>
          </select>
        </div>
      </div>

      {/* Phần hiển thị máy móc */}
      <div ref={cardsRef}>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : (
          <DashboardGrid machines={filteredMachines} />
        )}
      </div>

      {/* Nút bật/tắt fullscreen */}
      <button
        className="fixed bottom-4 right-4 z-50 text-white p-3 rounded-full shadow-lg focus:outline-none bg-blue-500 hover:bg-blue-600"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <AiOutlineFullscreenExit size={30} /> : <AiOutlineFullscreen size={30} />}
      </button>
    </div>
  );
};

export default Dashboard1;
