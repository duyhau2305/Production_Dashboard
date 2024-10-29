import React, { useState, useRef } from 'react';
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
  const [selectedMachines, setSelectedMachines] = useState([]);  
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null); 
  const runtimeTrendChartRef = useRef(null); // Create a ref for the RuntimeTrendChart
  const timelineChartRef = useRef(null); // Create a ref for the TimelineChart
  const stackedBarChartRef = useRef(null); // Create a ref for the StackedBarChart

  const machineOptions = [
    ...Array.from({ length: 17 }, (_, i) => ({
      value: `CNC${i + 1}`,
      label: `CNC ${i + 1}`
    })),
    ...Array.from({ length: 18 }, (_, i) => ({
      value: `PHAY${i + 1}`,
      label: `PHAY ${i + 1}`
    }))
  ];

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
    console.log(dates)
    setStartDate(null)
    setSelectedDate({startDate : dates.startDate , endDate : dates.endDate});
  }
  const handleDateChange = (dates) => {
    console.log(dates)
    setStartDate(null)
    setSelectedDate({startDate : dates[0].$d , endDate : dates[1].$d});
  };
  const handleDateChangeChoose = (dates) => {
    setStartDate(dates[0])
    // setSelectedDate(dates);
  };
  const disabledDate = (current) => {
    // Allow the selected start date and next 7 days
    if (!startDate) return false; // If no start date selected, allow all dates
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
    <div className="p-2 bg-white shadow-md rounded-md">
      <Breadcrumb />
      <hr />
      <div className="flex justify-end items-center mb-4 mt-2">
      
        <div className="flex items-center space-x-4">
      
          <Select
            mode="multiple" 
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

      <div className="grid grid-cols-12 gap-1 p-1 sm:grid sm:grid-cols-4">
        {/* Charts */}
        <div className="bg-white rounded-lg p-3 shadow-md col-span-2 sm:col-span-1 ">
          <TitleChart
            title="Tỷ lệ máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className=" ">
            <DowntimePieChart data={runtimeChartData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-md col-span-2 sm:col-span-1  ">
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

        <div className="bg-white rounded-lg p-3 shadow-md col-span-4 sm:col-span-1 " ref={runtimeTrendChartRef}>
          <TitleChart
            title="Xu hướng máy chạy"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="w-full  h-full ">
            <RuntimeTrendChart data={runtimeTrendData} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-md col-span-4 sm:col-span-1 ">
          <TitleChart
            title="Thời gian dừng sửa chữa"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(runtimeTrendChartRef)}
            onPrint={handlePrint}
          />
          <div className="w-full h-full ">
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
          {selectedDate ? <TimelineChart data={datastatus.status} selectedDate={selectedDate} onDateChange={newDateChane}/> : <>No data</>}
        </div>
        <div className="bg-white p-3 col-span-1" ref={stackedBarChartRef}>
          <TitleChart 
            title="Thống kê trạng thái"
            timeWindow="Last 24 hours"
            onFullscreen={() => handleFullscreen(stackedBarChartRef)}
            onPrint={handlePrint}
          />
          <StackedBarChart selectedDate={selectedDate} onDateChange={newDateChane}/>
        </div>
      </div>

    </div>
     
    </>
  );
}

export default DeviceReport;