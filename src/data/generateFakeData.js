import { addDays, differenceInDays } from 'date-fns';

export const generateFakeData = (start, end) => {
  const daysDifference = differenceInDays(end, start) + 1; // Số ngày giữa start và end
  const labels = [];
  const totalProduction = [];
  const defectProducts = [];

  // Tạo ra một xu hướng tăng dần (hoặc giảm dần)
  let baseProduction = Math.floor(Math.random() * 200 + 100); // Sản lượng cơ bản
  let baseDefects = Math.floor(Math.random() * 10 + 5); // Sản phẩm lỗi cơ bản

  for (let i = 0; i < daysDifference; i++) {
    const currentDate = addDays(start, i);
    labels.push(currentDate.toLocaleDateString('en-GB')); // Định dạng ngày

    // Thêm một chút ngẫu nhiên vào xu hướng
    const dailyProduction = baseProduction + Math.floor(Math.random() * 50) + i * 10; // Xu hướng tăng dần
    const dailyDefects = baseDefects + Math.floor(Math.random() * 5) + i * 2; // Xu hướng tăng dần nhẹ

    totalProduction.push(dailyProduction);
    defectProducts.push(dailyDefects);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Tổng sản lượng',
        data: totalProduction,
        borderColor: '#4A90E2',
        backgroundColor: '#0ea5e9',
        borderWidth: 1,
        barThickness: 'flex',
        trendlineLinear: {
          style: "rgba(58, 128, 186, 0.8)",
          lineStyle: "solid",
          width: 2
        },
      },
      {
        label: 'Sản phẩm lỗi',
        data: defectProducts,
        borderColor: '#E94A4A',
        backgroundColor: '#ea580c',
        borderWidth: 1,
        barThickness: 'flex',
        trendlineLinear: {
          style: "rgba(233, 74, 74, 0.8)",
          lineStyle: "solid",
          width: 2
        },
      },
    ],
  };
};
