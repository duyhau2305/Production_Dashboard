import React, { useState, useEffect } from 'react';

const CustomCalendar = ({ selectedDates, setSelectedDates ,taskData}) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Ngày hiện tại trên lịch
  const [showMonthPicker, setShowMonthPicker] = useState(false); // Trạng thái hiển thị picker tháng
  const [showYearPicker, setShowYearPicker] = useState(false); // Trạng thái hiển thị picker năm
  const [showDecadePicker, setShowDecadePicker] = useState(false); // Trạng thái hiển thị picker thập kỷ
  
  // Khi `selectedDates` thay đổi, cập nhật `currentDate`
  useEffect(() => {
    if (selectedDates && selectedDates.length > 0) {
      setCurrentDate(new Date(selectedDates[0])); // Cập nhật lịch với ngày đã chọn từ DatePicker
    }
  }, [selectedDates]);

  // Hàm lấy số ngày trong một tháng
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Hàm xử lý chọn hoặc bỏ chọn ngày
  const handleDayClick = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date)); // Bỏ chọn ngày
    } else {
      setSelectedDates([...selectedDates, date]); // Chọn ngày
    }
  };
  const getTasksForDate = (date) => {
    return taskData[date]?.tasks || []; // Lấy nhiệm vụ cho ngày cụ thể
  };
  

  // Kiểm tra xem một ngày có được chọn hay không
  const isSelected = (date) => selectedDates.includes(date);

  // Hàm tạo lịch hiển thị các ngày trong tháng
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Thêm các ngày từ tháng trước để lấp đầy tuần đầu tiên
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const previousDay = prevMonthDays - i;
      days.push(
        <div key={`prev-${previousDay}`} className="h-28 border border-gray-300 text-gray-400 p-2 cursor-not-allowed">
          {previousDay}
        </div>
      );
    }

    // Thêm các ngày của tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isToday = date === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(date)}
          className={`h-28 border border-gray-300 flex flex-col p-1 cursor-pointer ${
            isSelected(date) ? 'bg-blue-600 text-white' : isToday ? 'bg-blue-300 text-white' : ''
          }`}
        >
          <span>{day}</span>
          {/* Hiển thị các nhiệm vụ */}
          <ul className="list-none mt-1  text-xl"  >
            {getTasksForDate(date).map((task, index) => (
          <li key={index} className="text-xs none p-1 text-black mt-1" style={{ background: task.status === 'Dừng' ? 'red' : task.status === 'Chờ' ? '#fafa98' : '#8ff28f' }}>
            {task.selectedShift}
          </li>
      ))}

          </ul>
        </div>
      );
    }

    // Thêm các ngày của tháng tiếp theo để lấp đầy hàng cuối cùng
    const totalDaysDisplayed = adjustedFirstDay + daysInMonth;
    const nextMonthDays = 7 - (totalDaysDisplayed % 7 === 0 ? 7 : totalDaysDisplayed % 7);
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(
        <div key={`next-${i}`} className="h-28 border border-gray-300 text-gray-400 p-2 cursor-not-allowed">
          {i}
        </div>
      );
    }

    return days;
  };

  // Điều hướng sang tháng trước
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  // Điều hướng sang tháng sau
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Chọn tháng
  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month)); // Cập nhật tháng
    setShowMonthPicker(false); // Ẩn bộ chọn tháng sau khi chọn
  };

  // Chọn năm
  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth())); // Cập nhật năm
    setShowYearPicker(false); // Ẩn bộ chọn năm sau khi chọn
    setShowMonthPicker(true); // Chuyển về chọn tháng
  };

  // Chọn thập kỷ
  const handleDecadeSelect = (startYear) => {
    setCurrentDate(new Date(startYear, currentDate.getMonth())); // Chọn năm đầu tiên của thập kỷ
    setShowDecadePicker(false); // Ẩn picker thập kỷ
    setShowYearPicker(true); // Hiển thị picker năm
  };

  // Mảng tên tháng và ngày
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Hiển thị bộ chọn tháng
  if (showMonthPicker) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {monthNames.map((month, index) => (
          <div
            key={month}
            className="h-20 border flex items-center justify-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleMonthSelect(index)}
          >
            {month}
          </div>
        ))}
      </div>
    );
  }

  // Hiển thị bộ chọn năm
  if (showYearPicker) {
    const startYear = Math.floor(currentDate.getFullYear() / 10) * 10; // Tính toán năm đầu tiên của thập kỷ
    const years = Array.from({ length: 10 }, (_, i) => startYear + i); // Tạo danh sách năm trong thập kỷ

    return (
      <div className="grid grid-cols-3 gap-4">
        {years.map((year) => (
          <div
            key={year}
            className="h-20 border flex items-center justify-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleYearSelect(year)}
          >
            {year}
          </div>
        ))}
      </div>
    );
  }

  // Hiển thị bộ chọn thập kỷ
  if (showDecadePicker) {
    const startDecade = Math.floor(currentDate.getFullYear() / 100) * 100; // Tính toán thập kỷ đầu tiên của thế kỷ
    const decades = Array.from({ length: 10 }, (_, i) => startDecade + i * 10); // Tạo danh sách các thập kỷ

    return (
      <div className="grid grid-cols-3 gap-4">
        {decades.map((decade) => (
          <div
            key={decade}
            className="h-20 border flex items-center justify-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleDecadeSelect(decade)}
          >
            {decade} - {decade + 9}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold cursor-pointer" onClick={() => setShowDecadePicker(true)}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={handleNextMonth} className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 text-center font-bold text-gray-600">
        {dayNames.map((dayName) => (
          <div key={dayName} className="h-8">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">{generateCalendarDays()}</div>
    </div>
  );
};

export default CustomCalendar;
