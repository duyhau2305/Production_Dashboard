import React from 'react';

// Hàm chuyển đổi thời gian từ giây sang hh:mm:ss
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const DeviceTopEmployeeTable = ({ runTimeData, topEmployees }) => {
  // Lọc dữ liệu `runTimeData` chỉ theo nhân viên trong top 10
  const filteredData = topEmployees.map((employee, index) => {
    const devices = runTimeData
      .filter((entry) => entry.employee === employee.name && entry.runTime > 0) // Chỉ lấy thiết bị có runTime > 0
      .map((entry) => ({
        deviceName: entry.deviceId,
        totalRunTime: formatTime(entry.runTime), // Chuyển đổi thời gian chạy sang hh:mm:ss
        dates: entry.dates.join(', '), // Gộp các ngày thành chuỗi
      }));

    return devices.length > 0
      ? {
          employeeName: employee.name,
          rank: index + 1, // Số thứ tự
          devices,
        }
      : null; // Bỏ qua nhân viên nếu không có thiết bị nào với runtime > 0
  }).filter(Boolean); // Loại bỏ các phần tử `null`

  return (
    <div>
           <table className="min-w-full bg-white border border-gray-200 mt-4">
        <thead>
          <tr className="bg-gray-100">
            {['STT', 'Nhân viên', 'Thiết bị', 'Thời gian sử dụng (hh:mm:ss)', 'Ngày Đứng Máy'].map((header) => (
              <th key={header} className="border px-4 py-2 text-xs">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((employee) => (
            employee.devices.map((device, deviceIndex) => (
              <tr key={`${employee.rank}-${deviceIndex}`}>
                {deviceIndex === 0 && (
                  <>
                    <td
                      rowSpan={employee.devices.length}
                      className="border px-4 py-2 font-semibold"
                    >
                      {employee.rank}
                    </td>
                    <td
                      rowSpan={employee.devices.length}
                      className="border px-4 py-2 font-semibold"
                    >
                      {employee.employeeName}
                    </td>
                  </>
                )}
                <td className="border px-4 py-2">{device.deviceName}</td>
                <td className="border px-4 py-2">{device.totalRunTime}</td>
                <td className="border px-4 py-2">{device.dates}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTopEmployeeTable;
