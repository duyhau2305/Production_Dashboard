import React, { useState } from 'react';
import { Modal, Button, message,Spin } from 'antd';
import axios from 'axios'; // Import Axios
import CustomCalendar from '../../Components/Calendar/CustomCalendar';
import ProductionTaskManagement from './ProductionTaskManagement';

import { toast } from 'react-toastify';

const CustomAddTaskModal = ({ open, onClose, onCancel, selectedDates, setSelectedMachines, setSelectedDates, selectedMachines }) => {
  const [taskData, setTaskData] = useState({}); // Dữ liệu nhiệm vụ sản xuất lưu theo ngày
  const [tasks, setTasks] = useState([]); // Quản lý trạng thái tasks
  const [isLoading, setIsLoading] = useState(false); 
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
  console.log(selectedMachines)
  // Hàm xử lý khi lưu nhiệm vụ cùng ngày đã chọn
  const getDataWithSessionID = async (sessionID) => {
    try {
      const response = await axios.put('https://192.168.1.13/data/tags/T8:Status', 
       
        {
          headers: {
            'Referer': "https://127.0.0.1/",
            'Content-Type': 'application/json',
            'Cookie': `SID=003bbe4229ef448c13b15cd34232d397f4e`
          }
        }
      );
  
      console.log('Data:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
};
const handleSave = async () => {
  setIsLoading(true); 
  const updatedTaskData = { ...taskData };
  let isTaskAdded = false;
  const productionTasks = [];

  if (Array.isArray(selectedDates) && selectedDates.length > 0) {
    selectedDates.forEach(date => {
      if (updatedTaskData[date] && Array.isArray(updatedTaskData[date].tasks) && updatedTaskData[date].tasks.length > 0) {
        selectedMachines.forEach(machine => {
          const tasksForDate = updatedTaskData[date].tasks || []; 
          
          const shifts = tasksForDate.map(task => ({
            shiftName: task.selectedShift,
            status: task.status,
            employeeName: task.selectedEmployees,
          }));

          const formattedTask = {
            id: machine.tasks[0]?._id || null,  // Kiểm tra `machine.tasks` để lấy ID nếu tồn tại
            date: new Date(date).toISOString().split('T')[0],
            deviceId: machine.deviceId, 
            deviceName: machine.deviceName,
            shifts: shifts,
          };

          productionTasks.push(formattedTask);
          isTaskAdded = true;
        });
      }
    });

    if (!isTaskAdded) {
      message.error('Vui lòng thêm ít nhất một nhiệm vụ trước khi lưu.');
      return;
    }

    try {
      for (const task of productionTasks) {
       
          // Nếu không có ID, dùng POST để tạo mới
          await axios.post(`${apiUrl}/productiontask`, task);
          console.log('Created New Task:', task);
       
      }
     
      message.success('Kế hoạch đã được lưu hoặc cập nhật thành công!');

      const refreshedTaskData = await fetchTaskData();
      setTaskData(refreshedTaskData);
      setIsLoading(false);
      window.location.reload();
      setSelectedDates([]);
      setSelectedMachines([]);
      
      onClose();
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu kế hoạch. Vui lòng thử lại.');
      console.error('Error saving production task:', error);
      setIsLoading(false);
    }
  } else {
    message.error('Vui lòng chọn ít nhất một ngày!');
    setIsLoading(false);
  }
};


// Hàm để lấy dữ liệu mới nhất từ API
const fetchTaskData = async () => {
    try {
        const response = await axios.get(`${apiUrl}/productiontask`);
        return response.data;
    } catch (error) {
        console.error('Error fetching task data:', error);
        return {};
    }
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

export default CustomAddTaskModal;