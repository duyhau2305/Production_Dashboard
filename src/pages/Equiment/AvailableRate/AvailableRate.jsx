import React, { useState, useEffect } from 'react';
import { Select, DatePicker } from 'antd';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import AvailableGrid from '../../../Components/AvailableRate/AvailableGrid';
import MachineComparisonChart from '../../../Components/AvailableRate/MachineComparisonChart';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

function AvailableRate() {
  const [selectedArea, setSelectedArea] = useState('all'); // Default state for area
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [areaData, setAreaData] = useState([]); // Area data from API
  const [deviceData, setDeviceData] = useState([]); // Device data from API
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Fetch area and device data from API
    const fetchData = async () => {
      try {
        const areaResponse = await axios.get(`${apiUrl}/areas`);
        setAreaData(areaResponse.data);

        const deviceResponse = await axios.get(`${apiUrl}/device`);
        setDeviceData(deviceResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  console.log("Selected Date in Parent Component:", selectedDate); // Đảm bảo ngày thay đổi khi bạn chọn


  // Function to filter devices based on selected area
  const getFilteredDevices = (area) => {
    if (!area || area === 'all') {
      return deviceData; // Return all devices if 'all' is selected
    }
    return deviceData.filter(device => device.areaName === area); // Filter by areaName
  };

  // Handle area selection from dropdown
  const handleAreaSelect = (value) => {
    setSelectedArea(value);
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log("Selected Date:", date.format("YYYY-MM-DD")); // Correctly log the selected date
  };

  const filteredDevices = getFilteredDevices(selectedArea); // Get filtered devices based on selected area

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb />
        <div className="flex items-center space-x-2">
          <Select
            value={selectedArea}
            onChange={handleAreaSelect}
            placeholder="Chọn khu vực"
            style={{ width: 200 }}
            allowClear // Allow clearing selection
          >
            <Option value="all">Toàn nhà máy</Option>
            {areaData.map(area => (
              <Option key={area._id} value={area.areaName}>{area.areaName}</Option>
            ))}
          </Select>
          <DatePicker 
            onChange={handleDateChange} 
            value={selectedDate} 
            defaultValue={dayjs()} 
          />
        </div>
      </div>
      {/* Show AvailableGrid */}
      <AvailableGrid
        machines={filteredDevices} // Pass filtered devices
        machineType={selectedArea} // Area type for grid
        selectedDate={selectedDate}
      />
      <div className="mt-2">
        <MachineComparisonChart 
          selectedDate={selectedDate} // Pass the selected date
          machineType={filteredDevices} // Pass filtered devices to chart
        />
      </div>
    </div>
  );
}

export default AvailableRate;
