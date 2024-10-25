const DeviceTable = ({ downtimeData, productionData, employeeData }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (time) => time || 'N/A';

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute, startSecond] = startTime.split(':').map(Number);
    const [endHour, endMinute, endSecond] = endTime.split(':').map(Number);

    let startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
    let endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

    if (endTotalSeconds < startTotalSeconds) {
      endTotalSeconds += 24 * 3600;
    }

    const totalSeconds = endTotalSeconds - startTotalSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Hàm lấy thông tin nhân viên dựa trên deviceId và ngày
  const getEmployeeName = (deviceName, date) => {
    const employeeEntry = employeeData.find(
      (entry) =>
        entry.deviceName === deviceName && formatDate(entry.date) === formatDate(date)
    );

    // Kiểm tra xem có nhân viên không và trả về tên hoặc 'N/A'
    return employeeEntry?.shifts[0]?.employeeName.join(', ') || 'N/A';
  };

  return (
    <div>
      <h3 className="mt-6 font-semibold">Thống kê Downtime</h3>
      <table className="min-w-full bg-white border border-gray-200 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Ngày</th>
            <th className="border px-4 py-2 text-xs">Thời gian bắt đầu</th>
            <th className="border px-4 py-2 text-xs">Thời gian kết thúc</th>
            <th className="border px-4 py-2 text-xs">Thời lượng</th>
            <th className="border px-4 py-2 text-xs">Lý do</th>
            <th className="border px-4 py-2 text-xs">Nhân viên vận hành</th>
          </tr>
        </thead>
        <tbody>
          {downtimeData.flatMap((item, itemIndex) =>
            item.interval.map((interval, intervalIndex) => (
              <tr key={`${item._id}-${intervalIndex}`}>
                <td className="border px-4 py-2">
                  {itemIndex * item.interval.length + intervalIndex + 1}
                </td>
                <td className="border px-4 py-2">{formatDate(item.date)}</td>
                <td className="border px-4 py-2">{formatTime(interval.startTime)}</td>
                <td className="border px-4 py-2">{formatTime(interval.endTime)}</td>
                <td className="border px-4 py-2">
                  {calculateDuration(interval.startTime, interval.endTime)}
                </td>
                <td className="border px-4 py-2">{item.reasonName}</td>
                <td className="border px-4 py-2">
                  {getEmployeeName(item.deviceName, item.date)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="mt-6 font-semibold">Thống kê sản xuất</h3>
      <table className="min-w-full bg-white border border-gray-200 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Ngày</th>
            <th className="border px-4 py-2 text-xs">Thời gian bắt đầu</th>
            <th className="border px-4 py-2 text-xs">Thời gian kết thúc</th>
            <th className="border px-4 py-2 text-xs">Thời gian công việc</th>
            <th className="border px-4 py-2 text-xs">Thời gian chạy theo kế hoạch</th>
            <th className="border px-4 py-2 text-xs">Thời gian chạy thực tế</th>
            <th className="border px-4 py-2 text-xs">Thời gian chờ</th>
            <th className="border px-4 py-2 text-xs">Thời gian tắt máy</th>
            <th className="border px-4 py-2 text-xs">Thời gian bảo trì</th>
            <th className="border px-4 py-2 text-xs">Tỉ lệ chạy</th>
          </tr>
        </thead>
        <tbody>
          {productionData.map((item, index) => ( 
            <tr key={index}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{formatDate(item.date)}</td>
              <td className="border px-4 py-2">{item.startTime}</td>
              <td className="border px-4 py-2">{item.endTime}</td>
              <td className="border px-4 py-2">{item.workTime}</td>
              <td className="border px-4 py-2">{item.planeTime}</td>
              <td className="border px-4 py-2">{item.runTime}</td>
              <td className="border px-4 py-2">{item.downTime}</td>
              <td className="border px-4 py-2">{item.offTime}</td>
              <td className="border px-4 py-2">{item.maintenanceTime}</td>
              <td className="border px-4 py-2">{item.runRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTable;
