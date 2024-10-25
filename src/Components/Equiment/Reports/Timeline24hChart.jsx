import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Timeline24hChart = () => {
  const svgRef = useRef();

  // Dữ liệu mẫu với nhiều trạng thái hơn cho mỗi ngày
  const data = [
    { date: '2023-09-22', machine: 'CNC1', status: 'Cài Đặt', startTime: '00:00', endTime: '00:30' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chạy', startTime: '00:30', endTime: '4:00' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Dừng', startTime: '4:00', endTime: '4:05' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chờ', startTime: '4:05', endTime: '4:10' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chạy', startTime: '4:10', endTime: '5:00' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Dừng', startTime: '5:00', endTime: '5:05' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chạy', startTime: '5:05', endTime: '5:40' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Cài Đặt', startTime: '5:40', endTime: '6:00' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chạy', startTime: '6:00', endTime: '8:00' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Dừng', startTime: '8:00', endTime: '8:05' },
    { date: '2023-09-22', machine: 'CNC1', status: 'Chạy', startTime: '8:05', endTime: '12:00' },
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Make the chart responsive to the parent container's size
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 200; // Fixed height, adjust as necessary
    const margin = { top: 50, right: 35, bottom: 50, left: 35 };

    // Parse time
    const timeParse = d3.timeParse('%H:%M');
    const timeFormat = d3.timeFormat('%H:%M');

    // Set dimensions of the SVG element
    svg.attr('width', width).attr('height', height);

    // X scale for time (00:00 - 24:00)
    const xScale = d3
      .scaleTime()
      .domain([timeParse('00:00'), timeParse('24:00')])
      .range([margin.left, width - margin.right]);

    // Define color scale for different statuses
    const colorScale = d3
      .scaleOrdinal()
      .domain(['Chạy', 'Dừng', 'Cài Đặt', 'Chờ', 'Tắt máy'])
      .range(['#4bc0c0', '#ff6384', '#ffcd56', '#ffcd56', '#c9cbcf']);

    // Add X axis (Time)
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom - 70})`)
      .call(d3.axisBottom(xScale).ticks(d3.timeHour.every(2)).tickFormat(timeFormat));

    // Create the timeline bars
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(timeParse(d.startTime)))
      .attr('y', height / 4) // Fixed vertical positioning for all bars
      .attr('width', d => xScale(timeParse(d.endTime)) - xScale(timeParse(d.startTime)))
      .attr('height', 30) // Fixed height for each bar
      .attr('fill', d => colorScale(d.status))
      .append('title') // Tooltip
      .text(d => `${d.machine} (${d.status}): ${d.startTime} - ${d.endTime}`);

    // Add legend
    const legendData = ['Chạy', 'Dừng', 'Cài Đặt', 'Chờ', 'Tắt máy'];

    const legend = svg
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${margin.left + i * 150},${height - margin.bottom + 30})`); // Adjust legend position

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', -60)
      .attr('width', 18)
      .attr('height', 5)
      .style('fill', d => colorScale(d));

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', -55)
      .text(d => d)
      .style('text-anchor', 'start')
      .style('font-size', '12px');

    // Cleanup previous rendering when re-rendering
    return () => svg.selectAll('*').remove();
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Timeline24hChart;
