import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import axios from 'axios'; // Import Axios
import CustomCalendar from '../../Components/Calendar/CustomCalendar';
import ProductionTaskManagement from './ProductionTaskManagement';

const CustomUpdateModal = ({ open, onClose, onCancel, selectedDates, setSelectedMachines, setSelectedDates, selectedMachines }) => {
  const [taskData, setTaskData] = useState({}); // Dữ liệu nhiệm vụ sản xuất lưu theo ngày
  const [tasks, setTasks] = useState([]); // Quản lý trạng thái tasks
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
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
  const updatedTaskData = { ...taskData };
  let isTaskAdded = false;
  const productionTasks = [];

  if (Array.isArray(selectedDates) && selectedDates.length > 0) {
    selectedDates.forEach((date) => {
      if (
        updatedTaskData[date] &&
        Array.isArray(updatedTaskData[date].tasks) &&
        updatedTaskData[date].tasks.length > 0
      ) {
        selectedMachines.forEach((machine) => {
          const shifts = updatedTaskData[date].tasks.map((task) => ({
            shiftName: task.selectedShift,
            status: task.status,
            employeeName: task.selectedEmployees,
          }));

          const formattedTask = {
            date: new Date(date).toISOString().split('T')[0],
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
      // Gửi các nhiệm vụ qua API
      for (const task of productionTasks) {
        const response = await axios.put(
          `${apiUrl}/productiontask/${task.deviceName}/${task.date}`,
          task
        );

        // Nếu không tồn tại nhiệm vụ, chuyển sang tạo mới
        if (response.status === 404) {
          await axios.post(`${apiUrl}/productiontask`, task);
        }
      }

      message.success('Kế hoạch đã được cập nhật thành công!');
      const refreshedTaskData = await fetchTaskData();
      setTaskData(refreshedTaskData);
      setSelectedDates([]);
      setSelectedMachines([]);
      onClose();
      window.location.reload();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật kế hoạch. Vui lòng thử lại.');
      console.error('Error updating production task:', error);
    }
  } else {
    message.error('Vui lòng chọn ít nhất một ngày!');
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

export default CustomUpdateModal;