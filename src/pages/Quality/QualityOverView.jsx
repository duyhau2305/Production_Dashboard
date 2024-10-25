import React from 'react';
import QualityChart from './QualityChart';
import MaterialInspectionChart from './MaterialInspectionChart';

function QualityOverView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md">
      {/* Hàng 1: Cột 1 - Biểu đồ chất lượng */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden" style={{ height: '400px' }}>
        <QualityChart />
      </div>

      {/* Hàng 1: Cột 2 - Biểu đồ kiểm tra nguyên liệu */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden" style={{ height: '400px' }}>
        <MaterialInspectionChart />
      </div>

      {/* Hàng 2: Cột 1 - Bảng chất lượng */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Bảng Chất Lượng</h3>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-xs">Loại Lỗi</th>
              <th className="border px-4 py-2 text-xs">Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2 text-sm">Cháy</td>
              <td className="border px-4 py-2 text-sm text-center">320</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Chưa chín</td>
              <td className="border px-4 py-2 text-sm text-center">60</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Đóng gói sai</td>
              <td className="border px-4 py-2 text-sm text-center">160</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Khác</td>
              <td className="border px-4 py-2 text-sm text-center">279</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Hàng 2: Cột 2 - Bảng kiểm tra nguyên liệu */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Bảng Kiểm Tra Nguyên Liệu</h3>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-xs">Nguyên Liệu</th>
              <th className="border px-4 py-2 text-xs">Đạt</th>
              <th className="border px-4 py-2 text-xs">Cảnh Báo</th>
              <th className="border px-4 py-2 text-xs">Không Đạt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2 text-sm">Đường</td>
              <td className="border px-4 py-2 text-sm text-center">8</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Bột mì</td>
              <td className="border px-4 py-2 text-sm text-center">7</td>
              <td className="border px-4 py-2 text-sm text-center">2</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Sữa</td>
              <td className="border px-4 py-2 text-sm text-center">5</td>
              <td className="border px-4 py-2 text-sm text-center">4</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Bơ</td>
              <td className="border px-4 py-2 text-sm text-center">9</td>
              <td className="border px-4 py-2 text-sm text-center">0</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 text-sm">Socola</td>
              <td className="border px-4 py-2 text-sm text-center">6</td>
              <td className="border px-4 py-2 text-sm text-center">3</td>
              <td className="border px-4 py-2 text-sm text-center">1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QualityOverView;
