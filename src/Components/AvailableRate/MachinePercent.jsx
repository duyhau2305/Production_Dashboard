import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import moment from 'moment';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const MachinePercent = ({ deviceId, selectedDate , machineName}) => {
  const [deviceData, setDeviceData] = useState({});
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const totalSeconds = 86400;

  const calculatePercentages = (data) => {
    const runTimeSeconds = data.runTime || 0;
    const stopTimeSeconds = data.stopTime || 0;
    const idleTimeSeconds = data.idleTime || 0;
    const offlineTimeSeconds = Math.max(0, totalSeconds - (runTimeSeconds + stopTimeSeconds + idleTimeSeconds));

    return {
      Chạy: (runTimeSeconds / totalSeconds) * 100,
      Dừng: (stopTimeSeconds / totalSeconds) * 100,
      Chờ: (idleTimeSeconds / totalSeconds) * 100,
      Offline: (offlineTimeSeconds / totalSeconds) * 100,
    };
  };

  useEffect(() => {
    if (deviceId && selectedDate) {
      fetchTelemetryData(deviceId, selectedDate);
    }
  }, [deviceId, selectedDate]);

  const fetchTelemetryData = async (deviceId, selectedDate) => {
    setLoading(true);
    try {
      const startTime = selectedDate.clone().startOf('day').toISOString();
      const endTime = selectedDate.clone().endOf('day').toISOString();
      const apiEndpoint = `${apiUrl}/machine-operations/${deviceId}/summary-status?startTime=${startTime}&endTime=${endTime}`;
      const response = await axios.get(apiEndpoint);

      if (response.data?.data?.length > 0) {
        setDeviceData(response.data.data[0]);
      } else {
        console.warn(`No data found for deviceId ${deviceId}`);
        setDeviceData({});
      }
    } catch (error) {
      console.error(`Error fetching telemetry data for deviceId ${deviceId}:`, error);
      setDeviceData({});
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!deviceData) return { labels: [], datasets: [] };

    const percentages = calculatePercentages(deviceData);

    const adjustedData = Object.entries(percentages).map(([status, percent]) => ({
      status,
      displayPercent: percent < 0 ? 0 : percent,  // Set minimum of 1% for display
    }));

    return {
      labels: ['Machine Status'],
      datasets: [
        {
          label: `Chạy (${adjustedData.find(d => d.status === 'Chạy').displayPercent.toFixed(2)}%)`,
          data: [adjustedData.find(d => d.status === 'Chạy').displayPercent],
          backgroundColor: '#00C8D7',
        },
        {
          label: `Dừng (${adjustedData.find(d => d.status === 'Dừng').displayPercent.toFixed(2)}%)`,
          data: [adjustedData.find(d => d.status === 'Dừng').displayPercent],
          backgroundColor: '#f10401',
        },
        {
          label: `Chờ (${adjustedData.find(d => d.status === 'Chờ').displayPercent.toFixed(2)}%)`,
          data: [adjustedData.find(d => d.status === 'Chờ').displayPercent],
          backgroundColor: '#FFC107',
        },
        {
          label: `Offline (${adjustedData.find(d => d.status === 'Offline').displayPercent.toFixed(2)}%)`,
          data: [adjustedData.find(d => d.status === 'Offline').displayPercent],
          backgroundColor: '#d3d3d3',
        },
      ],
    };
  };

  return (
    <div style={{ height: '140px' }} className="flex justify-center p-2">
       <h2 className="text-xl font-semibold mt-2 ml-4">{machineName}
       </h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <Bar
          data={getChartData()}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                display: (context) => context.dataset.data[0] >= 0.8, // Only show if >= 1%
                color: (context) => context.dataset.label.includes('Dừng') ? 'white' : 'black', // Set text color for 'Dừng' to white
                anchor: 'center',
                align: 'center',
                formatter: (value) => `${value.toFixed(2)}%`, // Display percentage on each bar
              },
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  boxWidth: 25,
                  boxHeight: 7,
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                max: 100,
                grid: {
                  display: false,
                },
                ticks: {
                  callback: function (value) {
                    return `${value}%`;
                  },
                },
              },
              y: {
                stacked: true,
                display: false,
              },
            },
            layout: {
              padding: {
                top: 0,
                bottom: 0,
              },
            },
          }}
          plugins={[ChartDataLabels]}
        />
      )}
    </div>
  );
};

export default MachinePercent;
