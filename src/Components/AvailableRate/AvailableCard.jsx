import React from "react";
import MachineTimeline from "./MachineTimeline"; // Import MachineTimeline component

const AvailableCard = ({ machineName, deviceId, selectedDate, machineType }) => {
  console.log("AvailableCard selectedDate:", selectedDate.format("YYYY-MM-DD"));
  console.log(deviceId)
  return (
    <div className="bg-white shadow-md rounded-lg p-4 ">
      <header className="flex justify-between items-center mb-4">
        {/* Hiển thị tên máy dựa trên loại máy được chọn */}
        <h2 className="text-xl font-semibold">{machineName}</h2>
      </header>
      <div className="card-body">
        {/* MachineTimeline component với dữ liệu được truyền vào */}
        <MachineTimeline 
          deviceId={deviceId} // Truyền `deviceId` thay vì `machineName`
          selectedDate={selectedDate} 
          machineType={machineType} 
        />
      </div>
    </div>
  );
};

export default AvailableCard;
