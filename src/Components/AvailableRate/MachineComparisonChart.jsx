import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import moment from 'moment';

const MachineComparisonChart = ({ selectedDate, machineType }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  

  // Format date for API
  const formatDateForAPI = (date) => moment(date).format('YYYY-MM-DD');
  
  // Fetch machine data from API
  const fetchMachineData = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = formatDateForAPI(selectedDate.start);
      const formattedEndDate = formatDateForAPI(selectedDate.end);
      console.log(formattedStartDate)
      console.log(formattedEndDate)
      
      const fetchPromises = machineType.map(async (machine) => {
        const deviceCode = machine.deviceCode;
        console.log(deviceId)
        const response = await axios.get(`${apiUrl}/telemetry?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
        console.log("this is response")
        console.log(response)
        const fetchedData = response.data;

        let runningTime = 0;
        if (fetchedData && fetchedData.length > 0) {
          fetchedData[0].intervals.forEach(interval => {
            if (interval.status === 'Chạy') {
              const startTime = moment(interval.startTime, "HH:mm");
              const endTime = moment(interval.endTime, "HH:mm");
              runningTime += endTime.diff(startTime, 'minutes');
            }
          });
        }

        const percentage = (runningTime / 1440) * 100; 

        return {
          machine: machine.deviceName,
          percentage: percentage > 0 ? percentage : null // Keep as null if no running time
        };
      });

      const results = await Promise.all(fetchPromises);
      const filteredResults = results.filter(result => result.percentage !== null); // Filter out machines with no data

      setData(filteredResults);
    } catch (error) {
      console.error("Error fetching machine data:", error);
      setError("Error fetching machine data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData(); // Fetch data when component mounts or selectedDate/machineType changes
  }, [selectedDate, machineType]); // Depend on selectedDate and machineType

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous chart

    const width = svgRef.current.clientWidth || 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 40 };

    if (data.length === 0) return; // Don't draw if no data

    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.machine))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Percentage range
      .range([height - margin.bottom, margin.top]);

    // Draw X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Draw Y axis with '%' symbol
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));

    // Draw bars for machines with data
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.machine))
      .attr('y', d => yScale(d.percentage))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.percentage))
      .attr('fill', '#4aea4a')
      .on('mouseover', (event, d) => {
        d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background-color', 'white')
          .style('border', '1px solid #ccc')
          .style('padding', '5px')
          .style('border-radius', '4px')
          .style('display', 'block')
          .html(`Máy: <b>${d.machine}</b><br>Tỷ lệ: ${d.percentage.toFixed(2)}%`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', () => {
        d3.select('body').select('div.tooltip').remove();
      });

  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Tỷ lệ máy chạy</h3>
      </header>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <svg ref={svgRef} width="100%" height="300"></svg>
    </div>
  );
};

export default MachineComparisonChart;
