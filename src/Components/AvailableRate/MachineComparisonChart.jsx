import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import moment from 'moment-timezone';

const MachineComparisonChart = ({ selectedDate, machineType, viewMode }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Hàm gọi API
  const fetchMachineData = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchPromises = machineType.map(async (machine) => {
        const startTime = selectedDate.clone().startOf('day').toISOString();
        const endTime = selectedDate.clone().endOf('day').toISOString();
        const { _id, deviceName } = machine;
        const response = await axios.get(
          `${apiUrl}/machine-operations/${_id}/summary-status?startTime=${startTime}&endTime=${endTime}`
        );

        if (response.status === 200 && response.data && response.data.data.length > 0) {
          const { runTime } = response.data.data[0];
          const totalPossibleSeconds = moment(endTime).diff(moment(startTime), 'seconds');
          const runtimePercentage = ((runTime || 0) / totalPossibleSeconds) * 100;
          const runtimeHours = (runTime || 0) / 3600;

          return {
            machine: deviceName,
            percentage: runtimePercentage > 0 ? runtimePercentage : 0,
            hours: runtimeHours > 0 ? runtimeHours : 0,
          };
        } else {
          return null; // Không có dữ liệu cho máy này
        }
      });

      const results = (await Promise.all(fetchPromises)).filter((item) => item !== null); // Loại bỏ các phần tử null
      setData(results);
    } catch (error) {
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
  }, [selectedDate, machineType]);

  const formatHours = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  useEffect(() => {
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
      const width = wrapperRef.current.clientWidth;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 50, left: 60 };

      svg.selectAll('*').remove();

      // Kiểm tra nếu không có dữ liệu thì hiển thị thông báo
      if (data.length === 0) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('fill', '#888')
          .text('Không có dữ liệu để hiển thị');
        return;
      }

      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.machine))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, viewMode === 'percentage' ? 100 : d3.max(data, (d) => d.hours)])
        .range([height - margin.bottom, margin.top]);

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => 
          viewMode === 'percentage' ? `${d}%` : formatHours(d)
        ));

      svg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.machine))
        .attr('y', (d) => yScale(viewMode === 'percentage' ? d.percentage : d.hours))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - margin.bottom - yScale(viewMode === 'percentage' ? d.percentage : d.hours))
        .attr('fill', '#4aea4a')
        .on('mouseover', (event, d) => {
          tooltip
            .style('display', 'block')
            .html(`Machine: <b>${d.machine}</b><br>${
              viewMode === 'percentage' 
                ? `Runtime: ${d.percentage.toFixed(2)}%` 
                : `Runtime: ${formatHours(d.hours)}`
            }`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });
    };

    drawChart();

    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      tooltip.remove();
      resizeObserver.disconnect();
    };
  }, [data, viewMode]);

  return (
    <div ref={wrapperRef} className="bg-white rounded-lg shadow-sm p-4">
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">
          Machine {viewMode === 'percentage' ? 'Runtime Percentage' : 'Runtime Hours'}
        </h3>
      </header>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <svg ref={svgRef} width="100%" height="300"></svg>
    </div>
  );
};

export default MachineComparisonChart;
