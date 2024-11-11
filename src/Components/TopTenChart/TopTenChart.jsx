import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopTenChart = () => {
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [chartTitle, setChartTitle] = useState('Run Time');
  const [chartColor, setChartColor] = useState('rgba(255, 0, 0, 0.6)'); // Màu đỏ mặc định
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  function convertSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const fetchData = async (type) => {
    try {
      const response = await axios.get(`${apiUrl}/machine-operations/top-ten?startTime=2024-11-01T17:00:00Z&endTime=2024-11-10T16:59:59Z&type=1`);
      const data = response.data.data.data;

      const labels = data.map(record => record.machineSerialNum); 
      const values = data.map(record => record[type === 1 ? 'runTime' : type === 2 ? 'idleTime' : 'stopTime']);
      
      setChartLabels(labels);
      setChartValues(values);
      setChartTitle(type === 1 ? 'Run Time' : type === 2 ? 'Idle Time' : 'Stop Time');
      setChartColor(type === 1 ? '#00C8D7' : type === 2 ? '#FFC107' : 'red');

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(1); 
  }, []);

  // Dữ liệu cho biểu đồ
  const data = {
    labels: chartLabels, 
    datasets: [
      {
        label: chartTitle,
        data: chartValues,
        backgroundColor: chartColor, // Màu nền biểu đồ
        borderColor: 'rgba(54, 162, 235, 1)', // Màu đường viền
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    indexAxis: 'y', // Biểu đồ ngang
    scales: {
      x: { 
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          callback: function(value) {
            return convertSecondsToTime(value); // Chuyển giá trị sang giờ:phút:giây
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
        bodyColor: 'white'
      }
    }
  };

  return (
    <div style={{ width: '80%', margin: '0 auto', paddingTop: '30px' }}>
      <h1 style={styles.heading}>Top 10 {chartTitle}</h1>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => fetchData(1)}>Run Time</button>
        <button style={styles.button} onClick={() => fetchData(2)}>Idle Time</button>
        <button style={styles.button} onClick={() => fetchData(3)}>Stop Time</button>
      </div>

      {/* Biểu đồ cột */}
      <div style={styles.chartContainer}>
        {chartLabels.length > 0 && <Bar data={data} options={options} />}
      </div>
    </div>
  );
};

const styles = {
  heading: {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    margin: '0 10px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#36A2EB',
    color: 'white',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
};

export default TopTenChart;
