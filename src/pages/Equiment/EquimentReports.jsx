import React,{useState} from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import ErrorRateCharts from '../../Components/Equiment/Reports/ErrorRateCharts';
import PerformanceMetrics from '../../Components/Equiment/PerformanceMetrics';

const EquimentReports = () => {
    const [selectedMachine, setSelectedMachine] = useState('Máy trộn');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const handleMachineChange = (e) => {
        setSelectedMachine(e.target.value);
      };

  return (
    <div className="space-y-4">
    <div className="flex items-center space-x-2">
      <select
        value={selectedMachine}
        onChange={handleMachineChange}
        className="p-2 border rounded text-sm"
      >
        <option value="Máy trộn">Máy trộn</option>
        <option value="Máy định hình">Máy định hình</option>
        <option value="Máy nướng">Máy nướng</option>
        <option value="Máy đóng gói">Máy đóng gói</option>
      </select>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        className="p-2 border rounded text-sm"
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        className="p-2 border rounded text-sm"
      />
      <button className="p-2 bg-green-500 text-white rounded">Phân tích</button>
    </div>
  
        <div className="w-full  h-1/4 ">
                <ErrorRateCharts />
    </div>

  
    <div>
      <PerformanceMetrics />
    </div>
  
    {/* Đây là phần tử bổ sung cho hàng thứ 4 */}
    <div>
      {/* Nội dung bổ sung của bạn */}
    </div>
  </div>
  
  );
};

export default EquimentReports;
