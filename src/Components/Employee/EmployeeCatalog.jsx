import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Form, Input, Select, Button } from 'antd'; // Sử dụng Select cho gợi ý khu vực
import SearchButton from '../Button/SearchButton';
import AddButton from '../Button/AddButton';
import ExportExcelButton from '../Button/ExportExcelButton';
import FormSample from '../Button/FormSample';
import ImportButton from '../Button/ImportButton';
import axios from 'axios'; // Thêm axios để gọi API
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import sampleTemplate from '../../assets/form/Nhân viên.xlsx';
import * as XLSX from 'xlsx';

const { Option } = Select; // Ant Design Select

const EmployeeCatalog = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [areas, setAreas] = useState([]); // State cho danh sách khu vực
  const [form] = Form.useForm(); // Ant Design Form
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const apiUrl =import.meta.env.VITE_API_BASE_URL

  // Fetch employees from API on component mount
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${apiUrl}/employees`); // API GET để lấy danh sách nhân viên
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
    }
  };

  // Fetch areas from API on component mount
  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/areas`); // API GET để lấy danh sách khu vực
      setAreas(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khu vực');
    }
  };
  const openDeleteModal = (employee) => {
    setEmployeeToDelete(employee); 
    setIsDeleteModalOpen(true); 
  };
  useEffect(() => {
    fetchEmployees(); // Gọi API khi component được mount
    fetchAreas(); // Gọi API để lấy khu vực khi component được mount
  }, []);
  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = employees.filter((employee) =>
      employee.employeeCode.toLowerCase().includes(query.toLowerCase()) ||
      employee.employeeName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };
 // Hàm handleImport để nhập dữ liệu từ file Excel

 const handleImport = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Chuyển đổi dữ liệu thành định dạng phù hợp
    const newEmployees = importedData.map((item) => ({
      employeeCode: item['Mã Nhân Viên'],
      employeeName: item['Tên Nhân Viên'],
      areaName: item['Khu Vực'],
    }));

    // Gửi từng khu vực lên API và cập nhật state
    const promises = formattedData.map(async (employee) => {
      try {
        const response = await axios.post(`${apiUrl}/employees`, employee);
        // Cập nhật state ngay sau khi thêm thành công
        return response.data;
      } catch (error) {
        toast.error('Failed to save area');
        return null;
      }
    });

    // Đợi tất cả các yêu cầu hoàn tất và cập nhật bảng
    Promise.all(promises).then((results) => {
      const addedEmployee = results.filter((employee) => employee !== null);
      setEmployees((prevEmployee) => [...prevEmployee, ...addedEmployee ]);
      setFilteredEmployees((prevFiltered) => [...prevFiltered, ...addedEmployee ]);
      toast.success('Thêm khu vực thành công!');
    });
  };
  reader.readAsArrayBuffer(file);
};


  // Handle saving new or edited employee
  const handleSave = async (values) => {
    try {
      if (selectedEmployee) {
        // Update employee
        await axios.put(`${apiUrl}/employees/${selectedEmployee._id}`, values);
        toast.success('Cập nhật nhân viên thành công!');
      } else {
        // Create new employee
        await axios.post(`${apiUrl}/employees`, values);
        toast.success('Thêm nhân viên thành công!');
      }

      fetchEmployees(); // Refresh employee list after save
      setIsModalOpen(false);
      setSelectedEmployee(null);
      form.resetFields(); // Reset form fields after saving
    } catch (error) {
      toast.error('Mã nhân viên không được trùng nhau');
    }
  };

  // Handle delete employee by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/employees/${employeeToDelete._id}`);
      toast.success('Xóa nhân viên thành công!');
      fetchEmployees(); // Refresh employee list after delete
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Lỗi khi xóa nhân viên');
    }
  };

  // Open modal to add or edit employee
  const openModal = (employee = null) => {
    setIsModalOpen(true);
    if (employee) {
      setSelectedEmployee(employee);
      form.setFieldsValue(employee); // Set values in form for editing
    } else {
      setSelectedEmployee(null);
      form.resetFields(); // Reset form for new employee
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <Breadcrumb/>
      {/* Các nút tìm kiếm, thêm mới và xuất Excel */}
      <div className="flex items-center gap-2 mb-4">
        <SearchButton
          placeholder="Tìm kiếm mã nhân viên, tên nhân viên..."
          onSearch={(q) => handleSearch(q)}
        />
        <div className="flex-grow"></div>
        <AddButton onClick={() => openModal()} />
        <FormSample href={sampleTemplate}  label="Tải Form Mẫu" />
        <ImportButton onImport={handleImport}/>
        <ExportExcelButton
            data={filteredEmployees}
            parentComponentName="DanhSachNhanVien"
            headers={[
              { key: 'employeeCode', label: 'Mã nhân viên' },
              { key: 'employeeName', label: 'Tên Ca Làm Việc' },
              { key: 'areaName', label: 'Khu vực sản xuất' },
              
            ]}
          />
      </div>

      {/* Bảng hiển thị danh sách nhân viên */}
      <table className="min-w-full bg-white border  border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Mã Nhân Viên</th>
            <th className="border px-4 py-2 text-xs">Tên Nhân Viên</th>
            <th className="border px-4 py-2 text-xs">Khu Vực</th> {/* Thay đổi từ Tổ sang Khu vực */}
            <th className="border px-4 py-2 text-xs">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee, index) => (
            <tr key={employee._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center">{employee.employeeCode}</td>
              <td className="border px-4 py-2 text-sm text-center">{employee.employeeName}</td>
              <td className="border px-4 py-2 text-sm text-center">{employee.areaName}</td> {/* Hiển thị Khu vực */}
              <td className="py-2 px-2 text-center border">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => openModal(employee)} // Open modal for editing
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteModal(employee)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal nhập dữ liệu nhân viên */}
      <Modal
        title={selectedEmployee ? 'Chỉnh sửa Nhân Viên' : 'Thêm mới Nhân Viên'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Mã Nhân Viên"
            name="employeeCode"
            rules={[{ required: true, message: 'Mã Nhân Viên là bắt buộc' }]}
          >
            <Input placeholder="Nhập mã nhân viên" />
          </Form.Item>

          <Form.Item
            label="Tên Nhân Viên"
            name="employeeName"
            rules={[{ required: true, message: 'Tên Nhân Viên là bắt buộc' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            label="Khu Vực"
            name="areaName"
            rules={[{ required: true, message: 'Khu Vực là bắt buộc' }]}
          >
            <Select placeholder="Chọn khu vực">
              {areas.map((area) => (
                <Option key={area._id} value={area.areaName}>
                  {area.areaName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
              title="Xác nhận xóa"
              open={isDeleteModalOpen}
              onCancel={() => setIsDeleteModalOpen(false)}
              onOk={handleDelete}
            >
              <p>Bạn có chắc chắn muốn xóa ca nhân viên này không?</p>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default EmployeeCatalog;
