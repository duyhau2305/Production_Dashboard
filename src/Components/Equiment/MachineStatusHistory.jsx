import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

// Định nghĩa màu sắc và trạng thái cho các giá trị PLC:STATUS
const statusMapping = {
  1: { label: "Run", color: "#28a745" },   // Chạy (Xanh lá)
  2: { label: "Stop", color: "#ffc107" },  // Dừng (Vàng)
  5: { label: "Failed", color: "#dc3545" },// Lỗi (Đỏ)
  default: { label: "Unknown", color: "#6c757d" } // Không xác định (Xám)
};

const MachineStatusHistory = () => {
  const [historyData, setHistoryData] = useState([]); // Lưu trữ dữ liệu lịch sử máy
  const svgRef = useRef();
  const legendRef = useRef();
  const containerRef = useRef(); // Ref để theo dõi kích thước container

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await axios.get(
          'https://back-end-production.onrender.com/api/telemetry' // URL mới không cần xác thực
        );

        const rawData = response.data;
        console.log (rawData)
        const formattedData = formatHistoryData(rawData); // Xử lý dữ liệu API
        setHistoryData(formattedData); // Lưu dữ liệu vào state
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };

    fetchHistoryData(); // Gọi API khi component mount
  }, []);

  // Hàm xử lý dữ liệu thô từ API thành dữ liệu lịch sử máy
  const formatHistoryData = (rawData) => {
    const formattedData = [];

    // Sắp xếp dữ liệu theo timestamp
    const sortedData = rawData.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    // Duyệt qua dữ liệu và tính duration giữa các trạng thái liên tiếp
    for (let i = 0; i < sortedData.length - 1; i++) {
      const telemetryData = sortedData[i];
      const nextTelemetryData = sortedData[i + 1];  // Lấy dữ liệu tiếp theo

      // Lấy timestamp của trạng thái hiện tại và tiếp theo
      const startTime = new Date(telemetryData.ts);
      const endTime = new Date(nextTelemetryData.ts);

      const duration = (endTime - startTime) / 60000;  // Tính thời gian kéo dài (phút)

      // Tính số phút từ đầu ngày
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes; // Tính tổng số phút từ đầu ngày

      // Parse key để đảm bảo giá trị đúng
      const key = parseInt(telemetryData.value);
      
      if (isNaN(key) || !statusMapping[key]) {
        console.warn(`Unknown status key: ${telemetryData.value}`);
      }

      // Thêm dữ liệu đã xử lý vào mảng formattedData
      formattedData.push({
        time: timeInMinutes, // Thời gian (phút trong ngày)
        key: !isNaN(key) && statusMapping[key] ? key : 'default', // Sử dụng 'default' nếu key không hợp lệ
        duration, // Thời gian kéo dài của trạng thái
      });
    }

    // Xử lý trạng thái cuối cùng (không có trạng thái tiếp theo để tính duration)
    const lastTelemetryData = sortedData[sortedData.length - 1];
    const lastStartTime = new Date(lastTelemetryData.ts);
    const lastKey = parseInt(lastTelemetryData.value);

    if (!isNaN(lastKey) && statusMapping[lastKey]) {
      formattedData.push({
        time: lastStartTime.getHours() * 60 + lastStartTime.getMinutes(), // Thời gian (phút trong ngày)
        key: lastKey, // Trạng thái cuối cùng
        duration: 0, // Không có trạng thái tiếp theo để tính duration
      });
    }

    return formattedData;
  };

  useEffect(() => {
    if (!historyData || historyData.length === 0) return;

    // Lấy kích thước của container
    const containerWidth = containerRef.current.getBoundingClientRect().width;

    // Set kích thước của biểu đồ
    const width = containerWidth || 1200;
    const height =  120;  // Chiều cao của biểu đồ chính
    const margin = { top: 20, right: 30, bottom: 60, left: 20 };  // Thêm padding cho trục

    // Tạo SVG cho biểu đồ chính
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`) // Sử dụng viewBox để responsive
      .attr('preserveAspectRatio', 'xMidYMid meet') // Đảm bảo responsive
      .style('background-color', '#0000'); // Đặt màu nền trong suốt

    // Tạo thang đo x cho trục thời gian từ 00:00 đến 23:59
    const totalMinutesInDay = 24 * 60; // Tổng số phút trong 24 giờ
    const startTime = 0; // Bắt đầu từ 00:00 (phút đầu tiên của ngày)
    const endTime = totalMinutesInDay; // Kết thúc lúc 23:59 (1440 phút)

    const xScale = d3.scaleLinear()
      .domain([startTime, endTime]) // Trục thời gian từ startTime đến endTime
      .range([margin.left, width - margin.right]);

    // Xóa các phần tử cũ
    svg.selectAll("*").remove();

    // Đặt lại tổng thời gian tích lũy
    let totalElapsedMinutes = startTime;  // Bắt đầu từ 00:00

    // Tạo nhóm thanh bars
    svg.selectAll('rect')
      .data(historyData)
      .join('rect')
      .attr('x', d => {
        const xPos = xScale(d.time);  // Xác định vị trí x theo thời gian
        return xPos;
      })
      .attr('y', margin.top)
      .attr('width', d => {
        const barWidth = xScale(d.time + d.duration) - xScale(d.time); 
        return barWidth > 0 ? Math.max(barWidth, 2) : 0; // Đảm bảo chiều rộng tối thiểu là 2 pixels
      })
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', d => statusMapping[d.key]?.color || statusMapping.default.color); // Sử dụng màu theo trạng thái hoặc màu mặc định

    // Thêm trục x với các mốc thời gian chính từ 00:00 đến 23:59
    const xAxis = d3.axisBottom(xScale)
      .tickValues(d3.range(startTime, endTime + 120, 120))  // Mốc thời gian hai giờ
      .tickFormat(d => {
        let hour = Math.floor((d % totalMinutesInDay) / 60); // Đảm bảo không vượt qua 24 giờ
        return hour.toString().padStart(2, '0') + ":00";  // Hiển thị giờ dưới dạng HH:00
      });

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style('font-size', '12px'); // Cải thiện kích thước chữ trục x

    // Tính tổng thời gian hoạt động của từng trạng thái
    const statusDurations = historyData.reduce((acc, d) => {
      const status = statusMapping[d.key]?.label || 'Unknown';
      acc[status] = (acc[status] || 0) + d.duration;
      return acc;
    }, {});

    const totalDuration = d3.sum(historyData, d => d.duration); // Tính tổng thời gian từ dữ liệu hiện tại

    // Cập nhật phần legend dựa trên dữ liệu đã lọc
    const legend = d3.select(legendRef.current)
      .attr('width', width)
      .attr('height', 40); // Tăng chiều cao legend
    legend.attr('transform', 'translate(15, 0)');

    // Xóa legend cũ trước khi thêm legend mới
    legend.selectAll('*').remove();

    // Tạo nhóm cho từng mục legend
    const legendGroup = legend.selectAll('.legend')
      .data(Object.entries(statusDurations)) // Lấy giá trị và thời gian của Run, Stop, Failed
      .join('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${i * 150}, 0)`);  // Sắp xếp legend ngang hàng

    // Thêm hình chữ nhật vào legend
    legendGroup.append('rect')
      .attr('x', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => {
        const key = Object.keys(statusMapping).find(k => statusMapping[k].label === d[0]);
        return statusMapping[key]?.color || statusMapping.default.color;
      });

    // Thêm nhãn và phần trăm thời gian
    legendGroup.append('text')
      .attr('x', 20)
      .attr('y',6)
      .attr('dy', '0.2em')
      .style('font-size', '10px')
      .text(d => {
        const percent = totalDuration > 0 ? ((d[1] / totalDuration) * 100).toFixed(2) : "0.00"; // Tính phần trăm
        return `${d[0]}: ${percent}%`; // Hiển thị nhãn và phần trăm
      });

  }, [historyData]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: 'auto' }}>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef}></svg>
    </div>
  );
};

export default MachineStatusHistory;
