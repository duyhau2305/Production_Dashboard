import React from 'react';
import { Tooltip } from 'antd'; // Import Tooltip từ antd

// Hàm để lấy màu đèn tín hiệu dựa trên trạng thái
const getSignalLightColors = (status) => {
  if (status === 'Chạy') return { red: 'white', yellow: 'white', green: '#8ff28f' }; // Xanh lá cho trạng thái "Chạy"
  if (status === 'Chờ' || status === 'Cài Đặt') return { red: 'white', yellow: '#fafa98', green: 'white' }; // Vàng cho "Chờ" hoặc "Cài đặt"
  if (status === 'Dừng') return { red: 'red', yellow: 'white', green: 'white' }; // Đỏ cho trạng thái "Dừng"
  if (status === 'Tắt') return { red: 'white', yellow: 'white', green: 'white' }; // Tất cả màu trắng khi "Tắt"
  if (status === 'Vệ Sinh') return { red: 'white', yellow: 'white', green: '#807e7e' }; // Xám cho trạng thái "Vệ Sinh"
  return { red: 'white', yellow: 'white', green: 'white' }; // Mặc định màu trắng cho tất cả
};

const MachineWorkScheduleCard = ({ machine, tasks, selectedDate }) => {
  // Lọc nhiệm vụ theo ngày đã chọn
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0]; // Lấy ngày từ nhiệm vụ sản xuất
    return taskDate === selectedDate; // So sánh với ngày đã chọn
  });

  return (
    <div className="">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task, index) => {
          // Lấy trạng thái của ca đầu tiên trong mảng shifts
          const firstShiftStatus = task.shifts.length > 0 ? task.shifts[0].status : 'Tắt'; // Mặc định là 'Tắt' nếu không có ca
          const signalLightColors = getSignalLightColors(firstShiftStatus);

          return (
            <div key={index} className="shadow-md bg-gray-100 rounded-md w-full">
              <div className="bg-gray-50 p-2 items-center justify-center flex">
                <h2 className="text-xl font-bold text-[#375BA9]">{machine.deviceName}</h2> {/* Hiển thị tên thiết bị */}
              </div>

              <div className="flex items-start">
                {/* Đèn tín hiệu - Màu dựa trên trạng thái của ca đầu tiên */}
                <div className="flex flex-col justify-center items-center p-4">
                  <div className="w-14 h-40 border border-black rounded-lg">
                    <div style={{ backgroundColor: signalLightColors.red, height: '33.333%' }} className="rounded-t-lg border-l-4 border-b-2 border-[#cc0000]"></div>
                    <div style={{ backgroundColor: signalLightColors.yellow, height: '33.333%' }} className="border-l-4 border-b-2 border-[#ffff1a]"></div>
                    <div style={{ backgroundColor: signalLightColors.green, height: '33.333%' }} className="rounded-b-lg border-l-4 border-[#04ff06]"></div>
                  </div>
                </div>

                {/* Kế hoạch sản xuất */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-4 mr-2 mt-2 flex-grow">
                  <h3 className="font-semibold text-gray-700">Kế hoạch sản xuất</h3>
                  {task.shifts.length > 0 ? (
                    task.shifts.map((shift, shiftIndex) => (
                      <div key={shiftIndex} className="rounded-lg mb-4 p-2 bg-gray-100">
                        <div className="flex justify-between">
                          <div className="text-sm font-semibold">{shift.shiftName}</div> {/* Hiển thị tên ca */}
                           </div>

                        {/* Hiển thị danh sách nhân viên */}
                        <div className="mt-2">
                          {shift.employeeName.length > 0 ? (
                            shift.employeeName.map((employee, empIndex) => (
                              <div key={empIndex} className="text-sm ml-4">
                                {typeof employee === 'string' ? employee : employee._id} {/* Hiển thị tên nhân viên hoặc _id */}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600">Không có nhân viên</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 mt-4">Không có thông tin ca làm việc</div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="shadow-md bg-gray-100 rounded-md w-full">
          <div className="bg-gray-50 p-2 items-center justify-center flex">
            <h2 className="text-xl font-bold text-[#375BA9]">{machine.deviceName}</h2> {/* Hiển thị tên thiết bị */}
          </div>

          <div className="flex items-start">
            {/* Đèn tín hiệu mặc định */}
            <div className="flex flex-col justify-center items-center p-4">
              <div className="w-14 h-40 border border-black rounded-lg">
                <div style={{ backgroundColor: 'white', height: '33.333%' }} className="rounded-t-lg border-l-4 border-b-2 border-[#cc0000]"></div>
                <div style={{ backgroundColor: 'white', height: '33.333%' }} className="border-l-4 border-b-2 border-[#ffff1a]"></div>
                <div style={{ backgroundColor: 'white', height: '33.333%' }} className="rounded-b-lg border-l-4 border-[#04ff06]"></div>
              </div>
            </div>

            {/* Thông báo không có nhiệm vụ */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 mr-2 mt-2 flex-grow">
              <h3 className="font-semibold text-gray-700">Kế hoạch sản xuất</h3>
              <div className="text-gray-600 mt-4">Không có thông tin nhiệm vụ sản xuất cho ngày này</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineWorkScheduleCard;
