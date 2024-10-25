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

  // Hàm đảm bảo `date` là đối tượng moment và format nó
  const formatDateForAPI = (date) => {
    const momentDate = moment.isMoment(date) ? date : moment(date);
    return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : '';
  };

  // Fetch machine data from API
  const fetchMachineData = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = formatDateForAPI(selectedDate.start);
      const formattedEndDate = formatDateForAPI(selectedDate.end);

      if (!formattedStartDate || !formattedEndDate) {
        throw new Error('Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.');
      }

      const fetchPromises = machineType.map(async (machine) => {
        const { deviceId, deviceName } = machine;

        const response = await axios.get(
          `${apiUrl}/totaltop?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );

        const runtimePercentage = parseFloat(response.data.runtime || '0'); // Gán 0 nếu không có dữ liệu

        return {
          machine: deviceName,
          percentage: runtimePercentage > 0 ? runtimePercentage : 0,
        };
      });

      const results = await Promise.all(fetchPromises);
      setData(results);
    } catch (error) {
      console.error('Error fetching machine data:', error);
      setError('Có lỗi xảy ra khi lấy dữ liệu.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData(); // Gọi API khi component mount hoặc khi selectedDate/machineType thay đổi
  }, [selectedDate, machineType]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Xóa biểu đồ cũ

    const width = svgRef.current.clientWidth || 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    if (data.length === 0) return; // Không vẽ nếu không có dữ liệu

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.machine))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Vẽ trục X
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Vẽ trục Y với ký hiệu '%'
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`));

    // Vẽ các thanh biểu đồ
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
        d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background-color', 'white')
          .style('border', '1px solid #ccc')
          .style('padding', '5px')
          .style('border-radius', '4px')
          .style('display', 'block')
          .html(
            `Máy: <b>${d.machine}</b><br>Tỷ lệ: ${d.percentage.toFixed(2)}%`
          )
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

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <svg ref={svgRef} width="100%" height="300"></svg>
    </div>
  );
};

export default MachineComparisonChart;
