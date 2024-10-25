import React, { useRef } from 'react';
import { FiDownload } from 'react-icons/fi';

function FormSample({ onClick, label = "Tải Mẫu", href }) {
  const hiddenLinkRef = useRef(null);

  const handleDownload = () => {
    if (href && hiddenLinkRef.current) {
      hiddenLinkRef.current.click();  // Kích hoạt sự kiện click trên thẻ <a> ẩn
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div>
      <button
        className="bg-green-400 text-sm text-white px-3 py-2 rounded-md flex items-center hover:bg-green-600 transition-colors"
        onClick={handleDownload}
      >
        <FiDownload className="mr-2" />
        {label}
      </button>
      {/* Liên kết ẩn để tải file */}
      <a
        href={href}
        download
        ref={hiddenLinkRef}
        style={{ display: 'none' }} // Ẩn liên kết khỏi giao diện người dùng
      />
    </div>
  );
}

export default FormSample;
