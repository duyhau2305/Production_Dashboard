import React, { useState, useEffect } from 'react';
import { Dropdown, Button, AutoComplete, Select, message } from 'antd';
import { UserOutlined, PlusOutlined, CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import axios from 'axios';

const ProductionTaskManagement = ({ selectedMachines, setTaskData, taskData, selectedDates }) => {
  const [tasks, setTasks] = useState([]); // State để lưu nhiệm vụ
  const [employees, setEmployees] = useState([]); // State để lưu danh sách nhân viên từ API
  const [shifts, setShifts] = useState([]); // State để lưu danh sách ca làm việc từ API
  const [devices, setDevices] = useState([]); // State để lưu danh sách thiết bị từ API
  const [filteredDevices, setFilteredDevices] = useState([]); // State để lưu danh sách thiết bị đã lọc
  const [isMachineListOpen, setIsMachineListOpen] = useState(false); // Để mở/đóng danh sách máy
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
  // Gọi API để lấy danh sách nhân viên, ca làm việc và thiết bị
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await axios.get(`${apiUrl}/employees`);
        setEmployees(employeesResponse.data);

        const shiftsResponse = await axios.get(`${apiUrl}/workShifts`);
        setShifts(shiftsResponse.data);

        const devicesResponse = await axios.get(`${apiUrl}/device`);
        setDevices(devicesResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
      }
    };

    fetchData(); // Gọi hàm để lấy dữ liệu
  }, []);

  // Lọc danh sách thiết bị theo selectedMachines
  useEffect(() => {
    const filtered = devices.filter((device) => {
      return selectedMachines.some((selectedMachine) => selectedMachine.deviceName === device.deviceName);
    });
    setFilteredDevices(filtered); // Lưu danh sách thiết bị đã lọc
  }, [devices, selectedMachines]);

  // Hàm để thêm nhiệm vụ mới
  const addTask = () => {
    setTasks([...tasks, { selectedShift: '', selectedEmployees: [], selectedEmployee: '', status: 'Dừng' }]);
  };

  // Hàm để xóa nhiệm vụ
  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  // Cập nhật ca làm việc
  const updateShift = (index, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].selectedShift = value;
    setTasks(updatedTasks);
  };

  // Cập nhật nhân viên
  const updateEmployee = (index, employee) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].selectedEmployee = employee;
    setTasks(updatedTasks);
  };

  // Thêm nhân viên vào danh sách
  const addEmployee = (index) => {
    const updatedTasks = [...tasks];
    if (updatedTasks[index].selectedEmployee && !updatedTasks[index].selectedEmployees.includes(updatedTasks[index].selectedEmployee)) {
      updatedTasks[index].selectedEmployees.push(updatedTasks[index].selectedEmployee);
      updatedTasks[index].selectedEmployee = ''; // Reset selectedEmployee
    }
    setTasks(updatedTasks);
  };

  // Xóa nhân viên
  const removeEmployee = (taskIndex, employee) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].selectedEmployees = updatedTasks[taskIndex].selectedEmployees.filter((e) => e !== employee);
    setTasks(updatedTasks);
  };

  // Toggle danh sách máy
  const toggleMachineList = () => {
    setIsMachineListOpen(!isMachineListOpen);
  };

  // Xử lý khi click vào các div màu (trạng thái nhiệm vụ)
  const handleDivClick = (index, status) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = status; // Cập nhật trạng thái nhiệm vụ
    setTasks(updatedTasks);
  };

  // Xử lý khi ấn nút Xác nhận (Hiển thị nhiệm vụ trên Calendar)
  const handleConfirm = () => {
    if (tasks.length === 0) {
      message.error('Vui lòng thêm ít nhất một nhiệm vụ trước khi xác nhận!');
      return;
    }

    const updatedTaskData = { ...taskData };
    if (Array.isArray(selectedDates) && selectedDates.length > 0) {
      selectedDates.forEach(date => {
        updatedTaskData[date] = {
          tasks: [...(updatedTaskData[date]?.tasks || []), ...tasks], // Lưu các nhiệm vụ mới
          machines: selectedMachines, // Lưu các máy đã chọn
        };
      });

      setTaskData(updatedTaskData);
      message.success('Nhiệm vụ đã được xác nhận!');
      setTasks([]); // Reset các nhiệm vụ sau khi xác nhận
    } else {
      message.error('Vui lòng chọn ít nhất một ngày!');
    }
  };

  // Xử lý khi ấn nút Hủy bỏ (Xóa các task)
  const handleCancel = () => {
    setTasks([]); // Xóa tất cả các task đã tạo
    message.info('Các nhiệm vụ đã được hủy bỏ.');
  };

  return (
    <div className="w-full p-2">
      <h2 className="font-semibold mb-4">Quản lý nhiệm vụ sản xuất</h2>

      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center">
          <span className="font-semibold mr-2">Danh sách máy</span>
          <Button onClick={toggleMachineList} icon={isMachineListOpen ? <UpOutlined /> : <DownOutlined />}>
            {selectedMachines.length} Thiết bị
          </Button>
        </div>
      </div>

      {/* Hiển thị danh sách máy đã lọc */}
      <div className="overflow-y-scroll">
        {isMachineListOpen && (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-h-60 overflow-x-scroll mb-4">
            <h2 className="font-semibold mb-2">Thiết bị đã chọn</h2>
            <ul className="list-disc pl-5">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <li key={device._id} className="mb-1 flex justify-between items-center">
                    <span>{device.deviceName}</span>
                    <CloseOutlined className="text-red-500 cursor-pointer" />
                  </li>
                ))
              ) : (
                <p>Chưa có thiết bị nào được chọn.</p>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Nhiệm vụ sản xuất */}
      {tasks.map((task, index) => (
        <div key={index} className="bg-gray-100 rounded-md p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Ca làm việc</span>
            <CloseOutlined className="text-gray-600 cursor-pointer" onClick={() => removeTask(index)} />
          </div>

          {/* Dropdown cho việc chọn ca làm việc */}
          <div className="mb-2">
            <Select
              placeholder="Chọn ca làm việc"
              value={task.selectedShift}
              onChange={(value) => updateShift(index, value)}
              style={{ width: '100%' }}
            >
              {shifts.map((shift) => (
                <Select.Option key={shift._id} value={shift.shiftName}>
                  {shift.shiftName}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Dropdown cho việc chọn nhân viên */}
          <div className="mb-2 flex">
            <Select
              placeholder="Chọn nhân viên"
              value={task.selectedEmployee}
              onChange={(value) => updateEmployee(index, value)}
              onClick={() => addEmployee(index)}
              style={{ width: '100%', marginRight: '8px' }}
            >
              {employees.map((employee) => (
                <Select.Option key={employee._id} value={employee.employeeName}>
                  {employee.employeeName}
                </Select.Option>
              ))}
            </Select>
           
          </div>

          {/* Hiển thị danh sách nhân viên đã chọn */}
          <div className="max-h-32 overflow-y-auto mb-2">
            {task.selectedEmployees.map((employee, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded mb-1 " placeholder="Chọn nhân viên">
                <div className="flex items-center">
                  <UserOutlined className="mr-2" />
                  <span>{employee}</span>
                </div>
                <CloseOutlined
                  className="text-gray-600 cursor-pointer"
                  onClick={() => removeEmployee(index, employee)}
                />
              </div>
            ))}
          </div>

          {/* Divs for status colors */}
          <div className="h-12 bg-white border border-black rounded-lg overflow-hidden flex m-2">
            <div
              className={`w-1/3 border-l-4 border-l-red-600 cursor-pointer ${task.status === 'Dừng' ? 'bg-red-600' : ''}`}
              onClick={() => handleDivClick(index, 'Dừng')}
            />
            <div
              className={`w-1/3 border-l-4 border-l-yellow-600 cursor-pointer ${task.status === 'Chờ' ? 'bg-yellow-500' : ''}`}
              onClick={() => handleDivClick(index, 'Chờ')}
            />
            <div
              className={`w-1/3 cursor-pointer border-l-4 border-l-green-600 ${task.status === 'Chạy' ? 'bg-green-500' : ''}`}
              onClick={() => handleDivClick(index, 'Chạy')}
            />
          </div>
        </div>
      ))}

      {/* Nút để thêm nhiệm vụ sản xuất mới */}
      <Button className="w-full bg-gray-100 text-gray-600 flex items-center justify-center" onClick={addTask}>
        <PlusOutlined className="mr-2" />
        Thêm nhiệm vụ sản xuất
      </Button>

      {/* Nút Xác nhận và Hủy bỏ */}
      <div className="grid grid-cols-2 mt-2">
        <Button className="mr-2 bg-gray-100 text-gray-600 flex items-center justify-center" onClick={handleCancel}>
          Hủy bỏ
        </Button>
        <Button className="bg-gray-100 text-gray-600 flex items-center justify-center" onClick={handleConfirm}>
          Xác nhận
        </Button>
      </div>
    </div>
  );
};

export default ProductionTaskManagement;
