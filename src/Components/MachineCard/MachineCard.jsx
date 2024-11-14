import React ,{useEffect,useState, useRef}from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import io from "socket.io-client";

const getHeaderColor = (status) => {
  if (status === 'Run') return '#60ec60';  // Green for Active
  if (status === 'Idle' || status === 'Cài Đặt') return '#f8f867';   // Yellow for Idle or Set up
  if (status === 'Stop') return '#ff3333';  // Red for Error
  if (status === 'Off') return '#f7f5f5';   // Grey for Off
  return 'bg-gray-500';                     // Gray for other statuses
};

const getSignalLightColors = (status) => {
  if (status === 'Chạy') return { red: 'white', yellow: 'white', green: '#13a113' };
  if (status === 'Chờ' || status === 'Cài Đặt') return { red: 'white', yellow: '#f4f41e', green: 'white' };
  if (status === 'Dừng') return { red: '#e60000', yellow: 'white', green: 'white' };
  if (status === 'Off') return { red: 'white', yellow: 'white', green: 'white' };
  return { red: 'white', yellow: 'white', green: 'white' }; // Default case
};

const MachineCard = ({ machine }) => {
  const headerColor = getHeaderColor(machine.currentStatus || '');
  const signalLightColors = getSignalLightColors(machine.productionTasks?.[0]?.shifts[0]?.status || '');
  const blinkClass = machine?.status === 'Dừng' ? 'animate-blinkError' : '';
  function formatSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  function formatMinutesToTime(totalSeconds) {
    const minutes = Math.floor((totalSeconds / 60));
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}`;
  }
  const calculateDurationInHoursAndMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return '';

    const start = new Date(startTime);
    const end = Date.now();
    const durationInSeconds = (end - start) / 1000;

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

 
  const [isCalling, setIsCalling] = useState(false);
  const [callingDepartment, setCallingDepartment] = useState('');
  const socketRef = useRef(null);

  const displayInfo = isCalling
  ? `Đang gọi  ${callingDepartment}`
  : machine.productionTasks?.[0]?.shifts[0]?.employeeName?.[0] || '';

  useEffect(() => {
    const apiSocket = import.meta.env.VITE_API_BASE_SOCKET;
    socketRef.current = io(`${apiSocket}`);

    // Lắng nghe sự kiện gọi trợ giúp cho máy này
    socketRef.current.on('update_call_status', (data) => {
      if (data.deviceId === machine.deviceId) {
        setIsCalling(true);
        setCallingDepartment(data.department);
      }
    });

    // Lắng nghe sự kiện hủy trợ giúp cho máy này
    socketRef.current.on('cancel_call_status', (data) => {
      if (data.deviceId === machine.deviceId) {
        setIsCalling(false);
        setCallingDepartment('');
      }
    });

    // Ngắt kết nối socket khi component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [machine.deviceId]);
  const percentDiff = machine?.percentDiff || '0%';
  const numericPercentDiff = parseFloat(percentDiff);
  const isIncrease = numericPercentDiff > 0;
  const isDecrease = numericPercentDiff < 0;
  const displayPercentDiff = Math.abs(numericPercentDiff).toFixed(2) + '%';
  const arrowColor = headerColor === '#ff3333' ? 'text-white' : (isIncrease ? 'text-green-700' : 'text-red-500');


  return (
    <div className={`shadow-md flex flex-col justify-between `} style={{ backgroundColor: headerColor }}>
      {/* 1. Header */}
      <div className=" flex flex-col items-center justify-center" style={{ backgroundColor: headerColor }}>
        <div className="text-[#122a35] bg-black-rgba w-full flex justify-center py-1">
          <h2 className="text-4xl font-bold text-[#375BA9]">{machine.deviceId || ''}</h2>
        </div>
        {/* Machine Time and Status */}
        <div className="text-center mt-1">
          <span className="text-2xl font-bold">
            {machine.currentStatus || ''} - {calculateDurationInHoursAndMinutes(machine.timelineStartTime, machine.timelineEndTime)}
          </span>
        </div>
      </div>

      {/* 2. OEE Section */}
      <div className="flex items-center ml-2 justify-center bg-transparent p-3 mb-5">
        {/* Signal Light */}
        <div className="flex flex-col justify-center items-center">
          <div className="w-12 h-32 border border-black rounded-lg mr-4 -ml-3">
            <div style={{ backgroundColor: signalLightColors.red, height: '33.33%' }} className={`rounded-t-lg ${blinkClass} border-l-red-600 border-l-4 rounded-t-lg border-b-2 border-b-red-600`}></div>
            <div style={{ backgroundColor: signalLightColors.yellow, height: '33.33%' }} className="border-[#FCFC00] border-l-4 border-b-2"></div>
            <div style={{ backgroundColor: signalLightColors.green, height: '33.33%' }} className="border-[#13a113] border-l-4 rounded-b-lg"></div>
          </div>
        </div>

        {/* OEE Circular Progress */}
        <div className="relative ml-2" style={{ width: 165, height: 165 }}>
          <CircularProgressbar
            value={(machine.summaryStatus / 50400) *100}
            styles={buildStyles({
              pathColor: '#0782f4',
              textColor: '#122a35',
              fontSize: 'bold',
              trailColor: '#dbdbd7',
            })}
          />

          {/* OEE Value */}
          <div className="absolute mb-1 -top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center w-full h-full">
          {/* <span className="text-xl font-bold ">
          Total Run </span> */}
        <span className="text-5xl font-bold mt-6  ">
        {formatMinutesToTime(machine.summaryStatus || 0)}p
        </span>
          <span className=" font-bold  flex items-center mt-4">
            {isIncrease && <FaArrowUp className={`${arrowColor} mr-1 text-xl  `} />}
            {isDecrease && <FaArrowDown className={`${arrowColor} mr-1 text-xl `} />}
            <span className={`${arrowColor} mr-1 text-xl`}>{displayPercentDiff} </span>
          </span>
          <span className="text-md font-bold  flex items-center ">Hôm qua</span>
          </div>
          <div className={`absolute  font-bold text-[16px] -translate-x-1/5  ${isCalling ? 'calling-effect' : ''}`} >
            {displayInfo}
          </div>

        </div>
      </div>

      {/* 3. Time Labels Section */}
      <div className="flex justify-between bg-white text-black px-2 ">
      <span className="text-md font-bold">
          {machine.timeRange ? (
            machine.timeRange
          ) : (
            <>
              {machine.productionTasks?.[0]?.shifts[0]?.shiftDetails?.startTime || ''} - {machine.productionTasks?.[0]?.shifts[0]?.shiftDetails?.endTime || ''}
            </>
          )}
        </span>
        <span className="text-md font-bold ">Tỷ lệ chạy: {`${(machine.machinePercent || 0).toFixed(2)}%`}</span>
      </div>
    </div>
  );
};

export default MachineCard;
