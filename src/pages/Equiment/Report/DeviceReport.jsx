import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import DowntimePieChart from '../../../Components/Equiment/Reports/DowntimePieChart';
import TitleChart from '../../../Components/TitleChart/TitleChart';
import { Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import RuntimeTrendChart from '../../../Components/Equiment/Reports/RuntimeTrendChart';
import { datastatus } from '../../../data/status';
import moment from 'moment';
import dayjs from 'dayjs';
import DeviceTable from '../../../Components/Equiment/Analysis/DeviceTable';
import TaskPieChart from '../../../Components/Equiment/Reports/TaskPieChart';

const { RangePicker } = DatePicker;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_BASE_URL;

function DeviceReport() {
  
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    startDate: dayjs().subtract(6, 'days').startOf('day').toDate(),
    endDate: dayjs().endOf('day').toDate(),
  });
  const [selectedMachine, setSelectedMachine] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [machineOptions, setMachineOptions] = useState([]);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('1 tuần');
  const runtimeTrendChartRef = useRef(null);
  const runtimePieChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const stackedBarChartRef = useRef(null);
  const [defaultValue, setDefaultValue] = useState([moment().subtract(5, 'days').startOf('day'),
  moment().endOf('day'),])
  const [dateRangePickerValue, setDateRangePickerValue] = useState([
    dayjs().subtract(6, 'days'),
    dayjs()
  ]);
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
  const [productionData, setProductionData] = useState([]); // State for production data

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
      setDateRangePickerValue([dayjs(dates[0]), dayjs(dates[1])]); // Đảm bảo đúng định dạng
      setSelectedDate({ startDate: dates[0]?.toDate(), endDate: dates[1]?.toDate() });
    }
  };
  

  const handleSelectCustomDays = (days, label) => {
    const endDate = moment().endOf('day').toDate();
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
  
    setSelectedDate({ startDate, endDate }); // Cập nhật phạm vi ngày
    setDateRangePickerValue([moment(startDate), moment(endDate)]); // Cập nhật giá trị cho RangePicker
    setSelectedRangeLabel(label); // Cập nhật nhãn hiển thị
  };
  

  const handlePrevWeek = () => {
    const startDate = moment(selectedDate.startDate).subtract(6, 'days').toDate();
    const endDate = moment(selectedDate.endDate).subtract(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setDateRangePickerValue([moment(startDate), moment(endDate)]); // Đồng bộ RangePicker
    setSelectedRangeLabel('1 tuần');
  };
  
  const handleNextWeek = () => {
    const startDate = moment(selectedDate.startDate).add(6, 'days').toDate();
    const endDate = moment(selectedDate.endDate).add(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setDateRangePickerValue([moment(startDate), moment(endDate)]); // Đồng bộ RangePicker
    setSelectedRangeLabel('1 tuần');
  };
  
  const disabledDate = (current) => {
    if (!startDate) return false; // Nếu chưa chọn startDate, cho phép tất cả ngày
    return current < startDate || current > startDate.clone().add(6, 'days');
  };
  
  const handleFullscreen = (chartRef) => {
    if (chartRef.current) {
      if (!document.fullscreenElement) {
        chartRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  useEffect(() => {
    if (selectedMachines && selectedDate && selectedDate.startDate && selectedDate.endDate) {
      const startDate = moment(selectedDate.startDate);
      const endDate = moment(selectedDate.endDate);
  
      const fetchRuntimeChartData = async () => {
        try {
          const response = await axios.get(`${apiUrl}/machine-operations/${selectedMachines}/summary-status`, {
            params: {
              startTime: startDate.toISOString(),
              endTime: endDate.toISOString()
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
  
          // Tạo danh sách ngày đầy đủ từ startDate đến endDate
          const allDates = [];
          let currentDate = startDate.clone();
          while (currentDate.isSameOrBefore(endDate)) {
            allDates.push(currentDate.format('DD/MM'));
            currentDate.add(1, 'day');
          }
  
          // Chuẩn hóa dữ liệu runtime với danh sách ngày đầy đủ
          const runtimeDataMap = data.reduce((acc, entry) => {
            const date = moment(entry.logTime).format('DD/MM');
            acc[date] = entry.runTime;
            return acc;
          }, {});
  
          const trendLabels = [];
          const runtimeHours = allDates.map(date => {
            trendLabels.push(date);
            const runTime = runtimeDataMap[date] || 0; // Mặc định 0 nếu không có dữ liệu
            return formatSecondsToHHMM(runTime);
          });
  
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
  
  // Hàm chuyển đổi giây thành định dạng hh:mm
  const formatSecondsToHHMM = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  
  console.log(selectedDate)
  useEffect(() => {
    if (selectedDate && selectedMachines.length > 0) {
      const fetchTaskChartData = async () => {
        try {
          
          const shiftResponse = await axios.get(`${apiUrl}/workShifts`);
          const shifts = shiftResponse.data;
  
          if (!shifts || shifts.length === 0) {
            console.warn("No shift data received from /api/workShifts");
            setTaskChartData({ labels: ["1 người 1 máy", "1 người 2 máy", "Bảo Trì"], values: [0, 0, 0] });
            return;
          }
  
         
          const deviceIds = machineOptions
            .filter(machine => selectedMachines.includes(machine.value))
            .map(machine => machine.label); // Assuming `label` holds deviceId
  
          const startTime = selectedDate.startDate.toISOString();
          const endTime = selectedDate.endDate.toISOString();
  
        
          const responses = await Promise.all(
            deviceIds.map(deviceId =>
              axios.get(`${apiUrl}/productiontask`, {
                params: {
                  deviceId,
                  startTime,
                  endTime
                }
              })
            )
          );
  
           const data = responses.flatMap(response => response.data);
  
          if (!data || data.length === 0) {
            console.warn("No data received from API");
            setTaskChartData({ labels: ["1 người 1 máy", "1 người 2 máy", "Bảo Trì"], values: [0, 0, 0] });
            return;
          }
  
          const labelToStatusMapping = {
            "1 người 1 máy": "Chạy",
            "1 người 2 máy": "Chờ",
            "Bảo Trì": "Dừng"
          };
          
          let totalTimeByLabel = { "1 người 1 máy": 0, "1 người 2 máy": 0, "Bảo Trì": 0 };
  
             const calculateWorkingHours = (shift) => {
            const shiftStart = moment(shift.startTime, "HH:mm");
            const shiftEnd = moment(shift.endTime, "HH:mm");
            let totalMinutes = shiftEnd.diff(shiftStart, "minutes");
  
              shift.breakTime.forEach(breakPeriod => {
              const breakStart = moment(breakPeriod.startTime, "HH:mm");
              const breakEnd = moment(breakPeriod.endTime, "HH:mm");
              totalMinutes -= breakEnd.diff(breakStart, "minutes");
            });
  
            return totalMinutes;
          };
  
         
          data.forEach(item => {
            item.shifts.forEach(shiftData => {
           
              const shift = shifts.find(s => s.shiftName === shiftData.shiftName);
              const label = Object.keys(labelToStatusMapping).find(
                key => labelToStatusMapping[key] === shiftData.status
              );
  
              if (shift && label) {
                const workingMinutes = calculateWorkingHours(shift);
                totalTimeByLabel[label] += workingMinutes;
  
                console.log(`Shift: ${shift.shiftName}, Status: ${shiftData.status}, Label: ${label}, Working Minutes: ${workingMinutes}`);
              } else {
                console.warn(`Shift not found for shiftName: ${shiftData.shiftName}`);
              }
            });
          });
  
          
          console.log("Total time by label:", totalTimeByLabel);
  
         
          const labels = ["1 người 1 máy", "1 người 2 máy", "Bảo Trì"];
          const values = labels.map(label => (totalTimeByLabel[label] / 60).toFixed(2)); 
  
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
  }, [selectedDate, selectedMachines, machineOptions]);
  console.log(selectedDate)
  const fetchProductionData = async () => {
    if (selectedMachines && selectedDate.startDate && selectedDate.endDate) {
        // Chuyển đổi múi giờ UTC sang ISO (local)
        const startDateISO = moment(selectedDate.startDate).startOf('day').toISOString();
        const endDateISO = moment(selectedDate.endDate).endOf('day').toISOString();

        try {
            const response = await axios.get(
                `${apiUrl}/machine-operations/topemployee?startTime=${startDateISO}&endTime=${endDateISO}`
            );

            const machineAnalysis = await response.data.data.find(value => value._id === selectedMachines);

            // Tạo danh sách ngày trong khoảng thời gian (Local Time)
            const dateRange = [];
            let currentDate = new Date(selectedDate.startDate);
            const endDate = new Date(selectedDate.endDate);

            while (currentDate <= endDate) {
                dateRange.push(
                    moment(currentDate).format('YYYY-MM-DD') // Định dạng ngày theo Local Time
                );
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Tạo Map cho summaryStatus (Local Time)
            const summaryStatusMap = new Map(
                machineAnalysis.summaryStatus.map(record => [
                    moment(record.logTime).format('YYYY-MM-DD'), // Chuyển logTime về Local Date
                    record
                ])
            );

            // Tạo Map cho productionTasks (Local Time)
            const productionTasksMap = new Map(
                machineAnalysis.productionTasks.map(task => [
                    moment(task.date).format('YYYY-MM-DD'), // Chuyển date về Local Date
                    task
                ])
            );

            // Duyệt qua từng ngày trong dateRange
            const enrichedData = dateRange.map(date => {
                const productionTask = productionTasksMap.get(date);
                const summaryStatus = summaryStatusMap.get(date);

                return {
                    date,
                    productionTask: productionTask ? productionTask : "Chưa lên lịch",
                    summaryStatus: summaryStatus
                        ? summaryStatus
                        : {
                              logTime: `${date}T00:00:00.000Z`,
                              idleTime: 0,
                              runTime: 0,
                              stopTime: 0
                          }
                };
            });

            // Gắn enrichedData vào machineAnalysis
            machineAnalysis.enrichedData = enrichedData;

            // Cập nhật state với dữ liệu mới
            setProductionData(machineAnalysis);
        } catch (error) {
            console.error('Error fetching production data:', error);
        }
    }
};



  useEffect(() => {
    fetchProductionData(); // Fetch production data when selected machine or date range changes
  }, [selectedMachines, selectedDate]);
  console.log(productionData)
  const menu = ( 
    <Menu>
      <Menu.Item onClick={() => handleSelectCustomDays(2, '3 ngày')}>3 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(3, '4 ngày')}>4 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(6, '1 tuần')}>1 tuần</Menu.Item>
    </Menu>
  );
  const handleOpen =()=> {
    setDateRangePickerValue('')
  }
  const handleDateChangeChoose = (dates) => {
    if (dates) {
      setDateRangePickerValue(dates);
      setSelectedDate({ startDate: dates[0]?.toDate(), endDate: dates[1]?.toDate() });
    }
  };
  
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
            disabledDate={disabledDate}
            onCalendarChange={handleDateChangeChoose}
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

      <div className="grid grid-cols-12 gap-2 p-1" >
        <div className="bg-white rounded-lg p-4 shadow-md col-span-3" ref={runtimePieChartRef}>
          <TitleChart
            title="Tỷ lệ máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimePieChartRef)}
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
            <TaskPieChart data={taskChartData} />
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
      <div className="w-full">
          <DeviceTable downtimeData={[]} employeeData={[]} telemetryData={[]} productionData={productionData} type={'oeeAnalysis'} />
        </div>
    </>
  );
}

export default DeviceReport;