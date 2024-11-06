import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Dropdown, Menu, Space } from 'antd';
import { SettingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import AvailableGrid from '../../../Components/AvailableRate/AvailableGrid';
import MachineComparisonChart from '../../../Components/AvailableRate/MachineComparisonChart';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

function AvailableRate() {
  const [selectedArea, setSelectedArea] = useState('all'); // Default area selection
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Default selected date
  const [areaData, setAreaData] = useState([]); // Area data from API
  const [deviceData, setDeviceData] = useState([]); // Device data from API
  const [isPercentageView, setIsPercentageView] = useState(false); // Toggle view mode between % and hours
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch area and device data
  useEffect(() => {
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

  // Filter devices based on selected area
  const getFilteredDevices = (area) => {
    if (!area || area === 'all') {
      return deviceData;
    }
    return deviceData.filter(device => device.areaName === area); // Filter by areaName
  };

  // Handle area selection
  const handleAreaSelect = (value) => {
    setSelectedArea(value);
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log("Selected Date:", date ? date.format("YYYY-MM-DD") : null);
  };

  // Handle dropdown menu click
  const handleMenuClick = ({ key }) => {
    setIsPercentageView(key === 'percentage');
  };

  // Dropdown menu for view mode
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="percentage">Hiển thị %</Menu.Item>
      <Menu.Item key="hours">Hiển thị giờ</Menu.Item>
    </Menu>
  );

  const filteredDevices = getFilteredDevices(selectedArea); // Filtered devices based on area

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
            allowClear
          >
            <Option value="all">Toàn nhà máy</Option>
            {areaData.map(area => (
              <Option key={area._id} value={area.areaName}>{area.areaName}</Option>
            ))}
          </Select>
          
          <Button onClick={() => setSelectedDate(dayjs())}>Hôm nay</Button>
          <Button onClick={() => setSelectedDate(dayjs().subtract(1, 'day'))}>Hôm qua</Button>
          
          <Button icon={<LeftOutlined />} onClick={() => setSelectedDate(selectedDate.subtract(1, 'day'))} />
          <DatePicker 
            onChange={handleDateChange} 
            value={selectedDate} 
            defaultValue={dayjs()} 
          />
          <Button icon={<RightOutlined />} onClick={() => setSelectedDate(selectedDate.add(1, 'day'))} />

          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<SettingOutlined />} />
          </Dropdown>
        </div>
      </div>

      <AvailableGrid
        machines={filteredDevices}
        machineType={selectedArea}
        selectedDate={selectedDate}
        viewMode={isPercentageView ? 'percentage' : 'hours'} // Pass the view mode
      />
      
      <div className="mt-2">
        <MachineComparisonChart 
          selectedDate={selectedDate}
          machineType={filteredDevices}
         
        />
      </div>
    </div>
  );
}

export default AvailableRate;
