import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const ExportExcelButton = ({ data, parentComponentName }) => {
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate the filename dynamically based on parentComponentName
    const fileName = `${parentComponentName || 'ExportedData'}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success('Xuất dữ liệu thành công!');
  };

  return (
    <div className="flex justify-end">
      <button
        className="bg-green-400 text-sm text-white px-3 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors"
        onClick={handleExportExcel}
      >
        Xuất Dữ Liệu
      </button>
    </div>
  );
};

export default ExportExcelButton;
