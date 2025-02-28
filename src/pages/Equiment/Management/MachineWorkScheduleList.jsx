import React, { useState, useEffect } from 'react';
import { Modal, Select, DatePicker, Button ,Spin ,Dropdown, Menu,message } from 'antd';
import { DeleteOutlined ,EditOutlined,PlusOutlined,SettingOutlined} from '@ant-design/icons';
import axios from 'axios'; // Import axios để gọi API
import MachineWorkScheduleCard from '../../../Components/Equiment/MachineSchedule/MachineWorkScheduleCard';
import CustomUpdateModal from '../../../Components/Modal/CustomUpdateModal'; // Import custom modal component
import CustomCalendar from '../../../Components/Calendar/CustomCalendar'; // Import CustomCalendar component
import MachineScheduleModal from '../../../Components/Modal/MachineScheduleModal';
import dayjs from 'dayjs';
import FormSample from '../../../Components/Button/FormSample';
import ImportButton from '../../../Components/Button/ImportButton';
import ExportExcelButton from '../../../Components/Button/ExportExcelButton';
import sampleTemplate from '../../../assets/form/Nhiệm vụ sản xuất.xlsx';
import moment from 'moment';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
const { Option } = Select;

const MachineWorkScheduleList = () => {
  const [areas, setAreas] = useState([]); // State để lưu danh sách khu vực từ API
  const [devices, setDevices] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [productionTasks, setProductionTasks] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all'); // State để lưu khu vực được chọn
  const [selectedDates, setSelectedDates] = useState([dayjs().format('YYYY-MM-DD')]); // Track selected dates (default to today)
  const [selectedMachines, setSelectedMachines] = useState([]); // Track selected machines
  const apiUrl =import.meta.env.VITE_API_BASE_URL;
  const [isSelecting, setIsSelecting] = useState(false); // Track if the user is selecting devices
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Modal visibility for update confirmation
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false); // Custom modal visibility for the final confirmation
  const [isCalendarVisible, setIsCalendarVisible] = useState(false); // Track if calendar is visible
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
  const showNoSelectionWarning = () => {
    message.warning('Vui lòng chọn ít nhất một thiết bị trước khi thực hiện hành động này.');
  };
  const refreshData = async () => {
    setIsLoading(true); // Bắt đầu loading
    try {
      // Gọi API để lấy dữ liệu mới
      const areasResponse = await axios.get(`${apiUrl}/areas`);
      setAreas(areasResponse.data);

      const devicesResponse = await axios.get(`${apiUrl}/device`);
      setDevices(devicesResponse.data);

      const tasksResponse = await axios.get(`${apiUrl}/productiontask`);
      setProductionTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };
  const handleMenuClick = ({ key }) => {
    if (selectedMachines.length === 0) {
      showNoSelectionWarning();
      return;
    }
  
    if (key === 'update') {
      setActionType('update');
      setIsCustomModalOpen(true); // Open CustomUpdateModal directly for update
    } else if (key === 'delete') {
      setIsDeleteConfirmModalOpen(true); // Open modal for delete confirmation
    } else if (key === 'add') {
      setActionType('add');
      setIsUpdateModalOpen(true); // Open update modal only for adding new tasks
    }
  };
   // Hàm chuyển đổi ngày từ Excel
  
   const convertExcelDate = (excelDate) => {
    const epoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30 là điểm khởi đầu thực tế
    return new Date(epoch.getTime() + excelDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };
   
  const handleImport = async (file) => {
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
  
        const worksheet = workbook.worksheets[0]; // Lấy sheet đầu tiên
        if (!worksheet) {
          message.error("Không tìm thấy sheet nào trong file Excel.");
          return;
        }
  
        console.log("Sheet Name:", worksheet.name);
  
        const headers = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          // Bỏ qua các cột 1, 2, 3 (Mã thiết bị, Tên thiết bị, Nhân viên)
          if (colNumber < 4) return;
      
          let headerValue = cell.value;
      
          // Nếu tiêu đề là đối tượng Date, chuyển sang chuỗi định dạng YYYY-MM-DD
          if (headerValue instanceof Date) {
              headerValue = moment(headerValue).format("YYYY-MM-DD");
          }
      
          // Nếu tiêu đề là số, chuyển số thành ngày
          if (!moment(headerValue, "YYYY-MM-DD", true).isValid() && !isNaN(headerValue)) {
              const excelBaseDate = new Date(1899, 11, 30); // Ngày gốc của Excel
              const parsedDate = new Date(excelBaseDate.getTime() + headerValue * 86400000);
              headerValue = moment(parsedDate).format("YYYY-MM-DD");
          }
      
          // Kiểm tra lại nếu tiêu đề vẫn không hợp lệ
          if (!moment(headerValue, "YYYY-MM-DD", true).isValid()) {
              console.warn(`Invalid header format in column ${colNumber}: ${cell.value}`);
              headerValue = null; // Bỏ qua tiêu đề không hợp lệ
          }
      
          headers[colNumber] = headerValue; // Lưu tiêu đề đã chuẩn hóa
          console.log(`Processed Header Cell ${colNumber}:`, headerValue); // Log tiêu đề sau xử lý
      });
      
      const jsonData = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Bỏ qua tiêu đề
    
        const deviceId = row.getCell(1).value?.toString().trim(); // Mã thiết bị
        const deviceName = row.getCell(2).value?.toString().trim(); // Tên thiết bị
        const shiftNames = row
            .getCell(3)
            .value?.toString()
            .split(",")
            .map((shift) => shift.trim()) || []; // Tách các ca làm việc từ cột "Ca"
    
        // Xác định số cột thực tế có dữ liệu
        const columnCount = worksheet.getRow(1).cellCount;
    
        for (let colIndex = 4; colIndex <= columnCount; colIndex++) {
            const header = headers[colIndex]; // Ngày từ tiêu đề cột
            if (!header) continue; // Bỏ qua cột không có tiêu đề hợp lệ
    
            const cell = row.getCell(colIndex); // Lấy ô dữ liệu
            const fillColor = cell.fill?.fgColor?.argb || "No Color"; // Lấy mã màu của ô
            const cellValue = cell.value?.toString().trim(); // Giá trị trong ô
    
            if (!cellValue) continue; // Bỏ qua ô trống
    
            console.log(`Row ${rowNumber}, Column ${colIndex}:`, {
                date: header,
                value: cellValue,
                fillColor: fillColor,
            });
    
            // Tách tên nhân viên và trạng thái từ giá trị ô (vd: "Nguyễn Văn A, Chạy")
            const [employeeNameRaw, statusRaw] = cellValue.split(",").map((val) => val.trim());
            let status = "Pending"; // Trạng thái mặc định nếu không xác định được
    
            // Chuẩn hóa trạng thái dựa trên mã màu (ưu tiên màu nếu trạng thái bị thiếu)
            if (fillColor === "FF92D050" || statusRaw?.toLowerCase() === "chạy") status = "Chạy";
            else if (fillColor === "FFFFFF00" || statusRaw?.toLowerCase() === "chờ") status = "Chờ";
            else if (fillColor === "FFFF0000" || statusRaw?.toLowerCase() === "dừng") status = "Dừng";
    
            const employeeName = employeeNameRaw || "N/A"; // Tên nhân viên mặc định là "N/A" nếu trống
    
            // Kiểm tra và xử lý từng ca làm việc
            shiftNames.forEach((shiftName) => {
                if (!shiftName) return; // Bỏ qua nếu ca làm việc không tồn tại
    
                // Tạo cấu trúc shift
                const shift = {
                    shiftName: shiftName, // Ca làm việc
                    status: status, // Trạng thái
                    employeeName: [employeeName], // Danh sách nhân viên (một phần tử)
                };
    
                // Kiểm tra nếu đã có task với ngày và thiết bị, thêm shift vào
                let task = jsonData.find(
                    (item) => item.deviceId === deviceId && item.date === header
                );
    
                if (!task) {
                    // Nếu chưa có task, tạo mới
                    task = {
                        date: header,
                        deviceId: deviceId,
                        deviceName: deviceName,
                        shifts: [],
                        };
                    jsonData.push(task);
                }
    
                // Thêm shift vào task
                task.shifts.push(shift);
            });
        }
    });
    
    
  
        console.log("Formatted JSON Data:", jsonData);
  
        if (jsonData.length === 0) {
          message.warning("Không có dữ liệu hợp lệ để import.");
          return;
        }
  
        // Gửi dữ liệu đến backend qua API
        const existingTasksResponse = await axios.get(`${apiUrl}/productiontask`);
        const existingTasks = existingTasksResponse.data;
  
        const productionTasks = jsonData.map((task) => {
          const existingTask = existingTasks.find(
            (et) =>
              et.deviceId === task.deviceId &&
              moment(et.date).isSame(task.date, "day")
          );
  
          return {
            ...task,
            _id: existingTask ? existingTask._id : null, // Gán _id nếu đã tồn tại
            shifts: task.shifts.map((shift) => ({
              ...shift,
              _id: existingTask
                ? existingTask.shifts.find(
                    (s) =>
                      s.shiftName === shift.shiftName &&
                      JSON.stringify(s.employeeName) ===
                        JSON.stringify(shift.employeeName)
                  )?._id || null
                : null,
            })),
          };
        });
  
        console.log("Final Tasks to Save:", productionTasks);
  
        // Gửi PUT/POST
        const key = "updating-tasks";
        message.loading({ content: "Nhiệm vụ đang được cập nhật...", key, duration:0 });
  
        await Promise.all(
          productionTasks.map(async (task) => {
            if (task._id) {
              await axios.put(`${apiUrl}/productiontask/${task._id}`, task);
              console.log("Updated Task:", task);
            } else {
              const createdTask = await axios.post(`${apiUrl}/productiontask`, task);
              console.log("Created New Task:", createdTask.data);
            }
          })
        );
  
        message.success({
          content: "Thêm hoặc cập nhật nhiệm vụ sản xuất thành công!",
          key,
          duration: 2,
        });
  
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }  catch (error) {
        console.error("Error during import:", error);
  
        const errorMessage =
          error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý file. Vui lòng thử lại.';
        message.error(`Có lỗi xảy ra: ${errorMessage}`);
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  // const handleImport = async (file) => {
  //   const reader = new FileReader();
  
  //   reader.onload = async (e) => {
  //     try {
  //       const data = new Uint8Array(e.target.result);
  //       const workbook = XLSX.read(data, { type: 'array' });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  //       console.log("Raw JSON Data from Excel:", jsonData);
  
  //       // Chuyển đổi dữ liệu từ file Excel
  //       const formattedData = jsonData.map((item) => {
  //         let date = item["Ngày"];
  //         if (!isNaN(date)) {
  //           date = convertExcelDate(date);
  //         } else {
  //           date = moment.utc(date, ["DD-MM-YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD");
  //         }
  
  //         const shiftName = item["Ca"];
  //         const status = item["Trạng thái đèn"] || 'Pending';
  
  //         const employeeNames = item["Nhân viên"]
  //           ? item["Nhân viên"].split(',').map((name) => name.trim())
  //           : [];
  
  //         return {
  //           date: date,
  //           deviceId: item["Mã thiết bị"],
  //           deviceName: item["Tên thiết bị"],
  //           shiftName: shiftName,
  //           status: status,
  //           employeeNames: employeeNames,
  //         };
  //       }).filter((task) => task.deviceId && task.date);
  
  //       console.log("Formatted Data:", formattedData);
  
  //       const groupedTasks = formattedData.reduce((acc, task) => {
  //         const key = `${task.deviceId}-${task.date}`;
  //         if (!acc[key]) {
  //           acc[key] = {
  //             date: task.date,
  //             deviceId: task.deviceId,
  //             deviceName: task.deviceName,
  //             shifts: [],
  //           };
  //         }
  
  //         if (task.shiftName === "Ca chính") {
  //           acc[key].shifts.unshift({
  //             shiftName: task.shiftName,
  //             status: task.status,
  //             employeeName: task.employeeNames,
  //           });
  //         } else {
  //           acc[key].shifts.push({
  //             shiftName: task.shiftName,
  //             status: task.status,
  //             employeeName: task.employeeNames,
  //           });
  //         }
  
  //         return acc;
  //       }, {});
  
  //       const finalTasks = Object.values(groupedTasks);
  
  //       console.log("Grouped Tasks:", groupedTasks);
  
  //       if (finalTasks.length === 0) {
  //         message.warning("Không có dữ liệu hợp lệ để import.");
  //         return;
  //       }
  
  //       const existingTasksResponse = await axios.get(`${apiUrl}/productiontask`);
  //       const existingTasks = existingTasksResponse.data;
  
  //       const productionTasks = finalTasks.map((task) => {
  //         const existingTask = existingTasks.find(
  //           (et) => et.deviceId === task.deviceId && moment(et.date).isSame(task.date, 'day')
  //         );
  
  //         return {
  //           ...task,
  //           id: existingTask ? existingTask._id : null,
  //         };
  //       });
  
  //       console.log("Final Tasks to Save:", productionTasks);
  
  //       // Hiển thị thông báo "Nhiệm vụ đang được cập nhật"
  //       const key = 'updating-tasks';
  //       message.loading({ content: 'Nhiệm vụ đang được cập nhật...', key });
  
  //       // Thực hiện PUT/POST cho từng nhiệm vụ
  //       await Promise.all(
  //         productionTasks.map(async (task) => {
  //           if (task.id) {
  //             await axios.put(`${apiUrl}/productiontask/${task.id}`, task);
  //             console.log('Updated Task:', task);
  //           } else {
  //             const createdTask = await axios.post(`${apiUrl}/productiontask`, task);
  //             console.log('Created New Task:', createdTask.data);
  //           }
  //         })
  //       );
  
  //       // Thay đổi thông báo thành công và reload
  //       message.success({ content: 'Thêm hoặc cập nhật nhiệm vụ sản xuất thành công!', key, duration: 2 });
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 1000);
  //     } catch (error) {
  //       console.error("Error during import:", error);
  
  //       const errorMessage =
  //         error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý file. Vui lòng thử lại.';
  //       message.error(`Có lỗi xảy ra: ${errorMessage}`);
  //     }
  //   };
  
  //   reader.readAsArrayBuffer(file);
  // };
  

  
  
    
  // Nội dung tiêu đề và văn bản của Modal dựa trên `actionType`
  const getModalContent = () => {
    if (actionType === 'update') {
      return {
        title: "Xác nhận cập nhật",
        content: "Bạn có muốn cập nhật nhiệm vụ sản xuất cho các thiết bị đã chọn?",
        okText: "Xác nhận"
      };
    } else if (actionType === 'add') {
      return {
        title: "Xác nhận thêm mới",
        content: "Bạn có muốn thêm mới nhiệm vụ cho các thiết bị đã chọn?",
        okText: "Thêm mới"
      };
    }
    return {};
  };

  const { title, content, okText } = getModalContent();


  useEffect(() => {
    refreshData(); // Gọi API khi component được mount
  }, []);

  // Call APi fetch area and devices
  useEffect(() => {
    const fetchAreasAndDevices = async () => {
      try {
        // Area List
        const areasResponse = await axios.get(`${apiUrl}/areas`);
        setAreas(areasResponse.data);

        // Device List
        const devicesResponse = await axios.get(`${apiUrl}/device`);
        setDevices(devicesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAreasAndDevices();
  }, []);

  useEffect(() => {
    if (selectedArea === 'all') {
      const sortedDevices = [...devices].sort((a, b) => {
        const regex = /^([a-zA-Z]+)(\d+)/; // Chỉ lấy phần chữ và số ở đầu tên thiết bị
        const aMatch = a.deviceName.match(regex);
        const bMatch = b.deviceName.match(regex);
  
        // Tách phần chữ và số, nếu không khớp thì đặt giá trị mặc định
        const aLetter = aMatch ? aMatch[1] : '';
        const aNumber = aMatch ? parseInt(aMatch[2], 10) : 0;
  
        const bLetter = bMatch ? bMatch[1] : '';
        const bNumber = bMatch ? parseInt(bMatch[2], 10) : 0;
  
        // So sánh phần chữ trước, phần số sau
        if (aLetter === bLetter) {
          return aNumber - bNumber;
        }
        return aLetter.localeCompare(bLetter);
      });
  
      setFilteredDevices(sortedDevices);
    } else {
      const selectedAreaName = areas.find((area) => area._id === selectedArea)?.areaName.trim().toLowerCase();
  
      const filtered = devices.filter(
        (device) => device.areaName.trim().toLowerCase() === selectedAreaName
      );
  
      const sortedFilteredDevices = filtered.sort((a, b) => {
        const regex = /^([a-zA-Z]+)(\d+)/; // Chỉ lấy phần chữ và số ở đầu tên thiết bị
        const aMatch = a.deviceName.match(regex);
        const bMatch = b.deviceName.match(regex);
  
        const aLetter = aMatch ? aMatch[1] : '';
        const aNumber = aMatch ? parseInt(aMatch[2], 10) : 0;
  
        const bLetter = bMatch ? bMatch[1] : '';
        const bNumber = bMatch ? parseInt(bMatch[2], 10) : 0;
  
        if (aLetter === bLetter) {
          return aNumber - bNumber;
        }
        return aLetter.localeCompare(bLetter);
      });
  
      setFilteredDevices(sortedFilteredDevices);
    }
  }, [selectedArea, devices]);
  
  useEffect(() => {
    const fetchProductionTasks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/productiontask`);
        setProductionTasks(response.data); // Lưu dữ liệu nhiệm vụ sản xuất vào state
      } catch (error) {
        console.error('Error fetching production tasks:', error);
      }
    };
  
    fetchProductionTasks(); // Gọi API khi component được mount
  }, []);
  
  
  const getTasksForDevice = (deviceName) => {
    return productionTasks.filter(task => {
      const taskDate = new Date(task.date).toISOString().split('T')[0]; // Lấy ngày từ task
      return task.deviceName === deviceName && taskDate === selectedDates[0]; // So sánh ngày và thiết bị
    });
  };
   

  // Handle saving the selected dates
  const handleSaveDates = () => {
    console.log('Saved dates:', selectedDates); // Log or process the saved dates
    setIsCustomModalOpen(false); // Close modal after saving
  };

 // Handle canceling the selected dates
const handleCancelDates = () => {
  setSelectedDates([new Date().toISOString().split('T')[0]]); // Clear selected dates on cancel (set to today)
  setIsCustomModalOpen(false); // Close the modal
  setSelectedMachines([]); // Clear selected machines when cancelling
  setIsSelecting(false); // Reset trạng thái chọn thiết bị
};


  
 // Toggle machine selection mode
// Toggle machine selection mode with task inclusion
const toggleSelectDevicesByArea = () => {
  const machinesInArea = filteredDevices; // Lấy tất cả thiết bị trong khu vực được chọn

  // Kiểm tra xem tất cả thiết bị trong khu vực đã được chọn chưa
  const allSelected = machinesInArea.every(machine => selectedMachines.some(selected => selected._id === machine._id));

  if (allSelected) {
    // Nếu tất cả thiết bị đã được chọn, bỏ chọn các thiết bị trong khu vực
    const updatedSelectedMachines = selectedMachines.filter(selected => !machinesInArea.some(machine => machine._id === selected._id));
    setSelectedMachines(updatedSelectedMachines);
  } else {
    // Nếu chưa chọn hết, thêm tất cả thiết bị trong khu vực vào danh sách
    const newSelectedMachines = [
      ...selectedMachines,
      ...machinesInArea
        .filter(machine => !selectedMachines.some(selected => selected._id === machine._id))
        .map(machine => ({
          ...machine,
          tasks: getTasksForDevice(machine.deviceName) // Lấy danh sách nhiệm vụ cho từng thiết bị
        })) // Chỉ thêm các thiết bị chưa được chọn và kèm theo nhiệm vụ
    ];
    setSelectedMachines(newSelectedMachines);
  }

  // Điều chỉnh trạng thái chọn thiết bị
  setIsSelecting(!allSelected);
};


  // Handle machine click
// Xử lý khi nhấp vào thiết bị
const handleRemoveAllTasks = async () => {
  setIsLoading(true); // Bắt đầu loading khi xóa

  try {
    // Lặp qua từng thiết bị và xóa các nhiệm vụ của nó
    for (const machine of selectedMachines) {
      for (const task of machine.tasks) {
        await axios.delete(`${apiUrl}/productiontask/${task._id}`);
      }
    }

    console.log("All tasks removed successfully.");
    
    // Sau khi xóa thành công, cập nhật lại `selectedMachines` để loại bỏ nhiệm vụ
    const updatedMachines = selectedMachines.map(machine => ({
      ...machine,
      tasks: [] // Loại bỏ tất cả nhiệm vụ của thiết bị trong state
    }));
    setSelectedMachines(updatedMachines);

  } catch (error) {
    console.error("Error removing tasks:", error);
  } finally {
    setIsLoading(false); // Kết thúc loading
    await refreshData(); // Tải lại dữ liệu
  }
};

// Hàm mở modal xác nhận xóa
const openDeleteConfirmModal = () => {
  setIsDeleteConfirmModalOpen(true);
};

// Hàm xử lý xác nhận xóa
const confirmDelete = async () => {
  setIsDeleteConfirmModalOpen(false); // Đóng modal trước khi xóa
  await handleRemoveAllTasks(); // Thực hiện xóa
};

// Hàm hủy xóa (đóng modal)
const cancelDelete = () => {
  setIsDeleteConfirmModalOpen(false); // Đóng modal mà không xóa
};

// Hàm xử lý khi nhấp vào thiết bị
const handleMachineClick = (machine) => {
  const isSelected = selectedMachines.some((m) => m._id === machine._id);

  if (isSelected) {
    // Nếu thiết bị đã được chọn, bỏ chọn thiết bị đó
    const updatedMachines = selectedMachines.filter((m) => m._id !== machine._id);
    setSelectedMachines(updatedMachines);

    // Nếu không còn thiết bị nào được chọn, đặt trạng thái "Chọn Thiết Bị"
    if (updatedMachines.length === 0) {
      setIsSelecting(false);
    }
  } else {
    // Nếu thiết bị chưa được chọn, thêm thiết bị vào danh sách cùng với nhiệm vụ của nó
    const tasksForDevice = getTasksForDevice(machine.deviceName);
    setSelectedMachines((prevMachines) => [...prevMachines, { ...machine, tasks: tasksForDevice }]);

    // Đảm bảo trạng thái "Chọn Thiết Bị" chỉ được set thành true nếu có thiết bị được chọn
    if (selectedMachines.length === 0) {
      setIsSelecting(true);
    }
  }
};

  // Sử dụng useEffect để theo dõi thay đổi của selectedMachines
  useEffect(() => {
    console.log('Selected Machines Updated:', selectedMachines); // Log mỗi khi selectedMachines thay đổi
  }, [selectedMachines]);

  // Handle date selection from DatePicker
  const handleDateChange = (date, dateString) => {
    if (date && dayjs(date).isValid()) { // Sử dụng dayjs để kiểm tra ngày hợp lệ
      console.log("Selected date:", dateString);
      setSelectedDates([dateString]); // Cập nhật selectedDates với ngày đã chọn
    } else {
      console.log("Invalid date selected");
      setSelectedDates([dayjs().format('YYYY-MM-DD')]); // Đặt lại về ngày hôm nay nếu không hợp lệ
    }
  };
   // Handle form submission to save the edited details
  const handleSave = () => {
    console.log('Updated machine details:', selectedMachines);
    setIsUpdateModalOpen(false); // Close the modal after saving
  };

  // Handle "Cập nhật nhiệm vụ sản xuất" button click
  const handleUpdateClick = () => {
    setIsUpdateModalOpen(true); // Show update confirmation modal
  };
  const handleCallMachine = () => {
    set
  }
  const handleCancelAction = () => {
    setSelectedMachines([]); // Loại bỏ tất cả thiết bị đã chọn
    setIsActionModalOpen(false); // Đóng modal
    setIsUpdateModalOpen(false)
  };
  // Handle modal confirmation
  const handleConfirmUpdate = () => {
    setIsUpdateModalOpen(false); // Close modal on confirm
    setIsCustomModalOpen(true); // Show custom modal after confirmation
  };
  const handleAddNewTask = () => {
    setIsUpdateModalOpen(false); // Close modal on confirm
    setIsCustomModalOpen(true); // Show custom modal after confirmation
  };
  // Handle canceling the update (close modal and clear selections)
const handleCancelUpdate = () => {
  setIsUpdateModalOpen(false); // Close the update confirmation modal
  setSelectedMachines([]); // Clear selected machines on cancel
  setIsSelecting(false); // Reset trạng thái chọn thiết bị
};

  // Hàm mở modal
  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
  };
  // Toggle calendar visibility
  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible); // Toggle calendar visibility
  };

  return (
    <>
       {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" /> {/* Spinner trong lúc loading */}
        </div>
      ) : (
      <div >
          {/* Area Selection */}
      <div className="sticky -top-4 z-10 bg-gray-100 px-1 ">
        
        <div className="flex justify-between items-center mb-4 ">
        
          <Button className="ml-2 bg-gray-400 text-white " onClick={handleOpenScheduleModal}>
            Lịch Sản xuất
          </Button>
       {/*nut giao nhiem vu den trang thai*/}
        <div>
        
            </div>
              <MachineScheduleModal
                open={isScheduleModalOpen}
                onClose={handleCloseScheduleModal}
                selectedMachines={selectedMachines}
              />
              <div className="flex items-center space-x-1">
                {/* Select Dropdown for Area */}
                <Select
                  value={selectedArea}
                  onChange={(value) => setSelectedArea(value)} // Update selected area
                  placeholder="Chọn khu vực"
                  style={{ width: 160 }}
                >
                  {/* Area options */}
                  <Option key="all" value="all">Toàn nhà máy</Option>
                  {areas && areas.map((area) => (
                    // Đảm bảo key là giá trị duy nhất (ví dụ: id)
                    area._id ? (
                      <Option key={area._id} value={area._id}>{area.areaName}</Option>
                    ) : null
                  ))}
                </Select>
           {/* Toggle "Chọn Thiết Bị" or "Bỏ Chọn Thiết Bị" */}
           <Button onClick={toggleSelectDevicesByArea}>
             {isSelecting ?  'Bỏ Chọn Tất Cả' : 'Chọn Tất Cả'   }
           </Button>
           <DatePicker 
         onChange={handleDateChange} 
         value={dayjs(selectedDates[0])} // Hiển thị ngày từ selectedDates, ngày đầu tiên luôn là hôm nay
         defaultValue={dayjs()} // Đặt giá trị mặc định là hôm nay nếu chưa có gì được chọn
       />
 
          <Dropdown overlay={
              <Menu onClick={handleMenuClick}>
                <Menu.Item key="update" icon={<EditOutlined />}>
                  Cập nhật nhiệm vụ
                </Menu.Item>
                <Menu.Item key="delete" icon={<DeleteOutlined />}>
                  Xóa nhiệm vụ
                </Menu.Item>
              
              </Menu>
            } trigger={['click']}>
              <Button type="primary" icon={<SettingOutlined />} className="ml-2">
                Điều chỉnh kế hoạch
              </Button>
            </Dropdown>
            <FormSample href={sampleTemplate} label="Tải Form Mẫu" />
            <ImportButton onImport={handleImport}/>
          </div>    
            
      

      {/* Modal xác nhận cho cập nhật hoặc thêm mới */}
      <Modal
        title={title}
        open={isUpdateModalOpen}
        onCancel={handleCancelAction}
        onOk={() => {
          actionType === 'update' ? handleConfirmUpdate() : handleAddNewTask(); // Gọi hàm đúng với hành động
          setIsUpdateModalOpen(false); // Đóng modal
        }}
        // okText={okText}
        cancelText="Hủy"
      >
        <p>{content}</p>
      </Modal>

      {/* Modal Xác nhận Xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmModalOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa tất cả nhiệm vụ của các thiết bị đã chọn không?</p>
      </Modal>

    
          
 
           {/* Button to toggle CustomCalendar */}
           
         </div>
      </div>
 
       {/* Machine List */}
       <div className="mt-3">
       <div className="grid grid-cols-5 gap-1 sm:grid-cols-5 ">
            {filteredDevices.map((machine) => {
            const tasksForDevice = getTasksForDevice(machine.deviceName);
            
            // Nếu máy có nhiệm vụ sản xuất, lặp qua từng nhiệm vụ và hiển thị card riêng cho mỗi nhiệm vụ
            if (tasksForDevice.length > 0) {
              return tasksForDevice.map((task, index) => (
                <div
                  key={`${machine._id}-${index}`} // Đảm bảo key là duy nhất
                  onClick={() => handleMachineClick(machine)}
                  className={`relative cursor-pointer transition duration-300 ease-in-out h-full p-1
                    ${isSelecting && selectedMachines.some((m) => m._id === machine._id) ? 'border-2 border-blue-700 round-lg bg-gray-600 ' : ''}`}
                >
                  <MachineWorkScheduleCard
                    machine={machine} // Truyền thông tin máy vào card
                    tasks={[task]} // Truyền nhiệm vụ vào thẻ
                    selectedDate={selectedDates[0]} // Truyền ngày đã chọn
                  />
                  {selectedMachines.length > 0 && selectedMachines.some((m) => m._id === machine._id) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">✓</div>
                )}
                </div>
              ));
            } else {
              // Nếu máy không có nhiệm vụ sản xuất, hiển thị thông báo "Không có thông tin sản xuất"
              return (
                <div
                  key={machine._id}
                  onClick={() => handleMachineClick(machine)}
                  className={`relative cursor-pointer transition duration-300 ease-in-out h-full p-1
                    ${isSelecting && selectedMachines.some((m) => m.id === machine._id) ? 'border-2 border-blue-700 round-lg bg-gray-600 ' : ''}`}
                >
                  <MachineWorkScheduleCard
                    machine={machine} // Truyền thông tin máy vào card
                    tasks={[]} // Truyền một mảng rỗng nếu không có nhiệm vụ
                    selectedDate={selectedDates[0]} // Truyền ngày đã chọn
                      />
                      {selectedMachines.length > 0 && selectedMachines.some((m) => m._id === machine._id) && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">✓</div>
            )}
                
                </div>
            
              );
            }
          })}
        </div>
        {/* Custom Modal after Update Confirmation */}
       <CustomUpdateModal
         open={isCustomModalOpen}
         onClose={() => setIsCustomModalOpen(false)}
         onCancel={handleCancelDates} // Clear dates and close modal
         onSave={handleSaveDates} // Save the selected dates
         selectedDates={selectedDates} 
         
         setSelectedDates={setSelectedDates}
         setSelectedMachines={setSelectedMachines}
         selectedMachines={selectedMachines} // Allow modal to update dates if necessary
       />
 
       {/* Custom Calendar Component */}
       {isCalendarVisible && (
         <CustomCalendar 
           onClose={toggleCalendar} // Pass function to close the calendar
         />
       )}
      
      
      </div> 
       
    </div>
      )}
      
    </>
  );
};

export default MachineWorkScheduleList;
