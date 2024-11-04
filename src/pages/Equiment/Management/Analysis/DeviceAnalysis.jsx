import React, { useEffect, useState } from 'react';
import { Select, DatePicker, Space, Radio, Tabs } from 'antd';
import moment from 'moment';  
import DeviceTable from '../../../../Components/Equiment/Analysis/DeviceTable'; 
import DowntimePieChart from '../../../../Components/Equiment/Analysis/DowntimePieChart'; 
import ParetoTimeChart from '../../../../Components/Equiment/Analysis/ParetoTimeChart'; 
import ParetoFrequencyChart from '../../../../Components/Equiment/Analysis/ParetoFrequencyChart'; 
import Breadcrumb from '../../../../Components/Breadcrumb/Breadcrumb'; 
import axios from 'axios';


const { RangePicker } = DatePicker;
const { Option } = Select;

const DeviceAnalysis = () => {
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
   const [selectedMachineType, setSelectedMachineType] = useState('CNC');
  const [downtimeData, setDowntimeData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [telemetryData, setTelemetryData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')} tiếng ${minutes.toString().padStart(2, '0')} phút`;
  };

  useEffect(() => {
    if (selectedDateRange && selectedDateRange.length === 2) {
      const [startDate, endDate] = selectedDateRange;
      fetchData(startDate, endDate);
    } else {
      console.warn('Date range is not properly selected.');
    }
  }, [selectedDateRange]);

  const fetchData = async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `${apiUrl}/getprocessdata?deviceId=543ff470-54c6-11ef-8dd4-b74d24d26b24&startDate=${startDate}&endDate=${endDate}`
      );

      const newData = response.data.productionTasks.map((task, index) => ({
        date: response.data.availabilityData.logTime.split('T')[0],
        startTime: task.shifts[0].shiftDetails.startTime,
        endTime: task.shifts[0].shiftDetails.endTime,
        workTime: response.data.availabilityData.logTime.split('T')[0],
        planeTime: response.data.availabilityData.logTime.split('T')[0],
        runTime: secondsToTime(response.data.availabilityData.runtime),
        downTime: secondsToTime(response.data.availabilityData.stopTime),
        maintenanceTime: response.data.availabilityData.logTime.split('T')[0],
        runRate: ((response.data.availabilityData.runtime / 86400) * 100).toFixed(2)
      }));

      setProductionData(newData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
// Fetch areas from API
useEffect(() => {
  fetch(`${apiUrl}/areas`)
    .then((response) => response.json())
    .then((data) => setAreas(data))
    .catch((error) => console.error('Error fetching areas:', error));
}, []);

// Fetch devices when an area is selected
const handleAreaSelect = async (areaId) => {
  setSelectedArea(areaId);
  console.log('Selected Area ID:', areaId);

  try {
    // Gọi API để lấy toàn bộ danh sách thiết bị
    const response = await axios.get(`${apiUrl}/device`);
    console.log('Fetched Devices (Unfiltered):', response.data);

    // Lọc danh sách thiết bị theo `areaId` đã chọn
    const filteredDevices = response.data.filter(device => {
      console.log(`Device Area ID: ${device.areaId}, Selected Area ID: ${areaId}`);
      return device.areaId === areaId;
    });

    if (filteredDevices.length > 0) {
      // Cập nhật danh sách thiết bị đã lọc
      setDevices(filteredDevices);
    } else {
      console.warn('No devices found for this area.');
      setDevices([]); // Xóa dữ liệu nếu không có thiết bị phù hợp
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    setDevices([]); // Đảm bảo không hiển thị dữ liệu cũ nếu gặp lỗi
  }
};






const handleDeviceSelect = (deviceId) => {
  console.log('Selected Device ID:', deviceId); // Debug để kiểm tra
  setSelectedDevice(deviceId);

  if (selectedDateRange) {
    fetchDowntimeData(deviceId, selectedDateRange);
  }
};

  
  useEffect(() => {
   if(selectedDateRange != null){
    const startDate = new Date(selectedDateRange[0].$d);
    const endDate = new Date(selectedDateRange[1].$d);
    const yearS = startDate.getFullYear();
    const yearE = endDate.getFullYear();
    const monthS = String(startDate.getMonth() + 1).padStart(2, '0'); 
    const monthE = String(endDate.getMonth() + 1).padStart(2, '0'); 

    const dayS = String(startDate.getDate()).padStart(2, '0');
    const dayE = String(endDate.getDate()).padStart(2, '0');

    const formattedDateS = `${yearS}-${monthS}-${dayS}`;
    const formattedDateE = `${yearE}-${monthE}-${dayE}`;
    fetchData(formattedDateS, formattedDateE);
   }

  }, [selectedDateRange]);
  // Hàm xử lý khi người dùng chọn ngày
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
  
      // Kiểm tra nếu moment object hợp lệ
      if (!startDate.isValid() || !endDate.isValid()) {
        console.error('Invalid date range selected.');
        return;
      }
  
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
  
      console.log('Selected Start Date:', formattedStartDate);
      console.log('Selected End Date:', formattedEndDate);
  
      // Cập nhật state và gọi API nếu có thiết bị được chọn
      setSelectedDateRange([formattedStartDate, formattedEndDate]);
  
      if (selectedDevice) {
        fetchDowntimeData(selectedDevice, [formattedStartDate, formattedEndDate]);
        fetchEmployeeData(selectedDevice, [formattedStartDate, formattedEndDate]);
        fetchTelemetryData(selectedDevice, [formattedStartDate, formattedEndDate]);
      }
    } else {
      console.warn('Please select a valid date range.');
    }
  };
  
  
  useEffect(() => {
    if (selectedDevice && selectedDateRange) {
      console.log('Triggering fetch with new data:', selectedDevice, selectedDateRange);
      fetchDowntimeData(selectedDevice, selectedDateRange);
      fetchEmployeeData(selectedDevice,selectedDateRange);
    }
  }, [selectedDevice, selectedDateRange]);
  
  const fetchDowntimeData = async (deviceId, [startDate, endDate]) => {
    const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
  
    console.log(`Fetching with Device ID: ${deviceId}, Start: ${formattedStartDate}, End: ${formattedEndDate}`);
  
    try {
      const response = await axios.get(
        `${apiUrl}/downtime?deviceId=${deviceId}&startDate=${startDate}&endDate=${endDate}`
      );
      setDowntimeData(response.data);
    } catch (error) {
      console.error('Error fetching downtime data:', error);
    }
  };
  const fetchEmployeeData = async (deviceId, [startDate, endDate]) => {
    try {
      const response = await axios.get(
        `${apiUrl}/productiontask?deviceName=MÁY%20TIỆN%2001&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      setEmployeeData(response.data);
    } catch (error) {
      console.error('Error fetching downtime data:', error);
    }
  };

  const fetchTelemetryData = async (deviceId, [startDate, endDate]) => {
    const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
  
    console.log(`Fetching telemetry for Device ID: ${deviceId}, Start: ${formattedStartDate}, End: ${formattedEndDate}`);
  
    try {
      const response = await axios.get(
        `${apiUrl}/telemetry?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
  
      // Lọc các interval có status "Dừng" và thời lượng > 5 phút, đồng thời gắn date vào interval
      const filteredData = response.data.flatMap((entry) =>
        entry.intervals
          .filter((interval) => {
            if (interval.status === "Dừng") {
              const start = moment(interval.startTime, 'HH:mm:ss');
              const end = moment(interval.endTime, 'HH:mm:ss');
              const duration = moment.duration(end.diff(start)).asMinutes();
              return duration > 5; // Giữ lại những interval dừng > 5 phút
            }
            return false;
          })
          .map((interval) => ({
            ...interval,
            date: entry.date, // Gắn thêm date vào mỗi interval
          }))
      );
  
      setTelemetryData(filteredData); // Lưu dữ liệu đã lọc vào state
      console.log('Filtered Telemetry Data with Date:', filteredData);
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
    }
  };
  
  const aggregateDowntimeHoursByReason = (data) => {
    const reasonHours = data.reduce((acc, item) => {
      const reason = item.reasonName;
      const totalIntervalHours = item.interval.reduce((sum, interval) => {
        const [startHour, startMinute] = interval.startTime.split(':').map(Number);
        const [endHour, endMinute] = interval.endTime.split(':').map(Number);
  
        const startTime = startHour + startMinute / 60;
        const endTime = endHour + endMinute / 60;
  
        return sum + (endTime - startTime); // Calculate duration in hours
      }, 0);
  
      acc[reason] = (acc[reason] || 0) + totalIntervalHours;
      return acc;
    }, {});
  
    return {
      labels: Object.keys(reasonHours),
      values: Object.values(reasonHours),
    };
  };
  const aggregateFrequencyByReason = (data) => {
    const reasonCounts = data.reduce((acc, item) => {
      const reason = item.reasonName;
      const frequency = item.interval.length;
      acc[reason] = (acc[reason] || 0) + frequency;
      return acc;
    }, {});
    return {
      labels: Object.keys(reasonCounts),
      values: Object.values(reasonCounts)
    };
  };

  return (
    <div>
      <Breadcrumb />
      <hr />
      <div className="flex justify-end items-center mb-4 mt-2">
        <Select
          value={selectedArea}
          onChange={handleAreaSelect}
          placeholder="Chọn khu vực"
          style={{ width: 150,marginRight: 5 }}
        >
          {areas.map((area) => (
            <Option key={area._id} value={area._id}>
              {area.areaName}
            </Option>
          ))}
        </Select>

        <Select
            value={selectedDevice} // deviceId được lưu trong state
            onChange={handleDeviceSelect} // Gọi khi người dùng chọn thiết bị
            placeholder="Chọn thiết bị"
            style={{ width: 150, marginRight: 5}}
            disabled={!selectedArea}
          >
            {devices.map((device) => (
              <Option key={device.id} value={device.id}> 
                {device.name} {/* Hiển thị deviceName */}
              </Option>
            ))}
          </Select>



        <Space direction="vertical" size={12} style={{ width: 200 }}>
          <RangePicker onChange={(dates) => {
        console.log('Raw Dates from RangePicker:', dates); // Kiểm tra giá trị
        handleDateChange(dates);
  }}  />
        </Space>
      </div>

      {selectedMachineType === 'CNC' && (
        <>
          <div className="grid grid-cols-5 gap-2 mt-4">
            <div className="col-span-1 bg-white p-3">
              <h4 className="mb-4">Downtime Pie Chart - Máy CNC</h4>
              <DowntimePieChart data={downtimeData} />
            </div>
            <div className="col-span-2 bg-white p-3">
              <h4 className="mb-4">Pareto Time Chart - Máy CNC</h4>
              <ParetoTimeChart data={aggregateDowntimeHoursByReason(downtimeData).values} labels={aggregateDowntimeHoursByReason(downtimeData).labels} />
            </div>
            <div className="col-span-2 bg-white p-3">
              <h4 className="mb-4">Pareto Frequency Chart - Máy CNC</h4>
              <ParetoFrequencyChart data={aggregateFrequencyByReason(downtimeData).values} labels={aggregateFrequencyByReason(downtimeData).labels} />
            </div>
          </div>
          <div className="bg-white p-3 mt-2">
            <DeviceTable downtimeData={downtimeData} productionData={productionData} />
          </div>
        </>
      )}

      {selectedMachineType === 'PHAY' && (
        <>
          <div className="grid grid-cols-5 gap-2 mt-4">
            <div className="col-span-1 bg-white p-3">
              <h4 className="mb-4">Downtime Pie Chart - Máy PHAY</h4>
              <DowntimePieChart data={downtimeData} />
            </div>
            <div className="col-span-2 bg-white p-3">
              <h4 className="mb-4">Pareto Time Chart - Máy PHAY</h4>
              <ParetoTimeChart data={aggregateDowntimeHoursByReason(downtimeData).values} labels={aggregateDowntimeHoursByReason(downtimeData).labels} />
            </div>
            <div className="col-span-2 bg-white p-3">
              <h4 className="mb-4">Pareto Frequency Chart - Máy PHAY</h4>
              <ParetoFrequencyChart data={aggregateFrequencyByReason(downtimeData).values} labels={aggregateFrequencyByReason(downtimeData).labels} />
            </div>
          </div>
          <div className="bg-white p-3 mt-2">
            <DeviceTable downtimeData={downtimeData} employeeData={employeeData} telemetryData={telemetryData} productionData={productionData} />
          </div>
        </>
      )}
    </div>
  );
};

export default DeviceAnalysis;