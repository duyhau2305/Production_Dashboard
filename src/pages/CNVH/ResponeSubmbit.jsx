import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { declareInterval } from '../../redux/intervalSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ResponeSubmit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedIntervals, selectedMachine, selectedDate } = useSelector(
    (state) => state.interval
  );

  const [filteredReasons, setFilteredReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [isResponseEnabled, setIsResponseEnabled] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/issue`)
      .then((response) => {
        
        const reasons = response.data.filter(
          (reason) =>
            reason.deviceNames.includes(selectedMachine.deviceName) &&
            reason.deviceStatus === 'DỪNG'
        );
        setFilteredReasons(reasons);
      })
      .catch(() => toast.error('Có lỗi xảy ra khi lấy dữ liệu.'));
  }, [selectedMachine]);
  


  const handleReasonClick = (reason) => {
    setSelectedReason(reason);
    setIsResponseEnabled(true);
  };

  const handleCancel = () => {
    if (!selectedReason) {
      
      navigate(-1);
    } else {
      
      setSelectedReason(null);
      setIsResponseEnabled(false);
      toast.info('Lý do đã được hủy.');
    }
  };

  const handleResponse = async () => {
    if (!selectedReason || !selectedIntervals || selectedIntervals.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khoảng thời gian và một lý do.');
      return;
    }

    try {
      const payloads = selectedIntervals.map((interval) => ({
        deviceId: selectedMachine.deviceId,
        deviceName: selectedMachine.deviceName,
        date: selectedDate,
        interval: {
          status: interval.status,
          startTime: interval.startTime,
          endTime: interval.endTime,
          _id: interval._id,
          selectedIntervalIndex: interval.selectedIntervalIndex,
        },
        reasonName: selectedReason.reasonName,
      }));

      console.log('Payloads:', payloads);

      await Promise.all(
        payloads.map((payload) =>
          axios.post(`${import.meta.env.VITE_API_BASE_URL}/downtime`, payload)
        )
      );

      selectedIntervals.forEach((interval) => {
        dispatch(
          declareInterval({
            date: selectedDate,
            intervalIndex: interval.selectedIntervalIndex,
          })
        );
      });

      toast.success('Phản hồi thành công!');
      setTimeout(() => navigate('/dashboard/mobile/issue'), 500);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Có lỗi xảy ra khi gửi phản hồi.');
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-sky-500">
        <h1 className="text-5xl text-white font-bold py-8 flex-1 text-center">
          Phản hồi ngừng máy
        </h1>
      </div>
      <div className="flex justify-between items-center ">
        <h1 className="text-4xl font-bold py-4 flex-1 text-center "
       >
          Trạng thái thiết bị
        </h1>
      </div>
      <div className="flex justify-between items-center w-[93.5%]  ml-8">
        <h1 className="text-4xl font-bold py-8 flex-1 text-center bg-white text-red-600 ">
          DỪNG
        </h1>
      </div>
     
      <div className="grid grid-cols-2 gap-4 p-8">
        {filteredReasons.map((reason, index) => (
          <button
            key={index}
            onClick={() => handleReasonClick(reason)}
            className={`p-8 text-4xl font-bold ${
              selectedReason === reason ? 'bg-red-400 text-white' : 'bg-gray-100'
              
            }` }
            style={{ boxShadow: `inset 0px 5px 30px 5px rgba(255, 0, 0, 0.8)` }}
          >
            {reason.reasonName}
          </button>
        ))}
      </div>

      <button
        onClick={handleResponse}
        disabled={!isResponseEnabled}
        className={`w-[93.5%] p-6 text-4xl ml-8 font-bold rounded-lg ${
          isResponseEnabled ? 'bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Phản hồi
      </button>

      <button
        onClick={handleCancel}
        className={`w-[93.5%] p-6 mt-2 text-4xl ml-8 rounded-lg font-bold ${
          selectedReason ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'
        }`}
      >
        {selectedReason ? 'Hủy bỏ' : 'Quay lại'}
      </button>

      <ToastContainer autoClose={1000} />
    </div>
  );
};

export default ResponeSubmit;
