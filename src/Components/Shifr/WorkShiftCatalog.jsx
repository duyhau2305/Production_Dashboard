import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Form,Modal } from 'antd';
import AddButton from '../Button/AddButton';
import ExportExcelButton from '../Button/ExportExcelButton';
import DynamicModal from './DynamicModal';
import SearchButton from '../Button/SearchButton';
import FormSample from '../Button/FormSample';
import ImportButton from '../Button/ImportButton';
import * as XLSX from 'xlsx/xlsx.mjs';

import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


// Import file mẫu Excel từ thư mục assets
import sampleTemplate from '../../assets/form/Ca làm việc.xlsx';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

const WorkShiftCatalog = () => {
  const [workShifts, setWorkShifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const apiUrl =import.meta.env.VITE_API_BASE_URL;

  // Fetch work shifts from backend
  const fetchWorkShifts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/workShifts`);
      setWorkShifts(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ca làm việc');
    }
  };

  useEffect(() => {
    fetchWorkShifts();
  }, []);

  // Handle save work shift
  const handleSave = async (values) => {
    console.log('Received values from form:', values); // Log giá trị form nhận được
  
    
    const breakTimeData = values.breakTime
      ? values.breakTime.map((item) => {
          if (item && item.range) {
            // Chỉ format nếu giá trị range có tồn tại
            return {
              startTime: item.range[0] ? item.range[0].format('HH:mm') : null,
              endTime: item.range[1] ? item.range[1].format('HH:mm') : null,
            };
          }
          return null;
        }).filter(item => item !== null) // Loại bỏ các item null
      : [];
  
    const shiftData = {
      ...values,
      startTime: values.startTime ? values.startTime.format('HH:mm') : null,
      endTime: values.endTime ? values.endTime.format('HH:mm') : null,
      breakTime: breakTimeData
    };
  
    console.log('Formatted shiftData:', shiftData); 
  
    try {
      if (selectedShift) {
        // Update work shift
        console.log('Updating work shift:', selectedShift._id);
        await axios.put(`${apiUrl}/workShifts/${selectedShift._id}`, shiftData);
        toast.success('Cập nhật ca làm việc thành công!');
      } else {
        // Create new work shift
        console.log('Creating new work shift', shiftData.breakTimeData);
        await axios.post(`${apiUrl}/workShifts`, shiftData);
        toast.success('Thêm ca làm việc thành công!');
      }
      fetchWorkShifts();
      setIsModalOpen(false);
      setSelectedShift(null);
      form.resetFields();
    } catch (error) {
      console.log('Error when saving work shift:', error); // Log lỗi nếu xảy ra
      toast.error('Lỗi khi lưu ca làm việc');
    }
  };
  const openDeleteModal = (shift) => {
    setShiftToDelete(shift); 
    setIsDeleteModalOpen(true); 
  };
  // Handle delete work shift
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/workShifts/${shiftToDelete._id}`);
      toast.success('Xóa ca làm việc thành công!');
      fetchWorkShifts();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Lỗi khi xóa ca làm việc');
    }
  };

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredShifts = workShifts.filter(
    (shift) =>
      shift.shiftCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.shiftName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Xử lý việc tải file Excel lên
  const handleImport = (file) => {
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
        // Hàm chuyển đổi số thập phân từ Excel sang thời gian HH:mm
        const convertExcelTimeToHHmm = (excelTime) => {
          if (isNaN(excelTime)) {
            console.warn(`Invalid time format: "${excelTime}"`);
            return null;
          }
          const totalMinutes = Math.round(parseFloat(excelTime) * 24 * 60); // Chuyển đổi thành phút
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
                  startTime: convertExcelTimeToHHmm(start) || '00:00',
                  endTime: convertExcelTimeToHHmm(end) || '00:30',
                };
              })
            : [];
  
          return {
            shiftCode: item['Mã Ca Làm Việc'] || '',
            shiftName: item['Tên Ca Làm Việc'] || '',
            startTime: convertExcelTimeToHHmm(item['Thời Gian Vào Ca']),
            endTime: convertExcelTimeToHHmm(item['Thời Gian Tan Ca']),
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
  
  
  

  const openModal = (shift = null) => {
    setSelectedShift(shift);
  
    if (shift) {
      // Đảm bảo chuyển đổi breakTime thành moment cho TimePicker và RangePicker
      form.setFieldsValue({
        shiftCode: shift.shiftCode,
        shiftName: shift.shiftName,
        startTime: shift.startTime ? moment(shift.startTime, 'HH:mm') : null,
        endTime: shift.endTime ? moment(shift.endTime, 'HH:mm') : null,
        breakTime: shift.breakTime
          ? shift.breakTime.map((bt) => ({
              range: [moment(bt.startTime, 'HH:mm'), moment(bt.endTime, 'HH:mm')],
            }))
          : [],
      });
    } else {
      // Reset lại form khi thêm mới
      form.resetFields();
    }
    setIsModalOpen(true);
  };
  
  

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
       <Breadcrumb />
       <hr />
      <div className="flex items-center gap-2 mb-4 mt-2">
        <SearchButton placeholder="Tìm kiếm mã ca, tên ca..." onSearch={(q) => handleSearch(q)} />
        <div className="flex items-center gap-2 ml-auto">
          <AddButton onClick={() => openModal()} />
          <FormSample href={sampleTemplate} label="Tải Form Mẫu" />
          <ImportButton onImport={handleImport} />
         
          <ExportExcelButton
            data={workShifts}
            parentComponentName="DanhSachCaLamViec"
            headers={[
              { key: 'shiftCode', label: 'Mã Ca Làm Việc' },
              { key: 'shiftName', label: 'Tên Ca Làm Việc' },
              { key: 'startTime', label: 'Thời Gian Vào Ca' },
              { key: 'endTime', label: 'Thời Gian Tan Ca' },
              {
                key: 'breakTime',
                label: 'Thời Gian Nghỉ Ngơi',
                // Chuyển đổi breakTime thành chuỗi để hiển thị đúng trong Excel
                transform: (breakTime) =>
                  breakTime && breakTime.length > 0
                    ? breakTime
                        .map((bt) => `${bt.startTime || 'N/A'} - ${bt.endTime || 'N/A'}`)
                        .join(', ')
                    : 'N/A',
              },
            ]}
          />

        </div>
      </div>

      {/* Bảng hiển thị danh sách ca làm việc */}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Mã Ca Làm Việc</th>
            <th className="border px-4 py-2 text-xs">Tên Ca Làm Việc</th>
            <th className="border px-4 py-2 text-xs">Thời Gian Vào Ca</th>
            <th className="border px-4 py-2 text-xs">Thời Gian Tan Ca</th>
            <th className="border px-4 py-2 text-xs">Thời Gian Nghỉ Ngơi</th>
            <th className="border px-4 py-2 text-xs">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredShifts.map((shift, index) => (
            <tr key={shift._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center">{shift.shiftCode}</td>
              <td className="border px-4 py-2 text-sm text-center">{shift.shiftName}</td>
              <td className="border px-4 py-2 text-sm text-center">{shift.startTime}</td>
              <td className="border px-4 py-2 text-sm text-center">{shift.endTime}</td>
              <td className="border px-4 py-2 text-sm text-center">
                {shift.breakTime && shift.breakTime.length > 0
                  ? shift.breakTime.map((bt, i) => (
                      <div key={i}>
                        {bt.startTime || 'N/A'} - {bt.endTime || 'N/A'}
                      </div>
                    ))
                  : 'N/A'}
              </td>
              <td className="py-2 px-2 text-center border">
                <button
                  className="mr-2 text-blue-500 hover:text-blue-700"
                  onClick={() => openModal(shift)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteModal(shift) }
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for add/edit work shift */}
      <DynamicModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        form={form}
        title={selectedShift ? 'Chỉnh sửa Ca Làm Việc' : 'Thêm mới Ca Làm Việc'}
        fields={[
          {
            name: 'shiftCode',
            label: 'Mã Ca Làm Việc',
            type: 'input',
            rules: [{ required: true, message: 'Mã Ca Làm Việc là bắt buộc' }],
          },
          {
            name: 'shiftName',
            label: 'Tên Ca Làm Việc',
            type: 'input',
            rules: [{ required: true, message: 'Tên Ca Làm Việc là bắt buộc' }],
          },
          {
            name: 'startTime',
            label: 'Thời gian vào ca',
            type: 'timePicker',
            rules: [{ required: true, message: 'Thời Gian Bắt Đầu là bắt buộc' }],
          },
          {
            name: 'endTime',
            label: 'Thời gian tan ca',
            type: 'timePicker',
            rules: [{ required: true, message: 'Thời Gian Kết Thúc là bắt buộc' }],
          },
          {
            name: 'breakTime',
            label: 'Thời gian nghỉ ngơi',
            type: 'rangePicker',
            rules: [{ required: true, message: 'Thời gian nghỉ ngơi là bắt buộc' }],
          },
        ]}
      />
       <Modal
              title="Xác nhận xóa"
              open={isDeleteModalOpen}
              onCancel={() => setIsDeleteModalOpen(false)}
              onOk={handleDelete}
            >
              <p>Bạn có chắc chắn muốn xóa ca làm việc này không?</p>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default WorkShiftCatalog;
