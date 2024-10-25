import React, { useState, useEffect } from 'react';
import { Modal, Calendar, Checkbox, Select, Tooltip } from 'antd';
import axios from 'axios';

const MachineScheduleModal = ({ open, onClose }) => {
  const [productionTasks, setProductionTasks] = useState([]); // Lưu dữ liệu lịch sản xuất từ API
  const [devices, setDevices] = useState([]); // Lưu danh sách thiết bị từ API
  const [areas, setAreas] = useState([]); // Lưu danh sách khu vực từ API
  const [filteredDevices, setFilteredDevices] = useState([]); // Danh sách thiết bị theo khu vực
  const [selectedArea, setSelectedArea] = useState('all'); // Khu vực được chọn
  const [checkedDevices, setCheckedDevices] = useState([]); // Thiết bị có lịch trong ngày
  const [selectedDate, setSelectedDate] = useState(null); // Ngày được chọn trên lịch
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
  // Gọi API để lấy dữ liệu lịch sản xuất và thiết bị
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu nhiệm vụ sản xuất
        const tasksResponse = await axios.get(`${apiUrl}/productiontask`);
        setProductionTasks(tasksResponse.data);

        // Lấy dữ liệu thiết bị
        const devicesResponse = await axios.get(`${apiUrl}/device`);
        setDevices(devicesResponse.data);
        setFilteredDevices(devicesResponse.data); // Hiển thị tất cả thiết bị lúc đầu

        // Lấy dữ liệu khu vực
        const areasResponse = await axios.get(`${apiUrl}/areas`);
        setAreas(areasResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Lọc thiết bị theo khu vực dựa trên tên khu vực
  useEffect(() => {
    if (selectedArea === 'all') {
      setFilteredDevices(devices); // Nếu chọn "Toàn bộ khu vực", hiển thị tất cả thiết bị
    } else {
      // Lấy tên khu vực được chọn
      const selectedAreaName = areas.find(area => area._id === selectedArea)?.areaName.trim().toLowerCase();
  
      // Lọc danh sách thiết bị dựa theo tên khu vực
      const filtered = devices.filter(device => device.areaName.trim().toLowerCase() === selectedAreaName);
      setFilteredDevices(filtered);
    }
  }, [selectedArea, devices, areas]);

  // Hiển thị tổng số thiết bị đã được lên lịch làm việc trong mỗi ngày
  const dateCellRender = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    const tasksForDate = productionTasks.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === dateString
    );

    // Nếu có thiết bị trong ngày đó, thêm style để đổi màu nền cho cả ô ngày với Tailwind CSS
    if (tasksForDate.length > 0) {
      return (
        <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center">
          {tasksForDate.length} Thiết bị
        </div>
      );
    }

    return null;
  };

  // Khi người dùng chọn một ngày trên lịch
  const handleDateSelect = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    const tasksForDate = productionTasks.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === dateString
    );

    // Lấy danh sách các thiết bị có lịch làm việc trong ngày
    const devicesWithTasks = tasksForDate.map(task => task.deviceName);
    setCheckedDevices(devicesWithTasks); // Cập nhật các thiết bị có lịch làm việc
    setSelectedDate(value); // Lưu ngày đã chọn
  };

  // Lấy nhiệm vụ sản xuất của một thiết bị cụ thể cho ngày được chọn
  const getTaskForDevice = (deviceName) => {
    if (!selectedDate) return [];
    const dateString = selectedDate.format('YYYY-MM-DD');
    return productionTasks.find(task => 
      task.deviceName === deviceName && 
      new Date(task.date).toISOString().split('T')[0] === dateString
    );
  };

  return (
    <Modal
      title="Lịch Sản xuất"
      visible={open}
      onCancel={onClose}
      footer={null}
      width={1000} // Điều chỉnh độ rộng modal để hiển thị đủ hai bên
    >
      <div className="grid grid-cols-3 gap-4">
        {/* Lịch ở bên trái */}
        <div className="col-span-2 pr-4">
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={handleDateSelect} // Gọi hàm khi người dùng chọn một ngày
          />
        </div>

        {/* Danh sách thiết bị ở bên phải */}
        <div>
          <h3>Danh sách thiết bị</h3>
          <Select
            defaultValue="all"
            style={{ width: 200, marginBottom: '10px' }}
            onChange={value => setSelectedArea(value)} // Khi người dùng chọn khu vực
          >
            <Select.Option key="all" value="all">Toàn nhà máy</Select.Option>
            {/* Hiển thị danh sách khu vực từ API */}
            {areas.map(area => (
              <Select.Option key={area._id} value={area._id}>
                {area.areaName}
              </Select.Option>
            ))}
          </Select>

          <Checkbox.Group
            style={{ width: '100%' }}
            value={checkedDevices} // Thiết bị có lịch làm việc sẽ được tích xanh
          >
            {filteredDevices.map(device => {
              const taskForDevice = getTaskForDevice(device.deviceName);

              return (
                <Tooltip 
                  key={device._id} 
                  title={taskForDevice && taskForDevice.shifts ? taskForDevice.shifts.map((shift, index) => (
                    <div key={index}>
                      <p>Ca làm việc: {shift.shiftName}</p>
                      <p>Trạng thái: {shift.status}</p>
                    </div>
                  )) : "Không có lịch làm việc"}
                >
                  <Checkbox value={device.deviceName}>
                    {device.deviceName}
                  </Checkbox>
                </Tooltip>
              );
            })}
          </Checkbox.Group>
        </div>
      </div>
    </Modal>
  );
};

export default MachineScheduleModal;
