import React, { useState, useEffect } from 'react';
import { Modal, Select, DatePicker, Button ,Spin} from 'antd';
import axios from 'axios'; // Import axios để gọi API
import MachineWorkScheduleCard from '../../../Components/Equiment/MachineSchedule/MachineWorkScheduleCard';
import CustomUpdateModal from '../../../Components/Modal/CustomUpdateModal'; // Import custom modal component
import CustomCalendar from '../../../Components/Calendar/CustomCalendar'; // Import CustomCalendar component
import MachineScheduleModal from '../../../Components/Modal/MachineScheduleModal';
import dayjs from 'dayjs';
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
      setFilteredDevices(devices); // Nếu chọn "Toàn bộ khu vực", hiển thị tất cả thiết bị
    } else {
      // Ensure comparison is done based on the `areaName`
      const selectedAreaName = areas.find(area => area._id === selectedArea)?.areaName.trim().toLowerCase();
  
      const filtered = devices.filter(device => device.areaName.trim().toLowerCase() === selectedAreaName); // Lọc theo khu vực
      console.log("Filtered Devices:", filtered); // Log filtered devices
      setFilteredDevices(filtered);
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
 // Handle canceling the selected dates
const handleCancelDates = () => {
  setSelectedDates([new Date().toISOString().split('T')[0]]); // Clear selected dates on cancel (set to today)
  setIsCustomModalOpen(false); // Close the modal
  setSelectedMachines([]); // Clear selected machines when cancelling
  setIsSelecting(false); // Reset trạng thái chọn thiết bị
};


  
 // Toggle machine selection mode
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
          ...machinesInArea.filter(machine => !selectedMachines.some(selected => selected._id === machine._id)) // Chỉ thêm các thiết bị chưa được chọn
      ];
      setSelectedMachines(newSelectedMachines);
  }

  // Điều chỉnh trạng thái chọn thiết bị
  setIsSelecting(!allSelected);
};




  // Handle machine click
  const handleMachineClick = (machine) => {
    // Kiểm tra xem thiết bị đã được chọn chưa
    const isSelected = selectedMachines.some((m) => m._id === machine._id);

    if (isSelected) {
        // Nếu đã được chọn, bỏ chọn thiết bị đó
        const updatedMachines = selectedMachines.filter((m) => m._id !== machine._id);
        setSelectedMachines(updatedMachines);

        // Kiểm tra nếu không còn máy nào được chọn, thì chuyển lại trạng thái về "Chọn Thiết Bị"
        if (updatedMachines.length === 0) {
            setIsSelecting(false);
        }
    } else {
        // Nếu chưa được chọn, thêm thiết bị vào danh sách
        setSelectedMachines((prevMachines) => [...prevMachines, machine]);
        setIsSelecting(true);
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

  // Handle modal confirmation
  const handleConfirmUpdate = () => {
    setIsUpdateModalOpen(false); // Close modal on confirm
    setIsCustomModalOpen(true); // Show custom modal after confirmation
  };

  // Handle canceling the update (close modal and clear selections)
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
        <div>
          {/* Area Selection */}
      <div className="flex justify-between items-center mb-4 p-2">
       
       <Button className="ml-2 bg-gray-400 text-white " onClick={handleOpenScheduleModal}>
         Lịch Sản xuất
       </Button>
       {/*nut giao nhiem vu den trang thai*/}
       {selectedMachines.length > 0 && (
             <Button type="primary" className="ml-2" onClick={handleUpdateClick}>
               Giao nhiem vu
             </Button>
           )}
 
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
 
           {/* Conditionally render "Cập nhật nhiệm vụ sản xuất" */}
           {selectedMachines.length > 0 && (
             <Button type="primary" className="ml-2" onClick={handleUpdateClick}>
               Cập nhật nhiệm vụ sản xuất
             </Button>
           )}
 
           {/* Button to toggle CustomCalendar */}
           
         </div>
       </div>
 
       {/* Machine List */}
       <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 ">
    {filteredDevices.map((machine) => {
     const tasksForDevice = getTasksForDevice(machine.deviceName);
     
     // Nếu máy có nhiệm vụ sản xuất, lặp qua từng nhiệm vụ và hiển thị card riêng cho mỗi nhiệm vụ
     if (tasksForDevice.length > 0) {
       return tasksForDevice.map((task, index) => (
         <div
           key={`${machine._id}-${index}`} // Đảm bảo key là duy nhất
           onClick={() => handleMachineClick(machine)}
           className={`relative cursor-pointer transition duration-300 ease-in-out h-full p-1
             ${isSelecting && selectedMachines.some((m) => m.id === machine._id) ? 'border-2 border-blue-700 round-lg bg-gray-600 ' : ''}`}
         >
           <MachineWorkScheduleCard
             machine={machine} // Truyền thông tin máy vào card
             tasks={[task]} // Truyền nhiệm vụ vào thẻ
             selectedDate={selectedDates[0]} // Truyền ngày đã chọn
           />
           {isSelecting && selectedMachines.some((m) => m.id === machine.id) && (
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
           {isSelecting && selectedMachines.some((m) => m.id === machine.id) && (
             <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">✓</div>
           )}
         </div>
       );
     }
   })}
 </div>
 
 
 
       {/* Update Confirmation Modal */}
       <Modal
         title="Xác nhận cập nhật"
         open={isUpdateModalOpen}
         onCancel={handleCancelUpdate}
         onOk={handleConfirmUpdate}
         okText="Xác nhận"
         cancelText="Hủy"
       >
         <p>Bạn có muốn cập nhật nhiệm vụ sản xuất cho các thiết bị đã chọn?</p>
       </Modal>
 
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
      )}
      
    </>
  );
};

export default MachineWorkScheduleList;
