import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ParetoFrequencyChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Sort data descending based on values for Pareto 80/20 logic
    let { labels, values } = data || {};
    const sortedData = values
      .map((value, index) => ({ label: labels[index], value }))
      .sort((a, b) => b.value - a.value);

    labels = sortedData.map(item => item.label);
    values = sortedData.map(item => item.value);

    console.log('Sorted Labels:', labels); // Debugging
    console.log('Sorted Values:', values); // Debugging

    if (!labels || !values || labels.length === 0 || values.length === 0) {
      console.error('No data or labels available');
      return;
    }

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
            label: 'Cumulative Percentage',
            data: cumulativeData,
            type: 'line',
            borderColor: '#c21224',
            backgroundColor: '#c21224',
            borderWidth: 2,
            pointRadius: 3,
            yAxisID: 'y1',
          },
          {
            label: 'Frequency',
            data: values,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 1,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: { display: false },
            title: { display: false, text: 'Reason Names' },
          },
          y: {
            beginAtZero: true,
            position: 'left',
            ticks: {
              callback: (value) => `${value} lần`,
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
          legend: { display: false, position: 'top' },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default ParetoFrequencyChart;
