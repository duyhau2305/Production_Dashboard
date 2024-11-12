import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Radio } from 'antd';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopTenChart = ({ machineSerial }) => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [chartTitle, setChartTitle] = useState('Run Time');
  const [chartColor, setChartColor] = useState('#00C8D7');
  const [selectedType, setSelectedType] = useState(1);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async (type) => {
    try {
      const response = await axios.get(
        `${apiUrl}/machine-operations/top-ten?startTime=2024-11-01T17:00:00Z&endTime=2024-11-10T16:59:59Z&machineSerial=${machineSerial}&type=${type}`
      ); 

      const data = response.data.data.data;
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
    fetchData(selectedType);
  }, [machineSerial, selectedType]);

  const formatTimeForX = (value) => {
    const hours = Math.floor(value / 3600);  // Only show hours for X-axis
    return `${String(hours).padStart(2, '0')} giờ`;
  };

  const formatTimeForTooltip = (value) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return `${String(hours).padStart(2, '0')} giờ ${String(minutes).padStart(2, '0')} phút`;
  };

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
          stepSize: 10,  // Adjust the step size based on your data range
          callback: function(value) {
            return formatTimeForX(value);  // Use the formatTimeForX function to display hours only
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
            const formattedValue = formatTimeForTooltip(tooltipItem.raw);  // Format time for tooltip (hours and minutes)
            return `${tooltipItem.label}: ${formattedValue}`;  // Custom tooltip format
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
          onChange={(e) => setSelectedType(e.target.value)} // Update selectedType
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
