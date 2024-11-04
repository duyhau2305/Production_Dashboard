import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const getHeaderColor = (status) => {
  if (status === 'Run') return '#60ec60';  // Green for Active
  if (status === 'Idle') return '#f8f867';   // Yellow for Idle
  if (status === 'Cài Đặt') return '#f8f867';  // Yellow for Set up
  if (status === 'Stop') return '#ff3333';       // Red for Error
  if (status === 'Off') return '#f7f5f5';   // Grey for Off
  return 'bg-gray-500';                     // Gray for other statuses
};

const getSignalLightColors = (status) => {
  if (status === 'Chạy') return { red: 'white', yellow: 'white', green: '#13a113' };
  if (status === 'Chờ' || status === 'Cài Đặt') return { red: 'white', yellow: '#f4f41e', green: 'white' };
  if (status === 'Dừng') return { red: '#e60000', yellow: 'white', green: 'white' };
  if (status === 'Dừng') return { red: '#e60000', yellow: 'white', green: 'white' };
  if (status === 'Off') return { red: 'white', yellow: 'white', green: 'white' };
  return { red: 'white', yellow: 'white', green: 'white' }; // Default case
};

const MachineCard = ({ machine }) => {
  const headerColor = getHeaderColor(machine.currentStatus);
  const signalLightColors = getSignalLightColors(machine.productionTasks[0].shifts[0].status); // Get signal light colors

  const blinkClass = machine.status === 'Lỗi' ? 'animate-blinkError' : '';

  const changePercent = machine.oee - machine.oeeYesterday; // So sánh với ngày hôm qua
  const changeIcon = changePercent >= 0 ? <FaArrowUp className="text-green-700 inline" /> : <FaArrowDown className="text-blue-950 inline" />; // Mũi tên xanh nếu tăng, đỏ nếu giảm

  const timeChangePercent = ((machine.totalTimeToday - machine.totalTimeYesterday) / machine.totalTimeYesterday) * 100;
  const timeChangeColor = timeChangePercent >= 0 ? 'text-green-500' : 'text-red-500';
  const timeChangeIcon = timeChangePercent >= 0 ? <FaArrowUp className="inline" /> : <FaArrowDown className="inline" />;
  function formatSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  const calculateDurationInHoursAndMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInSeconds = (end - start) / 1000;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
  return (
    <div className={`shadow-md flex flex-col justify-between  h-full ${blinkClass}`} style={{ backgroundColor: headerColor }}>
      {/* 1. Header */}
      <div className={`mb-1 flex flex-col items-center justify-center ${blinkClass}`} style={{ backgroundColor: headerColor }}>
        {/* Machine Name */}
        <div className={`text-[#122a35] bg-black-rgba w-full flex justify-center py-1 ${blinkClass}`}> 
          <h2 className="text-5xl font-bold text-[#375BA9]">{machine.deviceId}</h2>
        </div>

        {/* Machine Time and Status */}
        <div className="text-center mt-3"> 
          <span className="text-2xl font-bold">{machine.currentStatus} - {calculateDurationInHoursAndMinutes(machine.timelineStartTime , machine.timelineEndTime)}</span>
        </div>
      </div>

      {/* 2. OEE Section */}
      <div className="flex items-center ml-2 justify-center bg-transparent p-2 mb-8">
        {/* Signal Light */}
        <div className="flex flex-col justify-center items-center">
          {/* Add signal light as a rectangle */}
          <div className="w-14 h-40 border border-black rounded-lg mr-2">
            <div style={{ backgroundColor: signalLightColors.red, height: '33.33%' }} className={`rounded-t-lg ${blinkClass} border-l-red-600 border-l-4 rounded-t-lg border-b-2 border-b-red-600`}></div>
            <div style={{ backgroundColor: signalLightColors.yellow, height: '33.33%' }} className="border-[#FCFC00] border-l-4 border-b-2"></div>
            <div style={{ backgroundColor: signalLightColors.green, height: '33.33%' }} className="border-[#13a113] border-l-4 rounded-b-lg"></div>
          </div>
        </div>

        {/* OEE Circular Progress */}
        <div className="relative ml-2 " style={{ width: 200, height: 200 }}>
          <CircularProgressbar
            value={machine.summaryStatus/86400*100}
            styles={buildStyles({
              pathColor: '#0782f4',
              textColor: '#122a35',
              fontSize: 'bold',
              trailColor: '#dbdbd7',
            })}
          />

          {/* OEE Value */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center w-full h-full">
            <span className="text-4xl font-bold mb-2">{`${(machine.summaryStatus/86400*100).toFixed(2)}%`}</span>
            <span className=" text-sm text-wrap font-bold">{machine.percentDiff} hôm qua</span>
          </div>
          <div className="  absolute mt-2 font-bold text-xl -translate-x-1/4 ml-3 ">
            {machine.productionTasks[0].shifts[0].employeeName[0]}
      </div>
        </div>
        
      </div>
    
      

      {/* 3. Time Labels Section */}
      <div className="flex justify-between bg-white text-black px-2 py-1 ">
        <span className="text-sm">
          <span>{machine.productionTasks[0].shifts[0].startTime}</span>-<span>{machine.productionTasks[0].shifts[0].endTime}</span>
        </span>
        <span className={`text-sm -ml-1 `}>
        Total Run: {formatSecondsToTime(machine.summaryStatus)}
        </span>
      </div>
    </div>
  );
};

export default MachineCard;
