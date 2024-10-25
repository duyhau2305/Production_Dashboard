import React from 'react';
import { FiScissors, FiHardDrive, FiTool } from 'react-icons/fi';

const MachineSelection = ({ currentMachine, setCurrentMachine }) => {
  return (
    <div className="lg:col-span-1 sflex items-stretch bg">
      
      <button 
        className={`p-3 my-4 rounded transition duration-300 text-center ${currentMachine === 'Máy Cắt' ? 'bg-green-500 text-white font-bold' : 'bg-cyan-700 text-white font-bold'}`} 
        onClick={() => setCurrentMachine('Máy Cắt')}
        
      >

       
        Máy Cắt
      </button>
      <button 
        className={`p-3  my-4 rounded transition duration-300 text-center ${currentMachine === 'Máy Dập' ? 'bg-green-500 text-white font-bold' : 'bg-cyan-700 text-white font-bold'}`} 
        onClick={() => setCurrentMachine('Máy Dập')}
      >
        Máy Dập
      </button>
      <button 
        className={`p-3  my-4   rounded transition duration-300 text-center ${currentMachine === 'Máy Uốn' ? 'bg-green-500 text-white font-bold' : 'bg-cyan-700 text-white font-bold'}`} 
        onClick={() => setCurrentMachine('Máy Uốn')}
      >
        Máy Uốn
      </button>
      
    </div>
  );
};

export default MachineSelection;
