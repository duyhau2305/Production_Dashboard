import React from 'react';
import MachineCard3 from '../../Components/MachineCard/MachineCard3';

const DashboardGrid3 = ({ machines, orderedList, isFullscreen }) => {
  // Sắp xếp machines theo danh sách chỉ định trong orderedList
  const sortedMachines = orderedList.length
    ? machines.sort((a, b) => {
        const indexA = orderedList.indexOf(a.deviceId);
        const indexB = orderedList.indexOf(b.deviceId);

        // Đưa các máy không có trong orderedList vào cuối
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      })
    : machines; // Nếu không có orderedList, giữ nguyên thứ tự ban đầu

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

export default DashboardGrid3;
