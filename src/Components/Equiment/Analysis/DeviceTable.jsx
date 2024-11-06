import React from 'react';
import moment from 'moment';

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateReason = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const formatTimeToGMT7 = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const calculateDuration = (startISO, endISO) => {
  const start = moment(startISO);
  const end = moment(endISO);
  const duration = moment.duration(end.diff(start));

  const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
  const minutes = String(duration.minutes()).padStart(2, '0');
  const seconds = String(duration.seconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

const getEmployeeName = (date, employeeData) => {
  const formattedDate = formatDate(date);
  const employeeEntry = employeeData.find(
    (entry) => formatDate(entry.date) === formattedDate
  );
  return employeeEntry?.shifts[0]?.employeeName.join(', ') || 'N/A';
};

const getDowntimeInfoByTime = (intervalStartTime, intervalEndTime, downtimeData) => {
  // Tìm downtime có `startTime` và `endTime` trùng với `interval`
  const matchingDowntime = downtimeData.find((item) =>
    item.interval.some((downtimeInterval) => 
      downtimeInterval.startTime === intervalStartTime && downtimeInterval.endTime === intervalEndTime
    )
  );

  if (matchingDowntime) {
    const matchedInterval = matchingDowntime.interval.find(
      (downtimeInterval) => 
        downtimeInterval.startTime === intervalStartTime && downtimeInterval.endTime === intervalEndTime
    );
    return {
      reason: matchingDowntime.reasonName || 'Đề nghị khai báo',
      reportedAt: formatDateReason(matchingDowntime.createdAt),
    };
  }

  // Trả về mặc định nếu không tìm thấy trong `downtimeData`
  return { reason: 'Chưa khai báo', reportedAt: 'Đề nghị khai báo' };
};
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
        // Lấy thông tin downtime cho từng `interval`, bao gồm cả những `interval` chưa khai báo
        const { reason, reportedAt } = getDowntimeInfoByTime(interval.startTime, interval.endTime, downtimeData);

        return (
          <tr key={`${interval.startTime}-${interval.endTime}`}>
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{formatDate(interval.date)}</td>
            <td className="border px-4 py-2">{formatTimeToGMT7(interval.startTime)}</td>
            <td className="border px-4 py-2">{formatTimeToGMT7(interval.endTime)}</td>
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


// Component chính
const DeviceTable = ({ downtimeData, telemetryData, productionData, employeeData }) => {
  const sortedTelemetryData = [...telemetryData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  console.log(productionData)
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



// Bảng thống kê sản xuất
// Bảng thống kê sản xuất
const TableProduction = ({ productionData }) => {
  // Kiểm tra nếu productionData là undefined hoặc null hoặc không có productionTasks dưới dạng mảng
  if (!productionData || !Array.isArray(productionData.productionTasks)) {
    return <p className="text-red-500">Không có dữ liệu sản xuất.</p>;
  }

  return (
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
        {productionData.productionTasks.map((item, index) => (
          <tr key={index}>
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{new Date(item.date).toISOString().split('T')[0]}</td>
            <td className="border px-4 py-2">{item.shift.startTime}</td>
            <td className="border px-4 py-2">{item.shift.endTime}</td>
            <td className="border px-4 py-2"></td>
            <td className="border px-4 py-2"></td>
            <td className="border px-4 py-2">{productionData.summaryStatus}</td>
            <td className="border px-4 py-2">{productionData.summaryStatusIdle}</td>
            <td className="border px-4 py-2">{productionData.summaryStatusStop}</td>
            <td className="border px-4 py-2"></td>
            <td className="border px-4 py-2"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


export default DeviceTable;
