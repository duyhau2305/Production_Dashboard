import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import DowntimePieChart from '../../../Components/Equiment/Analysis/DowntimePieChart';
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
  const [selectedDate, setSelectedDate] = useState({
    startDate: moment().subtract(6, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate(),
  });
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
  const [defaultValue, setDefaultValue] = useState([moment().subtract(6, 'days').startOf('day'),
    
  moment().endOf('day'),])
  const [dateRangePickerValue, setDateRangePickerValue] = useState([
    moment().subtract(6, 'days'),
    moment()
  ]);
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

  }, []);

  const handleDateChange = (dates) => {
    if (dates) {
      console.log(dates)
      setSelectedDate({ startDate: dates[0]?.toDate() || null, endDate: dates[1]?.toDate() || null });
    }
  };

  const handleSelectCustomDays = (days, label) => {
    const endDate = moment().endOf('day').toDate();
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel(label);
  };

  const handlePrevWeek = () => {
    const startDate = moment(selectedDate.startDate).subtract(6, 'days').toDate();
    const endDate = moment(selectedDate.endDate).subtract(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel('1 tuần');
  };

  const handleNextWeek = () => {
    const startDate = moment(selectedDate.startDate).add(6, 'days').toDate();
    const endDate = moment(selectedDate.endDate).add(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel('1 tuần');
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
  
          // Tính tổng thời gian idle, run, và stop cho biểu đồ pie chart
          const totalIdleTime = data.reduce((acc, entry) => acc + entry.idleTime, 0);
          const totalRunTime = data.reduce((acc, entry) => acc + entry.runTime, 0);
          const totalStopTime = data.reduce((acc, entry) => acc + entry.stopTime, 0);
  
          setRuntimeChartData({
            labels: ['Run', 'Idle', 'Stop'],
            values: [totalRunTime, totalIdleTime, totalStopTime]
          });
  
          // Hàm chuyển đổi giây thành định dạng hh:mm
          const formatSecondsToHHMM = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          };
  
          // Chuẩn bị dữ liệu cho biểu đồ xu hướng thời gian runtime
          const trendLabels = [];
          const runtimeHours = data.map(entry => {
            trendLabels.push(moment(entry.logTime).format('DD/MM')); // Lấy ngày từ logTime
            return formatSecondsToHHMM(entry.runTime); // Đổi runTime thành hh:mm
          });
          console.log(runtimeHours)
          setRuntimeTrendData({
            labels: trendLabels,
            datasets: [
              {
                label: "Daily Runtime (hh:mm)",
                data: runtimeHours,
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
      <Menu.Item onClick={() => handleSelectCustomDays(6, '1 tuần')}>1 tuần</Menu.Item>
    </Menu>
  );
  const handleOpen =()=> {
    setDateRangePickerValue('')
  }
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
          <RangePicker
            value={dateRangePickerValue} 
            onChange={handleDateChange}
            onOpenChange={handleOpen}
          />
          <div className="flex items-center space-x-2 bg-white rounded-md shadow-sm border">
            <Button icon={<LeftOutlined />} onClick={handlePrevWeek} type="text" />
            <Dropdown overlay={menu} trigger={['hover']}>
              <Button type="text">{selectedRangeLabel}</Button>
            </Dropdown>
            <Button icon={<RightOutlined />} onClick={handleNextWeek} type="text" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 p-1">
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
            title="Phân bố nhiệm vụ"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={() => window.print()}
          />
          <div className="w-full h-full">
            <DowntimePieChart data={taskChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md col-span-6" ref={runtimeTrendChartRef}>
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
