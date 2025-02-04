import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ParetoFrequencyChart = ({ data, isLoading }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !data.labels || !data.values || data.labels.length === 0 || data.values.length === 0) {
      return; // Exit early if no valid data
    }

    const ctx = chartRef.current.getContext('2d');
    let { labels, values } = data;

    // Ensure values are integers
    console.log('Raw values:', values);
    values = values.map((value) => Math.round(value)); // Ensure values are whole numbers

    // Sort data descending for Pareto logic (80/20)
    const sortedData = values
      .map((value, index) => ({ label: labels[index], value }))
      .sort((a, b) => b.value - a.value);

    labels = sortedData.map(item => item.label);
    values = sortedData.map(item => item.value);

    // Calculate cumulative percentage
    const total = values.reduce((acc, value) => acc + value, 0);
    const cumulativeData = values.map((value, index) => {
      const cumulativeSum = values.slice(0, index + 1).reduce((acc, val) => acc + val, 0);
      return (cumulativeSum / total) * 100;
    });

    const barColors = ['#0e1b93'];

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cumulative Percentage (%)',
            data: cumulativeData,
            type: 'line',
            borderColor: '#c21224',
            backgroundColor: '#c21224',
            borderWidth: 2,
            pointRadius: 3,
            yAxisID: 'y1', // Assign to second y-axis
          },
          {
            label: 'Frequency',
            data: values,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 1,
            yAxisID: 'y', // Assign to first y-axis
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: { display: false },
            title: { display: false, text: 'Reasons' },
          },
          y: {
            beginAtZero: true,
            position: 'left',
            ticks: {
              stepSize: 1, // Force tick increments of 1
              callback: (value) => `${value} lần`, // Ensure integer display with label
            },
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            ticks: {
              callback: (value) => `${value}%`,
            },
            grid: { drawOnChartArea: false },
          },
        },
        plugins: {
          legend: {
            display: false,
            position: 'top',
            labels: {
              font: {
                size: 10,
              },
              boxWidth: 20,
              padding: 10,
            },
            align: 'center',
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '280px' }} className="flex justify-center items-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!data || !data.labels || !data.labels.length) {
    return (
      <div style={{ width: '100%', height: '280px' }} className="flex justify-center items-center">
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '280px' }} className="flex justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ParetoFrequencyChart;
