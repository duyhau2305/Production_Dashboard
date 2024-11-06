import React from "react";
import MachineTimeline from "./MachineTimeline";
import MachinePercent from "./MachinePercent";

const AvailableCard = ({ machineName, deviceId, selectedDate, machineType, viewMode }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-3">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{machineName}</h2>
      </header>
      <div className="card-body">
        {viewMode === 'percentage' ? (
          <MachinePercent 
            deviceId={deviceId}
            selectedDate={selectedDate}
            machineType={machineType} 
          />
        ) : (
          <MachineTimeline 
            deviceId={deviceId}
            selectedDate={selectedDate}
            machineType={machineType} 
          />
        )}
      </div>
    </div>
  );
};

export default AvailableCard;
