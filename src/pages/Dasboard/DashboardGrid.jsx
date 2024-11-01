import React from 'react';
import MachineCard from '../../Components/MachineCard/MachineCard'; // Import MachineCard component

const DashboardGrid = ({ machines, isFullscreen }) => {
  // Custom sort function to compare device names naturally (e.g., T3, T5, T10)
  const sortMachinesByDeviceName = (a, b) => {
    const regex = /^([a-zA-Z]+)(\d+)$/; // Tách chữ và số (ví dụ: "T10" => ["T", "10"])
    const [, letterA, numberA] = a.deviceName.match(regex);
    const [, letterB, numberB] = b.deviceName.match(regex);

    // So sánh phần chữ trước
    const letterComparison = letterA.localeCompare(letterB);
    if (letterComparison !== 0) return letterComparison;

    // Nếu chữ giống nhau, so sánh phần số theo số học
    return parseInt(numberA) - parseInt(numberB);
  };

  // Sort the machines using the custom sort function
  const sortedMachines = [...machines].sort(sortMachinesByDeviceName);

  return (
    <div
  className={`grid ${
    isFullscreen
      ? 'overflow-hidden grid-cols-[repeat(auto-fit,minmax(250px,1fr))] h-screen p-4'
      : 'lg:grid-cols-4 2xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 p-2'
  } gap-1`}
>

      {sortedMachines.map((machine) => (
        <div
          key={machine.id}
          className={`flex flex-col justify-center ${
            isFullscreen ? 'h-screen' : 'h-full'
          }`} // Điều chỉnh kích thước thẻ
        >
          <MachineCard machine={machine} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;
