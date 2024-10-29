import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Form, Input, Button ,Select} from 'antd';  // Import các thành phần cần thiết từ Ant Design
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchButton from '../../Components/Button/SearchButton';
import AddButton from '../../Components/Button/AddButton';
import ExportExcelButton from '../../Components/Button/ExportExcelButton';
import axios from 'axios';  // Import axios để gọi API
import FormSample from '../../Components/Button/FormSample';
import ImportButton from '../../Components/Button/ImportButton';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import sampleTemplate from '../../assets/form/Nguyên nhân dừng máy.xlsx'
import * as XLSX from 'xlsx';
const ErrorReportCatalog = () => {
  const [errorReports, setErrorReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [deviceSuggestions, setDeviceSuggestions] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [errorToDelete, setErrorToDelete] = useState(null);
  const [form] = Form.useForm(); // Tạo form instance từ Ant Design
  const apiUrl = import.meta.env.VITE_API_BASE_URL

  // Gọi API để lấy danh sách issue
  const fetchErrorReports = async () => {
    try {
      const response = await axios.get(`${apiUrl}/issue`);
      setErrorReports(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải nguyên nhân');
    }
  };

  // Gọi API để lấy danh sách deviceName từ model Device
  const fetchDeviceSuggestions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/device`);
      setDeviceSuggestions(response.data); // Giả định rằng response trả về danh sách thiết bị
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thiết bị');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchErrorReports();
    fetchDeviceSuggestions();
  }, []);

  // Hàm lưu issue (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    try {
      const values = await form.validateFields(); // Lấy và validate dữ liệu từ form
      if (selectedReport) {
        // Cập nhật issue
        await axios.put(`${apiUrl}/issue/${selectedReport._id}`, values);
        toast.success('Cập nhật nguyên nhân  thành công!');
      } else {
        // Thêm mới issue
        await axios.post(`${apiUrl}/issue`, values);
        toast.success('Thêm mới nguyên nhân  thành công!');
      }
      fetchErrorReports();  // Tải lại dữ liệu sau khi thêm/cập nhật
      setIsModalOpen(false);
      setSelectedReport(null);
      form.resetFields(); // Reset form sau khi lưu
    } catch (error) {
      toast.error('Lỗi khi lưu nguyên nhân');
    }
  };
  const openDeleteModal = (error) => {
    setErrorToDelete(error); 
    setIsDeleteModalOpen(true); 
  };

  // Hàm xóa issue
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/issue/${errorToDelete._id}`);
      toast.success('Xóa nguyên nhân thành công!');
      fetchErrorReports();  // Tải lại dữ liệu sau khi xóa
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Lỗi khi xóa nguyên nhân');
    }
  };
  const handleImport = (file) => {
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
        // Hàm chuyển đổi giá trị thập phân từ Excel sang thời gian
        const convertExcelTimeToHHmm = (excelTime) => {
          const totalMinutes = Math.round(excelTime * 24 * 60); // Chuyển đổi thành phút
          const hours = Math.floor(totalMinutes / 60); // Lấy giờ
          const minutes = totalMinutes % 60; // Lấy phút
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; // Định dạng HH:mm
        };
  
        // Chuyển đổi dữ liệu từ Excel sang định dạng cần thiết
        const formattedData = jsonData.map((item) => {
          const breakTimeRanges = item['Thời Gian Nghỉ Ngơi']
            ? item['Thời Gian Nghỉ Ngơi'].split(',').map((range) => {
                const [start, end] = range.split('-').map((t) => t.trim());
                return {
                  startTime: moment(start, ['H:mm', 'HH:mm'], true).isValid()
                    ? start
                    : convertExcelTimeToHHmm(parseFloat(start)),
                  endTime: moment(end, ['H:mm', 'HH:mm'], true).isValid()
                    ? end
                    : convertExcelTimeToHHmm(parseFloat(end)),
                };
              })
            : [];
  
          return {
            shiftCode: item['Mã Ca Làm Việc'] || '',
            shiftName: item['Tên Ca Làm Việc'] || '',
            startTime: moment(item['Thời Gian Vào Ca'], ['H:mm', 'HH:mm'], true).isValid()
              ? moment(item['Thời Gian Vào Ca'], 'HH:mm').format('HH:mm')
              : convertExcelTimeToHHmm(parseFloat(item['Thời Gian Vào Ca'])),
            endTime: moment(item['Thời Gian Tan Ca'], ['H:mm', 'HH:mm'], true).isValid()
              ? moment(item['Thời Gian Tan Ca'], 'HH:mm').format('HH:mm')
              : convertExcelTimeToHHmm(parseFloat(item['Thời Gian Tan Ca'])),
            breakTime: breakTimeRanges,
          };
        });
  
        console.log('Imported Data:', formattedData); // Kiểm tra dữ liệu đã nhập
  
        // Kiểm tra dữ liệu hợp lệ
        const validData = formattedData.filter(
          (shift) => shift.startTime !== null && shift.endTime !== null
        );
  
        if (validData.length === 0) {
          toast.error('Không có dữ liệu hợp lệ để thêm.');
          return;
        }
  
        // Gửi dữ liệu hợp lệ lên API
        const promises = validData.map(async (shift) => {
          try {
            const response = await axios.post(`${apiUrl}/workShifts`, shift);
            return response.data;
          } catch (error) {
            console.error('Error saving shift:', error);
            toast.error(`Lỗi khi lưu ca làm việc: ${error.message}`);
            return null;
          }
        });
  
        const results = await Promise.all(promises);
        const addedShifts = results.filter((shift) => shift !== null);
  
        if (addedShifts.length) {
          setWorkShifts((prevShifts) => [...prevShifts, ...addedShifts]);
          toast.success('Thêm ca làm việc thành công!');
        } else {
          toast.info('Không có ca làm việc nào được thêm.');
        }
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
      }
    };
  
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      toast.error('Lỗi khi đọc file. Vui lòng thử lại.');
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  
 
  // Hàm mở modal khi thêm/sửa
  const openModal = (report = null) => {
    setIsModalOpen(true);
    if (report) {
      setSelectedReport(report);
      form.setFieldsValue(report);  // Đặt giá trị cho form khi chỉnh sửa
    } else {
      setSelectedReport(null);
      form.resetFields();  // Reset form khi thêm mới
    }
  };

  // Hàm lọc báo cáo lỗi theo từ khóa tìm kiếm
  const filteredReports = errorReports.filter(
    (report) =>
      report.reasonCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reasonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.deviceNames && report.deviceNames.join(', ').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <Breadcrumb />
      <hr />
      {/* Các nút tìm kiếm, thêm mới và xuất Excel */}
      <div className="flex items-center gap-2 mb-4 mt-3">
        <SearchButton placeholder="Tìm kiếm mã lỗi, mã thiết bị..." onSearch={(q) => setSearchQuery(q)} />
        <div className="flex items-center gap-2 ml-auto">
          <AddButton onClick={() => openModal()} />
          <FormSample href={sampleTemplate} label='Tải Form Mẫu'/>
          <ImportButton onImport={(file) => handleImport(file)} />

          <ExportExcelButton
            data={errorReports}
            parentComponentName="DanhSachNguyenNhan"
            headers={[
              { key: 'reasonCode', label: 'Mã nguyên nhân' },
              { key: 'reasonName', label: 'Tên nguyên nhân' },
              { key: 'deviceStatus', label: 'Trạng thái thiết bị' },
              {
                key: 'deviceNames',
                label: 'Tên thiết bị',
                // Chuyển đổi mảng thành chuỗi
                transform: (deviceNames) => deviceNames.join(', '),
              },
            ]}
          />

        </div>
      </div>

      {/* Bảng hiển thị danh sách báo cáo lỗi */}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Mã nguyên nhân</th>
            <th className="border px-4 py-2 text-xs">Tên nguyên nhân</th>
            <th className="border px-4 py-2 text-xs">Trạng thái thiết bị</th>
            <th className="border px-4 py-2 text-xs">Tên thiết bị</th>
            <th className="border px-4 py-2 text-xs">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report, index) => (
            <tr key={report._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center w-44">{report.reasonCode}</td>
              <td className="border px-4 py-2 text-sm  text-center  w-44">{report.reasonName}</td>
              <td className="border px-4 py-2 text-sm  text-center  w-44">{report.deviceStatus}</td>
              <td className="border px-4 py-2 text-sm text-center w-86 text-wrap">
                {report.deviceNames && report.deviceNames.join(', ')}
              </td>
              <td className="py-2 px-2 text-center border">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => openModal(report)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteModal(report)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa báo cáo lỗi */}
      <Modal
        title={selectedReport ? 'Chỉnh sửa Nguyên Nhân' : 'Thêm mới Nguyên Nhân'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
          form.resetFields(); // Reset form khi đóng modal
        }}
        onOk={handleSave}
        okText={selectedReport ? 'OK' : 'OK'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã Nguyên Nhân"
            name="reasonCode"
            rules={[{ required: true, message: 'Mã Nguyên Nhân là bắt buộc' }]}
          >
            <Input placeholder="Nhập mã nguyên nhân" />
          </Form.Item>

          <Form.Item
            label="Tên Nguyên Nhân"
            name="reasonName"
            rules={[{ required: true, message: 'Tên Nguyên Nhân là bắt buộc' }]}
          >
            <Input placeholder="Nhập tên nguyên nhân" />
          </Form.Item>

          <Form.Item
            label="Thiết Bị"
            name="deviceNames"
            rules={[{ required: true, message: 'Thiết Bị là bắt buộc' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn thiết bị"
              allowClear
            >
              {deviceSuggestions.map((device) => (
                <Option key={device.deviceName} value={device.deviceName}>
                  {device.deviceName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Trường nhập deviceStatus */}
          <Form.Item
              label="Trạng thái thiết bị"
              name="deviceStatus"
              rules={[{ required: true, message: 'Trạng thái thiết bị là bắt buộc' }]}
            >
              <Select placeholder="Chọn trạng thái thiết bị">
                <Select.Option value="DỪNG">DỪNG</Select.Option>
                <Select.Option value="CHỜ">CHỜ</Select.Option>
                <Select.Option value="TẮT MÁY">TẮT MÁY</Select.Option>
                
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
              <p>Bạn có chắc chắn muốn xóa nguyên nhân này không?</p>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ErrorReportCatalog;
