import React from 'react';
import MachineCard from '../../Components/MachineCard/MachineCard';
import MachineCard3 from '../../Components/MachineCard/MachineCard3';

const DashboardGrid = ({ machines, isFullscreen }) => {
  // Danh sách chỉ định sắp xếp
  const orderedList = [
    "P22","P21","P19","P17","P15","P13","P20","P18","P16","P14","P10","P8","P11","P9","P7","P5","P1","P6",
    "T17","T15","T13","T11","T9","T7","T20","T18","T16","T14","T12","T10","T8","T6","T4","T5","T3"
  ];

  // Sắp xếp machines theo danh sách chỉ định
  const sortedMachines = [...machines].sort((a, b) => {
    const indexA = orderedList.indexOf(a.deviceId);
    const indexB = orderedList.indexOf(b.deviceId);

    // Đưa các machine không có trong danh sách vào cuối cùng
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return (
    <div
      className="grid lg:grid-cols-9 md:grid-cols-5 gap-0.5 h-screen sm:grid-cols-2"
      style={{ maxHeight: '100vh' }}
    >
      {sortedMachines.map((machine) => (
        <div key={machine.id} className="flex flex-col justify-center">
          <MachineCard3 machine={machine} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;
