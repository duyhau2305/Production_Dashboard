import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfoCard from '../../Components/MachineCard/InfoCard';
import '../../index.css';
import { FiChevronLeft } from 'react-icons/fi';
import { IoMdClose } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0'); 
  return `${year}-${month}-${day}`;
};

// Hàm tính thời lượng từ thời gian bắt đầu và kết thúc
const calculateDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = new Date(0, 0, 0, startHour, startMinute);
  const end = new Date(0, 0, 0, endHour, endMinute);
  let diff = (end - start) / 1000 / 60; // Tính ra phút
  if (diff < 0) diff += 24 * 60; // Xử lý trường hợp thời gian qua ngày
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours} giờ ${minutes} phút`;
};

const ResponeIssue = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiv, setSelectedDiv] = useState(null);
  const [isResponseEnabled, setIsResponseEnabled] = useState(false);
  const [telemetryData, setTelemetryData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL

  const { selectedDate, selectedMachine } = location.state || { selectedDate: null, selectedMachine: null };
  const displayDate = selectedDate || getCurrentDate();

  // Gọi API để lấy dữ liệu telemetry dựa trên thiết bị và ngày
  useEffect(() => {
    if (selectedMachine) {
      const fetchTelemetryData = async () => {
        try {
          const response = await axios.get(`${apiUrl}/telemetry?deviceId=543ff470-54c6-11ef-8dd4-b74d24d26b24&startDate=${selectedDate}&endDate=${selectedDate}`);
          if (response.data && response.data.length > 0) {
            setTelemetryData(response.data[0].intervals); // Giả sử API trả về một mảng với các khoảng thời gian
          }
          console.log(response.data)
        } catch (error) {
          console.error("Error fetching telemetry data:", error);
        }
      };

      fetchTelemetryData();
    }
  }, [selectedMachine, selectedDate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCallQC = () => {
    toast.success('Đã gọi Đội QC thành công. Xin đợi trong giây lát!', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { fontSize: '1.6rem', padding: '1rem', width: '90%' }, 
    });
    handleCloseModal();
  };

  const handleCallMaintenance = () => {
    toast.success('Đã gọi Đội Bảo Trì thành công. Xin đợi trong giây lát!', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { fontSize: '1.6rem', padding: '1rem', width: '90%' },
    });
    handleCloseModal();
  };

  const handleTimeClick = (index) => {
    setSelectedDiv(index);
    setIsResponseEnabled(true);
  };

  const handleResponse = () => {
    if (!selectedMachine) {
      toast.error("Không có thiết bị nào được chọn!");
      return;
    }

    navigate('/dashboard/mobile/issue/respone', {
      state: {
        selectedDate: displayDate,
        selectedMachine: selectedMachine,
      }
    });
  };

  return (
    <div className="h-screen bg-gray-100 w-full">
      <div className="flex justify-between items-center w-full bg-gradient-to-r from-blue-600 to-sky-500">
        <h1 className="h-32 items-center text-5xl text-white font-bold flex w-full justify-evenly">
          <span className="text-5xl -ml-52 cursor-pointer" onClick={handleBackClick}>
            <FiChevronLeft />
          </span>
          Phản hồi ngừng máy
        </h1>
      </div>

      <div className="grid grid-cols-2 w-full p-2 gap-2">
        <div className="justify-start grid grid-flow-row p-8 ">
          <h1 className="text-left text-5xl font-semibold mt-4 w-full">Ngày</h1>
          <div>
            <input
              type="date"
              value={displayDate}
              readOnly
              className="block w-[100%] h-24 text-5xl ml-6 mt-6 border bg-white text-center rounded-lg py-6 px-8 focus:outline-none"
            />
          </div>
        </div>

        <div className="justify-start grid grid-flow-row p-8">
          <h1 className="text-center text-5xl font-semibold mt-2">Thiết bị đã chọn</h1>
          {selectedMachine ? (
            <InfoCard machine={selectedMachine.deviceName} className={`bg-white text-center p-[2px] ml-4 text-5xl`} />
          ) : (
            <p className="text-4xl text-center text-red-500">Không có thiết bị nào được chọn!</p>
          )}
        </div>
      </div>

      <div className="justify-start grid grid-flow-row p-8">
        <h1 className="text-center text-5xl font-semibold mt-2">Khoảng thời gian ngừng máy</h1>
      </div>

      {telemetryData
  .filter(interval => interval.status === "Dừng" && calculateDuration(interval.startTime, interval.endTime) !== "0 giờ 0 phút")
  .map((interval, index) => (
    <div
      key={interval._id}
      className={`border-8 rounded-3xl grid grid-cols-2 py-8 mt-4 px-8 w-[90%] justify-center items-center ml-8 gap-10 text-4xl cursor-pointer ${selectedDiv === index ? 'bg-gray-200' : 'border-[#FCFC00]'}`}
      onClick={() => handleTimeClick(index)}
      style={{ boxShadow: `inset 0px 10px 40px 10px rgba(252, 252, 0, 0.4)` }}
    >
      <span className="col-span-1 flex ml-2 ">Trong khoảng</span>
      <span className="col-span-1 flex">{`${interval.startTime} - ${interval.endTime}`}</span>
      <span className="col-span-1 flex ml-2 ">Thời lượng</span>
      <span className="col-span-1 flex">{calculateDuration(interval.startTime, interval.endTime)}</span>
      <span className="col-span-1 flex ml-2 ">Trạng thái thiết bị</span>
      <span className="col-span-1 flex">Chờ</span>
    </div>
  ))}


{/* Các nút Phản hồi và Gọi trợ giúp */}
<div className="fixed bottom-0 w-full flex flex-col items-center z-50 p-4 bg-transperent -ml-4">
  <button
    onClick={handleResponse}
    disabled={!isResponseEnabled}
    className={`w-[90%] p-6 mb-4 rounded-lg shadow-lg text-white text-center text-4xl font-bold transition duration-300 ease-in-out ${isResponseEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
  >
    Phản hồi
  </button>
  <button
    onClick={handleOpenModal}
    className="w-[90%] p-6 rounded-lg shadow-lg text-white text-center bg-red-600 hover:bg-red-900 text-4xl font-bold transition duration-300 ease-in-out"
  >
    Gọi trợ giúp
  </button>
</div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-[70%] h-[22%] p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-4 w-full ">
              <h2 className="text-6xl text-center font-bold col-span-3 ml-4">{selectedMachine?.deviceName}</h2>
              <button onClick={handleCloseModal} className="text-6xl col-span-1 ml-8 font-bold">
                <IoMdClose />
              </button>
            </div>
            <p className="text-5xl text-center mt-10">Cần gọi trợ giúp từ</p>
            <div className="grid grid-cols-2 gap-4 mt-16">
              <button onClick={handleCallQC} className="border-2 border-blue-600 text-blue-600 text-5xl py-4 px-8 rounded-md">
                Đội QC
              </button>
              <button onClick={handleCallMaintenance} className="border-2 border-blue-600 text-blue-600 text-5xl py-4 px-8 rounded-md">
                Đội Bảo Trì
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ fontSize: '30px', padding: '3rem', width: '100%', textAlign: 'center' }}
      />
    </div>
  );
};

export default ResponeIssue;
