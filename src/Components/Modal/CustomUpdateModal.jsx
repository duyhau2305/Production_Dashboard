import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import axios from 'axios'; // Import Axios
import CustomCalendar from '../../Components/Calendar/CustomCalendar';
import ProductionTaskManagement from './ProductionTaskManagement';

import { toast } from 'react-toastify';

const CustomUpdateModal = ({ open, onClose, onCancel, selectedDates, setSelectedMachines, setSelectedDates, selectedMachines }) => {
  const [taskData, setTaskData] = useState({}); // Dữ liệu nhiệm vụ sản xuất lưu theo ngày
  const [tasks, setTasks] = useState([]); // Quản lý trạng thái tasks
  

  // Hàm xử lý khi lưu nhiệm vụ cùng ngày đã chọn
  const handleSave = async () => {
    const updatedTaskData = { ...taskData };

    let isTaskAdded = false;
    const productionTasks = [];

    selectedDates.forEach(date => {
      if (selectedMachines.length > 0) {
        if (!updatedTaskData[date]) {
          updatedTaskData[date] = {
            machines: selectedMachines,
            tasks: [], // Bắt buộc phải có ít nhất một nhiệm vụ
          };
        }
        // Đảm bảo có ít nhất một nhiệm vụ cho ngày được chọn
        if (updatedTaskData[date].tasks.length > 0) {
          isTaskAdded = true; // Có nhiệm vụ được thêm
        }
      }
    });
    if (!isTaskAdded) {
      message.error('Vui lòng thêm ít nhất một nhiệm vụ trước khi lưu.');
      return;
    }
    try {
      const response = await axios.get(`http://192.168.1.11:5001/api/updateTask`);
      console.log(response)
      if(response.data.status == "success"){
        message.success('Bật thành công');
      }
      console.log(response)
    } catch (error) {
      console.error('Failed to fetch telemetry data:', error.message);
      throw new Error('Failed to fetch telemetry data');
    }
    setTaskData(updatedTaskData);
    
    console.log('Dữ liệu nhiệm vụ đã lưu:', updatedTaskData);
    
    setSelectedDates([]); 
    setSelectedMachines([]); 
    
    // Thông báo thành công và đóng modal
    message.success('Kế hoạch đã được lưu thành công!');
    onClose(); 
  };

  // Hàm xử lý khi nhấn nút Hủy bỏ
  const handleCancel = () => {
    setSelectedDates([]); // Xóa các ngày đã chọn
    onCancel(); // Gọi hàm onCancel nếu được truyền vào
    onClose();
    setTaskData([]); // Xóa dữ liệu nhiệm vụ
    setTasks([]); // Xóa các nhiệm vụ đã tạo
  };

  // Hàm để lấy thông tin nhiệm vụ đã lưu cho một ngày cụ thể
  const getTaskForDate = (selectedDate) => taskData[selectedDate] || null;
  console.log(taskData);

  return (
    <Modal
      title="Nhiệm vụ sản xuất"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy bỏ
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Lưu kế hoạch
        </Button>,
      ]}
      width={1200}
    >
      <div className="grid grid-cols-5 gap-1 h-100">
        <div className="p-1 col-span-4">
          {/* Hiển thị lịch với các ngày đã chọn */}
          <CustomCalendar
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            getTaskForDate={getTaskForDate} // Lấy thông tin nhiệm vụ đã lưu cho từng ngày
            taskData={taskData} // Truyền dữ liệu nhiệm vụ đầy đủ để hiển thị trên lịch
          />
        </div>
        <div className="col-span-1">
          {/* Quản lý nhiệm vụ sản xuất */}
          <ProductionTaskManagement 
            selectedMachines={selectedMachines}
            setSelectedMachines={setSelectedMachines}
            setTaskData={setTaskData} // Cập nhật dữ liệu nhiệm vụ khi chỉnh sửa hoặc thêm mới
            taskData={taskData} // Truyền dữ liệu nhiệm vụ hiện tại để cho phép chỉnh sửa/cập nhật
            tasks={tasks} // Truyền tasks hiện tại để quản lý
            setTasks={setTasks} // Truyền setTasks để cập nhật nhiệm vụ
            selectedDates={selectedDates || []}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CustomUpdateModal;
