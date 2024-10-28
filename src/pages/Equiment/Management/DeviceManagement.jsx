import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Form, Input, AutoComplete, Modal } from 'antd';
import AddButton from '../../../Components/Button/AddButton';
import ExportExcelButton from '../../../Components/Button/ExportExcelButton';
import SearchButton from '../../../Components/Button/SearchButton';
import FormSample from '../../../Components/Button/FormSample';
import ImportButton from '../../../Components/Button/ImportButton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';

// Import sample template and data for devices
import sampleTemplate from '../../../assets/form/Thiết bị.xlsx';
import Breadcrumb from '../../../Components/Breadcrumb/Breadcrumb';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [areas, setAreas] = useState([]); // To store area names from Area model
  const [form] = Form.useForm();
  const [sortOrderDate, setSortOrderDate] = useState('asc'); // 'asc' cho tăng dần, 'desc' cho giảm dần
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const sortDevicesByDate = () => {
    const sortedDevices = [...filteredDevices].sort((a, b) => {
      if (sortOrderDate === 'asc') {
        return new Date(a.purchaseDate) - new Date(b.purchaseDate);
      } else {
        return new Date(b.purchaseDate) - new Date(a.purchaseDate);
      }
    });
    setFilteredDevices(sortedDevices);
    setSortOrderDate(sortOrderDate === 'asc' ? 'desc' : 'asc'); // Đảo hướng sắp xếp
  };
  
  // Hàm sắp xếp thiết bị theo thứ tự bảng chữ cái tăng dần
  const sortDevicesAlphabetically = (devices) => {
    return devices.sort((a, b) => a.deviceId.localeCompare(b.deviceId));
  };

  // Fetch devices and areas from API
  const fetchDevicesAndAreas = async () => {
    try {
      // Fetch devices
      const deviceResponse = await axios.get(`${apiUrl}/device`);
      const sortedDevices = sortDevicesAlphabetically(deviceResponse.data);
      setDevices(sortedDevices);
      setFilteredDevices(sortedDevices);

      // Fetch areas for dropdown
      const areaResponse = await axios.get(`${apiUrl}/areas`);
      setAreas(areaResponse.data); // Store areas from API
    } catch (error) {
      toast.error('Failed to fetch devices or areas');
    }
  };

  useEffect(() => {
    fetchDevicesAndAreas(); // Fetch data on mount
  }, []);

  // Handle search input change
 // Handle search input change
const handleSearch = (query) => {
  if (!query) {
    // Nếu không có nội dung tìm kiếm, reset lại danh sách thiết bị
    setFilteredDevices(devices);
  } else {
    // Thực hiện lọc danh sách thiết bị theo query
    const filtered = devices.filter((device) =>
      device.deviceId.toLowerCase().includes(query.toLowerCase()) ||
      device.deviceName.toLowerCase().includes(query.toLowerCase()) ||
      device.areaName.toLowerCase().includes(query.toLowerCase()) // Sửa lại 'device.area' thành 'device.areaName'
    );
    setFilteredDevices(filtered);
  }
};


  // Kiểm tra trùng lặp mã thiết bị hoặc tên thiết bị
  const checkDuplicateDevice = (deviceId, deviceIdigone = null) => {
    return devices.some((device) => {
      // Nếu đang thêm mới (deviceId không tồn tại), kiểm tra xem mã thiết bị đã tồn tại chưa
      if (!deviceId) {
        return device.deviceId === deviceId;
      }
      // Nếu đang cập nhật (deviceId đã tồn tại), bỏ qua việc kiểm tra chính thiết bị đó
      return device._id !== deviceId && device.deviceId === deviceIdigone;
    });
  };
  

  // Save new or updated device
  const handleSave = async (values) => {
    const { deviceId, deviceName } = values;
  
    // Nếu đang thêm mới (selectedDevice là null), kiểm tra xem mã thiết bị có bị trùng không
    if (!selectedDevice && checkDuplicateDevice(deviceId)) {
      toast.error('Mã thiết bị đã tồn tại. Vui lòng nhập mã thiết bị khác.');
      return; // Dừng lại không gửi yêu cầu lên API
    }
  
    const deviceData = {
      ...values,
      areaName: values.areaName ? values.areaName.trim() : '',
      purchaseDate: moment(values.purchaseDate).format("YYYY-MM-DD"),
      _id: selectedDevice ? selectedDevice._id : null,
    };
  
    try {
      if (selectedDevice) {
        // Update device
        await axios.put(`${apiUrl}/device/${selectedDevice._id}`, deviceData);
        toast.success('Cập nhật thiết bị thành công!');
      } else {
        // Create new device
        await axios.post(`${apiUrl}/device`, deviceData);
        toast.success('Thêm thiết bị thành công!');
      }
  
      fetchDevicesAndAreas();
      setIsModalOpen(false);
      setSelectedDevice(null);
      form.resetFields(); // Reset form fields after saving
    } catch (error) {
      console.error(error.response);
      toast.error('Failed to save device');
    }
  };
  

  // Delete device by ID
  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/device/${deviceToDelete._id}`);
      toast.success('Xóa thiết bị thành công!');
      fetchDevicesAndAreas();
      setIsDeleteModalOpen(false);
      
    } catch (error) {
      toast.error('Failed to delete device');
    }
  };
  const convertExcelDate = (excelDate) => {
    // Excel's serial date format offset
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return moment(date).format("MM-DD-YYYY");
  };

  const openDeleteModal = (device) => {
    setDeviceToDelete(device); 
    setIsDeleteModalOpen(true); 
  };
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const formattedData = jsonData.map((item) => {
        let purchaseDate = item["Ngày mua"];
        
        // Kiểm tra nếu giá trị ngày là số thì chuyển đổi
        if (!isNaN(purchaseDate)) {
          purchaseDate = convertExcelDate(purchaseDate);
        } else {
          // Sử dụng moment nếu giá trị là chuỗi
          purchaseDate = moment(purchaseDate, ["DD-MM-YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).format("MM-DD-YYYY");
        }
  
        return {
          deviceId: item["Mã thiết bị"],
          deviceName: item["Tên thiết bị"],
          areaName: item["Khu vực sản xuất"],
          model: item["Model thiết bị"],
          technicalSpecifications: item["Thông số kĩ thuật"],
          purchaseDate: purchaseDate,
        };
      });
  
      const promises = formattedData.map(async (device) => {
        try {
          const response = await axios.post(`${apiUrl}/device`, device);
          return response.data;
        } catch (error) {
          toast.error('Failed to save device');
          return null;
        }
      });
  
      Promise.all(promises).then((results) => {
        const addedDevices = results.filter((device) => device !== null);
        setDevices((prevDevices) => [...prevDevices, ...addedDevices]);
        setFilteredDevices((prevFiltered) => [...prevFiltered, ...addedDevices]);
        if (addedDevices.length) {
          toast.success('Thêm thiết bị thành công!');
        }
      });
    };
    reader.readAsArrayBuffer(file);
  };
  
  


  // Open modal to add or edit device
  const openModal = (device = null) => {
    if (device) {
      setSelectedDevice(device);
  
      // Nếu ngày từ API có định dạng khác (ví dụ: "DD-MM-YYYY", "MM/DD/YYYY"), sử dụng moment để parse đúng cách
      const formattedDate = moment(device.purchaseDate, ["DD-MM-YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD");
      console.log (formattedDate)
      form.setFieldsValue({
        ...device,
        purchaseDate: formattedDate, // Chuyển đổi thành định dạng đúng 'YYYY-MM-DD'
      });
    } else {
      setSelectedDevice(null);
      form.resetFields(); // Xóa form để thêm mới
    }
    setIsModalOpen(true);
  };
  
  

  return (
    <div className="p-8 bg-white shadow-md rounded-md">
      <Breadcrumb />
      <div className="flex items-center gap-2 mb-4 mt-2">
        <SearchButton
          placeholder="Tìm kiếm mã thiết bị, tên thiết bị, khu vực..."
          onSearch={(q) => handleSearch(q)}
        />
        <div className="flex items-center gap-2 ml-auto">
          <AddButton onClick={() => openModal()} /> {/* Open modal for new device */}
          <FormSample href={sampleTemplate} label="Tải Form Mẫu" />
          <ImportButton onImport={handleImport}/>
          <ExportExcelButton
            data={devices}
            parentComponentName="DanhSachThietBi"
            headers={[
              { key: 'deviceId', label: 'Mã thiết bị' },
              { key: 'deviceName', label: 'Tên thiết bị' },
              { key: 'areaName', label: 'Khu vực' },
              { key: 'model',label: 'Model' },
              { key: 'technicalSpecifications',label: 'Thông số kỹ thuật' },
              { key: 'purchaseDate',label: 'Ngày mua',
                transform: (purchaseDate) => 
                  purchaseDate ? moment(purchaseDate).format('DD-MM-YYYY') : 'N/A',
               },
            ]}
          />
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Mã thiết bị</th>
            <th className="border px-4 py-2 text-xs">Tên tên thiết bị</th>
            <th className="border px-4 py-2 text-xs">Khu vực sản xuất</th>
            <th className="border px-4 py-2 text-xs">Model thiết bị</th>
            <th className="border px-4 py-2 text-xs">Thông số kĩ thuật</th>
            <th className="border px-4 py-2 text-xs">
                Ngày mua
                <button onClick={sortDevicesByDate} className="ml-2">
                  {sortOrderDate === 'asc' ? '▼' : '▲'} {/* Biểu tượng sắp xếp */}
                </button>
              </th>

            <th className="border px-4 py-2 text-xs">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.map((device, index) => (
            <tr key={device._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center">{device.deviceId}</td>
              <td className="border px-4 py-2 text-sm text-center">{device.deviceName}</td>
              <td className="border px-4 py-2 text-sm text-center">{device.areaName}</td>
              <td className="border px-4 py-2 text-sm text-center">{device.model}</td>
              <td className="border px-4 py-2 text-sm text-center">{device.technicalSpecifications}</td>
              <td className="border px-4 py-2 text-sm text-center">
                {moment(device.purchaseDate).format('DD-MM-YYYY')} {/* Format date */}
              </td>
              <td className="py-2 px-2 text-center border">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => openModal(device)} // Open modal for editing
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteModal(device)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add/Edit Device */}
     <Modal
                title={selectedDevice ? 'Chỉnh sửa Thiết Bị' : 'Thêm mới Thiết Bị'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)} // Đóng modal khi nhấn nút hủy
                onOk={() => form.submit()} // Gọi hàm submit của form khi nhấn nút OK
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave} // Hàm handleSave sẽ được gọi khi form submit thành công
                >
                  <Form.Item
                    label="Mã Thiết Bị"
                    name="deviceId"
                    rules={[{ required: true, message: 'Mã Thiết Bị là bắt buộc' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Tên Thiết Bị"
                    name="deviceName"
                    rules={[{ required: true, message: 'Tên Thiết Bị là bắt buộc' }]}
                  >
                    <Input />
                  </Form.Item>

                  {/* Area Dropdown */}
                  <Form.Item
                    label="Khu Vực"
                    name="areaName"
                    rules={[{ required: true, message: 'Khu Vực là bắt buộc' }]}
                  >
                    <AutoComplete
                      options={areas.map((area) => ({ value: area.areaName }))} 
                      onChange={(value) => {
                        form.setFieldsValue({ areaName: value }); // Đảm bảo trường này được cập nhật đúng
                      }}
                      placeholder="Nhập khu vực"
                      filterOption={(inputValue, option) =>
                        option.value.toLowerCase().includes(inputValue.toLowerCase())
                      }
                    >
                      <Input />
                    </AutoComplete>
                  </Form.Item>

                  <Form.Item
                    label="Model"
                    name="model"
                    rules={[{ required: true, message: 'Model là bắt buộc' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Thông Số Kỹ Thuật"
                    name="technicalSpecifications"
                   
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Ngày Mua"
                    name="purchaseDate"
                    >
                    <Input type="date" />
                  </Form.Item>
                </Form>
              </Modal>
              <Modal
              title="Xác nhận xóa"
              open={isDeleteModalOpen}
              onCancel={() => setIsDeleteModalOpen(false)}
              onOk={handleDelete}
            >
              <p>Bạn có chắc chắn muốn xóa thiết bị này không?</p>
            </Modal>
            
    </div>
  );
};

export default DeviceManagement;
