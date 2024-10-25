import React from 'react';
import { MdFullscreen } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BiSolidFileExport } from "react-icons/bi";

const TitleChart = ({ title, timeWindow, onFullscreen, onPrint }) => {
  return (
    <div className="title-chart mb-3">
      {/* Hàng 1: Tên biểu đồ và các nút */}
      <div className="title-chart-header flex justify-between items-center mb-1">
        <h3 className="font-bold text-sm">{title}</h3>
        <div className="title-chart-actions flex space-x-2">
          <button onClick={onPrint} className="print-btn flex items-center">
            <BiSolidFileExport className="text-lg" />
          </button>
          <button onClick={onFullscreen} className="fullscreen-btn flex items-center">
            <MdFullscreen className="text-2xl text-gray-700" />
          </button>
        </div>
      </div>

      {/* Hàng 2: Time Window */}
      
    </div>
  );
};

export default TitleChart;
