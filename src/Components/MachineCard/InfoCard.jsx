import React from 'react';

const InfoCard = ({ machine, className }) => {
  return (
    <button className={`bg-gray-100 hover:bg-blue-900 p-8 rounded-lg text-left w-full ${className}`}>
      <h3 className="text-5xl text-center font-bold bg-clip-text text-transparent bg-[#0e5d93] hover:text-white">
        {machine}
      </h3>
    </button>
  );
};

export default InfoCard;
