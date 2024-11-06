import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './TimelineChart.css';
import { Slider, Checkbox } from 'antd';

const TimelineChart = ({ selectedDate, selectedMchine, onDateChange }) => {
  const [data, setData] = useState([]);
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
      const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 16, 59, 59, 0));
      const isoDate = utcDate.toISOString();
      const firstApiUrl = `${apiUrl}/machine-operations/${selectedMchine}/timeline?startTime=${startDate.toISOString()}&endTime=${new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString()}`;
      const secondApiUrl = `${apiUrl}/machine-operations/${selectedMchine}/summary-status?startTime=${start}&endTime=${isoDate}`;
      const [response, responsePercent] = await Promise.all([
        axios.get(firstApiUrl),
        axios.get(secondApiUrl)
      ]);
      let totalRun = [];
      let totalStop = [];
      let totalIdle = [];
      const dataReverse = responsePercent.data.data.reverse();
      dataReverse.slice(0, response.data.data.length).forEach(entry => {
        totalRun.push(entry.runTime.toFixed(2));
        totalIdle.push(entry.idleTime.toFixed(2));
        totalStop.push(entry.stopTime.toFixed(2));
      });
      setArrayPercentRun(totalRun)
      setArrayPercentIdle(totalStop)
      setArrayPercentStop(totalIdle)
      const formattedData = formatDateAndTime(response.data.data).reverse();
      const processedData = formattedData.map(entry => {
        const gaps = findGaps(entry.intervals);
        return { ...entry, intervals: [...entry.intervals, ...gaps].sort((a, b) => moment(a.startTime, 'HH:mm') - moment(b.startTime, 'HH:mm')) };
      });

      setDates(response.data.data.map(value => moment(value.date).format('DD/MM')));
      setListGradient(processedData.map(value => createGradientStops(value.intervals, 0, 1440)));
      setData(processedData);
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
  };

  const handleMouseLeave = () => {
    setTextToTooltip('');
    setPositionToTooltip(0);
  };

  const handleSliderChange = (newValue) => {
    setListGradient(data.map(value => createGradientStops(value.intervals, newValue[0] * 1440 / 100, newValue[1] * 1440 / 100)));
    const newListHour = hourFil.filter((value, index) => {
      if (index * 4.16 > newValue[0] && index * 4.16 < newValue[1]) {
        return value;
      }
    });
    setHour(newListHour);
  };

  useEffect(() => {
    if (selectedDate?.startDate && selectedDate?.endDate) {
      fetchData(selectedDate.startDate, selectedDate.endDate);
    }
  }, [selectedDate, selectedMchine]);

  const renderXAxisLabels = useMemo(() => (
    showXAxis && hour.map(value => (
      <div key={value} style={{ display: 'inline-block', width: '4.16%', textAlign: 'center', fontSize: '10px', marginTop: '5px' }}>
        {`${value}:00`}
      </div>
    ))
  ), [hour, showXAxis]);

  const renderYAxisLabels = useMemo(() => (
    showYAxis && dates.map((date, index) => (
      <div key={index} style={{ textAlign: 'right', fontSize: '10px', display: 'flex', height: '70px' }}>
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div style={{ position: 'absolute', top: '-35px', right: '70px' }}>
        <Checkbox checked={showYAxis} onChange={(e) => setShowYAxis(e.target.checked)}></Checkbox>
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
          {data.length > 0 ? data.map((entry, index) => (
            <div key={index} onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={handleMouseLeave} style={{ overflow: 'hidden' }}>
              <div className="gradient-container gradient-section gradient" style={{
                height: '50px',
                background: `linear-gradient(to right, ${listGradient[index]})`,
                marginTop: '10px',
                width: '100%',
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
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px' }}></div>
          <span>Idle</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#BFBFBF', marginRight: '5px' }}></div>
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;

