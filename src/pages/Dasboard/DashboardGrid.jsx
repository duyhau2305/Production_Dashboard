import React from 'react';
import MachineCard from '../../Components/MachineCard/MachineCard'; // Import MachineCard component

const DashboardGrid = ({ machines ,isFullscreen}) => {
  console.log(machines)
  return (
    <div  className={`grid ${isFullscreen ? 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))] h-full' : 'lg:grid-cols-4 2xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2'} gap-1`} >  
      {machines.map((machines) => (
        <div key={machines.id} className="flex flex-col h-full justify-center"> 
          <MachineCard machine={machines} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default DashboardGrid;
