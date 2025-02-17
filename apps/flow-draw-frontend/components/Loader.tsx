'use client';

import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce200"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce400"></div>
      </div>
    </div>
  );
};

export default Loader;
