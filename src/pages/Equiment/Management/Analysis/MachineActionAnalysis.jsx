import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import StackedBarChart from '../../../../Components/Equiment/Reports/StackedBarChart';
import TimelineChart from '../../../../Components/Equiment/Reports/TimelineChart';
import { datastatus } from '../../../../data/status';
import TitleChart from '../../../../Components/TitleChart/TitleChart';
import DeviceTable from '../../../../Components/Equiment/Analysis/DeviceTable';

const { RangePicker } = DatePicker;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_BASE_URL;

function MachineActionAnalysis() {
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    startDate: moment().subtract(6, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate(), 
  });
  const [selectedMachine, setSelectedMachine] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [machineOptions, setMachineOptions] = useState([]);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('1 tuần');
  const runtimeTrendChartRef = useRef(null);
  const runtimePieChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const stackedBarChartRef = useRef(null);
  const rangePickerRef = useRef(null);
  const [defaultValue, setDefaultValue] = useState([moment().subtract(5, 'days').startOf('day'),
  moment().endOf('day'),])
  const [dateRangePickerValue, setDateRangePickerValue] = useState([ 
    moment().subtract(6, 'days'), 
    moment()
  ]);

  console.log(selectedDate)
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
        const options = await machines.map(machine => ({
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
      setDateRangePickerValue(dates);  // Update state to reflect selected date range
    }
  };

  const handleSelectCustomDays = (days, label) => {
    const endDate = moment().endOf('day').toDate();
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel(label);
    setDateRangePickerValue([moment(startDate), moment(endDate)]);  // Update the RangePicker value
  };

  const handlePrevWeek = () => {
   console.log(dateRangePickerValue)
    const startDate = dateRangePickerValue[0].subtract(6, 'days').toDate()
    const endDate =  dateRangePickerValue[1].subtract(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel('1 tuần');
    setDateRangePickerValue([dateRangePickerValue[0], dateRangePickerValue[1]]);  // Update the RangePicker value
  };

  const handleNextWeek = () => {
    const startDate = dateRangePickerValue[0].add(6, 'days').toDate()
    const endDate =  dateRangePickerValue[1].add(6, 'days').toDate();
    setSelectedDate({ startDate, endDate });
    setSelectedRangeLabel('1 tuần');
    setDateRangePickerValue([dateRangePickerValue[0], dateRangePickerValue[1]]);  // Update the RangePicker value
  };

  const disabledDate = (current) => {
    if (!startDate) return false;
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

 

  const menu = (
    <Menu>
      <Menu.Item onClick={() => handleSelectCustomDays(2, '3 ngày')}>3 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(3, '4 ngày')}>4 ngày</Menu.Item>
      <Menu.Item onClick={() => handleSelectCustomDays(6, '1 tuần')}>1 tuần</Menu.Item>
    </Menu>
  );

  const handleOpen = () => {
    setDateRangePickerValue('')
  }

  const handleDateChangeChoose = (dates) => {
    setStartDate(dates[0])
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
          <RangePicker ref={rangePickerRef}
            value={dateRangePickerValue} // This will now reflect the selected date range
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
      {/* <div className="">
          <DeviceTable downtimeData={[]} employeeData={[]} telemetryData={[]} productionData={productionData} type={'oeeAnalysis'} />
        </div> */}
    </>
  );
}

export default MachineActionAnalysis;
