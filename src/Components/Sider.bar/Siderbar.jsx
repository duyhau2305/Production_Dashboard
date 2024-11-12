import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiBarChart2, FiGrid, FiClipboard, FiDatabase, FiHeadphones, FiSettings, FiCalendar, FiLogOut, FiChevronLeft, FiFolder, FiChevronRight, FiPercent } from 'react-icons/fi';
import Submenu from '../Submenu/Submenu';
import { AuthContext } from '../../context/AuthContext';
import { supportItems, settingItems, imprtDataItems,QCStItems } from '../../libs/menuItems';
import { toast } from 'react-toastify';
import logo from '../../assets/image/logo.png';
import logodark from '../../assets/image/logodark.png';
import { message } from 'antd'

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Hàm xử lý khi click vào submenu
  const handleSubmenuClick = (toggleSubmenu) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      toggleSubmenu();
    } else {
      toggleSubmenu();
    }
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    message.success('Đã đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <div className={`relative dark:bg-[#35393c] bg-slate-100 h-full shadow-md ${isCollapsed ? 'w-20' : 'w-60'} flex flex-col justify-between transition-all duration-300 overflow-y-auto`} style={{ maxHeight: '100vh' }}>

      {/* Phần chứa logo và nút toggle */}
      <div className="flex flex-col items-start p-4 mt-2">
        <div className="flex justify-between w-full">
          {!isCollapsed && (
            <div className="">
              {/* Hiển thị Logo */}
              <img src={logodark} alt="Logodark" className="w-[180px] h-auto object-contain hidden dark:block " />
              <img src={logo} alt="Logo" className="w-[180px] h-auto object-contain dark:hidden" />
              <h3 className="font-bold text-sky-700 ml-2 flex justify-center dark:text-white">DI.OEE</h3>
            </div>
          )}
          <button onClick={toggleSidebar} className=" mt-4 p-2 h-[50%] rounded-full hover:bg-gray-200 focus:outline-none flex justify-center items-center">
            {isCollapsed ? <FiChevronRight className="text-lg text-gray-500 dark:text-white ml-1" /> : <FiChevronLeft className="text-lg dark:text-white text-gray-500" />}
          </button>
        </div>
      </div>

      <hr />

      {/* Phần chứa các menu */}
      <div className="flex-grow flex flex-col space-y-4 p-2  mt-4 text-gray-500">
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-black">
            <FiHome className="mr-4 text-lg text-gray-500 dark:text-white dark:hover:text-black" />
            {!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Trang chủ</span>}
          </Link>

          <Submenu
            title={<><FiGrid className="mr-4 text-lg dark:text-white text-gray-500 hover:text-blue-500 " />{!isCollapsed && <span className="text-gray-500 dark:text-white hover:text-blue-500">Nhập dữ liệu cơ bản</span>}</>}
            items={imprtDataItems}
            mainLink="/importdata/devivce"
            isCollapsed={isCollapsed}
            onSubmenuClick={handleSubmenuClick}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Tổng Quan */}

          <Link to="/QCS/availablerate" className="flex items-center text-gray-700 hover:text-black">
            <FiPercent className="mr-4 dark:text-white text-lg text-gray-500" />
            {!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Tỷ lệ máy chạy</span>}
          </Link>
          <Link to="/QCS/schedule" className="flex items-center text-gray-700 hover:text-blue-500">
            <FiCalendar className=" dark:text-white mr-4 text-lg text-gray-500" />
            {!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Nhiệm vụ sản xuất</span>}
          </Link>
          <Submenu
            title={
              <>
                <FiBarChart2 className="mr-4 dark:text-white text-lg text-gray-500" />
                {!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Phân tích</span>}
              </>
            }
            items={QCStItems.slice(1, 4)}  
            mainLink="/QCS/analysis"
            isCollapsed={isCollapsed}
            onSubmenuClick={handleSubmenuClick}
            setIsCollapsed={setIsCollapsed}
          />
          <Link to="/QCS/reports" className="flex items-center text-gray-700  hover:text-blue-500">
            <FiFolder className="mr-4 dark:text-white text-lg text-gray-500" />
            {!isCollapsed && <span className="text-gray-500 dark:text-white hover:text-blue-500">Báo cáo</span>}
          </Link>

          {userRole === 'Admin' && (
            <Link to="/admin/userlist" className="flex items-center text-gray-700 hover:text-blue-500">
              <FiSettings className="mr-4 dark:text-white text-lg text-gray-500" />
              {!isCollapsed && <span className="text-gray-500 dark:text-white hover:text-blue-500">Quản lý tài khoản</span>}
            </Link>
          )}

        </nav>
      </div>

      {/* Phần chứa các nút hỗ trợ và đăng xuất */}
      <div className="p-4">
        <nav className="flex flex-col space-y-4">
          {/* <Submenu
              title={<><FiHeadphones className="mr-4 dark:text-white hover:text-blue-500 text-lg text-gray-500" />{!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Hỗ trợ</span>}</>}
              items={supportItems}
              mainLink="/support/faq"
              isCollapsed={isCollapsed}
              onSubmenuClick={handleSubmenuClick}
              setIsCollapsed={setIsCollapsed}
            />
    
            <Submenu
              title={<><FiSettings className="mr-4 text-lg hover:text-blue-500 dark:text-white text-gray-500" />{!isCollapsed && <span className="text-gray-500 hover:text-blue-500 dark:text-white">Cài Đặt</span>}</>}
              items={settingItems}
              mainLink="/settings/profile"
              isCollapsed={isCollapsed}
              onSubmenuClick={handleSubmenuClick}
              setIsCollapsed={setIsCollapsed}
            /> */}

          <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-black focus:outline-none">
            <FiLogOut className="mr-4 dark:text-white text-lg text-gray-500" />
            {!isCollapsed && <span className="text-gray-500 dark:text-white">Đăng xuất</span>}
          </button>
        </nav>
      </div>
    </div>
  );

};

export default Sidebar;
