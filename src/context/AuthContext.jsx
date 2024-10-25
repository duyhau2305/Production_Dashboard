import React, { createContext, useContext, useState } from 'react';

// Tạo AuthContext
export const AuthContext = createContext();

// Tạo AuthProvider để bọc ứng dụng
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);

  // Hàm để cập nhật role khi người dùng đăng nhập
  const login = (role) => {
    setUserRole(role);
    localStorage.setItem('role', role); // Lưu role vào localStorage
  };

  // Hàm để logout người dùng
  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole: login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);
