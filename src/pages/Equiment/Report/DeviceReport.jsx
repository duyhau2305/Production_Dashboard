import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';
import DowntimePieChart from '../../../Components/Equiment/Analysis/DowntimePieChart';
import TitleChart from '../../../Components/TitleChart/TitleChart';
import { Select, DatePicker } from 'antd'; 
import RuntimeTrendChart from '../../../Components/Equiment/Reports/RuntimeTrendChart';
import RepairBarChart from '../../../Components/Equiment/Reports/RepairBarChart';
import StackedBarChart from '../../../Components/Equiment/Reports/StackedBarChart';
import TimelineChart from '../../../Components/Equiment/Reports/TimelineChart';
import { datastatus } from '../../../data/status'; 

const { RangePicker } = DatePicker;
const { Option } = Select;

function DeviceReport() {
  const apiUrl =import.meta.env.VITE_API_BASE_URL
  const [selectedMachines, setSelectedMachines] = useState([]);  
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null); 
  const [machineOptions, setMachineOptions] = useState([]); // State lưu dữ liệu máy từ API

  const runtimeTrendChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const stackedBarChartRef = useRef(null);
  console.log(selectedMachines)
  useEffect(() => {
    const fetchMachineOptions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/machine-operations/machineOperations`);
        const machines = response.data.data; 
        console.log(response)
        const options = machines.map(machine => ({
          value: machine._id, // Hoặc field phù hợp với mã máy
          label: machine.operationStatusKey || `Machine ${machine.id}` // Tên máy hoặc thông tin mô tả
        }));

        setMachineOptions(options);
      } catch (error) {
        console.error('Error fetching machine options:', error);
      }
    };

    fetchMachineOptions();
  }, []); 

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

  const handlePrint = () => {
    // Implement your print logic here
  };

  const newDateChane = (dates) => {
    console.log(dates);
    setStartDate(null);
    setSelectedDate({ startDate: dates.startDate, endDate: dates.endDate });
  };
  const machineChange = () => {

  }
  const handleDateChange = (dates) => {
    console.log(dates);
    setStartDate(null);
    setSelectedDate({ startDate: dates[0].$d, endDate: dates[1].$d });
  };

  const handleDateChangeChoose = (dates) => {
    setStartDate(dates[0]);
  };

  const disabledDate = (current) => {
    if (!startDate) return false; // Nếu không có ngày bắt đầu được chọn, cho phép tất cả các ngày
    return current < startDate || current > startDate.clone().add(6, 'days');
  };

  const runtimeChartData = {
    labels: ['Dừng', 'Chờ', 'Cài đặt', 'Tắt máy'],
    values: [50, 20, 20, 10],
  };

  const taskChartData = {
    labels: ['Lỗi kỹ thuật', 'Lỗi sensor', 'Lỗi chất lượng', 'Xước màn'],
    values: [50, 20, 20, 10],
  };

  const runtimeTrendData = {
    labels: ['22/09', '23/09', '24/09', '25/09'],
    datasets: [
      {
        label: "Tỷ lệ máy chạy (%)",
        data: [85, 90, 80, 75],
        fill: false,
        backgroundColor: 'green',
        borderColor: 'green',
        borderWidth: 2,
      }
    ],
  };

  const repairDowntimeBarData = {
    labels: ['22/09', '23/09', '24/09', '25/09'],
    datasets: [
      {
        label: "",
        data: [1, 2, 1, 2, 3, 4],
        backgroundColor: 'rgba(5, 65, 151, 0.96)',
        borderColor: 'rgba(5, 65, 151, 1)',
        borderWidth: 1,
      }
    ],
  };

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center space-x-4">
          <Select
            // mode="multiple"
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
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 p-1">
        {/* Charts */}
        <div className="bg-white rounded-lg p-4 shadow-md col-span-2 ">
          <TitleChart
            title="Tỷ lệ máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="h-28">
            <DowntimePieChart data={runtimeChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md col-span-2 ">
          <TitleChart
            title="Phân bố nhiệm vụ"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="w-full h-full">
            <DowntimePieChart data={taskChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md col-span-4 " ref={runtimeTrendChartRef}>
          <TitleChart
            title="Xu hướng máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="w-full h-full mt-1 ml-2 p-2">
            <RuntimeTrendChart data={runtimeTrendData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-2 shadow-md col-span-4">
          <TitleChart
            title="Thời gian dừng sửa chữa"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="w-full h-full mt-12 ml-2 px-3">
            <RepairBarChart data={repairDowntimeBarData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1">
        <div className="bg-white p-3 col-span-1" ref={timelineChartRef}>
          <TitleChart
            title="Ngăn xếp trạng thái"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(timelineChartRef)}
            onPrint={handlePrint}
          />
          {selectedDate ? <TimelineChart  data={datastatus.status} selectedDate={selectedDate} selectedMchine={selectedMachines} onDateChange={newDateChane}/> : <>No data</>}
        </div>
        <div className="bg-white p-3 col-span-1" ref={stackedBarChartRef}>
          <TitleChart 
            title="Thống kê trạng thái"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(stackedBarChartRef)}
            onPrint={handlePrint}
          />
          <StackedBarChart selectedDate={selectedDate} selectedMchine={selectedMachines} onDateChange={newDateChane}/>
        </div>
      </div>
    </>
  );
}

export default DeviceReport;
