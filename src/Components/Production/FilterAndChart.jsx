import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFilter } from 'react-icons/fa';
import { fetchData } from '../../data/fetchData';

const FilterAndChart = ({ onFilterData }) => {
  const [selectedLine, setSelectedLine] = useState({ value: 'All', label: 'Tất cả các Line' });
  const [selectedShift, setSelectedShift] = useState({ value: 'All', label: 'Tất cả các Ca' });
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);

  const handleLineChange = (selectedOption) => setSelectedLine(selectedOption);
  const handleShiftChange = (selectedOption) => setSelectedShift(selectedOption);
  const handleDateChange = (dates) => setSelectedDateRange(dates);

  const handleFilter = async () => {
    const data = await fetchData(selectedLine.value, selectedShift.value, selectedDateRange);
    setFilteredData(data);
    onFilterData(data);  
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData('All', 'All', [null, null]);
      if (data.length > 15) {
        const limitedData = data.slice(-15);  
        setFilteredData(limitedData);
        onFilterData(limitedData);  
      } else {
        setFilteredData(data);
        onFilterData(data); 
      }
    };
    loadData();
  }, []);

  return (
    <div>
      {/* Bộ lọc */}
      <div className="mb-2 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col md:flex-row md:col-span-2 space-y-2 md:space-y-0 md:space-x-2">
          <Select
            value={selectedLine}
            onChange={handleLineChange}
            options={[
              { value: 'All', label: 'Tất cả các Line' },
              { value: 'Line 1', label: 'Line 1' },
              { value: 'Line 2', label: 'Line 2' },
              { value: 'Line 3', label: 'Line 3' }
            ]}
            className="w-full md:w-[96%] text-sm"
            placeholder="Chọn Line Sản Xuất"
          />
          <Select
            value={selectedShift}
            onChange={handleShiftChange}
            options={[
              { value: 'All', label: 'Tất cả các Ca' },
              { value: 'Shift 1', label: 'Ca 1' },
              { value: 'Shift 2', label: 'Ca 2' },
              { value: 'Shift 3', label: 'Ca 3' }
            ]}
            className="w-full md:w-[96%] text-sm"
            placeholder="Chọn Ca"
          />
        </div>

        <div className="flex flex-col md:flex-row md:col-span-2 space-y-2 md:space-y-0 md:space-x-2">
          <DatePicker
            selected={selectedDateRange[0]}
            onChange={handleDateChange}
            startDate={selectedDateRange[0]}
            endDate={selectedDateRange[1]}
            selectsRange
            isClearable
            className="w-full md:w-[80%] text-sm py-2 px-4 border rounded"
            placeholderText="Chọn Khoảng Ngày"
          />
          <button
            onClick={handleFilter}
            className="bg-green-500 text-white rounded-lg flex items-center justify-center py-2 px-4"
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Biểu đồ sản lượng */}
      {filteredData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="text-md font-semibold mb-4">Biểu Đồ Sản Lượng</h3>
          <div className="w-full h-96 md:h-60 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="bottom" />
                <Bar dataKey="sản lượng" fill="#8884d8" />
                <Line type="monotone" dataKey="sản lượng" stroke="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterAndChart;
