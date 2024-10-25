import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../../Components/MachineCard/InfoCard';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setMachineData } from '../../redux/intervalSlice';

const Dashboard2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);

  const selectedDate = useSelector((state) => state.interval?.selectedDate);
  const selectedMachine = useSelector((state) => state.interval?.selectedMachine);

  useEffect(() => {
    fetchAreas();
    fetchDevices();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${apiUrl}/device`);
      setDevices(response.data);
      setFilteredDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleMachineTypeSelect = (value) => {
    if (value === 'ALL') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter((device) => device.areaName === value);
      setFilteredDevices(filtered);
    }
  };

  const handleMachineSelect = (device) => {
    dispatch(setMachineData({ selectedDate, selectedMachine: device }));
  };

  const handleDateChange = (e) => {
    dispatch(setMachineData({ selectedDate: e.target.value, selectedMachine }));
  };

  const handleConfirm = () => {
    if (!selectedMachine) {
      alert('Vui lòng chọn máy!');
      return;
    }
    navigate('/dashboard/mobile/issue');
  };

  return (
    <div className="h-screen bg-gray-100 w-full">
      <div className="flex justify-center items-center w-full bg-gradient-to-r from-blue-600 to-sky-500">
        <h1 className="h-32 items-center text-5xl text-white font-bold flex w-full justify-center">
          Thiết bị phụ trách
        </h1>
      </div>

      <div className="grid grid-flow-row w-full p-2">
        <div className="justify-start grid grid-flow-row p-8">
          <h1 className="text-center text-5xl font-semibold mt-4">Chọn ngày khai báo</h1>
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="block w-[90%] h-20 text-4xl ml-8 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="justify-start grid grid-flow-row p-8">
          <h1 className="text-center text-5xl font-semibold mt-4">Chọn khu vực sản xuất</h1>
        </div>

        <div>
          <select
            onChange={(e) => handleMachineTypeSelect(e.target.value)}
            className="block w-[90%] h-20 text-3xl ml-8 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Toàn bộ nhà máy</option>
            {areas.map((area, index) => (
              <option key={index} value={area.areaName}>
                {area.areaName}
              </option>
            ))}
          </select>
        </div>

        <div className="justify-start grid grid-flow-row p-8">
          <h1 className="text-center text-5xl font-semibold mt-2">Chọn máy phụ trách</h1>
        </div>

        <div className="bg-white rounded-lg grid grid-cols-3 gap-3 shadow-sm w-[90%] h-full ml-6 p-8">
          {filteredDevices.map((device, index) => (
            <div
              key={index}
              onClick={() => handleMachineSelect(device)}
              className={`cursor-pointer ${
                selectedMachine?.id === device.id ? 'border-2 border-blue-500' : ''
              }`}
            >
              <InfoCard machine={device.deviceName} />
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="bg-gradient-to-r from-blue-600 to-sky-500 w-[90%] hover:bg-blue-700 p-8 rounded-lg shadow-lg text-white text-center ml-6 mt-2 text-4xl font-bold transition duration-300 ease-in-out"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default Dashboard2;
