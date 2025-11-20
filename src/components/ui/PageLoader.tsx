
import React from 'react';
const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-4 border-t-[#162a41] rounded-full animate-spin mx-auto mb-5" />
        <p className="text-gray-500 text-base">Loading your progress...</p>
      </div>
    </div>
  );
};

export default PageLoader;