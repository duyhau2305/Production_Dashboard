import React from 'react';
import { TrophyTwoTone, CrownTwoTone } from '@ant-design/icons'; // Ant Design icons

// Hàm chuyển đổi giờ sang định dạng hh:mm:ss
const formatHoursToTime = (hours) => {
  const totalSeconds = Math.round(hours * 3600); // Chuyển đổi giờ sang giây
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

const TopEmployeeRanking = ({ topEmployeesData }) => {
  // Đảm bảo danh sách luôn có đủ 10 hạng
  const fullRankingData = Array.from({ length: 10 }, (_, index) => ({
    name: topEmployeesData[index]?.name || 'Chưa có dữ liệu',
    hours: topEmployeesData[index]?.hours || 0,
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6 flex flex-col items-center">
      {/* Header */}
      <h3 className="text-2xl font-bold text-orange-600 mb-6">Bảng Vinh Danh Top 10 Nhân Viên</h3>

      {/* Podium for Top 3 */}
      <div className="flex justify-center items-end mb-8 space-x-6">
        {/* Second Place */}
        <div className="flex flex-col items-center w-24">
          <TrophyTwoTone className="text-3xl mb-2" twoToneColor="#C0C0C0" />
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-2"></div>
          <div className="text-center font-semibold text-gray-700">{fullRankingData[1].name}</div>
          <div className="text-sm text-gray-600">{formatHoursToTime(fullRankingData[1].hours)}</div>
        </div>

        {/* First Place */}
        <div className="flex flex-col items-center w-24 relative" style={{ marginBottom: '20px' }}>
          <CrownTwoTone className="text-4xl mb-2" twoToneColor="#FFD700" />
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-2"></div>
          <div className="text-center font-semibold text-yellow-500">{fullRankingData[0].name}</div>
          <div className="text-sm text-gray-600">{formatHoursToTime(fullRankingData[0].hours)}</div>
        </div>

        {/* Third Place */}
        <div className="flex flex-col items-center w-24">
          <TrophyTwoTone className="text-3xl mb-2" twoToneColor="#CD7F32" />
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-2"></div>
          <div className="text-center font-semibold text-gray-700">{fullRankingData[2].name}</div>
          <div className="text-sm text-gray-600">{formatHoursToTime(fullRankingData[2].hours)}</div>
        </div>
      </div>

      {/* Ranking Table */}
      <table className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <thead>
          <tr className="bg-orange-300 text-orange-800">
            {['Hạng', 'Tên nhân viên', 'Thời gian (hh:mm:ss)'].map((header) => (
              <th
                key={header}
                className="border px-4 py-2 text-sm font-semibold text-center"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fullRankingData.map((employee, index) => (
            <tr
              key={index}
              className={`hover:bg-orange-50 ${
                index % 2 === 0 ? 'bg-orange-100' : 'bg-orange-50'
              }`}
            >
              {/* Rank with Trophy or Number */}
              <td className="border px-4 py-2 text-center text-lg font-semibold">
                {index === 0 ? (
                  <CrownTwoTone twoToneColor="#FFD700" />
                ) : index === 1 ? (
                  <TrophyTwoTone twoToneColor="#C0C0C0" />
                ) : index === 2 ? (
                  <TrophyTwoTone twoToneColor="#CD7F32" />
                ) : (
                  index + 1
                )}
              </td>
              {/* Employee Name */}
              <td className="border px-4 py-2 text-center font-medium text-gray-700">
                {employee.name}
              </td>
              {/* Total Runtime */}
              <td className="border px-4 py-2 text-center font-medium text-gray-700">
                {formatHoursToTime(employee.hours)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopEmployeeRanking;
