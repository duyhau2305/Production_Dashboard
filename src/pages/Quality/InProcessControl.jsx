import React from 'react';
import { IoThermometer, IoTime, IoSpeedometer, IoWater } from 'react-icons/io5';

function InProcessControl() {
  // Dữ liệu giả lập cho các thông số
  const processParameters = [
    { icon: <IoThermometer />, label: 'Nhiệt độ', value: '180°C', unit: '°C' },
    { icon: <IoTime />, label: 'Thời gian', value: '30 phút', unit: 'phút' },
    { icon: <IoSpeedometer />, label: 'Áp suất', value: '1.2 bar', unit: 'bar' },
    { icon: <IoWater />, label: 'Độ ẩm', value: '50%', unit: '%' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Kiểm tra trong quá trình sản xuất (In-Process Control)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {processParameters.map((param, index) => (
          <div key={index} className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm">
            <div className="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
              {param.icon}
            </div>
            <div className="ml-4">
              <span className="text-sm text-gray-500 font-light">{param.label}</span>
              <div className="flex items-center">
                <strong className="text-lg text-gray-700 font-semibold">{param.value}</strong>
                <span className="text-sm text-gray-400 pl-2">{param.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InProcessControl;
