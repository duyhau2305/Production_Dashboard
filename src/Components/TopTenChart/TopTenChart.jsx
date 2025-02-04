import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Radio } from 'antd';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopTenChart = ({ selectedDate , machineSerial  }) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [chartTitle, setChartTitle] = useState('Run Time');
  const [chartColor, setChartColor] = useState('#00C8D7');
  const [selectedType, setSelectedType] = useState(1);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async (startDate , endDate , type) => {
    try {
      const start = startDate.toISOString();
      const end = new Date(endDate);
      const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 16, 59, 59, 0));
      const isoDate = utcDate.toISOString();
      const response = await axios.get(
        `${apiUrl}/machine-operations/top-ten?startTime=${start}&endTime=${isoDate}&machineSerial=${machineSerial}&type=${type}`
      ); 
      
      const data = response.data.data.data;
      console.log(data)
      const labels = data.map(record => record.machineSerialNum);
      const values = data.map(record => 
        type === 1 ? record.totalRunTime : 
        type === 2 ? record.totalIdleTime : 
        record.totalStopTime
      );
      
      setChartLabels(labels);
      setChartValues(values);
      setChartTitle(type === 1 ? 'Run Time' : type === 2 ? 'Idle Time' : 'Stop Time');
      setChartColor(type === 1 ? '#00C8D7' : type === 2 ? '#FFC107' : '#FF5733');

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (selectedDate?.startDate && selectedDate?.endDate) {
      fetchData(selectedDate.startDate, selectedDate.endDate , selectedType);
    };
  }, [machineSerial,selectedDate , selectedType]);

  const formatTimeForX = (value) => {
    const hours = Math.floor(value / 3600);  // Only show hours for X-axis
    return `${String(hours).padStart(2, '0')} giờ`;
  };

  const formatTimeForTooltip = (value) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return `${String(hours).padStart(2, '0')} giờ ${String(minutes).padStart(2, '0')} phút`;
  };

  // Tính tổng thời gian và bước (stepSize) cho trục X
  const totalTime = Math.max(...chartValues); // Tính tổng thời gian lớn nhất từ dữ liệu chart

  // Tính bước stepSize theo cách lẻ hay chẵn
  let stepSize = totalTime / 10; // Chia tổng thời gian cho 10 để có bước đều cho trục X
  
  if (totalTime % 2 === 0) {
    // Nếu totalTime là số chẵn, làm tròn stepSize thành số chẵn
    stepSize = Math.round(stepSize / 2) * 2; 
  } else {
    // Nếu totalTime là số lẻ, làm tròn stepSize thành số lẻ
    stepSize = Math.round(stepSize / 2) * 2 + 1;
  }

  const data = {
    labels: chartLabels, 
    datasets: [
      {
        label: chartTitle,
        data: chartValues,
        backgroundColor: chartColor,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: { 
        beginAtZero: true,
        ticks: {
          stepSize: stepSize,  // Sử dụng stepSize đã tính toán ở trên
          callback: function(value) {
            return formatTimeForX(value);  // Hiển thị thời gian trên trục X
          }
        }
      },
      y: { 
        ticks: {}
      }
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function(tooltipItem) {
            const formattedValue = formatTimeForTooltip(tooltipItem.raw);  // Định dạng thời gian cho tooltip (giờ và phút)
            return `${tooltipItem.label}: ${formattedValue}`;  // Hiển thị tooltip tùy chỉnh
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-center font-bold">{`Top 10 ${chartTitle} - ${machineSerial === 'P' ? 'Phay' : 'Tiện'}`}</h2>
      <div className="text-center mb-4">
        <Radio.Group
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)} // Cập nhật selectedType
          buttonStyle="solid"
        >
          <Radio.Button value={1}>Run Time</Radio.Button>
          <Radio.Button value={2}>Idle Time</Radio.Button>
          <Radio.Button value={3}>Stop Time</Radio.Button>
        </Radio.Group>
      </div>
      {chartLabels.length > 0 && <Bar data={data} options={options} />}
    </div>
  );
};

export default TopTenChart;
