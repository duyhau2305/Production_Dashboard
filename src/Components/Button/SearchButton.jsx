import React from 'react';
import { FiSearch } from 'react-icons/fi';

function SearchButton({ placeholder = "Search...", onSearch }) {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder={placeholder} 
        className="border  rounded-full pl-3 pr-10 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-gray-300"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onSearch(e.target.value);
          }
        }}
      />
      <button
        onClick={() => onSearch(document.querySelector('input').value)}
        className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500 focus:outline-none"
      >
        <FiSearch />
      </button>
    </div>
  );
}

export default SearchButton;
