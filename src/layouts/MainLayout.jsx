import React, { useContext } from 'react';
import Sidebar from '../Components/Sider.bar/Siderbar';  
import Header from '../Components/Header/Header';
import { AuthContext } from '../context/AuthContext'; 

function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { role } = useContext(AuthContext); 

  return (
    <div className="flex h-screen w-screen">
      
      <aside className={`bg-gray-200 flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-48'}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          role={role} 
        />
      </aside>

      <div className="flex flex-col flex-grow">
        
        <header className="flex-shrink-0 ml-2">
          <Header />
        </header>

        {/* Nội dung chính */}
        <main className="flex-grow p-4 bg-gray-100 overflow-auto mt-2 ml-2">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
