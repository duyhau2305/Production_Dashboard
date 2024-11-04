import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import moment from 'moment';

const MachineTimeline = ({ deviceId, selectedDate }) => {
  const fixedHeight = 200;
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [deviceData, setDeviceData] = useState({});
  const [dimensions, setDimensions] = useState({ width: 800, height: fixedHeight });
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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
      fetchTelemetryData(deviceId); 
    }
  }, [deviceId, selectedDate]);

  const fetchTelemetryData = async (deviceId) => {
    setLoading(true); 
    try {
      const startTime = selectedDate.clone().startOf('day').toISOString();
      const endTime = selectedDate.clone().endOf('day').toISOString();
      const apiEndpoint = `${apiUrl}/machine-operations/${deviceId}/timeline?startTime=${startTime}&endTime=${endTime}`;
      const response = await axios.get(apiEndpoint);

      if (response.data && response.data.data && response.data.data.length > 0) {
        const intervals = response.data.data[0].intervals;
        const flatData = intervals.map((interval) => ({
          startTime: moment(interval.startTime).format('HH:mm'),
          endTime: moment(interval.endTime).format('HH:mm'),
          status: interval.status === 'Run' ? 'Chạy' : interval.status === 'Stop' ? 'Dừng' : 'Chờ'
        }));
        const processedData = addOfflineIntervals(flatData);
        setDeviceData((prevData) => ({ ...prevData, [deviceId]: processedData }));
      } else {
        console.warn(`No intervals found for deviceId ${deviceId}`);
        setDeviceData((prevData) => ({ ...prevData, [deviceId]: [] }));
      }
    } catch (error) {
      console.error(`Error fetching telemetry data for deviceId ${deviceId}:`, error);
      setDeviceData((prevData) => ({ ...prevData, [deviceId]: [] }));
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    // Tạo tooltip chỉ một lần khi component mount
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('border-radius', '4px')
      .style('display', 'none')
      .style('pointer-events', 'none');

    const drawChart = () => {
      const svg = d3.select(svgRef.current);
      const { width, height } = dimensions;
      const margin = { top: 20, right: 35, bottom: 80, left: 50 };

      svg.selectAll('*').remove();

      if (loading) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('fill', '#888')
          .text('Đang tải...');
        return;
      }

      if (!deviceData[deviceId] || deviceData[deviceId].length === 0) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('fill', '#888')
          .text('Không có dữ liệu để hiển thị');
        return;
      }

      const data = deviceData[deviceId];
      const timeParse = d3.timeParse('%H:%M');
      const xScale = d3
        .scaleTime()
        .domain([timeParse('00:00'), timeParse('23:59')])
        .range([margin.left, width - margin.right]);

      const colorScale = d3
        .scaleOrdinal()
        .domain(['Chạy', 'Dừng', 'Chờ', 'Offline'])
        .range(['#00C8D7', '#f10401', '#FFC107', '#d3d3d3']);

      // Tính tổng thời gian cho mỗi trạng thái
      const totalTime = {
        'Chạy': 0,
        'Dừng': 0,
        'Chờ': 0,
        'Offline': 0
      };

      data.forEach(d => {
        const start = moment(d.startTime, 'HH:mm');
        const end = moment(d.endTime, 'HH:mm');
        const duration = moment.duration(end.diff(start));
        totalTime[d.status] += duration.asMinutes();
      });

      // Vẽ chú thích (legend) cho tổng thời gian
      const legendData = [
        { status: 'Chạy', time: `${Math.floor(totalTime['Chạy'] / 60)} giờ ${totalTime['Chạy'] % 60} phút`, color: '#00C8D7' },
        { status: 'Dừng', time: `${Math.floor(totalTime['Dừng'] / 60)} giờ ${totalTime['Dừng'] % 60} phút`, color: '#f10401' },
        { status: 'Chờ', time: `${Math.floor(totalTime['Chờ'] / 60)} giờ ${totalTime['Chờ'] % 60} phút`, color: '#FFC107' },
      ];

      const legend = svg
        .selectAll('.legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${margin.left + i * 150},${height - margin.bottom + 45})`);

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

      // Vẽ trục x
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom - 30})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeHour.every(2)).tickFormat(d3.timeFormat('%H:%M')))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Vẽ các hình chữ nhật biểu thị trạng thái
      svg
        .selectAll('.status-rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'status-rect')
        .attr('x', d => xScale(timeParse(d.startTime)) + 1)
        .attr('y', height - margin.bottom - 60)
        .attr('width', d => {
          const width = xScale(timeParse(d.endTime)) - xScale(timeParse(d.startTime));
          return width > 0 ? width : 1;
        })
        .attr('height', 30)
        .attr('fill', d => colorScale(d.status))
        .on('mouseover', (event, d) => {
          tooltip
            .style('display', 'block')
            .html(`Trạng thái: <b>${d.status}</b><br>Thời gian: ${d.startTime} - ${d.endTime}`);
        })
        .on('mousemove', event => {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });
    };

    drawChart();
    
    return () => {
      tooltip.remove(); // Loại bỏ tooltip khi component unmount
    };
  }, [deviceData, dimensions, deviceId, loading]);

  useEffect(() => {
    const handleResize = () => {
      const clientWidth = wrapperRef.current.clientWidth;
      setDimensions({ width: clientWidth, height: fixedHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

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
