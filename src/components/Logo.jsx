import React from 'react';

const Logo = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold text-orange-600">HOT</span>
      <span className="text-lg font-medium text-gray-600">Courier</span>
    </div>
  );
};

export default Logo; 