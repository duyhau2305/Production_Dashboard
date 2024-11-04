import React, { useRef } from 'react';
import { FiFilePlus } from 'react-icons/fi';

function ImportButton({ onImport, label = "Nhập Dữ liệu" }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Kích hoạt input khi người dùng nhấn vào nút
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        className="bg-[#080f4c] text-sm text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        onClick={handleButtonClick}
      >
        <FiFilePlus className="mr-2" />
        {label}
      </button>
    </div>
  );
}

export default ImportButton;
