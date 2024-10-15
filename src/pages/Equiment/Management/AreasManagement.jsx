import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Form, Input, Modal } from 'antd';
import AddButton from '../../../Components/Button/AddButton';
import ExportExcelButton from '../../../Components/Button/ExportExcelButton';
import SearchButton from '../../../Components/Button/SearchButton';
import FormSample from '../../../Components/Button/FormSample';
import ImportButton from '../../../Components/Button/ImportButton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Import sample template and data for areas
import sampleTemplate from '../../../assets/form/Khu vực sản xuất.xlsx';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';

const AreasManagement = () => {
  const [areas, setAreas] = useState([]); // Initialize empty areas array
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null); // Area for editing
  const [form] = Form.useForm(); // Ant Design form instance

  // Fetch areas from the back-end API
  const fetchAreas = async () => {
    try {
      const response = await axios.get('http://192.168.1.9:5001/api/areas'); // Your API URL
      setAreas(response.data);
      setFilteredAreas(response.data);
    } catch (error) {
      toast.error('Failed to fetch areas management');
    }
  };

  useEffect(() => {
    fetchAreas(); // Fetch areas on component mount
  }, []);

  // Handle search input change
  const handleSearch = (query) => {
    const filtered = areas.filter((area) =>
      area.areaCode.toLowerCase().includes(query.toLowerCase()) ||
      area.areaName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAreas(filtered);
  };

  // Save new or updated area
  const handleSave = async (values) => {
    const areaData = { ...values, _id: selectedArea ? selectedArea._id : null }; // Use _id for MongoDB

    try {
      if (selectedArea) {
        // Update Area
        await axios.put(`http://192.168.1.9:5001/api/areas/${selectedArea._id}`, areaData);
        toast.success('Cập nhật khu vực thành công!');
      } else {
        // Create New Area
        await axios.post('http://192.168.1.9:5001/api/areas', areaData);
        toast.success('Thêm khu vực thành công!');
      }

      fetchAreas(); // Refresh area list after save
      setIsModalOpen(false);
      setSelectedArea(null);
      form.resetFields(); // Reset form fields after saving
    } catch (error) {
      toast.error('Failed to save area');
    }
  };

  // Delete area by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.1.9:5001/api/areas/${id}`);
      toast.success('Xóa khu vực thành công!');
      fetchAreas(); // Refresh area list after delete
    } catch (error) {
      toast.error('Failed to delete area');
    }
  };

  // Open modal to add or edit area
  const openModal = (area = null) => {
    if (area) {
      setSelectedArea(area); // Set selected area for editing
      form.setFieldsValue(area); // Pre-fill form with selected area details
    } else {
      setSelectedArea(null); // Clear selection for new area
      form.resetFields(); // Clear form for new area
    }
    setIsModalOpen(true); // Open the modal
  };

  return (
    
    <div className="p-4 bg-white shadow-md rounded-md">
      <Breadcrumb  />
      <hr />
      <div className="flex items-center gap-2 mb-4 mt-2">
        <SearchButton
          placeholder="Tìm kiếm mã khu vực, tên khu vực..."
          onSearch={(q) => handleSearch(q)}
        />
        <div className="flex items-center gap-2 ml-auto">
          <AddButton onClick={() => openModal()} /> {/* Open modal for new area */}
          <FormSample href={sampleTemplate} label="Tải Form Mẫu" />
          <ImportButton />
          <ExportExcelButton data={areas} fileName="DanhSachKhuVuc.xlsx" />
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Mã Khu Vực</th>
            <th className="border px-4 py-2 text-xs">Tên Khu Vực</th>
            <th className="border px-4 py-2 text-xs">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredAreas.map((area, index) => (
            <tr key={area._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center">{area.areaCode}</td>
              <td className="border px-4 py-2 text-sm text-center">{area.areaName}</td>
              <td className="py-2 px-2 text-center border">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => openModal(area)} // Open modal for editing
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(area._id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add/Edit Area */}
      <Modal
        title={selectedArea ? 'Chỉnh sửa Khu Vực' : 'Thêm mới Khu Vực'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)} // Close the modal on cancel
        onOk={() => form.submit()} // Submit form when clicking OK
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Mã Khu Vực"
            name="areaCode"
            rules={[{ required: true, message: 'Mã Khu Vực là bắt buộc' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên Khu Vực"
            name="areaName"
            rules={[{ required: true, message: 'Tên Khu Vực là bắt buộc' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default AreasManagement;
