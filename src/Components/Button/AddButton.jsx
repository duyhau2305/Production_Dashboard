import React from 'react';
import { FiPlus } from 'react-icons/fi';

function AddButton({ onClick, label = "Thêm mới" }) {
  return (
    <button
      className="bg-green-400 text-sm text-white px-3 py-2 rounded-md flex items-center hover:bg-green-600 transition-colors"
      onClick={onClick}
    >
      <FiPlus className="mr-2" />
      {label}
    </button>
  );
}

export default AddButton;
