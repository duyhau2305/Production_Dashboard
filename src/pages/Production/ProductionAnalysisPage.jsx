import React, { useState } from 'react';
import ExportExcelButton from '../../Components/Button/ExportExcelButton';
import { FaFileExport } from 'react-icons/fa';
import FilterAndChart from '../../Components/Production/FilterAndChart';
import { format } from 'date-fns';

const ProductionAnalysisPage = () => {
  const [filteredData, setFilteredData] = useState([]);  

 
  const handleFilterData = (data) => {
    setFilteredData(data);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Phân Tích Sản Lượng</h2>

      <FilterAndChart onFilterData={handleFilterData} />

      {/* Bảng dữ liệu */}
      {filteredData.length > 0 && (
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
                  <td className="border px-4 py-2 text-sm text-center">{item['sản lượng']}</td>
                  <td className="border px-4 py-2 text-sm text-center">{item.errors}</td>
                  <td className="border px-4 py-2 text-sm text-center">{item.efficiency}%</td>
                  <td className="border px-4 py-2 text-sm text-center">{item.line}</td>
                  <td className="border px-4 py-2 text-sm text-center">{item.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nút xuất báo cáo */}
      <div className="flex justify-end mt-4">
        <ExportExcelButton data={filteredData} fileName="BaoCaoSanLuong.xlsx">
          <FaFileExport className="mr-2" />
          Xuất Báo Cáo
        </ExportExcelButton>
      </div>
    </div>
  );
};

export default ProductionAnalysisPage;
