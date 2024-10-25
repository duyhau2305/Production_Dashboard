import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiBell } from 'react-icons/fi';

const NotificationDropdown = () => {
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex items-center focus:outline-none">
          <FiBell className="text-gray-600 text-xl dark:text-white" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items 
          className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <div
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } px-4 py-2 text-sm text-gray-700`}
                >
                  <div className="font-medium">Tin nhắn mới</div>
                  <div className="text-xs text-gray-500">Đồng Duy Hậu đã nhắn cho bạn</div>
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } px-4 py-2 text-sm text-gray-700`}
                >
                  <div className="font-medium">Quản lý</div>
                  <div className="text-xs text-gray-500">Kế hoạch sản xuất bánh trung thu</div>
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } px-4 py-2 text-sm text-gray-700`}
                >
                  <div className="font-medium">Hệ thống</div>
                  <div className="text-xs text-gray-500">Bảo trì hệ thống</div>
                </div>
              )}
            </Menu.Item>
            <div className="border-t border-gray-200"></div>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700`}
                >
                  Hiển thị tất cả thông báo
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;
