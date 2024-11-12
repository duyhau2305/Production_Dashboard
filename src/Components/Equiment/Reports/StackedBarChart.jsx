import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import './TimelineChart.css';
import { Slider, Checkbox } from 'antd';

const StackedBarChart = ({ selectedDate, selectedMchine, onDateChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  const [listGradient, setListGradient] = useState([]);
  const [hour] = useState(Array.from({ length: 24 }, (_, i) => i));
  const [arrayPercentOffline, setArrayPercentOffline] = useState([]);
  const [arrayPercentRun, setArrayPercentRun] = useState([]);
  const [arrayPercentStop, setArrayPercentStop] = useState([]);
  const [arrayPercentIdle, setArrayPercentIdle] = useState([]);
  const [showYAxis, setShowYAxis] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [positionToTooltip, setPositionToTooltip] = useState(1);
  const [textToTooltip, setTextToTooltip] = useState('');

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const formatDateForAPI = (date) => moment(date).format('YYYY-MM-DD');

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const start = startDate.toISOString();
      const end = new Date(endDate);
      const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 16, 59, 59, 0));
      const isoDate = utcDate.toISOString();

      const responsePercent = await axios.get(
        `${apiUrl}/machine-operations/${selectedMchine}/summary-status?startTime=${start}&endTime=${isoDate}`
      );

      let totalRun = [];
      let totalStop = [];
      let totalIdle = [];
      let totalOfflinePercentArray = [];

      const dataReverse = responsePercent.data.data;
      dataReverse.forEach(entry => {
        const runPercent = (entry.runTime / 86400) * 100;
        const idlePercent = (entry.idleTime / 86400) * 100;
        const stopPercent = (entry.stopTime / 86400) * 100;
        const offlinePercent = 100 - (runPercent + stopPercent + idlePercent);

        totalRun.push(runPercent.toFixed(2));
        totalIdle.push(idlePercent.toFixed(2));
        totalStop.push(stopPercent.toFixed(2));
        totalOfflinePercentArray.push(offlinePercent.toFixed(2));
      });

      setArrayPercentRun(totalRun);
      setArrayPercentStop(totalStop);
      setArrayPercentIdle(totalIdle)
      setArrayPercentOffline(totalOfflinePercentArray);

      const combinedArray = totalIdle.map((idle, index) => {
        const runPercent = Number(totalRun[index]);
        const stopPercent = runPercent + Number(totalStop[index]);
        const idlePercent = stopPercent + Number(idle);
        const offlinePercent = totalOfflinePercentArray[index];
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

      setDates(dataReverse.map(value => moment(value.logTime).format('DD/MM')));
      setListGradient(combinedArray);
      setData(dataReverse);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = selectedDate?.startDate;
    const endDate = selectedDate?.endDate;

    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [selectedDate, selectedMchine]);

  const handleMouseMove = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const valueRun = Number(arrayPercentRun[index]);
    const valueStop = Number(arrayPercentStop[index]);
    const valueIdle = Number(arrayPercentIdle[index]);

    if (percentX < valueRun) {
      setTextToTooltip(`Chạy: ${valueRun}%`);
    } else if (percentX < valueRun + valueStop) {
      setTextToTooltip(`Dừng: ${arrayPercentStop[index]}%`);
    } else if (percentX < valueRun + valueStop + valueIdle) {
      setTextToTooltip(`Idle: ${arrayPercentIdle[index]}%`);
    } else {
      setTextToTooltip(`Offline: ${arrayPercentOffline[index]}%`);
    }

    setCurrentIndex(index);
    setPositionToTooltip(percentX);
  };

  const handleMouseLeave = () => {
    setTextToTooltip('');
    setPositionToTooltip(0);
  };

  const handleUpArrowClick = () => {
    const startDate = new Date(selectedDate.startDate);
    const endDate = new Date(selectedDate.endDate);
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    onDateChange({ startDate, endDate });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div style={{ position: 'absolute', top: '-35px', right: '70px' }}>
        <Checkbox checked={showYAxis} onChange={(e) => setShowYAxis(e.target.checked)}></Checkbox>
      </div>
      <div className="y-axis-arrow" style={{ position: 'absolute', top: 0, left: 31, height: '100%', borderLeft: '2px solid black', display: showYAxis ? 'block' : 'none' }}>
        <span className="arrow up-arrow" onClick={handleUpArrowClick}>↑</span>
      </div>
      <div className="x-axis-arrow" style={{ position: 'absolute', bottom: 0, left: 31, width: '95%', borderBottom: '2px solid black', display: showYAxis ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          {hour.map(value => (
            <div key={value} style={{ display: 'inline-block', width: '4.16%', textAlign: 'center', fontSize: '10px', marginTop: '5px' }}>
              {`${value}:00`}
            </div>
          ))}
        </div>
        <span className="arrow right-arrow">→</span>
      </div>
      <div style={{ paddingLeft: '33px', position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '99%', display: 'flex',  padding: '10px 0', display: showYAxis ? 'flex' : 'none' ,flexDirection: 'column' }}>
          {dates.map((date, index) => (
            <div key={index} style={{
              textAlign: 'right', fontSize: '10px', display: 'flex', marginTop: index > 0 ? '58px' : '0',
 
            }}>
              {date}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '99%' }}>
          {data.length > 0 ? data.map((entry, index) => (
            <div key={index} onMouseMove={(event) => handleMouseMove(event, index)} onMouseLeave={handleMouseLeave}>
              <div className='gradient-container gradient-section gradient' style={{
                height: '50px',
                background: `linear-gradient(to right, ${listGradient[index]})`,
                width: '100%',
                marginTop: index > 0 ? '21px' : '0',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', position: 'absolute', top: '10px', width: '100%' }}>
                  {arrayPercentRun[index] > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: `${arrayPercentRun[index]}%`,
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#474747'
                    }}>
                      {arrayPercentRun[index]}%
                    </div>
                  )}
                  {arrayPercentStop[index] > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: `${arrayPercentStop[index]}%`,
                      fontSize: '15px',
                      fontWeight: '500',
                      color: 'white'
                    }}>
                      <span>{arrayPercentStop[index]}%</span>
                    </div>
                  )}
                  {arrayPercentIdle[index] > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: `${arrayPercentIdle[index]}%`,
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#474747'
                    }}>
                      <span>{arrayPercentIdle[index]}%</span>
                    </div>
                  )}
                  {arrayPercentOffline[index] > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'absolute',
                      right: '0',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#474747'
                    }}>
                      <span>{arrayPercentOffline[index]}%</span>
                    </div>
                  )}
                </div>

                {currentIndex === index && (
                  <span style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '0', marginLeft: `${positionToTooltip}%`, background: '#ffff95' }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
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

export default StackedBarChart;
