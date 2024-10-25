import React, { useContext } from 'react';

import Header from '../Components/Header/Header';
import { AuthContext } from '../context/AuthContext'; 

function MainLayout2({ children, className }) {
  
  return (
    <div className={`lg:flex h-screen w-screen ${className}`}>
      {/* Sidebar được ẩn trên mobile bằng cách sử dụng hidden lg:block */}
      <div className="flex flex-col flex-grow">
        <header className="flex-shrink-0 lg:ml-2">
          <Header />
        </header>

        {/* Nội dung chính */}
        <main className="lg:flex-grow  lg:bg-gray-100 sm:bg-transparent  lg:rounded-lg overflow-auto mt-2 lg:ml-2">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout2;
