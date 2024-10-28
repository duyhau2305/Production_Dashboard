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

  const fixedDate = moment().format('YYYY-MM-DD'); // Ngày hiện tại

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesResponse, areasResponse] = await Promise.all([
        axios.get(`${apiUrl}/device`),
        axios.get(`${apiUrl}/areas`),
      ]);

      setAreas(areasResponse.data);

      const machinesWithDetails = await Promise.all(
        devicesResponse.data.map(async (device) => {
          const deviceId = device.deviceId;

          try {
            const [telemetryResponse, totaltopResponse, productionTaskResponse, workShiftsResponse] = await Promise.all([
              axios.get(`${apiUrl}/telemetry?deviceId=${deviceId}&startDate=${fixedDate}&endDate=${fixedDate}`),
              axios.get(`${apiUrl}/totaltop?deviceId=${deviceId}&startDate=${fixedDate}&endDate=${fixedDate}`),
              axios.get(`${apiUrl}/productiontask?deviceId=${deviceId}&startDate=${fixedDate}&endDate=${fixedDate}`),
              axios.get(`${apiUrl}/workShifts`),
            ]);
           
            const telemetryData = telemetryResponse.data[0] || {};
            const { status, elapsedTime } = getRealTimeStatusAndElapsed(telemetryData.intervals);

            const runtimeData = totaltopResponse.data || {};
            console.log('runtimeData',runtimeData)
            const runtimePercentage = runtimeData.run || 0;
            const totalTimeToday = runtimeData.totalRunTime || '0 giờ';
            const totalTimeYesterday = runtimeData.totalStopTime || '0 giờ';

            const productionTaskData = productionTaskResponse.data[0] || {};
            const employee = productionTaskData.shifts?.[0]?.employeeName?.[0] || 'Không có dữ liệu';
            const shiftName = productionTaskData.shifts?.[0]?.shiftName || 'Không xác định';

            const workShift = workShiftsResponse.data.find((shift) => shift.shiftName === shiftName);
            const startTime = workShift?.startTime || 'Chưa xác định';
            const endTime = workShift?.endTime || 'Chưa xác định';
            
            return {
              id: deviceId,
              deviceName: device.deviceName,
              areaName: device.areaName || 'Không xác định',
              status,
              elapsedTime, // Thời gian trạng thái hiện tại đã duy trì
              runtimePercentage,
              employee,
              shiftName,
              startTime,
              endTime,
              totalTimeToday,
              totalTimeYesterday,
            };
          } catch (error) {
            console.error(`Lỗi khi lấy dữ liệu cho ${device.deviceName}:`, error);
            return {
              id: deviceId,
              deviceName: device.deviceName,
              areaName: device.areaName || 'Không xác định',
              status: 'Không xác định',
              elapsedTime: '0 phút',
              runtimePercentage: 0,
              employee: 'Không có dữ liệu',
              shiftName: 'Không xác định',
              startTime: 'Chưa xác định',
              endTime: 'Chưa xác định',
              totalTimeToday: '0 giờ',
              totalTimeYesterday: '0 giờ',
            };
          }
        })
      );

      setMachines(machinesWithDetails);
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
    if (!intervals || intervals.length === 0) return { status: 'Không xác định', elapsedTime: '0 phút' };

    const now = moment();
    const latestInterval = intervals[intervals.length - 1]; // Interval gần nhất
    const intervalEnd = moment(latestInterval.endTime, 'HH:mm'); // Thời điểm kết thúc của interval
    console.log('last interval' , latestInterval)

    const status = latestInterval.status || 'Không xác định';
    const elapsedMinutes = now.diff(intervalEnd, 'minutes'); // Số phút đã trôi qua từ khi thay đổi trạng thái

    const elapsedTime = `${Math.floor(elapsedMinutes / 60)} giờ ${elapsedMinutes % 60} phút`;

    return { status, elapsedTime };
  };

  const handleAreaChange = (e) => setSelectedArea(e.target.value);

  const filteredMachines = machines.filter(
    (machine) => selectedArea === 'All Areas' || machine.areaName === selectedArea
  );

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (cardsRef.current.requestFullscreen) {
        cardsRef.current.requestFullscreen();
      } else if (cardsRef.current.webkitRequestFullscreen) {
        cardsRef.current.webkitRequestFullscreen();
      } else if (cardsRef.current.mozRequestFullScreen) {
        cardsRef.current.mozRequestFullScreen();
      } else if (cardsRef.current.msRequestFullscreen) {
        cardsRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
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
          <div className="flex justify-center text-2xl items-center h-64">Loading...</div>
        ) : (
          <DashboardGrid machines={filteredMachines} />
        )}
      </div>

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
