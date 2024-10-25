// DateContext.js
import React, { useState, createContext } from 'react';

// Create the context
export const DateContext = createContext();

// Create the provider component
export const DateProvider = ({ children }) => {
  const [selectedDates, setSelectedDates] = useState([new Date().toISOString().split('T')[0]]); // Default to today's date

  return (
    <DateContext.Provider value={{ selectedDates, setSelectedDates }}>
      {children}
    </DateContext.Provider>
  );
};
