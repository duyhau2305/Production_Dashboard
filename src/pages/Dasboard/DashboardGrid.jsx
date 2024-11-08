import React from 'react';
import MachineCard from '../../Components/MachineCard/MachineCard';

const DashboardGrid = ({ machines, isFullscreen }) => {
  // Sắp xếp machines theo chữ cái và số
  const sortedMachines = [...machines].sort((a, b) => {
    // Tách chữ cái và số từ deviceName
    const [, aPrefix, aNumber] = a.deviceId.match(/^([A-Za-z]+)(\d+)$/) || [];
    const [, bPrefix, bNumber] = b.deviceId.match(/^([A-Za-z]+)(\d+)$/) || [];

    // So sánh phần chữ cái trước
    if (aPrefix !== bPrefix) {
      return aPrefix.localeCompare(bPrefix);
    }

    // Nếu phần chữ cái giống nhau, so sánh phần số
    return parseInt(aNumber) - parseInt(bNumber);
  });

  return (
    <div
      className="grid lg:grid-cols-6 md:grid-cols-5 gap-0.5 h-screen sm:grid-cols-2"
      style={{ maxHeight: '100vh' }}
    >
      {sortedMachines.map((machine) => (
        <div key={machine.id} className="flex flex-col justify-center">
          <MachineCard machine={machine} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;
