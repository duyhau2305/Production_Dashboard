import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './TimelineChart.css';
import { Slider } from 'antd';

const TimelineChart = ({ selectedDate, selectedMchine, onDateChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  const [listGradient, setListGradient] = useState([]);
  const [listGradientToFild, setListGradientToFild] = useState([]);
  const [hour] = useState(Array.from({ length: 24 }, (_, i) => i));
  const [arrayPercentOffline, setArrayPercentOffline] = useState([]);
  const [arrayPercentRun, setArrayPercentRun] = useState([]);
  const [positionToTooltip, setPositionToTooltip] = useState(1);
  const [textToTooltip, setTextToTooltip] = useState('');
  const [currentIndex, setCurrentIndex] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [scale, setScale] = useState('1');

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
    let totalOfflineTime = 0;

    if (type === 'offline') {
      totalOfflineTime = gaps.reduce((acc, gap) => {
        let startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
        let endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
        if (endSeconds > limitTime) {
          endSeconds = limitTime;
        }
        if (endSeconds > startSeconds) {
          acc += endSeconds - startSeconds;
        }
        return acc;
      }, 0);
    } else {
      totalOfflineTime = gaps.reduce((acc, gap) => {
        if (gap.status === type) {
          let startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
          let endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
          if (endSeconds > limitTime) {
            endSeconds = limitTime;
          }
          if (endSeconds > startSeconds) {
            acc += endSeconds - startSeconds;
          }
        }
        return acc;
      }, 0);
    }

    const totalOfflinePercentage = (totalOfflineTime / totalSecondsInDay) * 100;
    return totalOfflinePercentage.toFixed(2);
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

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiUrl}/machine-operations/${selectedMchine}/timeline?startTime=${startDate.toISOString()}&endTime=${new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString()}`
      );

      const formattedData = formatDateAndTime(response.data.data);
      const processedData = formattedData.map(entry => {
        const gaps = findGaps(entry.intervals);
        const runPercent = calculateTotalOfflinePercentageBefore23(entry.intervals, 'Run');
        const totalOfflinePercent = calculateTotalOfflinePercentageBefore23(gaps, 'offline');

        arrayPercentRun.push(runPercent);
        arrayPercentOffline.push(totalOfflinePercent);

        return { ...entry, intervals: [...entry.intervals, ...gaps].sort((a, b) => moment(a.startTime, 'HH:mm') - moment(b.startTime, 'HH:mm')) };
      });

      setDates(response.data.data.map(value => moment(value.date).format('DD/MM')));
      setListGradient(processedData.map(value => createGradientStops(value.intervals)));
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

  const handleMouseMove = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const totalHours = (percentX / 100) * 24;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    const currentTimeInMinutes = hours * 60 + minutes;

    data[index].intervals.forEach(interval => {
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
    setStart(newValue[0]);
    setEnd(newValue[1] - 30);
    setScale(`1.${newValue[0] / 10}`);
  };

  useEffect(() => {
    if (selectedDate?.startDate && selectedDate?.endDate) {
      fetchData(selectedDate.startDate, selectedDate.endDate);
    }
  }, [selectedDate, selectedMchine]);

  const renderXAxisLabels = useMemo(() => (
    hour.map(value => (
      <div key={value} style={{ display: 'inline-block', width: '4.16%', textAlign: 'center', fontSize: '10px', marginTop: '5px' }}>
        {`${value}:00`}
      </div>
    ))
  ), [hour]);

  const renderYAxisLabels = useMemo(() => (
    dates.map((date, index) => (
      <div key={index} style={{ textAlign: 'right', fontSize: '10px', display: 'flex' }}>
        {date}
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
    onDateChange({ startDate, endDate });
  };

  const createGradientStops = (intervals) => {
    const gradientStops = [];
    let lastEndPercent = 0;

    intervals.forEach(item => {
      const { startTime, endTime, status } = item;
      const startPercent = (timeToMinutes(startTime) / 1440) * 100;
      const endPercent = (timeToMinutes(endTime) / 1440) * 100;
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div className="y-axis-arrow" style={{ position: 'absolute', top: 0, left: 31, height: '100%', borderLeft: '2px solid black' }}>
        <span className="arrow up-arrow" onClick={handleUpArrowClick}>↑</span>
      </div>
      <div className="x-axis-arrow" style={{ position: 'absolute', bottom: 0, left: 31, width: '95%', borderBottom: '2px solid black' }}>
        <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between' }}>{renderXAxisLabels}</div>
        <span className="arrow right-arrow">→</span>
      </div>
      <div style={{ paddingLeft: '33px', position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '99%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
          {renderYAxisLabels}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '99%' }}>
          {data.length > 0 ? data.map((entry, index) => (
            <div key={index} onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={handleMouseLeave} style={{ overflow: 'hidden', height: `${(100 / data.length) - 1}%` }}>
              <div className="gradient-container gradient-section gradient" style={{
                height: '100%',
                background: `linear-gradient(to right, ${listGradient[index]})`,
                marginTop: '10px',
                width: '100%',
                position: 'relative',
                transition: 'transform 0.1s ease-in-out',
                transformOrigin: '50%',
                transform: `scaleX(${scale})`,
                zIndex: '1'
              }}>
                {currentIndex === index && (
                  <span style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, marginLeft: `${positionToTooltip}%`, background: '#ffff95' }}>
                    {textToTooltip}
                  </span>
                )}
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
