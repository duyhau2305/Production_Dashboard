import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicFormModal from '../../Components/Modal/DynamicFormModal';
import SearchButton from '../../Components/Button/SearchButton';
import AddButton from '../../Components/Button/AddButton';
import ExportExcelButton from '../../Components/Button/ExportExcelButton';
import * as yup from 'yup';
import { format } from 'date-fns';

const initialInventoryData = [
  { id: 1, category: 'Nguyên vật liệu', material: 'Đường', quantity: '500 kg', warehouse: 'Kho 1' },
  { id: 2, category: 'Nguyên vật liệu', material: 'Bột mì', quantity: '300 kg', warehouse: 'Kho 2' },
  { id: 3, category: 'Nguyên vật liệu', material: 'Bơ', quantity: '200 kg', warehouse: 'Kho 1' },
  { id: 4, category: 'Nguyên vật liệu', material: 'Sữa', quantity: '100 lít', warehouse: 'Kho 3' },
  { id: 5, category: 'Nguyên vật liệu', material: 'Socola', quantity: '50 kg', warehouse: 'Kho 2' },
  { id: 6, category: 'Phụ liệu', material: 'Phẩm màu', quantity: '10 kg', warehouse: 'Kho 2' },
  // Thêm các mục tồn kho khác nếu cần
];

function InventoryForm({ limit }) {
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportStartDate, setExportStartDate] = useState(new Date());
  const [exportEndDate, setExportEndDate] = useState(new Date());

  const handleSave = (data) => {
    if (selectedItem) {
      setInventoryData(prevData =>
        prevData.map(item =>
          item.id === selectedItem.id ? { ...item, ...data } : item
        )
      );
      toast.success('Cập nhật thành công!');
    } else {
      setInventoryData(prevData => [
        ...prevData,
        { id: prevData.length + 1, ...data },
      ]);
      toast.success('Đã lưu thành công!');
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = (id) => {
    setInventoryData(prevData => prevData.filter(item => item.id !== id));
    toast.success('Xóa thành công!');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredData = inventoryData.filter(
    (item) =>
      item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExportData = inventoryData.filter(
    (item) =>
      new Date(item.startDate) >= exportStartDate &&
      new Date(item.endDate) <= exportEndDate
  );

  const dataToDisplay = limit ? filteredData.slice(0, limit) : filteredData;

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="flex items-center gap-2 mb-4">
        <SearchButton placeholder="Tìm kiếm sản phẩm..." onSearch={handleSearch} />
        <AddButton onClick={() => setIsModalOpen(true)} />

        <div className="flex-grow"></div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={format(exportStartDate, 'yyyy-MM-dd')}
            onChange={(e) => setExportStartDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={format(exportEndDate, 'yyyy-MM-dd')}
            onChange={(e) => setExportEndDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
          <ExportExcelButton data={filteredExportData} fileName="Tồn kho.xlsx" />
        </div>
      </div>

      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Loại</th>
            <th className="py-2 px-4 border-b">Tên sản phẩm</th>
            <th className="py-2 px-4 border-b">Số lượng</th>
            <th className="py-2 px-4 border-b">Kho</th>
            <th className="py-2 px-4 border-b">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {dataToDisplay.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.category}</td>
              <td className="py-2 px-4 border-b">{item.material}</td>
              <td className="py-2 px-4 border-b">{item.quantity}</td>
              <td className="py-2 px-4 border-b">{item.warehouse}</td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSave}
        formFields={[
          { name: 'category', label: 'Loại', type: 'text', validation: yup.string().required('Loại là bắt buộc') },
          { name: 'material', label: 'Tên sản phẩm', type: 'text', validation: yup.string().required('Tên sản phẩm là bắt buộc') },
          { name: 'quantity', label: 'Số lượng', type: 'text', validation: yup.string().required('Số lượng là bắt buộc') },
          { name: 'warehouse', label: 'Kho', type: 'text', validation: yup.string().required('Kho là bắt buộc') },
        ]}
        contentLabel={selectedItem ? 'Chỉnh sửa Mục tồn kho' : 'Thêm mới Mục tồn kho'}
        initialData={selectedItem}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default InventoryForm;
