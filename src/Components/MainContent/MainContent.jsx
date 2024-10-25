import React from 'react';
import Production from '../../pages/Production/ProductionDashboard';
import Quality from '../../pages/Quality/QualityDashboard';
import Equiment from '../../pages/Equiment.jsx/EquimentDashboard';
import Inventory from '../../pages/Inventory/InventoryDashboard';

import Dashboard from '../../pages/Dasboard/Dashboard';

const viewComponents = {
  production: Production,
  quality: Quality,
  equipment: Equiment,
  inventory: Inventory,
 
  dashboard: Dashboard,
};

function MainContent({ currentView }) {
  const ViewComponent = viewComponents[currentView] || Dashboard;

  return (
    <div className="p-4 flex-grow">
      <ViewComponent />
    </div>
  );
}

export default MainContent;
