import React from 'react';

// Helper functions (như trước)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTimeToGMT7 = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formatDate(isoString)} ${hours}:${minutes}:${seconds}`;
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

const getEmployeeName = (date, employeeData) => {
  const formattedDate = formatDate(date);
  const employeeEntry = employeeData.find(
    (entry) => formatDate(entry.date) === formattedDate
  );
  return employeeEntry?.shifts[0]?.employeeName.join(', ') || 'N/A';
};

const getDowntimeInfoById = (intervalId, downtimeData) => {
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

// Component chính
const DeviceTable = ({ downtimeData, telemetryData, productionData, employeeData }) => {
  // Sắp xếp telemetryData theo ngày tăng dần (cũ nhất đến gần nhất)
  const sortedTelemetryData = [...telemetryData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div>
      <h3 className="mt-6 font-semibold">Thống kê Downtime</h3>
      <TableDowntime
        telemetryData={sortedTelemetryData}
        downtimeData={downtimeData}
        employeeData={employeeData}
      />
      <h3 className="mt-6 font-semibold">Thống kê sản xuất</h3>
      <TableProduction productionData={productionData} />
    </div>
  );
};

// Bảng thống kê Downtime
const TableDowntime = ({ telemetryData, downtimeData, employeeData }) => (
  <table className="min-w-full bg-white border border-gray-200 mt-4">
    <thead>
      <tr className="bg-gray-100">
        {['STT', 'Ngày', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Thời lượng', 
          'Lý do', 'Thời gian khai báo', 'Nhân viên vận hành'].map((header) => (
          <th key={header} className="border px-4 py-2 text-xs">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {telemetryData.map((interval, index) => {
        const { reason, reportedAt } = getDowntimeInfoById(interval._id, downtimeData);

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
              {getEmployeeName(interval.date, employeeData)}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// Bảng thống kê sản xuất
const TableProduction = ({ productionData }) => (
  <table className="min-w-full bg-white border border-gray-200 mt-4">
    <thead>
      <tr className="bg-gray-100">
        {['STT', 'Ngày', 'Thời gian bắt đầu', 'Thời gian kết thúc', 
          'Thời gian công việc', 'Thời gian chạy theo kế hoạch', 
          'Thời gian chạy thực tế', 'Thời gian chờ', 
          'Thời gian tắt máy', 'Thời gian bảo trì', 'Tỉ lệ chạy'].map((header) => (
          <th key={header} className="border px-4 py-2 text-xs">
            {header}
          </th>
        ))}
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
);

export default DeviceTable;
