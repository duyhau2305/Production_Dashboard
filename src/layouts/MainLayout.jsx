import React, { useContext } from 'react';
import Sidebar from '../Components/Sider.bar/Siderbar';  
import Header from '../Components/Header/Header';
import { AuthContext } from '../context/AuthContext'; 

function MainLayout({ children, className }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { userRole } = useContext(AuthContext); 

  return (
    <div className={`lg:flex h-screen w-screen ${className}`}>
      {/* Sidebar được ẩn trên mobile bằng cách sử dụng hidden lg:block */}
      <aside className={`bg-gray-200 lg:flex flex-shrink-0 transition-all duration-300 hidden  ${isSidebarCollapsed ? 'w-20' : 'w-54'}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          role={userRole} 
        />
      </aside>

      <div className="flex flex-col flex-grow">
        <header className="flex-shrink-0 lg:ml-1">
          <Header />
        </header>

        {/* Nội dung chính */}
        <main className="lg:flex-grow p-4 lg:bg-gray-100 sm:bg-transparent  lg:rounded-lg overflow-auto mt-1 lg:ml-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
