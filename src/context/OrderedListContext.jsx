import React, { createContext, useState, useEffect } from 'react';

export const OrderedListContext = createContext();

export const OrderedListProvider = ({ children }) => {
  const [orderedList, setOrderedList] = useState(() => {
    // Lấy giá trị từ localStorage khi khởi tạo
    const savedOrder = localStorage.getItem('orderedList');
    return savedOrder ? JSON.parse(savedOrder) : [];
  });

  // Cập nhật localStorage mỗi khi orderedList thay đổi
  useEffect(() => {
    localStorage.setItem('orderedList', JSON.stringify(orderedList));
  }, [orderedList]);

  return (
    <OrderedListContext.Provider value={{ orderedList, setOrderedList }}>
      {children}
    </OrderedListContext.Provider>
  );
};
