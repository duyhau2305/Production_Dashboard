import React from 'react';
import QualityChart from './QualityChart';
import MaterialInspectionChart from './MaterialInspectionChart';

function QualityDashboard() {
  return (
    <>
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Biểu đồ chất lượng */}
      <QualityChart />

    </div>
    <div className="bg-white p-4 rounded-lg shadow-md mt-2">
      {/* Biểu đồ chất lượng */}
      <MaterialInspectionChart/>
    </div>
    </>
    

  );
}

export default QualityDashboard;
