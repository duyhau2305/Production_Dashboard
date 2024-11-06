import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import { SettingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import AvailableGrid from '../../../Components/AvailableRate/AvailableGrid';
import MachineComparisonChart from '../../../Components/AvailableRate/MachineComparisonChart';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

function AvailableRate() {
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [areaData, setAreaData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [isPercentageView, setIsPercentageView] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  const getFilteredDevices = (area) => {
    if (!area || area === 'all') return deviceData;
    return deviceData.filter(device => device.areaName === area);
  };

  const handleAreaSelect = (value) => {
    setSelectedArea(value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleMenuClick = ({ key }) => {
    setIsPercentageView(key === 'percentage');
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="percentage">Hiển thị %</Menu.Item>
      <Menu.Item key="hours">Hiển thị giờ</Menu.Item>
    </Menu>
  );

  const filteredDevices = getFilteredDevices(selectedArea);

  return (
    <div>
      <div className="flex justify-between flex-shrink-0 items-center mb-4">
        <Breadcrumb />
        <div className="flex justify-between  items-center space-x-2">
          <Select
            value={selectedArea}
            onChange={handleAreaSelect}
            placeholder="Chọn khu vực"
            style={{ width: 150 }}
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

      <div className="grid grid-rows-3 gap-4">
        <div className="row-span-2">
          <AvailableGrid
            machines={filteredDevices}
            machineType={selectedArea}
            selectedDate={selectedDate}
            viewMode={isPercentageView ? 'percentage' : 'hours'}
          />
        </div>
        
        <div className="row-span-1">
          <MachineComparisonChart 
            selectedDate={selectedDate}
            machineType={filteredDevices}
            viewMode={isPercentageView ? 'percentage' : 'hours'}
          />
        </div>
      </div>
    </div>
  );
}

export default AvailableRate;
