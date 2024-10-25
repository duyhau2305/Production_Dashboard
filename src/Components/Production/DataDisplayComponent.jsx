import React from 'react';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const DataDisplayComponent = ({ filteredData }) => {
  return (
    <>
      {filteredData.length > 0 ? (
        <>
          {/* Biểu đồ sản lượng */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Biểu Đồ Sản Lượng</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="output" fill="#8884d8" />
                <Line type="monotone" dataKey="errors" stroke="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bảng dữ liệu */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Dữ Liệu Thời Gian Thực</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-xs">Ngày</th>
                  <th className="border px-4 py-2 text-xs">Sản Lượng</th>
                  <th className="border px-4 py-2 text-xs">Số Lỗi</th>
                  <th className="border px-4 py-2 text-xs">Hiệu Suất (%)</th>
                  <th className="border px-4 py-2 text-xs">Line</th>
                  <th className="border px-4 py-2 text-xs">Ca</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-sm text-center">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                    <td className="border px-4 py-2 text-sm text-center">{item.output}</td>
                    <td className="border px-4 py-2 text-sm text-center">{item.errors}</td>
                    <td className="border px-4 py-2 text-sm text-center">{item.efficiency}%</td>
                    <td className="border px-4 py-2 text-sm text-center">{item.line}</td>
                    <td className="border px-4 py-2 text-sm text-center">{item.shift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center text-red-500">Không có dữ liệu để hiển thị.</div>
      )}
    </>
  );
};

export default DataDisplayComponent;
