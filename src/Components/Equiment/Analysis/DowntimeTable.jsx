const DowntimeTable = ({ historyData }) => {
    // Kiểm tra nếu historyData không phải là mảng
    if (!Array.isArray(historyData)) {
      return <p className="text-center">Không có dữ liệu lịch sử.</p>;
    }
  
    return (
      <div className="bg-white p-4 rounded-lg shadow overflow-auto max-h-[400px]">
        <h3 className="font-semibold mb-2">Thống Kê Lịch Sử DownTime</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Nguyên Nhân</th>
              <th className="px-4 py-2 text-left">Thời Gian Diễn Ra</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((entry, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{entry.timestamp}</td>
                <td className="px-4 py-2">{entry.reason}</td>
                <td className="px-4 py-2">{entry.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default DowntimeTable;
  