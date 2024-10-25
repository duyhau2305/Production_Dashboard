import React from 'react';
import { IoStatsChart, IoCash, IoCart, IoWarning } from 'react-icons/io5';

function DashboardStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <BoxWrapper>
        <div className="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center">
          <IoStatsChart className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-600 ">Tăng trưởng doanh thu</span>
          <div className="flex items-center">
            <strong className="text-lg text-gray-700 font-semibold">$32,420</strong>
            <span className="text-sm text-green-500 pl-2">+10%</span>
          </div>
          <span className="text-xs text-gray-400">7 ngày gần nhất</span>
        </div>
      </BoxWrapper>

      <BoxWrapper>
        <div className="bg-green-500 rounded-full h-10 w-10 flex items-center justify-center">
          <IoCash className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-600 ">Top Sản lượng</span>
          <div className="flex items-center">
            <strong className="text-lg text-gray-700 font-semibold">15,000 Units</strong>
            <span className="text-sm text-green-500 pl-2">+8%</span>
          </div>
          <span className="text-xs text-gray-400">7 ngày gần nhất</span>
        </div>
      </BoxWrapper>

      <BoxWrapper>
        <div className="bg-purple-500 rounded-full h-10 w-10 flex items-center justify-center">
          <IoCart className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-600 ">Tổng doanh thu</span>
          <div className="flex items-center">
            <strong className="text-lg text-gray-700 font-semibold">72,458</strong>
            <span className="text-sm text-green-500 pl-2">+25%</span>
          </div>
          <span className="text-xs text-gray-400">Hiện tại</span>
        </div>
      </BoxWrapper>

      <BoxWrapper>
        <div className="bg-red-500 rounded-full h-10 w-10 flex items-center justify-center">
          <IoWarning className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-600 ">Lỗi xuất hiện nhiều nhất</span>
          <div className="flex items-center">
            <strong className="text-lg text-gray-700 font-semibold">Cháy (30 lần)</strong>
          </div>
          <span className="text-xs text-gray-400">3 ngày gần nhất</span>
        </div>
      </BoxWrapper>
    </div>
  );
}

function BoxWrapper({ children }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-md flex items-center">
      {children}
    </div>
  );
}

export default DashboardStatsGrid;
