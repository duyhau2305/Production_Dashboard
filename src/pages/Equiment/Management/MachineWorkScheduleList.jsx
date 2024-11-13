import React, { useState, useEffect } from 'react';
import { Modal, Select, DatePicker, Button ,Spin ,Dropdown, Menu,message } from 'antd';
import { DeleteOutlined ,EditOutlined,PlusOutlined,SettingOutlined} from '@ant-design/icons';
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

    if (updatedMachines.length === 0) {
      setIsSelecting(false); // Chuyển lại trạng thái về "Chọn Thiết Bị" nếu không còn máy nào được chọn
    }
  } else {
    // Nếu thiết bị chưa được chọn, thêm thiết bị vào danh sách cùng với nhiệm vụ của nó
    const tasksForDevice = getTasksForDevice(machine.deviceName);
    setSelectedMachines((prevMachines) => [...prevMachines, { ...machine, tasks: tasksForDevice }]);
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
            </Dropdown></div>    
      

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
