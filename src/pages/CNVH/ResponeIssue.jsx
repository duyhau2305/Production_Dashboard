import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfoCard from '../../Components/MachineCard/InfoCard';
import '../../index.css';
import { FiChevronLeft } from 'react-icons/fi';
import { IoMdClose } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { setMachineData } from '../../redux/intervalSlice';


const ResponeIssue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  

  // Lấy dữ liệu từ Redux Store
  const { selectedDate, selectedMachine, declaredIntervals } = useSelector(
    (state) => state.interval
  );

  const [telemetryData, setTelemetryData] = useState([]);
  const [selectedDiv, setSelectedDiv] = useState([]);
  const [isResponseEnabled, setIsResponseEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpTimerModalOpen, setIsHelpTimerModalOpen] = useState(false);
  const [declaredDowntimes, setDeclaredDowntimes] = useState([]); // Lưu downtime đã khai báo
  
  const [elapsedTime, setElapsedTime] = useState("00:00");

  useEffect(() => {
    if (selectedMachine) {
      const fetchTelemetryData = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/telemetry?deviceId=${selectedMachine.deviceId}&startDate=${selectedDate}&endDate=${selectedDate}`
          );
  
          if (response.data && response.data.length > 0) {
            // Lọc dữ liệu ngay sau khi nhận được từ API
            const filteredIntervals = response.data[0].intervals.filter((interval) => {
              const [startHour, startMinute] = interval.startTime.split(':').map(Number);
              const [endHour, endMinute] = interval.endTime.split(':').map(Number);
  
              // Tính tổng số phút từ giờ và phút
              const startTotalMinutes = startHour * 60 + startMinute;
              const endTotalMinutes = endHour * 60 + endMinute;
  
              // Tính thời lượng giữa hai thời điểm (xử lý qua ngày)
              let totalMinutes = endTotalMinutes - startTotalMinutes;
              if (totalMinutes < 0) totalMinutes += 24 * 60; // Nếu qua ngày, cộng thêm 24 giờ
  
              // Lọc các interval có status "Dừng" và thời lượng > 5 phút
              return interval.status === 'Dừng' && totalMinutes > 5;
            });
            console.log(filteredIntervals)
            // Cập nhật state với dữ liệu đã lọc
            setTelemetryData(filteredIntervals);
          }
        } catch (error) {
          console.error('Error fetching telemetry data:', error);
        }
      };
  
      fetchTelemetryData();
    }
  }, [selectedMachine, selectedDate]);
  

  useEffect(() => {
    if (isHelpTimerModalOpen) {
      const startTime = new Date();
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isHelpTimerModalOpen]);

  const handleBackClick = () => navigate(-1);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenHelpTimerModal = () => setIsHelpTimerModalOpen(true);
  const handleCloseHelpTimerModal = () => {
    setIsHelpTimerModalOpen(false);
    toast.success("Trợ giúp đã hoàn thành!");
  };

  const handleCallHelp = (team) => {
    toast.success(`Đã gọi Đội ${team} thành công!`);
    handleCloseModal();
    handleOpenHelpTimerModal();
  };
  const handleCallQC = () => handleCallHelp('QC');
  const handleCallMaintenance = () => handleCallHelp('Bảo Trì');
  const handleCallTechnical = () => handleCallHelp('Đội kỹ thuật');
  const handleTimeClick = (interval, index) => {
    const isDeclared = isIntervalDeclared(interval); // Kiểm tra đã khai báo chưa
  
    if (isDeclared) {
      toast.info('Khoảng thời gian này đã được khai báo!');
      return; // Không cho phép chọn nếu đã khai báo
    }
  
    setSelectedDiv((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index) // Bỏ chọn nếu đã chọn trước đó
        : [...prevSelected, index] // Thêm vào nếu chưa chọn
    );
  
    setIsResponseEnabled(true); // Kích hoạt nút phản hồi
    console.log('Khoảng thời gian đã chọn:', interval);
  };
  
  console.log(selectedDiv)

  const handleResponse = () => {
    if (!selectedMachine || selectedDiv.length === 0) {
      toast.error('Vui lòng chọn thiết bị và ít nhất một khoảng thời gian.');
      return;
    }
  
    const selectedIntervals = selectedDiv.map((index) => telemetryData[index]);
  
    dispatch(
      setMachineData({
        selectedDate,
        selectedMachine,
        selectedIntervals: selectedIntervals.map((interval, i) => ({
          ...interval,
          selectedIntervalIndex: selectedDiv[i],
        })),
      })
    );
  
    const stateToSave = {
      selectedDate,
      selectedMachine,
      declaredIntervals: {
        ...declaredIntervals,
        [selectedDate]: [...(declaredIntervals[selectedDate] || []), ...selectedDiv],
      },
    };
    localStorage.setItem('intervalState', JSON.stringify(stateToSave));
  
    navigate('/dashboard/mobile/issue/respone');
  };
  
  console.log(telemetryData)
  
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Chuẩn định dạng YYYY-MM-DD
  };
  
  useEffect(() => {
    const fetchDeclaredDowntimes = async () => {
      try {
        const formattedDate = formatDate(selectedDate); 
        const response = await axios.get(`${apiUrl}/downtime`, {
          params: {
            deviceId: selectedMachine.deviceId,
            startDate: formattedDate,
            endDate: formattedDate,
          },
        });
        console.log('Downtime response:', response.data); // Kiểm tra dữ liệu trả về
        setDeclaredDowntimes(response.data);
      } catch (error) {
        console.error('Error fetching declared downtimes:', error);
        toast.error('Có lỗi xảy ra khi lấy dữ liệu downtime.');
      }
    };
  
    if (selectedMachine && selectedDate) {
      fetchDeclaredDowntimes();
    }
  }, [selectedMachine, selectedDate]);
  
  const isIntervalDeclared = (interval) => {
    if (declaredDowntimes.length === 0) return false; // Nếu downtime rỗng, cho phép chọn tất cả
  
    return declaredDowntimes.some((downtime) =>
      downtime.interval.some((d) =>
        d.startTime === interval.startTime && d.endTime === interval.endTime
      )
    );
  };
  
  const getReasonName = (interval) => {
    const downtime = declaredDowntimes.find((downtime) =>
      downtime.interval.some((d) =>
        d.startTime === interval.startTime && d.endTime === interval.endTime
      )
    );
    return downtime ? downtime.reasonName : 'Chưa có lý do';
  };
   
  
  
  return (
    <div className="h-screen bg-gray-100">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-sky-500">
        <h1 className="text-5xl text-white font-bold py-8 flex-1 text-center">
          <span className="cursor-pointer" onClick={handleBackClick}>
            <FiChevronLeft />
          </span>
          Phản hồi ngừng máy
        </h1>
      </div>

      <div className="grid grid-cols-2 p-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Ngày:</h2>
          <input
            type="date"
            value={selectedDate}
            readOnly
            className="w-full p-4 text-xl border rounded-lg"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold">Thiết bị:</h2>
          {selectedMachine ? (
            <InfoCard machine={selectedMachine.deviceName} />
          ) : (
            <p className="text-red-500 text-xl">Chưa chọn thiết bị</p>
          )}
        </div>
      </div>

      <div className="p-4">
  <h2 className="text-3xl font-bold text-center mb-4">Danh sách các khoảng thời gian ngừng máy:</h2>
  {telemetryData.map((interval, index) => {
    const [startHour, startMinute] = interval.startTime.split(':').map(Number);
    const [endHour, endMinute] = interval.endTime.split(':').map(Number);

    let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Xử lý qua ngày

    const isDeclared = isIntervalDeclared(interval); // Kiểm tra đã khai báo chưa
    const reasonName = isDeclared ? getReasonName(interval) : 'Chưa có lý do';

    const isSelected = selectedDiv.includes(index);

    return (
      <div
        key={interval._id}
        className={`transition-transform transform border-4 rounded-3xl grid grid-cols-2 py-8 mt-4 px-8 w-[90%] justify-center items-center ml-8 gap-10 text-4xl cursor-pointer ${
          isDeclared ? 'bg-gray-300' : 'border-red-500'
        } ${isSelected ? 'scale-105 bg-green-200 border-green-500' : ''}`}
        onClick={() => handleTimeClick(interval, index)}
        style={{ boxShadow: `inset 0px 10px 40px 10px rgba(255, 0, 0, 0.8)` }}
      >
        <span className="col-span-1 flex ml-2">Trong khoảng</span>
        <span className="col-span-1 flex">{`${interval.startTime} - ${interval.endTime}`}</span>
        <span className="col-span-1 flex ml-2">Thời lượng</span>
        <span className="col-span-1 flex">{`${Math.floor(totalMinutes / 60)} giờ ${totalMinutes % 60} phút`}</span>
        <span className="col-span-1 flex">
          {isDeclared ? 'Đã khai báo' : 'Chưa khai báo'}
        </span>
        {isDeclared && (
          <span className="col-span-1 flex text-blue-600 font-semibold">
            {reasonName}
          </span>
        )}
      </div>
    );
  })}
</div>




      <div className="fixed bottom-0 w-full p-4 bg-transperent flex flex-col items-center">
        <button
          onClick={handleResponse}
          disabled={!isResponseEnabled}
          className={`w-full py-4 mb-4 text-xl font-bold rounded-lg ${
            isResponseEnabled ? 'bg-blue-600 text-white' : 'bg-gray-400'
          }`}
        >
          Phản hồi
        </button>

        <button
          onClick={handleOpenModal}
          className="w-full py-4 text-xl font-bold rounded-lg bg-red-600 text-white"
        >
          Gọi trợ giúp
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-[80%] h-[32%] rounded-t-xl shadow-lg">
            <div className="grid grid-cols-4 w-full bg-blue-500 p-8 rounded-t-xl justify-center bg-gradient-to-r from-[#375BA9] to-[#43B3DC] ">
              <h2 className="text-5xl text-center font-semibold col-span-3 ml-32 text-white">Phản hồi trợ giúp</h2>
              <button onClick={handleCloseModal} className="text-5xl col-span-1 ml-32 font-bold">
                <IoMdClose />
              </button>
            </div>
            <div className="mt-10 grid grid-rows-2 -ml-12 justify-center items-center gap-1">
              <h2 className="text-5xl text-center font-bold col-span-3 ml-16">{selectedMachine?.deviceName}</h2>
              <p className="text-5xl text-center mt-6 mb-22 ml-20">Cần gọi trợ giúp từ</p>
            </div>
            <div className="grid gap-4 mt-16 w-[80%] ml-20 items-center">
              <button onClick={handleCallQC} className="border-2 border-blue-600 text-blue-600 hover:bg-blue-500 text-5xl py-4 px-8 rounded-md">
                Đội QC
              </button>
              <button onClick={handleCallMaintenance} className="border-2 border-blue-600 text-blue-600 text-5xl py-4 px-8 rounded-md">
                Đội Bảo Trì
              </button>
              <button onClick={handleCallTechnical} className="border-2 border-blue-600 text-blue-600 text-5xl py-4 px-8 rounded-md">
                Đội Kỹ Thuật
              </button>
            </div>
          </div>
        </div>
      )}

    {isHelpTimerModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-[65%] h-[28%] rounded-xl shadow-lg ">
            <div className="flex justify-between  bg-gradient-to-r from-[#375BA9] to-[#43B3DC]">
              <h2 className="text-5xl p-6 ml-10 text-white">Thời gian Trợ giúp</h2>
              <button onClick={handleCloseHelpTimerModal} className="text-4xl">
                <IoMdClose />
              </button>
            </div>
            <div className="text-center mt-8">
            <h2 className="text-5xl font-semibold ">{selectedMachine?.deviceName}</h2>
              <div className="mt-10 bg-[#42B2DB]  p-8"> 
                <div className="text-4xl font-semibold mb-6">Quá trình đang diễn ra trong: </div>
                <span className="text-8xl font-semibold mt-6"> {elapsedTime} </span> 
                </div>
              <button onClick={handleCloseHelpTimerModal} className=" bg-gradient-to-r from-[#375BA9] to-[#43B3DC] text-white  rounded-lg mt-10 text-4xl p-6 ">
                Xác nhận đã hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={1000} hideProgressBar />
    </div>
  );
};

export default ResponeIssue;