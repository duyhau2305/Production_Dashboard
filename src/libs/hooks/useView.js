import { useState } from 'react';

function useView(initialView = 'dashboard') {
  const [currentView, setCurrentView] = useState(initialView);

  const changeView = (view) => {
    setCurrentView(view);
  };

  return {
    currentView,
    changeView,
  };
}

export default useView;
