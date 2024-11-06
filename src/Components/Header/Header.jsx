import React, { Fragment } from 'react';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import ThemeDropdown from './ThemeDropdown'; // Import ThemeDropdown
import logo from '../../assets/image/logodark.png'; 
import { HiOutlineMenu } from "react-icons/hi";
import { Menu, Transition } from '@headlessui/react';
import MobileMenuDropdown from './MobileMenuDropdown';

const Header = () => {
  return (
    <header className="bg-slate-100 dark:bg-[#35393c] shadow lg:h-16 px-4 flex sm:h-32 justify-between items-center">
      <div className="flex items-center justify-center">
        {/* Hiển thị Logo */}
        <img src={logo} alt="Logo" className="w-[280px] h-auto object-contain lg:hidden " />
        <h2 className="font-bold lg:hidden  lg:block sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500 dark:text-white">
          DI.OEE
        </h2>
        <h2 className="font-bold ml-64 lg:text-3xl sm:hidden lg:block sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500 dark:text-white">
          Nhà máy chuyển đổi số cơ khí Q.C.S
        </h2>
      </div>

      <div className="lg:flex lg:items-center lg:justify-center lg:space-x-6 sm:hidden md:hidden">
        {/* Thêm dropdown cho Light/Dark mode */}
        <ThemeDropdown />

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <UserDropdown />
      </div>

      {/* Menu thu gọn trên mobile */}
      <MobileMenuDropdown/>
    </header>
  );
};

export default Header;
