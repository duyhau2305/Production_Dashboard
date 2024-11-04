import React, { useState } from 'react';
import InfoCard from '../../Components/MachineCard/InfoCard';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CustomDropdown = ({ devices, selectedMachine, handleMachineSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectDevice = (device) => {
    handleMachineSelect(device);
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  return (
    <div className="relative w-full">
      {/* Button để mở dropdown */}
      <div
        onClick={toggleDropdown}
        className={`p-4 border rounded-lg cursor-pointer bg-white shadow-md flex items-center justify-between ${
          isOpen ? 'shadow-lg' : ''
        }`}
      >
        <span className="text-xl">
          {selectedMachine ? selectedMachine.deviceName : 'Chọn thiết bị'}
        </span>
        {isOpen ? <FiChevronUp className="text-2xl" /> : <FiChevronDown className="text-2xl" />}
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              onClick={() => selectDevice(device)}
              className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedMachine?.deviceId === device.deviceId ? 'bg-blue-100' : ''
              }`}
            >
              <InfoCard machine={device.deviceName} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
