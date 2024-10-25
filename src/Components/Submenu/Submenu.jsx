import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const Submenu = ({ title, items, isCollapsed, mainLink, setIsCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSubmenu = () => {
    // Nếu sidebar bị collapsed, mở rộng sidebar
    if (isCollapsed) {
      setIsCollapsed(false); // Mở rộng sidebar
    } else {
      // Nếu không bị collapsed, toggle submenu
      setIsOpen(!isOpen);
    }
  };

  const handleMainLinkClick = () => {
    // Điều hướng đến mainLink khi click vào tiêu đề
    navigate(mainLink);
  };

  return (
    <div className="flex flex-col">
      {/* Main Title của Submenu */}
      <div 
        className="flex items-center justify-between text-gray-500 hover:text-black cursor-pointer"
        onClick={toggleSubmenu} // Sử dụng toggleSubmenu khi click vào tiêu đề
      >
        <span className="flex items-center">
          {title}
        </span>
        {/* Hiển thị icon tùy theo trạng thái của submenu */}
        <span>
          {isCollapsed ? (
            <FiChevronRight  onClick={() => setIsCollapsed(false)} /> // Khi bị collapsed, click để mở rộng sidebar
          ) : isOpen ? (
            <FiChevronDown className="dark:text-white" />
          ) : (
            <FiChevronRight className="dark:text-white"/>
          )}
        </span>
      </div>

      {/* Submenu items, chỉ hiển thị nếu submenu đang mở và sidebar không bị collapsed */}
      <div className={`${isOpen && !isCollapsed ? 'block' : 'hidden'} pl-4 mt-2`}>
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="block py-1 px-1 ml-6 text-gray-500 dark:text-white hover:text-blue-500"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Submenu;
