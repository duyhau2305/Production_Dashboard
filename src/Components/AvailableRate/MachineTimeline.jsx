import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import moment from 'moment';

const MachineTimeline = ({ deviceId, selectedDate }) => {
  const fixedHeight = 150;
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [deviceData, setDeviceData] = useState({});
  const [dimensions, setDimensions] = useState({ width: 800, height: fixedHeight });
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const formatDateForAPI = (date) => date.format('YYYY-MM-DD');

  const addOfflineIntervals = (data) => {
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      const currentInterval = data[i];
      newData.push(currentInterval);
      if (i < data.length - 1) {
        const nextInterval = data[i + 1];
        const currentEndTime = moment(currentInterval.endTime, 'HH:mm');
        const nextStartTime = moment(nextInterval.startTime, 'HH:mm');

        if (currentEndTime.isBefore(nextStartTime)) {
          newData.push({
            startTime: currentEndTime.format('HH:mm'),
            endTime: nextStartTime.format('HH:mm'),
            status: 'Offline'
          });
        }
      }
    }
    return newData;
  };

  useEffect(() => {
    if (deviceId && selectedDate) {
      fetchTelemetryData(deviceId); // Fetch data when selectedDate or deviceId changes
    }
  }, [deviceId, selectedDate]); // Re-fetch data when deviceId or selectedDate changes

  const fetchTelemetryData = async (code) => {
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      console.log(`Formatted Date for API: ${formattedDate}`);
      const apiEndpoint = `${apiUrl}/telemetry?deviceId=${code}&startDate=${formattedDate}&endDate=${formattedDate}`;
      const response = await axios.get(apiEndpoint);

      if (response.data && response.data.length > 0 && response.data[0].intervals) {
        const flatData = response.data[0].intervals.flatMap(interval => ({
          startTime: moment(interval.startTime, 'HH:mm').format('HH:mm'),
          endTime: moment(interval.endTime, 'HH:mm').format('HH:mm'),
          status: interval.status
        }));
        const processedData = addOfflineIntervals(flatData);
        setDeviceData(prevData => ({ ...prevData, [code]: processedData }));
      } else {
        console.warn(`No intervals found for ${code}`);
        setDeviceData(prevData => ({ ...prevData, [code]: [] }));
      }
    } catch (error) {
      console.error(`Error fetching telemetry data for ${code}:`, error);
      setDeviceData(prevData => ({ ...prevData, [code]: [] }));
    }
  };

  useEffect(() => {
    const drawChart = () => {
      const svg = d3.select(svgRef.current);
      const { width, height } = dimensions;
      const margin = { top: 20, right: 35, bottom: 80, left: 50 };
  
      svg.selectAll('*').remove(); // Clear the previous chart
  
      // Check if there's data for the current device
      if (!deviceData[deviceId] || deviceData[deviceId].length === 0) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('fill', '#888')
          .text('Không có dữ liệu để hiển thị'); // Message indicating no data
        return; // Exit the function if there's no data
      }
  
      const data = deviceData[deviceId];
      const timeParse = d3.timeParse('%H:%M');
      const timeFormat = d3.timeFormat('%H:%M');
  
      const xScale = d3
        .scaleTime()
        .domain([timeParse('00:00'), timeParse('23:59')])
        .range([margin.left, width - margin.right]);
  
      const colorScale = d3
        .scaleOrdinal()
        .domain(['Chạy', 'Dừng', 'Offline'])
        .range(['#4aea4a', '#f10401', '#d3d3d3']);
  
      // Create tooltip
      const tooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ccc')
        .style('padding', '5px')
        .style('border-radius', '4px')
        .style('display', 'none')
        .style('pointer-events', 'none');
  
      // Draw x-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom - 30})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeHour.every(2)).tickFormat(timeFormat))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
  
      // Draw rectangles for status
      svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(timeParse(d.startTime)) + 1)
        .attr('y', height - margin.bottom - 60)
        .attr('width', d => {
          const width = xScale(timeParse(d.endTime)) - xScale(timeParse(d.startTime));
          return width > 0 ? width : 1;
        })
        .attr('height', 30)
        .attr('fill', d => colorScale(d.status))
        .on('mouseover', (event, d) => {
          tooltip.style('display', 'block')
            .html(`Trạng thái: <b>${d.status}</b><br>Thời gian: ${d.startTime} - ${d.endTime}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mousemove', event => {
          tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });
  
      // Calculate total time for each status
      const totalTime = {
        'Chạy': 0,
        'Dừng': 0,
        'Offline': 0
      };
  
      data.forEach(d => {
        const start = moment(d.startTime, 'HH:mm');
        const end = moment(d.endTime, 'HH:mm');
        const duration = moment.duration(end.diff(start));
        totalTime[d.status] += duration.asMinutes();
      });
  
      // Create legend
      const legendData = [
        { status: 'Chạy', time: `${Math.floor(totalTime['Chạy'] / 60)} giờ ${totalTime['Chạy'] % 60} phút`, color: '#4aea4a' },
        { status: 'Dừng', time: `${Math.floor(totalTime['Dừng'] / 60)} giờ ${totalTime['Dừng'] % 60} phút`, color: '#f10401' },
        { status: 'Offline', time: `${Math.floor(totalTime['Offline'] / 60)} giờ ${totalTime['Offline'] % 60} phút`, color: '#d3d3d3' },
      ];
  
      const legend = svg
        .selectAll('.legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${margin.left + i * 150},${height - margin.bottom + 25})`);
  
      legend
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 10)
        .style('fill', d => d.color);
  
      legend
        .append('text')
        .attr('x', 25)
        .attr('y', 0)
        .text(d => `${d.status}: ${d.time}`)
        .style('font-size', '12px')
        .style('text-anchor', 'start');
    };
  
    drawChart(); // Draw chart when deviceData or dimensions change
  }, [deviceData, dimensions, deviceId]);
  

  useEffect(() => {
    const handleResize = () => {
      const clientWidth = wrapperRef.current.clientWidth;
      setDimensions({ width: clientWidth, height: fixedHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it once on mount to set initial size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} width="100%" height={fixedHeight} />
    </div>
  );
};

export default MachineTimeline;
