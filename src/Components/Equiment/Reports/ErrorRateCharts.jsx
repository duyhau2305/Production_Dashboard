import React, { useState } from 'react';

import 'react-datepicker/dist/react-datepicker.css';
import ErrorFreeChart from './ErrorFreeChart';
import DetailedErrorChart from './DetailedErrorChart';

const ErrorRateCharts = () => {
  const [selectedMachine, setSelectedMachine] = useState('Máy trộn');
  
  const machineData = {
    'Máy trộn': {
      errorFree: 80,
      error: 20,
      detailedErrors: {
        Cushion: 10,
        'Runner stuck': 5,
        'Double short': 2,
        'Accume miss': 1,
        'Material runout': 1,
        Others: 1,
      },
    },
    'Máy định hình': {
      errorFree: 85,
      error: 15,
      detailedErrors: {
        Cushion: 5,
        'Runner stuck': 3,
        'Double short': 3,
        'Accume miss': 2,
        'Material runout': 1,
        Others: 1,
      },
    },
    'Máy nướng': {
      errorFree: 70,
      error: 30,
      detailedErrors: {
        Cushion: 15,
        'Runner stuck': 5,
        'Double short': 5,
        'Accume miss': 3,
        'Material runout': 1,
        Others: 1,
      },
    },
    'Máy đóng gói': {
      errorFree: 90,
      error: 10,
      detailedErrors: {
        Cushion: 4,
        'Runner stuck': 2,
        'Double short': 1,
        'Accume miss': 1,
        'Material runout': 1,
        Others: 1,
      },
    },
  };

  const selectedData = machineData[selectedMachine];

  const errorFreeData = {
    labels: ['Dừng có lỗi máy', 'Dừng không lỗi'],
    datasets: [
      {
        data: [selectedData.error, selectedData.errorFree],
        backgroundColor: ['#FF5252', '#4CAF50'],
      },
    ],
  };

  const detailedErrorData = {
    labels: Object.keys(selectedData.detailedErrors),
    datasets: [
      {
        data: Object.values(selectedData.detailedErrors),
        backgroundColor: ['#FF5252', '#FFC107', '#4CAF50', '#FF9800', '#03A9F4', '#E91E63'],
      },
    ],
  };



  return (
    <div className="bg-white p-2 rounded-lg shadow-md">
       
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow col-span-1" style={{ height: '400px' }}>
                <h3 className="text-lg font-semibold mb-2">Biểu đồ tỷ lệ dừng lỗi và không lỗi</h3>
                <div style={{ height: '100%' }}>
                  <ErrorFreeChart errorFreeData={errorFreeData} />
                </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow col-span-1" style={{ height: '400px' }}>
                <h3 className="text-lg font-semibold mb-2">Biểu đồ tỷ lệ lỗi máy sản xuất</h3>
                <div style={{ height: '70%' }}>
                  <DetailedErrorChart detailedErrorData={detailedErrorData} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ErrorRateCharts;
