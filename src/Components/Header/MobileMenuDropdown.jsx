import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiOutlineMenu } from 'react-icons/hi'; // Import icon HiOutlineMenu
import { useNavigate, Link } from 'react-router-dom';

const MobileMenuDropdown = () => {
const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');    
    localStorage.removeItem('role'); 

    
    navigate('/login');
  };
  return (
    <div className="lg:items-center lg:space-x-6 lg:hidden sm:flex ">
      <Menu as="div" className="relative">
        <div>
          {/* Button mở menu */}
          <Menu.Button className="mr-2 text-5xl dark:text-gray-300 cursor-pointer">
            <HiOutlineMenu />
          </Menu.Button>
        </div>

        {/* Menu Dropdown */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2  w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {/* Các mục trong menu */}
              <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings/profile" // Điều hướng tới trang Thông tin cá nhân
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700 dark:text-white hover:text-black `}
                >
                  Thông tin cá nhân
                </Link>
              )}
            </Menu.Item>
             
              
              <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout} // Gọi hàm handleLogout khi nhấn Đăng xuất
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:text-black`}
                >
                  Đăng xuất
                </button>
              )}
            </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default MobileMenuDropdown;
