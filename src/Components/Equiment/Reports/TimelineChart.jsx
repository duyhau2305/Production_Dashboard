import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './TimelineChart.css';
import { Slider } from 'antd';

const TimelineChart = ({ selectedDate,selectedMchine , onDateChange }) => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDate] = useState([]);
  const [listGradient, setListGradient] = useState([]);
  const [listGradientToFild, setListGradientToFild] = useState([]);
  const [hour, setHour] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  const [ArrayPercentOffline, setArrayPercentOffline] = useState([]);
  const [ArrayPercentRun, setArrayPercentRun] = useState([]);
  const [positionToTolipth, setPositionToTolipth] = useState(1)
  const [textToTolipth, setTextToTolipth] = useState('')
  const [currentIndex, setCurrentIndex] = useState(1)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState('1')

  const deviceId = '43636810-8e2f-11ef-a040-4d4ce340ad51';
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const formatDateForAPI = (date) => moment(date).format('YYYY-MM-DD');

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const findGaps = (intervals) => {
    const sortedIntervals = intervals.map(item => ({
      start: timeToMinutes(item.startTime),
      end: timeToMinutes(item.endTime),
    })).sort((a, b) => a.start - b.start);

    const gaps = [];
    const dayStart = 0;
    const dayEnd = 24 * 60;
    let lastEnd = dayStart;

    sortedIntervals.forEach(({ start, end }) => {
      if (start > lastEnd) {
        gaps.push({
          status: 'offline',
          startTime: formatTime(lastEnd),
          endTime: formatTime(start),
        });
      }
      lastEnd = Math.max(lastEnd, end);
    });

    if (lastEnd < dayEnd) {
      gaps.push({
        status: 'offline',
        startTime: formatTime(lastEnd),
        endTime: formatTime(dayEnd),
      });
    }
    return gaps;
  };

  const formatTime = (minutes) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };
  const calculateTotalOfflinePercentageBefore23 = (gaps, type) => {
    const totalSecondsInDay = 24 * 60 * 60;
    const limitTime = moment('23:00', 'HH:mm').hours() * 3600;
    let totalOfflineTime
    if (type == 'offline') {
      totalOfflineTime = gaps.reduce((acc, gap) => {
        let startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
        let endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
        if (endSeconds > limitTime) {
          endSeconds = limitTime;
        }
        if (endSeconds > startSeconds) {
          const offlineDuration = endSeconds - startSeconds;
          acc += offlineDuration;
        }

        return acc;
      }, 0);
    } else {
      totalOfflineTime = gaps.reduce((acc, gap) => {
        let startSeconds
        let endSeconds
        if (gap.status == type) {
          startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
          endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
        }

        // Giới hạn endTime nếu nó vượt quá 23:00
        if (endSeconds > limitTime) {
          endSeconds = limitTime; // Chỉ tính đến 23:00
        }

        // Chỉ tính nếu khoảng thời gian kết thúc sau khi bắt đầu
        if (endSeconds > startSeconds) {
          const offlineDuration = endSeconds - startSeconds;
          acc += offlineDuration;
        }

        return acc;
      }, 0);
    }

    const totalOfflinePercentage = (totalOfflineTime / totalSecondsInDay) * 100;
    return totalOfflinePercentage.toFixed(2);
  };
  function timeToSeconds(time) {
    // Tách giờ và phút
    const [hours, minutes] = time.split(':').map(Number);

    // Tính tổng giây
    const totalSeconds = (hours * 3600) + (minutes * 60);

    return totalSeconds;
  }
  function calculatePercentageOfDay(timeData) {
    const { startTime, endTime } = timeData;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const totalSecondsStart = (startHour * 3600) + (startMinute * 60);
    const totalSecondsEnd = (endHour * 3600) + (endMinute * 60);
    const percent = (totalSecondsEnd - totalSecondsStart) / 86400 * 100
    return percent.toFixed(2)
  }
  function percentOfDayToHMS(percentage) {
    const totalSecondsInDay = 24 * 60 * 60;
    const totalSeconds = totalSecondsInDay * (percentage / 100);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}giờ ${minutes}phút ${seconds}giây`;
  }
  const formatDateAndTime = (data) => {
    return data
        .map(entry => ({
            date: moment.tz(entry.date, "Asia/Ho_Chi_Minh").format('YYYY-DD-MM'),
            intervals: entry.intervals.map(interval => ({
                ...interval,
                startTime: moment.tz(interval.startTime, "Asia/Ho_Chi_Minh").format('HH:mm:ss'),
                endTime: moment.tz(interval.endTime, "Asia/Ho_Chi_Minh").format('HH:mm:ss'),
            }))
        }))
        .reverse()
};
  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null); 
    const start = startDate.toISOString()
    const end = new Date(endDate)
    const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()+1, 16, 59, 59, 0));
    const isoDate = utcDate.toISOString();
    try {
      const response = await axios.get(
        `http://localhost:5001/api/machine-operations/${selectedMchine}/timeline?startTime=2024-10-20T17:00:00Z&endTime=2024-10-30T16:59:59Z`
      );
      let totalOfflinePercentArray = [];
      let totalRun = []
      const formattedData = formatDateAndTime(response.data.data);
      const processedData = formattedData.map(entry => {
        const gaps = findGaps(entry.intervals);  
        const totalOfflinePercent = [];

        const runPercent = calculateTotalOfflinePercentageBefore23(entry.intervals, 'Chạy');
        totalRun.push(runPercent);
        totalOfflinePercentArray.push(totalOfflinePercent);

        const intervalsWithGaps = [...entry.intervals, ...gaps].sort((a, b) => moment(a.startTime, 'HH:mm') - moment(b.startTime, 'HH:mm'));
        return { ...entry, intervals: intervalsWithGaps };
      }); 

      setArrayPercentOffline(totalOfflinePercentArray)
      setArrayPercentRun(totalRun)
      const arrayGradient = processedData.map(value => createGradientStops(value.intervals));
      setListGradient(arrayGradient);
      setListGradientToFild(arrayGradient);
      setData(processedData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Run':
        return '#00C8D7';
      case 'Stop':
        return 'red';
      case 'Idle':
        return '#FFC107';
      case 'offline':
        return '#BFBFBF';
      default:
        return '#ffffff';
    }
  };
  const handleMouseMove = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    const totalHours = (percentX / 100) * 24;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    const currentTimeInMinutes = hours * 60 + minutes; // Tổng số phút hiện tại

    data[index].intervals.forEach(interval => {
      // Chuyển đổi startTime và endTime thành tổng số phút
      const [startHour, startMinute] = interval.startTime.split(':').map(Number);
      const [endHour, endMinute] = interval.endTime.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      // Kiểm tra nếu thời gian hiện tại nằm trong khoảng startTime và endTime
      if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        setTextToTolipth(`${interval.status} : ${interval.startTime}-${interval.endTime}  `)
      }
    });
    setCurrentIndex(index)
    setPositionToTolipth(percentX);
  };



  const calculatePercentage = (startTime, endTime) => {
    const startInMinutes = moment.duration(startTime).asMinutes();
    const endInMinutes = moment.duration(endTime).asMinutes();
    const duration = endInMinutes - startInMinutes;
    return {
      startPercent: (startInMinutes / 1440) * 100,
      durationPercent: (duration / 1440) * 100,
    };
  };

  const createGradientStops = (intervals) => {
    const gradientStops = [];
    let lastEndPercent = 0;
  
    intervals.forEach(item => {
      const { startTime, endTime, status } = item;
      const { startPercent, durationPercent } = calculatePercentage(startTime, endTime);
      const color = getStatusColor(status);
  
      // Nếu có khoảng trống từ `lastEndPercent` đến `startPercent`, thêm khoảng trống đó với màu mặc định
      if (startPercent > lastEndPercent) {
        gradientStops.push(`transparent ${lastEndPercent}%, transparent ${startPercent}%`);
      }
  
      // Thêm dải màu cho khoảng thời gian hiện tại
      gradientStops.push(`${color} ${startPercent}%, ${color} ${startPercent + durationPercent}%`);
      lastEndPercent = startPercent + durationPercent;
    });
  
    // Nếu phần trăm cuối cùng không đạt `100%`, thêm dải màu trong suốt từ điểm kết thúc cuối cùng đến `100%`
    if (lastEndPercent < 100) {
      gradientStops.push(`transparent ${lastEndPercent}%, transparent 100%`);
    }
  
    return gradientStops.join(', ');
  };

  useEffect(() => {
    const startDate = selectedDate?.startDate;
    const endDate = selectedDate?.endDate;

    if (startDate != null && endDate != null) {
      const startDate2 = moment(startDate);
      const endDate2 = moment(endDate);
      const newArrDate = [];

      for (let m = startDate2; m.isBefore(endDate2) || m.isSame(endDate2); m.add(1, 'days')) {
        newArrDate.push(m.clone());
      }
      setDate(newArrDate);
      fetchData(startDate, endDate);
    }

  }, [selectedDate , selectedMchine]);

  const scrollRef = useRef(null);

  const chartWidth = '100%';
  const chartHeight = '500px';

  const renderXAxisLabels = useMemo(() => (
    hour.map((value) => (
      <div key={value} style={{
        display: 'inline-block',
        width: '4.16%',
        textAlign: 'center',
        fontSize: '10px',
        marginTop: '5px'
      }}>
        {`${value}:00`}
      </div>
    ))
  ), [hour]);

  const renderYAxisLabels = useMemo(() => (
    dates.map((date, index) => (
      <div key={index} style={{ textAlign: 'right', fontSize: '10px', display: 'flex' }}>
        {date.format('DD/MM')}
      </div>
    ))
  ), [dates]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleUpArrowClick = () => {
    const startDate = new Date(selectedDate.startDate);
    const endDate = new Date(selectedDate.endDate);
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    onDateChange({ startDate: startDate, endDate: endDate });
  };
  const handleSliderChange = (newValue) => {
    // console.log(start)
    setStart(newValue[0])
    setEnd(newValue[1] - 30)
    setScale(`1.${newValue[0]/10}`)
};



  const handleMouseLeave = () => {
    setTextToTolipth(''); // Xóa text để ẩn tooltip
    setPositionToTolipth(0); // Reset vị trí của tooltip
  }
  return (
    <div style={{ position: 'relative', width: chartWidth, height: chartHeight }}>
      <div className="y-axis-arrow" style={{ position: 'absolute', top: 0, left: 31, height: '100%', borderLeft: '2px solid black' }}>
        <span className="arrow up-arrow" onClick={() => handleUpArrowClick()}>↑</span>
      </div>
      <div className="x-axis-arrow" style={{ position: 'absolute', bottom: 0, left: 31, width: '95%', borderBottom: '2px solid black' }}>
        <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between' }}>{renderXAxisLabels}</div>
        <span className="arrow right-arrow">→</span>
      </div>
      <div style={{ paddingLeft: '33px', position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '99%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
          {renderYAxisLabels}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '99%' }} >
          {data.length > 0 ? data.map((entry, index) => (
            <div onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={() => handleMouseLeave()} style={{overflow: 'hidden' , height: `${((100 / data.length-1)) - 10}%`}} >
              <div  className='gradient-container gradient-section gradient' key={index} style={{
                height: `100%`,
                background: `linear-gradient(to right, ${listGradient[index]})`,
                marginTop: '10px',
                width: `100%`,
                position :'relative',
                transition: 'transform 0.1s ease-in-out',
                transformOrigin: `50%`,
                transform: `scaleX(${scale})`,
                zIndex : '1'
              }} >  
              {currentIndex == index ? <span style={{ display: 'flex'  , justifyContent : 'space-between' ,  position : 'absolute' , top : '0' , marginLeft : `${positionToTolipth}%` ,background: '#ffff95'} }>
                {textToTolipth}
              </span> : <></>}  
              </div>
              {/* <div style={{ display: 'flex'  , justifyContent : 'space-between'}}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' , fontSize : '10px' ,marginTop : '5px'  }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: '#00ff07', marginRight: '5px'}}></div>
                  Chạy : {ArrayPercentRun[index]} %
                </div>
               
                <div style={{ display: 'flex', alignItems: 'center', fontSize : '10px' ,marginTop : '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: '#E7E7E7', marginRight: '5px' }}></div>
                  <span> Offline: {ArrayPercentOffline[index]} %</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px', fontSize : '10px', marginTop : '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: 'red', marginRight: '5px' }}></div>
                  <span>Dừng :{(100 - ArrayPercentRun[index] - ArrayPercentOffline[index]).toFixed(2)}%</span>
                </div>
              </div> */}
             
            </div>
          )) : (
            <div style={{ height: '32px', backgroundColor: '#E7E7E7', marginTop: '10px', width: '100%' }} />
          )}
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
        <Slider
          style={{ marginTop: '-5px', width: '95%' }}
          range={{ draggableTrack: true }}
          onChange={handleSliderChange}
          defaultValue={[0, 100]}
        />

      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#00C8D7', marginRight: '5px' }}></div>
          <span>Chạy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: 'red', marginRight: '5px' }}></div>
          <span>Dừng</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px' }}></div>
          <span>Idle</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#BFBFBF', marginRight: '5px' }}></div>
          <span>Offline</span>
        </div>
      </div>
    </div >

  );
};

export default TimelineChart;