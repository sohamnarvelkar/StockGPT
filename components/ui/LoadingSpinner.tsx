import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-cyan-400 font-mono text-sm animate-pulse">RUNNING QUANT MODELS...</p>
    </div>
  );
};

export default LoadingSpinner;