const DeviceTable = ({ downtimeData, telemetryData, productionData, employeeData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Định dạng dd-mm-yyyy
  };
  
  const formatTimeToGMT7 = (isoString) => {
    const date = new Date(isoString);
    const localDate = new Date(date.getTime());

    const day = String(localDate.getDate()).padStart(2, '0');
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const year = localDate.getFullYear();
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    const totalMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const getEmployeeName = (date) => {
    const formattedDate = formatDate(date); // Chuẩn hóa ngày thành yyyy-mm-dd
  
    // Tìm bản ghi khớp với ngày trong employeeData
    const employeeEntry = employeeData.find((entry) => {
      const entryDate = formatDate(entry.date); // Chuẩn hóa ngày trong employeeData
      return entryDate === formattedDate;
    });
  
    // Kiểm tra nếu tìm thấy bản ghi và có nhân viên trong ca làm việc
    if (employeeEntry && employeeEntry.shifts.length > 0) {
      return employeeEntry.shifts[0].employeeName.join(', ');
    }
  
    return 'N/A'; // Nếu không có bản ghi khớp, trả về 'N/A'
  };
  
 

  const getDowntimeInfoById = (intervalId) => {
    const matchingDowntime = downtimeData.find((item) =>
      item.interval.some((downtimeInterval) => downtimeInterval._id === intervalId)
    );

    if (matchingDowntime) {
      const matchedInterval = matchingDowntime.interval.find(
        (downtimeInterval) => downtimeInterval._id === intervalId
      );
      return {
        reason: matchingDowntime.reasonName || 'De nghi khai bao',
        reportedAt: formatTimeToGMT7(matchingDowntime.createdAt),
      };
    }

    return { reason: 'Chưa khai báo', reportedAt: 'De nghi khai bao' };
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
            <th className="border px-4 py-2 text-xs">Thời gian khai báo</th>
            <th className="border px-4 py-2 text-xs">Nhân viên vận hành</th>
          </tr>
        </thead>
        <tbody>
          {telemetryData.map((interval, index) => {
            const { reason, reportedAt } = getDowntimeInfoById(interval._id);

            return (
              <tr key={interval._id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{formatDate(interval.date)}</td>
                <td className="border px-4 py-2">{interval.startTime}</td>
                <td className="border px-4 py-2">{interval.endTime}</td>
                <td className="border px-4 py-2">
                  {calculateDuration(interval.startTime, interval.endTime)}
                </td>
                <td className="border px-4 py-2">{reason}</td>
                <td className="border px-4 py-2">{reportedAt}</td>
                <td className="border px-4 py-2">
                  {getEmployeeName(interval.date)}
                </td>
              </tr>
            );
          })}
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
