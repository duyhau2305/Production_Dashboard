import React, { useState } from 'react';
import MachineDetails from '../../Components/Equiment/MachineDetails';
import PerformanceMetrics from '../../Components/Equiment/PerformanceMetrics';
import RealTimeEnergyChart from '../../Components/Equiment/RealTimeEnergyChart';
import HourlyProductionChart from '../../Components/Equiment/HourlyProductionChart';

const EquipmentDashboard = () => {
  const [currentMachine, setCurrentMachine] = useState('Máy Trộn');

  return (
    <>
      <div className="w-full h-full row-span-3  ">
        
        {/* Hàng 1: MachineDetails (đã tích hợp MachineSelection) */}
        <div className="bg-white rounded-lg  shadow-lg   ">
          <MachineDetails machineName={currentMachine} setCurrentMachine={setCurrentMachine} />
        </div>
        
        {/* Hàng 2: PerformanceMetrics */}
       
        
        {/* Hàng 3: RealTimeEnergyChart và HourlyProductionChart (cùng một hàng) */}
         
       

      </div>
    </>
  );
};

export default EquipmentDashboard;
