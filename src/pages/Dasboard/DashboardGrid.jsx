import React from 'react';
import MachineCard from '../../Components/MachineCard/MachineCard';

const DashboardGrid = ({ machines, isFullscreen }) => {
  return (
    <div
      className="grid lg:grid-cols-6 gap-1 h-screen sm:grid-cols-2" style={{ maxHeight: '100vh' }}
    >
      {machines.map((machine) => (
        <div key={machine.id} className="flex flex-col justify-center">
          <MachineCard machine={machine} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;
