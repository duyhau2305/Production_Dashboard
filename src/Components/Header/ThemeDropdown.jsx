import React, { useState, useEffect, useRef } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa'; // Import icons

const ThemeDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const dropdownRef = useRef(null);

  // Function to toggle dark mode
  const toggleDarkMode = (mode) => {
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save light mode
      setDarkMode(false); // Update state
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save dark mode
      setDarkMode(true); // Update state
    }
    setIsOpen(false); // Close dropdown after selection
  };

  // Set dark mode by default (remove the localStorage check)
  useEffect(() => {
    document.documentElement.classList.add('dark'); // Set dark mode on mount
    setDarkMode(true); // Update state to dark mode
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-[#35393c] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#35393c] transition"
      >
        {darkMode ? <FaMoon className="h-4 w-4 mr-2" /> : <FaSun className="h-4 w-4 mr-2" />}
        {darkMode ? 'Dark Mode' : 'Light Mode'}
      </button>

      {isOpen && (
        <div className="absolute mt-2 right-0 ml-2 w-[132px] bg-white dark:bg-[#35393c] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <ul>
            <li
              className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer dark:text-white"
              onClick={() => toggleDarkMode('light')}
            >
              <FaSun className="h-4 w-4 mr-2 text-yellow-500" />
              Light Mode
            </li>
            <li
              className="flex items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:hover:text-white dark:text-white rounded-lg"
              onClick={() => toggleDarkMode('dark')}
            >
              <FaMoon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-300" />
              Dark Mode
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
