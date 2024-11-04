import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import moment from 'moment-timezone';

const MachineComparisonChart = ({ selectedDate, machineType }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const formatDateForAPI = (date, isEndOfDay = false) => {
    const momentDate = moment.isMoment(date) ? date : moment(date);
    if (!momentDate.isValid()) return '';

    const adjustedDate = isEndOfDay
      ? momentDate.tz('Asia/Ho_Chi_Minh').endOf('day').subtract(7.05, 'hours')
      : momentDate.tz('Asia/Ho_Chi_Minh').startOf('day').subtract(7.05, 'hours');

    return adjustedDate.format('YYYY-MM-DDTHH:mm:ss[Z]');
  };

  const fetchMachineData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = formatDateForAPI(selectedDate.start);
      const formattedEndDate = formatDateForAPI(selectedDate.end, true);

      if (!formattedStartDate || !formattedEndDate) {
        throw new Error('Invalid start or end date.');
      }

      const fetchPromises = machineType.map(async (machine) => {
        const { _id, deviceName } = machine;
        const response = await axios.get(
          `${apiUrl}/machine-operations/${_id}/summary-status?startTime=${formattedStartDate}&endTime=${formattedEndDate}`
        );

        if (response.status === 200 && response.data && response.data.data.length > 0) {
          const { runTime, idleTime, stopTime } = response.data.data[0];
          const startMoment = moment(selectedDate.start).tz('Asia/Ho_Chi_Minh').startOf('day');
          const endMoment = moment(selectedDate.end).tz('Asia/Ho_Chi_Minh').endOf('day');
          const totalPossibleSeconds = endMoment.diff(startMoment, 'seconds');
          const runtimePercentage = ((runTime || 0) / totalPossibleSeconds) * 100;

          return {
            machine: deviceName,
            percentage: runtimePercentage > 0 ? runtimePercentage : 0,
          };
        } else {
          return {
            machine: deviceName,
            percentage: 0,
          };
        }
      });

      const results = await Promise.all(fetchPromises);
      setData(results);
    } catch (error) {
      setError('There was an error fetching data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
  }, [selectedDate, machineType]);

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

      if (data.length === 0) return;

      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.machine))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`));

      svg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.machine))
        .attr('y', (d) => yScale(d.percentage))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - margin.bottom - yScale(d.percentage))
        .attr('fill', '#4aea4a')
        .on('mouseover', (event, d) => {
          tooltip
            .style('display', 'block')
            .html(`Machine: <b>${d.machine}</b><br>Runtime: ${d.percentage.toFixed(2)}%`);
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

    // Sử dụng ResizeObserver để lắng nghe thay đổi kích thước
    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      tooltip.remove();
      resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <div ref={wrapperRef} className="bg-white rounded-lg shadow-sm p-4">
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Machine Runtime Percentage</h3>
      </header>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <svg ref={svgRef} width="100%" height="300"></svg>
    </div>
  );
};

export default MachineComparisonChart;
