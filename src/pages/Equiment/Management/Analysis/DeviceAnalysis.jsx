import React, { useEffect, useState } from 'react';
import { Select, DatePicker, Space } from 'antd';
import moment from 'moment';
import DeviceTable from '../../../../Components/Equiment/Analysis/DeviceTable';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DeviceAnalysis = () => {
  const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
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

  useEffect(() => {
    fetch(`${apiUrl}/areas`)
      .then((response) => response.json())
      .then((data) => setAreas(data))
      .catch((error) => console.error('Error fetching areas:', error));
  }, []);

  const handleAreaSelect = async (areaId) => {
    setSelectedArea(areaId);
    try {
      const response = await axios.get(`${apiUrl}/device`);
      const filteredDevices = response.data.filter((device) => device.areaId === areaId);
      setDevices(filteredDevices.length > 0 ? filteredDevices : []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    }
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDevice(deviceId);
    if (selectedDateRange) {
      fetchDowntimeData(deviceId, selectedDateRange);
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      if (!startDate.isValid() || !endDate.isValid()) {
        console.error('Invalid date range selected.');
        return;
      }
      setSelectedDateRange([startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
      if (selectedDevice) {
        fetchDowntimeData(selectedDevice, [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
        fetchEmployeeData(selectedDevice, [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
        fetchTelemetryData(selectedDevice, [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
      }
    } else {
      console.warn('Please select a valid date range.');
    }
  };

  useEffect(() => {
    if (selectedDevice && selectedDateRange) {
      fetchDowntimeData(selectedDevice, selectedDateRange);
      fetchEmployeeData(selectedDevice, selectedDateRange);
      fetchTelemetryData(selectedDevice, selectedDateRange);
    }
  }, [selectedDevice, selectedDateRange]);

  const fetchDowntimeData = async (deviceId, [startDate, endDate]) => {
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
        `${apiUrl}/productiontask?deviceName=MÁY%20TIỆN%2001&startDate=${startDate}&endDate=${endDate}`
      );
      setEmployeeData(response.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchTelemetryData = async (deviceId, [startDate, endDate]) => {
    try {
      const response = await axios.get(
        `${apiUrl}/telemetry?deviceId=${deviceId}&startDate=${startDate}&endDate=${endDate}`
      );
      const filteredData = response.data.flatMap((entry) =>
        entry.intervals
          .filter((interval) => {
            if (interval.status === "Dừng") {
              const start = moment(interval.startTime, 'HH:mm:ss');
              const end = moment(interval.endTime, 'HH:mm:ss');
              const duration = moment.duration(end.diff(start)).asMinutes();
              return duration > 5;
            }
            return false;
          })
          .map((interval) => ({
            ...interval,
            date: entry.date
          }))
      );
      setTelemetryData(filteredData);
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
        return sum + (endTime - startTime);
      }, 0);
      acc[reason] = (acc[reason] || 0) + totalIntervalHours;
      return acc;
    }, {});
    return {
      labels: Object.keys(reasonHours),
      values: Object.values(reasonHours)
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
      {/* Breadcrumb component có thể được thêm ở đây */}

      {/* Lựa chọn loại máy và máy cụ thể */}
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedMachineType}
            placeholder="Chọn loại máy"
            style={{ width: 200 }}
          >
            <Option value="CNC">Tổ Tiện</Option>
            <Option value="PHAY">Tổ Phay</Option>
          </Select>
          <Select
            value={selectedMachine}
            placeholder={`Chọn máy ${selectedMachineType}`}
            style={{ width: 200 }}
            disabled={!selectedMachineType}
          >
            {devices.map((device) => (
              <Option key={device.id} value={device.id}>
                {device.name}
              </Option>
            ))}
          </Select>
          <Space direction="vertical" size={12} style={{ width: 200 }}>
            <RangePicker onChange={handleDateChange} />
          </Space>
        </div>
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