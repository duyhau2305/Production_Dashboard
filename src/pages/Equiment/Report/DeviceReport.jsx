import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import DowntimePieChart from '../../../Components/Equiment/Reports/DowntimePieChart';
import TitleChart from '../../../Components/TitleChart/TitleChart';
import { Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import RuntimeTrendChart from '../../../Components/Equiment/Reports/RuntimeTrendChart';
import RepairBarChart from '../../../Components/Equiment/Reports/RepairBarChart';
import StackedBarChart from '../../../Components/Equiment/Reports/StackedBarChart';
import TimelineChart from '../../../Components/Equiment/Reports/TimelineChart';
import { datastatus } from '../../../data/status';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_BASE_URL;

function DeviceReport() {
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [machineOptions, setMachineOptions] = useState([]);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('1 tuần');
  const runtimeTrendChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const stackedBarChartRef = useRef(null);
  const [runtimeChartData, setRuntimeChartData] = useState({
    labels: ['Run', 'Idle', 'Stop'],
    values: []
  });
  const [taskChartData, setTaskChartData] = useState({
    labels: [],
    values: []
  });
  const [runtimeTrendData, setRuntimeTrendData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchMachineOptions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/machine-operations/machineOperations`);
        const machines = response.data.data;
        const options = machines.map(machine => ({
          value: machine._id,
          label: machine.deviceId || `Machine ${machine.id}`
        }));
        setSelectedMachines(options[0]?.value || null);
        setSelectedMachine(options[0]?.label || null);
        setMachineOptions(options);
      } catch (error) {
        console.error('Error fetching machine options:', error);
      }
    };
    fetchMachineOptions();
    setDefaultDateRange();
  }, []);

  const setDefaultDateRange = () => {
    const currentDate = new Date();
    const endTime = currentDate;
    const startTime = new Date(currentDate);
    startTime.setDate(currentDate.getDate() - 8); // Lùi lại 1 ngày trước 7 ngày (tổng cộng là 8 ngày trước)
    // Đặt giờ phút giây mặc định là 17:00:00.000Z
    startTime.setUTCHours(17, 0, 0, 0);
    setSelectedDate({ startDate: startTime, endDate: endTime });
  };

  const handleSelectCustomDays = (days, label) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days); // Lùi lại thêm 1 ngày
    // Đặt giờ phút giây mặc định là 17:00:00.000Z
    startDate.setUTCHours(17, 0, 0, 0);
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel(label);
  };

  const handlePrevWeek = () => {
    if (selectedDate) {
      const startDate = moment(selectedDate.startDate).subtract(8, 'days').toDate(); // Lùi lại 8 ngày (1 tuần và thêm 1 ngày)
      const endDate = moment(selectedDate.endDate).subtract(7, 'days').toDate();
      // Đặt giờ phút giây mặc định là 17:00:00.000Z
      startDate.setUTCHours(17, 0, 0, 0);
      setSelectedDate({ startDate, endDate });
      setSelectedRangeLabel('1 tuần');
    }
  };

  const handleNextWeek = () => {
    if (selectedDate) {
      const startDate = moment(selectedDate.startDate).add(6, 'days').toDate(); // Tiến thêm 6 ngày (đi trước 1 ngày)
      const endDate = moment(selectedDate.endDate).add(7, 'days').toDate();
      // Đặt giờ phút giây mặc định là 17:00:00.000Z
      startDate.setUTCHours(17, 0, 0, 0);
      setSelectedDate({ startDate, endDate });
      setSelectedRangeLabel('1 tuần');
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      const newStartDate = new Date(dates[0]?.$d || null);
      newStartDate.setDate(newStartDate.getDate() - 1); // Lùi lại 1 ngày
      // Đặt giờ phút giây mặc định là 17:00:00.000Z
      newStartDate.setUTCHours(17, 0, 0, 0);
      setSelectedDate({ startDate: newStartDate, endDate: dates[1]?.$d || null });
    }
  };

  const handleDateChangeChoose = (dates) => {
    if (dates[0]) {
      const newStartDate = new Date(dates[0]);
      newStartDate.setDate(newStartDate.getDate() - 1); // Lùi lại 1 ngày
      // Đặt giờ phút giây mặc định là 17:00:00.000Z
      newStartDate.setUTCHours(17, 0, 0, 0);
      setStartDate(newStartDate);
    }
  };

  const disabledDate = (current) => {
    if (!startDate) return false;
    return current < startDate || current > startDate.clone().add(6, 'days');
  };
  useEffect(() => {
    if (selectedMachines && selectedDate && selectedDate.startDate && selectedDate.endDate) {
      const startDate = selectedDate.startDate.toISOString();
      const endDate = selectedDate.endDate.toISOString();
  
      const fetchRuntimeChartData = async () => {
        try {
          const response = await axios.get(`${apiUrl}/machine-operations/${selectedMachines}/summary-status`, {
            params: {
              startTime: startDate,
              endTime: endDate
            }
          });
  
          const data = response.data.data;
  
          // Calculate total runtime, idle, and stop times for pie chart
          const totalIdleTime = data.reduce((acc, entry) => acc + entry.idleTime, 0);
          const totalRunTime = data.reduce((acc, entry) => acc + entry.runTime, 0);
          const totalStopTime = data.reduce((acc, entry) => acc + entry.stopTime, 0);
  
          setRuntimeChartData({
            labels: ['Run', 'Idle', 'Stop'],
            values: [totalRunTime, totalIdleTime, totalStopTime]
          });
          const totalSecondsInDay = 86400
          // Prepare data for runtimeTrendData (daily runtime percentage)
          const trendLabels = [];
          const runtimePercentages = data.map(entry => {
            const totalTime = entry.runTime + entry.idleTime + entry.stopTime;
            const runtimePercentage = totalTime ? (entry.runTime / totalSecondsInDay) * 100 : 0;
            trendLabels.push(moment(entry.date).format('DD/MM'));
            return runtimePercentage;
          });
          console.log(trendLabels)
  
          setRuntimeTrendData({
            labels: trendLabels,
            datasets: [
              {
                label: "Daily Runtime Percentage (%)",
                data: runtimePercentages,
                fill: false,
                borderColor: 'green',
                borderWidth: 2,
              }
            ]
          });
        } catch (error) {
          console.error('Error fetching runtime chart data:', error);
        }
      };
  
      fetchRuntimeChartData();
    }
  }, [selectedMachines, selectedDate]);
  useEffect(() => {
    if (selectedMachine && selectedDate && selectedDate.startDate && selectedDate.endDate) {
      const startDate = moment(selectedDate.startDate).format('YYYY-MM-DD');
      const endDate = moment(selectedDate.endDate).format('YYYY-MM-DD');

      const fetchTaskChartData = async () => {
        try {
          const response = await axios.get(`${apiUrl}/downtime`, {
            params: {
              deviceId: selectedMachine,
              startDate: startDate,
              endDate: endDate
            }
          });

          const data = response.data;

          if (!data || data.length === 0) {
            console.warn("No data received from API");
            return;
          }

          const durationMap = {};

          data.forEach(item => {
            if (!item.reasonName || !item.interval || item.interval.length === 0) {
              console.warn("Missing reasonName or interval data for item:", item);
              return;
            }

            const reasonName = item.reasonName;
            const totalDuration = item.interval.reduce((acc, interval) => {
              if (!interval.startTime || !interval.endTime) {
                console.warn("Missing startTime or endTime for interval:", interval);
                return acc;
              }

              const start = new Date(interval.startTime);
              const end = new Date(interval.endTime);
              const duration = (end - start) / 1000;

              return acc + duration;
            }, 0);

            if (durationMap[reasonName]) {
              durationMap[reasonName] += totalDuration;
            } else {
              durationMap[reasonName] = totalDuration;
            }
          });

          const labels = Object.keys(durationMap);
          const values = Object.values(durationMap);

          setTaskChartData({
            labels: labels,
            values: values
          });
        } catch (error) {
          console.error('Error fetching task chart data:', error);
        }
      };

      fetchTaskChartData();
    }
  }, [selectedMachine, selectedDate]);

  const menu = (
    <Menu>
      <Menu.Item onClick={() => handleSelectCustomDays(3, '3 ngày')}>3 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(4, '4 ngày')}>4 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(7, '1 tuần')}>1 tuần</Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedMachines}
            onChange={setSelectedMachines}
            placeholder="Chọn máy"
            style={{ width: 300 }}
          >
            {machineOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <RangePicker onChange={handleDateChange} disabledDate={disabledDate} onCalendarChange={handleDateChangeChoose} />
          <div className="flex items-center space-x-2 bg-white rounded-md shadow-sm border">
            <Button icon={<LeftOutlined />} onClick={handlePrevWeek} type="text" />
            <Dropdown overlay={menu} trigger={['hover']}>
              <Button type="text">{selectedRangeLabel}</Button>
            </Dropdown>
            <Button icon={<RightOutlined />} onClick={handleNextWeek} type="text" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-11 gap-2 p-1">
        <div className="bg-white rounded-lg p-4 shadow-md col-span-3">
          <TitleChart
            title="Tỷ lệ máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={() => window.print()}
          />
          <div className="h-28">
            <DowntimePieChart data={runtimeChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md col-span-3">
          <TitleChart
            title="Phân bố nguyên nhân lỗi"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={() => window.print()}
          />
          <div className="w-full h-full">
            <DowntimePieChart data={taskChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md col-span-5" ref={runtimeTrendChartRef}>
          <TitleChart
            title="Xu hướng máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={() => window.print()}
          />
          <div className="w-full h-full mt-1 ml-2 p-2">
            <RuntimeTrendChart data={runtimeTrendData} />
          </div>
        </div>

        {/* <div className="bg-white rounded-lg p-2 shadow-md col-span-4">
          <TitleChart
            title="Thời gian dừng sửa chữa"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={() => window.print()}
          />
          <div className="w-full h-full mt-12 ml-2 px-3">
            {/* <RepairBarChart data={repairDowntimeBarData} /> */}
          {/* </div> */}
        {/* </div> */} 
      </div>

      <div className="grid grid-cols-2 gap-2 p-1">
        <div className="bg-white p-3 col-span-1" ref={timelineChartRef}>
          <TitleChart
            title="Ngăn xếp trạng thái"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(timelineChartRef)}
            onPrint={() => window.print()}
          />
          {selectedDate ? (
            <TimelineChart
              data={datastatus.status}
              selectedDate={selectedDate}
              selectedMchine={selectedMachines}
              onDateChange={handleDateChange}
            />
          ) : (
            <>No data</>
          )}
        </div>
        <div className="bg-white p-3 col-span-1" ref={stackedBarChartRef}>
          <TitleChart
            title="Thống kê trạng thái"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(stackedBarChartRef)}
            onPrint={() => window.print()}
          />
          <StackedBarChart selectedDate={selectedDate} selectedMchine={selectedMachines} onDateChange={handleDateChange} />
        </div>
      </div>
    </>
  );
}

export default DeviceReport;