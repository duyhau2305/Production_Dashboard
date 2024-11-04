import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import './TimelineChart.css';
const StackedBarChart = ({ selectedDate,selectedMchine, onDateChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDate] = useState([]);
  const [listGradient, setListGradient] = useState([]);
  const [hour, setHour] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  const [ArrayPercentOffline, setArrayPercentOffline] = useState([]);
  const [ArrayPercentRun, setArrayPercentRun] = useState([]);
  const [ArrayPercentStop, setArrayPercentStop] = useState([]);
  const [currentIndex , setCurrentIndex] = useState(1)
  const [positionToTolipth , setPositionToTolipth] = useState(1)
  const [textToTolipth , setTextToTolipth] = useState('')
  const deviceId = '543ff470-54c6-11ef-8dd4-b74d24d26b24';
  const apiUrl =import.meta.env.VITE_API_BASE_URL;

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
        if (endSeconds > limitTime) {
          endSeconds = limitTime; // Chỉ tính đến 23:00
        }
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
  function calculatePercentageOfDay(timeData) {
    console.log(timeData)
    const { startTime, endTime } = timeData;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const totalSecondsStart = (startHour * 3600) + (startMinute * 60);
    const totalSecondsEnd= (endHour * 3600) + (endMinute * 60);
    const percent = (totalSecondsEnd - totalSecondsStart)/86400 *100
    return percent.toFixed(2)
}
  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    const start = startDate.toISOString()
    const end = new Date(endDate)
    const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 16, 59, 59, 0));
    const isoDate = utcDate.toISOString();
    try {
      
      const responsePercent = await axios.get(
        `${apiUrl}/machine-operations/${selectedMchine}/summary-status?startTime=${start}&endTime=${isoDate}`
      );
      let totalOfflinePercentArray = [];
      let totalRun = [];
      let totalStop = [];
      let totalIdle = [];
      const dataReverse = responsePercent.data.data.reverse()
      dataReverse.forEach(entry => {
        const runPercent = (entry.runTime / 86400) * 100;
        console.log(runPercent)
        const idlePercent = (entry.idleTime / 86400) * 100;
        const stopPercent = (entry.stopTime / 86400) * 100;
        const offlinePercent = 100 - (runPercent + stopPercent + idlePercent);

        totalRun.push(runPercent.toFixed(2));
        totalIdle.push(idlePercent.toFixed(2));
        totalStop.push(stopPercent.toFixed(2));
        totalOfflinePercentArray.push(offlinePercent.toFixed(2));
      });
      setArrayPercentOffline(totalOfflinePercentArray)
      setArrayPercentRun(totalRun)
      setArrayPercentStop(totalStop)

      const combinedArray = totalIdle.map((idle, index) => {
        const runPercent = Number(totalRun[index]);
        const stopPercent = runPercent + Number(totalStop[index]);
        const idlePercent = stopPercent + Number(idle);
        const offlinePercent = totalOfflinePercentArray[index];
        console.log(runPercent)
        return `
          #00C8D7 0%, 
          #00C8D7 ${runPercent}%, 
          red ${runPercent}%, 
          red ${stopPercent}%, 
          #FFC107 ${stopPercent}%, 
          #FFC107 ${idlePercent}%, 
          #BFBFBF ${idlePercent}%, 
          #BFBFBF ${offlinePercent}%
        `;
      });

      let arrayDate = [];
      responsePercent.data.data.forEach(value => {
        const datePart = value.logTime.split('T')[0];
        const [year, month, day] = datePart.split('-');
        const formattedDate = `${day}/${month}`;
        arrayDate.push(formattedDate);
      });

      // Gán trực tiếp vào state
      setDate(arrayDate);
      setListGradient(combinedArray);

      setData(responsePercent.data.data);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
      fetchData(startDate, endDate);
    }

  }, [selectedDate,selectedMchine]);


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
    onDateChange({ startDate: startDate, endDate: endDate });
  };
  const handleMouseMove = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentX = (x / rect.width) * 100;
    const valueRun = Number(ArrayPercentRun[index]) 
    const valueStop = Number(ArrayPercentStop[index])
    if(percentX < valueRun){
      setTextToTolipth(`Chạy : ${valueRun}`)
    }
    if(percentX > valueRun && percentX <valueRun+valueStop){
      setTextToTolipth(`Dừng : ${ArrayPercentStop[index]}`)
    }
    if(percentX > valueRun+valueStop){
      setTextToTolipth(`Offline : ${ArrayPercentOffline[index]}`)
    }
    setCurrentIndex(index)
    setPositionToTolipth(percentX);
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '99%' }}>
          {data.length > 0 ? data.map((entry, index) => (
            <div style={{ height: `${((100 / data.length-1)) - 5}%` }} onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={() => handleMouseLeave()}>
              <div className='gradient-container gradient-section gradient' key={index} style={{
                height: `100%`,
                background: `linear-gradient(to right, ${listGradient[index]})`,
                marginTop: '0',
                width: '100%',
                position : 'relative'
              }}>
                <div style={{ display: 'flex', position : 'absolute' , top : '10px' , width: '100%'}}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' , position: 'absolute', color: 'black' , fontSize: '15px' , fontWeight: '500' , color: '#474747' }}>
                  {ArrayPercentRun[index]} %
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: `${(Number(ArrayPercentRun[index])).toString()}%` , color: 'black' , fontSize: '15px' , fontWeight: '500' , color: 'white'} }>
                <span>{(100 - ArrayPercentRun[index] - ArrayPercentOffline[index]).toFixed(2)}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' , position : 'absolute' , right : '0' , color: 'black' , fontSize: '15px' , fontWeight: '500' , color: '#474747'}}>
                  <span> {ArrayPercentOffline[index]} %</span>
                </div>
                </div>
                {currentIndex == index ? <span style={{ display: 'flex'  , justifyContent : 'space-between' ,  position : 'absolute' , top : '0' , marginLeft : `${positionToTolipth}%` ,background: '#ffff95'} }>
                {textToTolipth}
              </span> : <></>}
              </div>
              
            </div>
          )) : (
            <div style={{ height: '32px', backgroundColor: '#E7E7E7', marginTop: '10px', width: '100%' }} />
          )}
        </div>
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
    </div>
  );
};

export default StackedBarChart;
