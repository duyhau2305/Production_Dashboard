import React, { useEffect, useState } from 'react';
import { Select, DatePicker, Space, Radio, Tabs } from 'antd';
import moment from 'moment-timezone';
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
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
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
        `${apiUrl}/getprocessdata?deviceId=543ff470-54c6-11ef-8dd4-b74d24d26b24&startDate=${startDate}&endDate=${endDate}`
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
      console.log(response)

    } catch (error) {
      console.log(error)
    } 
  };
// Fetch areas from API
useEffect(() => {
  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${apiUrl}/device`);
      setDevices(response.data);
      setFilteredDevices(response.data); // Ban đầu, hiển thị tất cả thiết bị
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  fetchDevices();
}, []);

// Hàm lọc thiết bị khi người dùng gõ vào ô tìm kiếm
const handleDeviceSearch = (value) => {
  const searchValue = value.toLowerCase();
  const filtered = devices.filter((device) =>
    device.deviceName.toLowerCase().includes(searchValue)
  );
  setFilteredDevices(filtered);
};
 const handleDeviceSelect = (objectId) => {
    // Tìm thiết bị theo `_id` và lấy cả `deviceId`
    const selectedDevice = devices.find((device) => device.id === objectId);
    if (selectedDevice) {
      setSelectedDevice({ _id: selectedDevice.id, deviceId: selectedDevice.deviceId });
      console.log('Selected Device:', selectedDevice);
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
      const formattedDateRange = [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')];
      setSelectedDateRange(formattedDateRange);
      
      // Kiểm tra xem `selectedDevice` và `formattedDateRange` đã có giá trị hợp lệ
      if (selectedDevice.deviceId && formattedDateRange) {
        fetchDowntimeData(selectedDevice.deviceId, formattedDateRange);
        fetchEmployeeData(selectedDevice._id, formattedDateRange);
      }
      if (selectedDevice._id && formattedDateRange) {
      
        fetchTelemetryData(selectedDevice._id, formattedDateRange);
      }
    } else {
      console.warn('Please select a valid date range.');
    }
  };
  
  useEffect(() => {
    // Kiểm tra nếu `selectedDevice` đã có `deviceId` và `selectedDateRange` đã được chọn
    if (selectedDevice && selectedDevice.deviceId && selectedDateRange) {
      fetchDowntimeData(selectedDateRange);
    }
  
    // Kiểm tra nếu `selectedDevice` đã có `_id` và `selectedDateRange` đã được chọn
    if (selectedDevice && selectedDevice._id && selectedDateRange) {
      fetchEmployeeData(selectedDateRange);
      fetchTelemetryData(selectedDateRange);
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
        `${apiUrl}/productiontask?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      setEmployeeData(response.data);
    } catch (error) {
    
    }
  };
  // Khởi tạo state cho dữ liệu telemetry


  const fetchTelemetryData = async (_id, [startDate, endDate]) => {
    // Thiết lập thời gian theo timezone Asia/Ho_Chi_Minh và định dạng như yêu cầu
    const formattedStartDate = moment.tz(startDate, 'Asia/Ho_Chi_Minh').set({ hour: 17, minute: 0, second: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]");
    const formattedEndDate = moment.tz(endDate, 'Asia/Ho_Chi_Minh').set({ hour: 16, minute: 59, second: 59 }).format("YYYY-MM-DDTHH:mm:ss[Z]");
    
    try {
      const response = await axios.get(
        `${apiUrl}/machine-operations/${_id}/timeline`,
        {
          params: {
            startTime: formattedStartDate,
            endTime: formattedEndDate,
          },
        }
      );
  
      // Kiểm tra cấu trúc dữ liệu trả về
      if (response.data && response.data.data) {
        // Lọc các khoảng thời gian "Stop" với thời lượng > 5 phút
        const filteredData = response.data.data.flatMap((entry) =>
          entry.intervals
            .filter((interval) => {
              if (interval.status === "Stop") {
                const start = moment(interval.startTime);
                const end = moment(interval.endTime);
                const duration = moment.duration(end.diff(start)).asMinutes();
                return duration > 5; 
              }
              return false;
            })
            .map((interval) => ({
              ...interval,
              date: moment.tz(entry.date, 'Asia/Ho_Chi_Minh').format("YYYY-MM-DDTHH:mm:ss[Z]"), // Gắn thêm date với timezone Asia/Ho_Chi_Minh
            }))
        );
  
        // Lưu dữ liệu đã lọc vào state
        setTelemetryData(filteredData);
        console.log('Filtered Telemetry Data with Date:', filteredData); // Kiểm tra dữ liệu đã lọc
      } else {
        console.warn("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
    }
  };
  
const aggregateDowntimeHoursByReason = (data) => {
  const reasonHours = data.reduce((acc, item) => {
    const reason = item.reasonName;

    // Tổng thời gian downtime cho mỗi lý do
    const totalIntervalHours = item.interval.reduce((sum, interval) => {
      const startTime = moment(interval.startTime);
      const endTime = moment(interval.endTime);

      // Tính chênh lệch thời gian giữa `startTime` và `endTime` bằng giờ
      const durationInHours = moment.duration(endTime.diff(startTime)).asHours();
      
      return sum + durationInHours; // Cộng dồn thời gian downtime
    }, 0);

    // Thêm hoặc cập nhật thời gian cho lý do trong accumulator
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
      <Breadcrumb />
      <hr />
      <div className="flex justify-end items-center mb-4 mt-2">
      <Select
          showSearch
          style={{ width: 200, marginRight: 5 }}
          placeholder="Chọn thiết bị"
          onSearch={handleDeviceSearch} // Lọc khi người dùng gõ vào
          onChange={handleDeviceSelect} // Chọn thiết bị từ danh sách gợi ý
          filterOption={false} // Vô hiệu hóa lọc mặc định để dựa hoàn toàn vào dữ liệu từ API
        >
          {filteredDevices.map((device) => (
            <Option key={device.id} value={device.id}>
              {device.deviceName}
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