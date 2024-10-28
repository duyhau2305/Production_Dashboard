import * as XLSX from 'xlsx/xlsx.mjs';
import { toast } from 'react-toastify';

const ExportExcelButton = ({ data, headers, parentComponentName }) => {
  const handleExportExcel = () => {
    try {
      const formattedData = data.map((item, index) => {
        const row = { STT: index + 1 };

        headers.forEach(({ key, label, transform }) => {
          row[label] = transform ? transform(item[key]) : item[key];
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const fileName = `${parentComponentName || 'ExportedData'}.xlsx`;

      // Xuất file Excel đồng bộ
      XLSX.writeFile(workbook, fileName);

      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting file:', error);
      toast.error('Lỗi khi xuất dữ liệu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex justify-end">
      <button
        className="bg-[#080f4c] text-sm text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        onClick={handleExportExcel}
      >
        Xuất Dữ Liệu
      </button>
    </div>
  );
};

export default ExportExcelButton;
