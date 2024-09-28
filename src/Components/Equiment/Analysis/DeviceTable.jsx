import React from 'react';

const DeviceTable = ({ downtimeData, productionData }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h3>Thông kê Downtime</h3>
      <table className="min-w-full bg-white border border-gray-200 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Ngày</th>
            <th className="border px-4 py-2 text-xs">Thời gian bắt đầu</th>
            <th className="border px-4 py-2 text-xs">Thời gian kết thúc</th>
            <th className="border px-4 py-2 text-xs">Thời lượng</th>
            <th className="border px-4 py-2 text-xs">Lý do</th>
            <th className="border px-4 py-2 text-xs">Nhân viên vận hành</th> {/* Cột mới */}
          </tr>
        </thead>
        <tbody>
          {downtimeData.map((item, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{formatDate(item.startTime)}</td>
              <td className="border px-4 py-2">{item.startTime}</td>
              <td className="border px-4 py-2">{item.endTime}</td>
              <td className="border px-4 py-2">{item.duration}</td>
              <td className="border px-4 py-2">{item.reason}</td>
              <td className="border px-4 py-2">{item.operator}</td> {/* Giá trị của nhân viên vận hành */}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-6">Thông kê sản xuất</h3>
      <table className="min-w-full bg-white border border-gray-200 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Ngày</th>
            <th className="border px-4 py-2 text-xs">Tg bắt đầu</th>
            <th className="border px-4 py-2 text-xs">Tg kết thúc</th>
            <th className="border px-4 py-2 text-xs">Tg công việc</th>
            <th className="border px-4 py-2 text-xs">Tg chạy</th>
            <th className="border px-4 py-2 text-xs">Tg dừng</th>
            <th className="border px-4 py-2 text-xs">Tg bảo trì</th>
            <th className="border px-4 py-2 text-xs">Tỉ lệ chạy</th>
          </tr>
        </thead>
        <tbody>
          {productionData.map((item, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{formatDate(item.startTime)}</td>
              <td className="border px-4 py-2">{item.startTime}</td>
              <td className="border px-4 py-2">{item.endTime}</td>
              <td className="border px-4 py-2">{item.workTime}</td>
              <td className="border px-4 py-2">{item.runTime}</td>
              <td className="border px-4 py-2">{item.stopTime}</td>
              <td className="border px-4 py-2">{item.maintenanceTime}</td>
              <td className="border px-4 py-2">{item.runRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTable;
