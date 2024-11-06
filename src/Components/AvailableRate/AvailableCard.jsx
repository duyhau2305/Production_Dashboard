import React from "react";
import MachineTimeline from "./MachineTimeline";
import MachinePercent from "./MachinePercent";

const AvailableCard = ({ machineName, deviceId, selectedDate, machineType, viewMode }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-2">
      
      <div className="card-body">
     
        
     
        {viewMode === 'percentage' ? (
          <MachinePercent 
            deviceId={deviceId}
            machineName={machineName}
            selectedDate={selectedDate}
            machineType={machineType} 
          />
        ) : (
          <MachineTimeline 
            deviceId={deviceId}
            machineName={machineName}
            selectedDate={selectedDate}
            machineType={machineType} 
          />
        )}
      </div>
    </div>
  );
};

export default AvailableCard;
