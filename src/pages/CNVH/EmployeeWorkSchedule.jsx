import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode } from 'jwt-decode';
import moment from 'moment-timezone';
import { Dropdown, Menu, Button } from 'antd';

const EmployeeWorkSchedule = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [confirmedShifts, setConfirmedShifts] = useState({});


  const todayStart = moment.tz('Asia/Ho_Chi_Minh').startOf('day').toISOString();
  const todayEnd = moment.tz('Asia/Ho_Chi_Minh').endOf('day').toISOString();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.10.186:5000/api/productiontask?startTime=${todayStart}&endTime=${todayEnd}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByEmployee = (tasks, employeeName) => {
    return tasks.filter((task) =>
      task.shifts.some((shift) => shift.employeeName.includes(employeeName))
    );
  };

  const registerExtraShift = async (taskId, shiftType) => {
    try {
      const updatedTask = tasks.find((task) => task._id === taskId);
      const extraShift = {
        shiftName: shiftType,
        status: 'Chạy',
        employeeName: [employeeName],
      };
      updatedTask.shifts.push(extraShift);

      await axios.put(`http://192.168.10.186:5000/api/productiontask/${taskId}`, updatedTask);

      alert('Đăng ký ca phụ thành công!');
      await fetchTasks();
    } catch (error) {
      console.error('Error registering extra shift:', error);
      alert('Có lỗi xảy ra khi đăng ký ca phụ.');
    }
  };

  const confirmExtraShift = (taskId, shiftName) => {
    setConfirmedShifts((prev) => ({
      ...prev,
      [`${taskId}-${shiftName}`]: true,
    }));
  
    // Thực hiện cập nhật API nếu cần
    const updatedTask = tasks.find((task) => task._id === taskId);
    axios
      .put(`http://192.168.10.186:5000/api/productiontask/${taskId}`, updatedTask)
      .then(() => {
        alert('Đã xác nhận ca phụ.');
      })
      .catch((error) => {
        console.error('Error confirming shift:', error);
        alert('Có lỗi xảy ra khi xác nhận ca phụ.');
      });
  };
  
  const cancelExtraShift = (taskId, shiftName) => {
    setConfirmedShifts((prev) => {
      const updated = { ...prev };
      delete updated[`${taskId}-${shiftName}`];
      return updated;
    });
  
    // Thực hiện cập nhật API nếu cần
    const updatedTask = tasks.find((task) => task._id === taskId);
    updatedTask.shifts = updatedTask.shifts.filter((shift) => shift.shiftName !== shiftName);
  
    axios
      .put(`http://192.168.10.186:5000/api/productiontask/${taskId}`, updatedTask)
      .then(() => {
        alert('Ca phụ đã được hủy bỏ.');
        fetchTasks(); // Đồng bộ lại nếu cần
      })
      .catch((error) => {
        console.error('Error cancelling shift:', error);
        alert('Có lỗi xảy ra khi hủy bỏ ca phụ.');
      });
  };
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const name = decoded?.user?.name;
        setEmployeeName(name);

        if (name) {
          fetchTasks();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && employeeName) {
      const filtered = filterTasksByEmployee(tasks, employeeName);
      setFilteredTasks(filtered);
    }
  }, [tasks, employeeName]);

  const extraShiftMenu = (
    <Menu>
      {filteredTasks.map((task) => (
        <Menu.SubMenu key={task._id} title={task.deviceName}>
          <Menu.Item onClick={() => registerExtraShift(task._id, 'Ca phụ 1h')}>
            Ca phụ 1h
          </Menu.Item>
          <Menu.Item onClick={() => registerExtraShift(task._id, 'Ca phụ 2h')}>
            Ca phụ 2h
          </Menu.Item>
        </Menu.SubMenu>
      ))}
    </Menu>
  );

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Lịch Làm Việc Hôm Nay</h3>

      {/* Nút Đăng Ký Làm Thêm */}
      <div className="mb-4">
        <Dropdown overlay={extraShiftMenu} trigger={['click']}>
          <Button type="primary" className="bg-blue-500 text-white px-4 py-2 rounded">
            Đăng Ký Làm Thêm
          </Button>
        </Dropdown>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : filteredTasks.length === 0 ? (
        <p>Không có lịch làm việc hôm nay.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-xs text-center">Thiết Bị</th>
              <th className="border px-4 py-2 text-xs text-center">Ca Làm Việc</th>
              <th className="border px-4 py-2 text-xs text-center">Trạng Thái</th>
              <th className="border px-4 py-2 text-xs text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) =>
              task.shifts.map((shift, index) => (
                <tr key={`${task.deviceId}-${index}`} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">{task.deviceName}</td>
                  <td className="border px-4 py-2 text-center">{shift.shiftName}</td>
                  <td className="border px-4 py-2 text-center">{shift.status}</td>
                  <td className="border px-4 py-2 text-center">
                {shift.shiftName.startsWith('Ca phụ') ? (
                  confirmedShifts[`${task._id}-${shift.shiftName}`] ? (
                    <span className="text-gray-500">Đã Xác Nhận</span>
                  ) : (
                    <>
                      <button
                        onClick={() => confirmExtraShift(task._id, shift.shiftName)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Xác Nhận
                      </button>
                      <button
                        onClick={() => cancelExtraShift(task._id, shift.shiftName)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Hủy Bỏ
                      </button>
                    </>
                  )
                ) : (
                  <span className="text-gray-500"></span>
                )}
              </td>




                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeWorkSchedule;
