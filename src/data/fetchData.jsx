import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';

export const fetchData = async (line, shift, dateRange) => {
 
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31');
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  const generateRandomData = (date, line, shift) => {
    return {
      date: format(date, 'yyyy-MM-dd'),
      'sản lượng': Math.floor(Math.random() * 3000) + 500,  
      errors: Math.floor(Math.random() * 10), 
      efficiency: Math.floor(Math.random() * 10) + 90, 
      line: line || `Line ${Math.floor(Math.random() * 3) + 1}`,
      shift: shift || `Shift ${Math.floor(Math.random() * 3) + 1}` // 
    };
  };

  const mockData = allDates.map(date => generateRandomData(date));

  // Lọc dữ liệu dựa trên các tham số đầu vào
  const filteredData = mockData.filter(item => {
    return (line === 'All' || item.line === line) &&
           (shift === 'All' || item.shift === shift) &&
           (!dateRange[0] || new Date(item.date) >= dateRange[0]) &&
           (!dateRange[1] || new Date(item.date) <= dateRange[1]);
  });

  // Tạo danh sách các ngày trong khoảng thời gian được chọn
  const completeData = eachDayOfInterval({
    start: dateRange[0] || startDate,
    end: dateRange[1] || endDate
  }).map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingData = filteredData.find(item => item.date === formattedDate);
    return existingData || generateRandomData(date, line, shift);
  });

  return completeData;
};
