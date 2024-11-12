import React, { createContext, useState } from 'react';

// Tạo context
export const OrderedListContext = createContext();

// Tạo Provider component
export const OrderedListProvider = ({ children }) => {
  const [orderedList, setOrderedList] = useState([]);

  return (
    <OrderedListContext.Provider value={{ orderedList, setOrderedList }}>
      {children}
    </OrderedListContext.Provider>
  );
};
