import React ,{ useState }from 'react';
import ProductionChart from './ProductionChart';
import CycleTimeChart from './CycleTimeChart';
import FilterAndChartComponent from '../../Components/Production/FilterAndChart'


function ProductionDashboard() {
  const [filteredData, setFilteredData] = useState([]);  // State to hold filtered data

  // Handler to update the filtered data
  const handleFilterData = (data) => {
    setFilteredData(data);
  };
  return (
    <div className=" p-4 rounded-lg ">
      
      <div>
      <FilterAndChartComponent onFilterData={handleFilterData} />
      </div>
      {/* Hàng chứa biểu đồ CycleTimeChart */}
      <div>
        <CycleTimeChart />
      </div>
      
     
    </div>
  );
}

export default ProductionDashboard;
