import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './TimelineChart.css';
import { Slider, Checkbox, Radio, Dropdown, Menu, Button, Spin } from 'antd';

const TimelineChart = ({ selectedDate, selectedMchine, onDateChange }) => {
  console.log(selectedDate)
  const [data, setData] = useState([]);
  const [dataFilter, setDataFilter] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  const [listGradient, setListGradient] = useState([]);
  const [listGradientToFild, setListGradientToFild] = useState([]);
  const [hour, setHour] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  const [hourFil, setHourFil] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  const [arrayPercentOffline, setArrayPercentOffline] = useState([]);
  const [arrayPercentRun, setArrayPercentRun] = useState([]);
  const [arrayPercentIdle, setArrayPercentIdle] = useState([]);
  const [arrayPercentStop, setArrayPercentStop] = useState([]);
  const [positionToTooltip, setPositionToTooltip] = useState(1);
  const [textToTooltip, setTextToTooltip] = useState('');
  const [currentIndex, setCurrentIndex] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [scale, setScale] = useState('1');
  const [showYAxis, setShowYAxis] = useState(true);
  const [showXAxis, setShowXAxis] = useState(true);
  const [viewMode, setViewMode] = useState('24h');
  const [shift, setShift] = useState('');

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const formatDateForAPI = (date) => moment(date).format('YYYY-MM-DD');

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const findGaps = (intervals, date) => {
    const now = moment();

    console.log(now);
    const isToday = moment(date).isSame(moment(), 'day');

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
    console.log(lastEnd)
    if (lastEnd < dayEnd) {
      gaps.push({
        status: isToday ? 'yet' : 'offline',
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

  const formatDateAndTime = (data) => {
    return data
      .map(entry => ({
        date: moment.tz(entry.date, "Asia/Ho_Chi_Minh").format('YYYY-MM-DD'),
        intervals: entry.intervals.map(interval => ({
          ...interval,
          startTime: moment.tz(interval.startTime, "Asia/Ho_Chi_Minh").format('HH:mm:ss'),
          endTime: moment.tz(interval.endTime, "Asia/Ho_Chi_Minh").format('HH:mm:ss'),
        }))
      }))
      .reverse();
  };

  const createGradientStops = (intervals, start, end) => {
    const gradientStops = [];
    let lastEndPercent = 0;
    const startLimitMinutes = start;
    const endLimitMinutes = end;
    const totalIntervalMinutes = endLimitMinutes - startLimitMinutes;
    intervals.forEach(item => {
      const { startTime, endTime, status } = item;
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      if (startMinutes >= endLimitMinutes || endMinutes <= startLimitMinutes) {
        return;
      }
      const boundedStartMinutes = Math.max(startMinutes, startLimitMinutes);
      const boundedEndMinutes = Math.min(endMinutes, endLimitMinutes);
      const startPercent = ((boundedStartMinutes - startLimitMinutes) / totalIntervalMinutes) * 100;
      const endPercent = ((boundedEndMinutes - startLimitMinutes) / totalIntervalMinutes) * 100;
      const durationPercent = endPercent - startPercent;
      const color = getStatusColor(status);
      if (startPercent > lastEndPercent) {
        gradientStops.push(`transparent ${lastEndPercent}%, transparent ${startPercent}%`);
      }
      gradientStops.push(`${color} ${startPercent}%, ${color} ${endPercent}%`);
      lastEndPercent = endPercent;
    });

    if (lastEndPercent < 100) {
      gradientStops.push(`transparent ${lastEndPercent}%, transparent 100%`);
    }

    return gradientStops.join(', ');
  };
  const fetchData = async (startDate, endDate) => {

    setLoading(true);
    setError(null);
    try {
      const start = startDate.toISOString();
      const end = new Date(endDate);
      const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 16, 59, 59, 0));
      const isoDate = utcDate.toISOString();
      const firstApiUrl = `${apiUrl}/machine-operations/${selectedMchine}/timeline?startTime=${start}&endTime=${new Date(endDate.setDate(endDate.getDate() + 1)).toISOString()}`;
      const secondApiUrl = `${apiUrl}/machine-operations/${selectedMchine}/summary-status?startTime=${start}&endTime=${isoDate}`;
      const [response, responsePercent] = await Promise.all([
        axios.get(firstApiUrl),
        axios.get(secondApiUrl)
      ]);
      let totalRun = [], totalStop = [], totalIdle = [];
      const dataReverse = responsePercent.data.data;
      const formattedData = formatDateAndTime(response.data.data);
      const allDates = response.data.data.map(entry => entry.date);
      const filteredLogTimes = dataReverse.filter(entry => {
        return allDates.includes(entry.logTime);
      });
      filteredLogTimes.slice(0, formattedData.length).forEach(entry => {
        totalRun.push(entry.runTime.toFixed(2));
        totalIdle.push(entry.idleTime.toFixed(2));
        totalStop.push(entry.stopTime.toFixed(2));
      });
      const processedData = formattedData.map(entry => {
        const gaps = findGaps(entry.intervals, entry.date);
        return { ...entry, intervals: [...entry.intervals, ...gaps].sort((a, b) => moment(a.startTime, 'HH:mm') - moment(b.startTime, 'HH:mm')) };
      });
        setArrayPercentRun(totalRun);
      setArrayPercentIdle(totalIdle);
      setArrayPercentStop(totalStop);
      setDates(formattedData.map(value => moment(value.date).format('DD/MM')));
      setListGradient(processedData.map(value => createGradientStops(value.intervals, 0, 1440)));
      setData(processedData);
      setDataFilter(processedData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Run': return '#00C8D7';
      case 'Stop': return 'red';
      case 'Idle': return '#FFC107';
      case 'offline': return '#BFBFBF';
      case 'yet': return 'white';

      default: return '#ffffff';
    }
  };

  const getHour = (time) => {
    if (time && typeof time === 'string') {
      return parseInt(time.split(':')[0], 10);
    }
    return null; // Return null if the time is invalid
  };
  const handleMouseMove = (event, index) => {
    if (shift == '') {
      const rect = event.currentTarget.getBoundingClientRect();
      const percentX = ((event.clientX - rect.left) / rect.width) * 100;
      const totalHours = (percentX / 100) * 24;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      const currentTimeInMinutes = hours * 60 + minutes;
      const filteredData = data[index].intervals.filter(item => {
        const endHour = getHour(item.endTime);
        return endHour !== null && endHour < Math.max(...hour);
      });

      filteredData.forEach(interval => {
        const startTimeInMinutes = timeToMinutes(interval.startTime);
        const endTimeInMinutes = timeToMinutes(interval.endTime);
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
          setTextToTooltip(`${interval.status} : ${interval.startTime}-${interval.endTime}`);
        }
      });
      setCurrentIndex(index);
      setPositionToTooltip(percentX);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;

    let startMinute;
    let endMinute;

    if (shift === 'main') {
      startMinute = 8 * 60;
      endMinute = 17 * 60 + 20;
    } else if (shift === 'sub1') {
      startMinute = 17 * 60 + 20;
      endMinute = 18 * 60 + 20;
    } else {
      startMinute = hour[0] * 60;
      endMinute = hour[hour.length - 1] * 60;
    }

    const totalMinutes = (percentX / 100) * (endMinute - startMinute);
    const currentTimeInMinutes = Math.floor(totalMinutes) + startMinute;
    data[index].intervals.some(interval => {
      const startTimeInMinutes = timeToMinutes(interval.startTime);
      const endTimeInMinutes = timeToMinutes(interval.endTime);

      if (endTimeInMinutes > currentTimeInMinutes) {
        setTextToTooltip(`${interval.status} : ${interval.startTime}-${interval.endTime}`);
        return true; // Dừng vòng lặp
      }
      return false; // Tiếp tục vòng lặp
    });

    setCurrentIndex(index);
    setPositionToTooltip(percentX);

  };


  const handleMouseLeave = () => {
    setTextToTooltip('');
    setPositionToTooltip(0);
  };

  const handleSliderChange = (newValue) => {
    // setListGradient(data.map(value => createGradientStops(value.intervals, newValue[0] * 1440 / 100, newValue[1] * 1440 / 100)));
    let newListHour
    if (shift == '') {
      newListHour = hourFil.filter((value, index) => {
        if (index * 4.16 > newValue[0] && index * 4.16 < newValue[1]) {
          return value;
        }
      });
    } else {
      const hourFilSub = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      newListHour = hourFilSub.filter((value, index) => {
        if (index > newValue[0] / 10 && index / 10 < newValue[1] / 10) {
          return value;
        }
      });

    }
    handleShift('', newListHour[0], newListHour[newListHour.length - 1], 'slider')
    setShift('slider')
    setHour(newListHour);
  };

  useEffect(() => {
    if (selectedDate?.startDate && selectedDate?.endDate) {
      fetchData(selectedDate.startDate, selectedDate.endDate);
    }
  }, [selectedDate, selectedMchine]);

  const renderXAxisLabels = useMemo(() => (
    showXAxis && hour.map((value, index) => (
      <div key={value} style={{ display: 'inline-block', width: '4.16%', textAlign: 'center', fontSize: '10px', marginTop: '5px' }}>
        {(index === 0 && value === 17 || value === 18) || index === hour.length - 1 ? `${value}:20` : `${value}:00`}
      </div>
    ))
  ), [hour, showXAxis]);


  const renderYAxisLabels = useMemo(() => (
    showYAxis && dates.slice(0, 7).map((date, index) => (  // Chỉ lấy tối đa 7 phần tử
      <div key={index} style={{ textAlign: 'right', fontSize: '10px', display: 'flex', height: '15px', marginTop: index > 0 ? '58px' : '0' }}>
        {date}
      </div>
    ))
  ), [dates, showYAxis]);
  

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleUpArrowClick = () => {
    const startDate = new Date(selectedDate.startDate);
    const endDate = new Date(selectedDate.endDate);
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    onDateChange({ startDate, endDate });
  };

  function formatSecondsToTime(totalSeconds) {
    if (totalSeconds === 0) return '00:00:00';
    if (!totalSeconds) return '';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} giờ ${minutes.toString().padStart(1, '0')} phút`;
  }
  const handleShiftChange = ({ key }) => {
    setShift(key);
    // Điều chỉnh giờ hiển thị dựa trên lựa chọn ca làm việc
    switch (key) {
      case 'main':
        setHour(Array.from({ length: 10 }, (_, i) => 8 + i)); // Từ 8h đến 17h20 (8, 9, 10, 11, 12, 13, 14, 15, 16, 17)
        break;
      case 'sub1':
        setHour([17, 18]); // Từ 17h20 đến 18h20
        break;
      case 'sub2':
        setHour([17, 18, 19]); // Từ 17h20 đến 19h20
        break;
      default:
        setHour(Array.from({ length: 24 }, (_, i) => i)); // Mặc định là 24h
    }
  };

  const isTimeInRange = (time, startMinute, endMinute) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= startMinute && totalMinutes < endMinute;
  };
  const handleShift = async (shift, startDateHour, endDateHour, type) => {
    let startMinute, endMinute;

    if (type !== 'slider') {
      if (shift === 'main') {
        startMinute = 8 * 60;
        endMinute = 17 * 60 + 20;
      } else if (shift === 'sub1') {
        startMinute = 17 * 60 + 20;
        endMinute = 18 * 60 + 20;
      } else if (shift === 'sub2') {
        startMinute = 17 * 60 + 20;
        endMinute = 19 * 60 + 20;
      }
    } else {
      startMinute = startDateHour * 60;
      endMinute = endDateHour * 60;
    }
    const filteredData = await Promise.all(dataFilter.map(async (entry) => {
      const intervals = entry.intervals.filter(interval => {
        const startInRange = isTimeInRange(interval.startTime, startMinute, endMinute);
        const endInRange = isTimeInRange(interval.endTime, startMinute, endMinute);
        return startInRange && endInRange;
      });

      const offlineIntervals = [];
      let currentMinute = startMinute;
      while (currentMinute < endMinute) {
        const currentStartTime = moment().startOf('day').add(currentMinute, 'minutes').format('HH:mm');
        const currentEndTime = moment().startOf('day').add(currentMinute + 1, 'minutes').format('HH:mm');
        const isActive = intervals.some(interval => {
          const intervalStart = moment(interval.startTime, 'HH:mm');
          const intervalEnd = moment(interval.endTime, 'HH:mm');
          return intervalStart.isBefore(currentEndTime) && intervalEnd.isAfter(currentStartTime);
        });

        if (!isActive) {
          offlineIntervals.push({
            status: 'offline',
            startTime: currentStartTime,
            endTime: currentEndTime
          });
        }

        currentMinute++;
      }
      const allIntervals = [...intervals, ...offlineIntervals].sort((a, b) => {
        return moment(a.startTime, 'HH:mm') - moment(b.startTime, 'HH:mm');
      });
      return {
        date: entry.date,
        intervals: allIntervals
      };
    }));
    
    setData(filteredData);
    setListGradient(filteredData.map(value => createGradientStops(value.intervals, startMinute, endMinute)));
  };
  const handleFilterByDay = () => {
    setHour(Array.from({ length: 24 }, (_, i) => i))
    setData(dataFilter)
    setListGradient(dataFilter.map(value => createGradientStops(value.intervals, 0, 1440)));
    setShift('')
  }
  const shiftMenu = (
    <Menu onClick={handleShiftChange}>
      <Menu.Item key="main" onClick={() => handleShift("main")}>Ca chính</Menu.Item>
      <Menu.Item key="sub1" onClick={() => handleShift("sub1")}>Ca phụ 1h</Menu.Item>
      <Menu.Item key="sub2" onClick={() => handleShift("sub2")}>Ca phụ 2h</Menu.Item>

    </Menu>
  );
  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" /> {/* Ant Design spinner */}
        </div>
      )}
      <div style={{ position: 'absolute', top: '-35px', right: '70px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Checkbox checked={showYAxis} onChange={(e) => setShowYAxis(e.target.checked)}></Checkbox>
        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <Radio.Button value="24h" onClick={() => handleFilterByDay()}>Theo 24h</Radio.Button>
          <Radio.Button value="shift">Theo ca làm việc</Radio.Button>
        </Radio.Group>
        {viewMode === 'shift' && (
          <Dropdown overlay={shiftMenu} trigger={['click']}>
            <Button>{shift === 'main' ? 'Ca chính' : shift === 'sub1' ? 'Ca phụ 1h' : shift === 'sub2' ? 'Ca phụ 2h' : 'Ca chính'}</Button>
          </Dropdown>
        )}
      </div>
      <div className="y-axis-arrow" style={{ position: 'absolute', top: 0, left: 31, height: '100%', borderLeft: '2px solid black', display: showYAxis ? 'block' : 'none' }}>
        <span className="arrow up-arrow" onClick={handleUpArrowClick}>↑</span>
      </div>
      <div className="x-axis-arrow" style={{ position: 'absolute', bottom: 0, left: 31, width: '95%', borderBottom: '2px solid black', display: showYAxis ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between' }}>{renderXAxisLabels}</div>
        <span className="arrow right-arrow">→</span>
      </div>
      <div style={{ paddingLeft: '33px', position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '99%', display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
          {renderYAxisLabels}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '99%' }}>
        {data.length > 0 ? data.slice(0, 7).map((entry, index) => (  // Chỉ lấy tối đa 7 phần tử
            <div key={index} onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={handleMouseLeave} style={{ overflow: 'hidden' }}>
              <div className="gradient-container gradient-section gradient" style={{
                height: '50px',
                background: `linear-gradient(to right, ${listGradient[index]})`,
                width: '100%',
                marginTop: index > 0 ? '1px' : '0',
                position: 'relative',
                zIndex: '1'
              }}>

                {currentIndex === index && (
                  <span style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, marginLeft: `${positionToTooltip}%`, background: '#ffff95' }}>
                    {textToTooltip}
                  </span>
                )}

              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px', fontSize: '10px', marginTop: '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: '#00C8D7', marginRight: '5px' }}></div>
                  Chạy : {formatSecondsToTime(arrayPercentRun[index])}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', fontSize: '10px', marginTop: '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px' }}></div>
                  <span>Chờ : {formatSecondsToTime(arrayPercentIdle[index])}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px', fontSize: '10px', marginTop: '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: 'red', marginRight: '5px' }}></div>
                  <span>Dừng : {formatSecondsToTime(arrayPercentStop[index])}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px', fontSize: '10px', marginTop: '5px' }}>
                  <div style={{ width: '15px', height: '15px', backgroundColor: '#BFBFBF', marginRight: '5px' }}></div>
                  <span>Tắt máy : {formatSecondsToTime(86400 - arrayPercentStop[index] - arrayPercentIdle[index] - arrayPercentRun[index])}</span>
                </div>
              </div>
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
          onChange={() => { }} // Optionally handle the change event if needed
          onAfterChange={handleSliderChange} // Call the function when the user releases the slider
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
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px' }}></div>
          <span>Chờ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#BFBFBF', marginRight: '5px' }}></div>
          <span>Tắt máy</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
