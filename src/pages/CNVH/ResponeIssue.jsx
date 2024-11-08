import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfoCard from '../../Components/MachineCard/InfoCard';
import io from 'socket.io-client';
import { message } from 'antd';
import '../../index.css';
import { FiChevronLeft } from 'react-icons/fi';
import { IoMdClose } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { setMachineData,startCallHelp, stopCallHelp } from '../../redux/intervalSlice';
import moment from 'moment-timezone';


const ResponeIssue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [socket, setSocket] = useState(null); 
  useEffect(() => {
    
    const newSocket = io('http://192.168.10.186:5000', {
      transports: ['websocket', 'polling'],
    });
    
    setSocket(newSocket); 

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Ngắt kết nối khi component bị unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

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
  const [areas, setAreas] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading,setLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState("00:00");
  useEffect(() => {
    fetchAreas();
    fetchDevices();
    
  }, []);
  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${apiUrl}/device`);
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  // Xử lý khi người dùng chọn ngày
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    dispatch(setMachineData({ selectedDate: newDate, selectedMachine }));
  };

  // Xử lý khi người dùng chọn thiết bị
  const handleMachineSelect = (device) => {
    dispatch(setMachineData({ selectedDate, selectedMachine: device }));
  };
  
useEffect(() => {
  // Chỉ thực hiện khi `selectedMachine` và `selectedDate` có giá trị hợp lệ
  if (selectedMachine && selectedDate) {
    const fetchTelemetryData = async () => {
      setLoading(true);
      try {
        // Định dạng thời gian bắt đầu và kết thúc dựa trên `selectedDate` và timezone Asia/Ho_Chi_Minh
        const startDate = moment.tz(selectedDate, 'Asia/Ho_Chi_Minh').subtract(1, 'days').set({ hour: 17, minute: 0, second: 0 });
        const endDate = moment.tz(selectedDate, 'Asia/Ho_Chi_Minh').set({ hour: 16, minute: 59, second: 59 });

        const formattedStartDate = startDate.format("YYYY-MM-DDTHH:mm:ss[Z]");
        const formattedEndDate = endDate.format("YYYY-MM-DDTHH:mm:ss[Z]");

        const response = await axios.get(
          `${apiUrl}/machine-operations/${selectedMachine._id}/timeline`,
          {
            params: {
              startTime: formattedStartDate,
              endTime: formattedEndDate,
            },
          }
        );

        // Lọc khoảng thời gian "Stop" hoặc "Idle" lớn hơn 5 phút
        if (response.data && response.data.data.length > 0) {
          const filteredIntervals = response.data.data.flatMap(dayData =>
            dayData.intervals.filter(interval => {
              const startTime = new Date(interval.startTime);
              const endTime = new Date(interval.endTime);
              const totalSeconds = (endTime - startTime) / 1000;

              // Chỉ giữ lại các khoảng có trạng thái "Stop" hoặc "Idle" lớn hơn 5 phút
              return (interval.status === 'Stop' || interval.status === 'Idle') && totalSeconds > 300;
            })
          );

          // Cập nhật lại `telemetryData`
          setTelemetryData(filteredIntervals);
          
        } else {
          // Đặt `telemetryData` là mảng rỗng nếu không có dữ liệu
          setTelemetryData([]);
        }
      } catch (error) {
        console.error('Error fetching telemetry data:', error);
        message.error('Có lỗi khi tải dữ liệu telemetry.');
      } finally {
        setLoading(false); // Kết thúc tải
      }
    };

    // Gọi hàm fetchTelemetryData
    fetchTelemetryData();
  } else {
    // Đặt lại `telemetryData` nếu không có ngày hoặc máy được chọn
    setTelemetryData([]);
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

  const handleBackClick = () => navigate('/dashboard/mobile');

  const handleOpenModal = () => {
    setIsModalOpen(true);
   
    if (socket && !socket.connected) {
      socket.connect();
    }
  };
    

  const handleOpenHelpTimerModal = () => {
    setIsHelpTimerModalOpen(true)
    if (socket && !socket.connected) {
      socket.connect();
    }
  };
  const handleCallHelp = (team) => {
    if (socket) {
      // Phát sự kiện `call_help` để hiển thị trạng thái gọi
      socket.emit('call_help', { department: team, deviceId: selectedMachine.deviceId });
      message.success(`Đã gọi Đội ${team} thành công!`);
    }

    handleCloseModal();
    handleOpenHelpTimerModal();
  };

  const handleCloseHelpTimerModal = () => {
    if (socket) {
      // Phát sự kiện `cancel_call` để cập nhật trạng thái
      socket.emit('cancel_call', { deviceId: selectedMachine.deviceId });
      socket.disconnect(); // Ngắt kết nối sau khi xác nhận hoàn thành
    }
    setIsHelpTimerModalOpen(false);
    message.success("Trợ giúp đã hoàn thành!");
  };

  const handleCloseModal = () => {
    if (socket) {
     
      socket.emit('cancel_call', { deviceId: selectedMachine.deviceId });
      socket.disconnect(); // Ngắt kết nối socket khi modal đóng
    }
    setIsModalOpen(false);
  };
  
  const handleCallQC = () => handleCallHelp('PQC');
  const handleCallMaintenance = () => handleCallHelp('Bảo Trì');
  const handleCallTechnical = () => handleCallHelp('Kỹ thuật');
  const handleTimeClick = (interval, index) => {
    const isDeclared = isIntervalDeclared(interval); // Kiểm tra nếu khoảng thời gian đã khai báo
  
    // Nếu đã khai báo, hiển thị thông báo và không cho phép chọn
    if (isDeclared) {
        message.info('Khoảng thời gian này đã được khai báo!');
      return;
    }
  
    // Nếu `selectedDiv` có ít nhất một phần tử, kiểm tra trạng thái của `interval` mới
    if (selectedDiv.length > 0) {
      const firstSelectedInterval = telemetryData[selectedDiv[0]];
      const firstStatus = firstSelectedInterval.status;
  
      // Nếu trạng thái không giống nhau, hiển thị thông báo và không cho phép chọn
      if (firstStatus !== interval.status) {
        message.warning('Chỉ có thể chọn các khoảng thời gian có cùng trạng thái!');
        return;
      }
    }
  
    // Xử lý chọn hoặc bỏ chọn interval
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
      message.error('Vui lòng chọn thiết bị và ít nhất một khoảng thời gian.');
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
        message.error('Có lỗi xảy ra khi lấy dữ liệu downtime.');
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
    <div className="h-screen ">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-sky-500">
        <h1 className="text-5xl text-white font-bold py-6 flex-1 text-center">
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
            onChange={handleDateChange}
            className="w-full p-4 text-xl border rounded-lg"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold">Thiết bị:</h2>
          
          <select
            value={selectedMachine?.deviceId || ''}
            onChange={(e) => {
              const selectedDevice = devices.find((d) => d.deviceId === e.target.value);
              handleMachineSelect(selectedDevice);
            }}
            className="w-full p-4 text-xl border rounded-lg"
          >
            <option value="">Chọn thiết bị</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.deviceName}
              </option>
            ))}
          </select>
        </div>
      </div>
        {loading?(<div className="flex justify-center items-center h-96">
                  <div className="loader"></div> {/* Thêm hoặc tùy chỉnh CSS cho loader */}
                  <span className="text-3xl text-blue-600 ml-4">Đang tải dữ liệu...</span>
                </div> ):(  <div className="p-4">
                <h2 className="text-3xl font-bold text-center mb-4">Danh sách các khoảng thời gian ngừng máy:</h2>
                {telemetryData.map((interval, index) => {
                      const startDate = new Date(interval.startTime);
                      const endDate = new Date(interval.endTime);

                      const [startHour, startMinute, startSecond] = [
                        startDate.getUTCHours(),
                        startDate.getUTCMinutes(),
                        startDate.getUTCSeconds()
                      ];
                      const [endHour, endMinute, endSecond] = [
                        endDate.getUTCHours(),
                        endDate.getUTCMinutes(),
                        endDate.getUTCSeconds()
                      ];

                      let startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
                      let endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

                      let totalSeconds = endTotalSeconds - startTotalSeconds;
                      if (totalSeconds < 0) totalSeconds += 24 * 3600;

                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = totalSeconds % 60;

                      const isDeclared = isIntervalDeclared(interval);
                      const reasonName = isDeclared ? getReasonName(interval) : 'Chưa có lý do';
                      const isSelected = selectedDiv.includes(index);

                      // Xác định boxShadow dựa trên trạng thái
                      const boxShadow =
                        interval.status === 'Stop'
                          ? 'inset 0px 10px 40px 10px rgba(255, 0, 0, 0.8)' // Màu đỏ cho Stop
                          : interval.status === 'Idle'
                          ? 'inset 0px 10px 40px 10px rgba(255, 255, 0, 0.8)' // Màu vàng cho Idle
                          : '';

                      const borderColor =
                          interval.status === 'Stop'
                            ? 'border-red-500' // Màu đỏ cho Stop
                            : interval.status === 'Idle'
                            ? 'border-yellow-500' // Màu vàng cho Idle
                            : '';
                      const timeOptions = { hour: '2-digit', minute: '2-digit',second: '2-digit', hour12: false };

            return (
              <div
              key={`${interval.startTime}-${interval.endTime}-${index}`}
              className={`transition-transform transform border-4 rounded-3xl grid grid-cols-2 py-8 mt-4 px-8 w-[90%] justify-center items-center ml-8 gap-10 text-4xl cursor-pointer ${
                isDeclared ? 'bg-gray-300' : 'borderColor'
              } ${isSelected ? 'scale-105 bg-green-200 border-green-500' : ''}`}
              onClick={() => handleTimeClick(interval, index)}
              style={{ boxShadow}}
            >
              <span className="col-span-1 flex ml-2">Trong khoảng</span>
              <span className="col-span-1 flex">
                {`${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`}
              </span>
              <span className="col-span-1 flex ml-2">Thời lượng</span>
              <span className="col-span-1 flex">{`${hours} giờ ${minutes} phút ${seconds} giây`}</span>
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

          </div>)}
    

      <div className="fixed bottom-0 w-[90%] ml-8 p-6 bg-transperent flex flex-col items-center">
        <button
          onClick={handleResponse}
          disabled={!isResponseEnabled}
          className={`w-full py-6 mb-4 text-4xl font-bold rounded-lg ${
            isResponseEnabled ? 'bg-blue-600 text-white' : 'bg-gray-400'
          }`}
        >
          Phản hồi
        </button>

        <button
          onClick={handleOpenModal}
          className="w-full py-6 text-4xl font-bold rounded-lg bg-red-600 text-white"
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

    </div>
  );
};

export default ResponeIssue;