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
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [downtimeData, setDowntimeData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [telemetryData, setTelemetryData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL
  console.log(selectedDateRange)

  function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours} tiếng ${formattedMinutes} phút`;
}
useEffect(() => {
  if (selectedDateRange && selectedDateRange.length === 2) {
    const [startDate, endDate] = selectedDateRange;

    console.log('Fetching data for selected range:', startDate, endDate);
    fetchData(startDate, endDate);
  } else {
    console.warn('Date range is not properly selected.');
  }
}, [selectedDateRange]);

  const fetchData = async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `http://192.168.1.9:5001/api/getprocessdata?deviceId=543ff470-54c6-11ef-8dd4-b74d24d26b24&startDate=${startDate}&endDate=${endDate}`
      );
      console.log(response.data.productionTasks)
      const newData = [{
        date : response.data.productionTasks[0].date.split('T')[0],
        startTime : response.data.productionTasks[0].shifts[0].shiftDetails.startTime,
        endTime: response.data.productionTasks[0].shifts[0].shiftDetails.endTime,
        workTime : response.data.productionTasks[0].date.split('T')[0],
        planeTime : response.data.productionTasks[0].date.split('T')[0],
        runTime : secondsToTime(Number(response.data.availabilityData.runtime)),
        downTime : secondsToTime(Number(response.data.availabilityData.stopTime)),
        maintenanceTime : response.data.productionTasks[0].date.split('T')[0],
        runRate : (Number(response.data.availabilityData.runtime)/86400*100).toFixed(2) 
      },{
        date : response.data.productionTasks[0].date.split('T')[0],
        startTime : response.data.productionTasks[1].shifts[0].shiftDetails.startTime,
        endTime: response.data.productionTasks[1].shifts[0].shiftDetails.endTime,
        workTime : response.data.productionTasks[1].date.split('T')[0],
        planeTime : response.data.productionTasks[1].date.split('T')[0],
        runTime : secondsToTime(Number(response.data.availabilityData.runtime)),
        downTime : secondsToTime(Number(response.data.availabilityData.stopTime)),
        maintenanceTime : response.data.productionTasks[1].date.split('T')[0],
        runRate : (Number(response.data.availabilityData.runtime)/86400*100).toFixed(2) 
      }
    ]
      console.log(response.data.stopTime)
      setProductionData(newData)

    } catch (error) {
      console.log(error)
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
  console.log('Selected Area ID:', areaId); // Debug

  try {
    const response = await axios.get(`${apiUrl}/device?areaId=${areaId}`);
    console.log('API URL:', `${apiUrl}/device?areaId=${areaId}`); // Debug
    console.log('Fetched Devices:', response.data); // Debug

    if (response.data && response.data.length > 0) {
      const formattedDevices = response.data.map((device) => ({
        id: device.deviceId, // Lưu deviceId thay vì _id
        name: device.deviceName,
      }));
      setDevices(formattedDevices);
    } else {
      console.warn('No devices found for this area.');
      setDevices([]); // Đảm bảo xóa dữ liệu cũ nếu không tìm thấy thiết bị
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    setDevices([]); // Xóa dữ liệu cũ trong trường hợp lỗi
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
        `${apiUrl}/downtime?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      setDowntimeData(response.data);
    } catch (error) {
      console.error('Error fetching downtime data:', error);
    }
  };
  const fetchEmployeeData = async (deviceId, [startDate, endDate]) => {
    const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
  
    console.log(`Fetching with Device ID: ${deviceId}, Start: ${formattedStartDate}, End: ${formattedEndDate}`);
  
    try {
      const response = await axios.get(
        `${apiUrl}/productiontask?deviceName=MÁY%20TIỆN%2001&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      setEmployeeData(response.data);
    } catch (error) {
      console.error('Error fetching downtime data:', error);
    }
  };
  // Khởi tạo state cho dữ liệu telemetry

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
      const frequency = item.interval.length; // Each interval counts as one occurrence
  
      acc[reason] = (acc[reason] || 0) + frequency;
      return acc;
    }, {});
  
    return {
      labels: Object.keys(reasonCounts),
      values: Object.values(reasonCounts),
    };
  };
    const aggregatedData = aggregateDowntimeHoursByReason(downtimeData);
    console.log('data timepareto chart',aggregatedData)
    const aggregatedDowntimeData = aggregateDowntimeHoursByReason(downtimeData);
    const aggregatedFrequencytimeData = aggregateFrequencyByReason(downtimeData);
 console.log('telemetryData ', telemetryData)
 console.log('downtimeData' ,downtimeData)
 console.log('employData ',employeeData)
  return (
    <div>
      <div className="flex justify-end items-center mb-4">
        <Select
          value={selectedArea}
          onChange={handleAreaSelect}
          placeholder="Chọn khu vực"
          style={{ width: 200 }}
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
            style={{ width: 200 }}
            disabled={!selectedArea}
          >
            {devices.map((device) => (
              <Option key={device.id} value={device.id}> 
                {device.name} {/* Hiển thị deviceName */}
              </Option>
            ))}
          </Select>



        <Space direction="vertical" size={12}>
          <RangePicker onChange={(dates) => {
        console.log('Raw Dates from RangePicker:', dates); // Kiểm tra giá trị
        handleDateChange(dates);
  }}  />
        </Space>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4">
        <div className="col-span-1 bg-white p-3">
          <h4>Downtime Pie Chart</h4>
          <DowntimePieChart data={aggregatedDowntimeData} />
        </div>
        <div className="col-span-2 bg-white p-3">
          <h4>Pareto Time Chart</h4>
          <ParetoTimeChart data={aggregatedData} />
        </div>
        <div className="col-span-2 bg-white p-3">
          <h4>Pareto Frequency Chart</h4>
          <ParetoFrequencyChart data={aggregatedFrequencytimeData} />
        </div>
      </div>

      <div className="bg-white p-3 mt-2">
        <DeviceTable downtimeData={downtimeData} employeeData={employeeData} telemetryData={telemetryData} productionData={productionData} />
      </div>
    </div>
  );
};
export default DeviceAnalysis;