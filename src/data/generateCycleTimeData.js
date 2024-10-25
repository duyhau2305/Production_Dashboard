import { addDays, differenceInDays } from 'date-fns';

export const generateCycleTimeData = (start, end) => {
  const daysDifference = differenceInDays(end, start) + 1;

  // Tạo nhãn cho trục x là các ngày sản xuất
  const labels = Array.from({ length: daysDifference }, (_, i) => {
    const currentDate = addDays(start, i);
    return currentDate.toLocaleDateString('en-GB'); // Định dạng ngày
  });

  // Các công đoạn sản xuất
  const processStages = ['Chuẩn bị nguyên liệu', 'Trộn và nhồi bột', 'Định hình bánh', 'Nướng bánh', 'Làm mát và đóng gói'];

  // Tạo dữ liệu giả ngẫu nhiên cho mỗi công đoạn theo ngày
  const generateRandomData = () => {
    return Array.from({ length: daysDifference }, () => Math.floor(Math.random() * 50 + 30)); // Random cycle time từ 30 đến 80 phút
  };

  // Tạo dataset cho mỗi công đoạn, mỗi công đoạn là một đường trong biểu đồ
  return {
    labels,
    datasets: processStages.map((stage) => ({
      label: stage,
      data: generateRandomData(),
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
      backgroundColor: 'rgba(0, 0, 0, 0)', // Đặt nền trong suốt để chỉ hiển thị đường
      fill: false,
      tension: 0.4,
    })),
  };
};
