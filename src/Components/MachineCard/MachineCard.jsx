import React ,{useEffect,useState}from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

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
// const socket = io('http://192.168.10.186:5000');
const MachineCard = ({ machine }) => {
  const headerColor = getHeaderColor(machine.currentStatus || '');
  const signalLightColors = getSignalLightColors(machine.productionTasks?.[0]?.shift?.status || '');
  console.log(signalLightColors)
  const blinkClass = machine?.status === 'Dừng' ? 'animate-blinkError' : '';
  function formatSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  console.log(machine)
  const calculateDurationInHoursAndMinutes= (startTime, endTime) => {
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

  const displayInfo = isCalling
  ? `Đang gọi  ${callingDepartment} ...`
  : machine.productionTasks?.[0]?.shift?.employeeName?.[0] || '';

// useEffect(() => {
//   socket.on('update_call_status', (data) => {
//     if (data.deviceId === machine.deviceId) {
//       setIsCalling(true);
//       setCallingDepartment(data.department);
//     }
//   });

//   socket.on('cancel_call_status', (data) => {
//     if (data.deviceId === machine.deviceId) {
//       setIsCalling(false);
//       setCallingDepartment('');
//     }
//   });

//   return () => {
//     socket.off('update_call_status');
//     socket.off('cancel_call_status');
//   };
// }, [machine.deviceId]);
  
  

  return (
    <div className={`shadow-md flex flex-col justify-between `} style={{ backgroundColor: headerColor }}>
      {/* 1. Header */}
      <div className=" flex flex-col items-center justify-center" style={{ backgroundColor: headerColor }}>
        <div className="text-[#122a35] bg-black-rgba w-full flex justify-center py-1"> 
          <h2 className="text-5xl font-bold text-[#375BA9]">{machine.deviceId || ''}</h2>
        </div>
        {/* Machine Time and Status */}
        <div className="text-center mt-1"> 
          <span className="text-2xl font-bold">
            {machine.currentStatus || ''} - {calculateDurationInHoursAndMinutes(machine.timelineStartTime, machine.timelineEndTime)}
          </span>
        </div>
      </div>

      {/* 2. OEE Section */}
      <div className="flex items-center ml-2 justify-center bg-transparent p-2 mb-6">
        {/* Signal Light */}
        <div className="flex flex-col justify-center items-center">
        <div className="w-12 h-32 border border-black rounded-lg mr-2">
            <div style={{ backgroundColor: signalLightColors.red, height: '33.33%' }} className={`rounded-t-lg ${blinkClass} border-l-red-600 border-l-4 rounded-t-lg border-b-2 border-b-red-600`}></div>
            <div style={{ backgroundColor: signalLightColors.yellow, height: '33.33%' }} className="border-[#FCFC00] border-l-4 border-b-2"></div>
            <div style={{ backgroundColor: signalLightColors.green, height: '33.33%' }} className="border-[#13a113] border-l-4 rounded-b-lg"></div>
          </div>
        </div>

        {/* OEE Circular Progress */}
        <div className="relative ml-2" style={{ width: 160, height: 160 }}>
          <CircularProgressbar
            value={(machine.summaryStatus / 86400) * 100}
            styles={buildStyles({
              pathColor: '#0782f4',
              textColor: '#122a35',
              fontSize: 'bold',
              trailColor: '#dbdbd7',
            })}
          />

          {/* OEE Value */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center w-full h-full">
            <span className="text-4xl font-bold mb-2">{`${((machine.summaryStatus || 0) / 86400 * 100).toFixed(2)}%`}</span>
            <span className="text-sm font-bold">{machine?.percentDiff || ''}Hôm qua</span>
          </div>
          <div className={`absolute  font-bold text-xl -translate-x-1/6  ${isCalling ? 'calling-effect': ''}`} >
              {displayInfo}
          </div>
          
        </div>
      </div>

      {/* 3. Time Labels Section */}
      <div className="flex justify-between bg-white text-black px-2 ">
        <span className="text-md font-bold">
          {machine.productionTasks?.[0]?.shift?.startTime || ''} - {machine.productionTasks?.[0]?.shift?.endTime || ''}
        </span>
        <span className="text-md font-bold -ml-1">
          Total Run: {formatSecondsToTime(machine.summaryStatus || 0)}
        </span>
      </div>
    </div>
  );
};

export default MachineCard;
