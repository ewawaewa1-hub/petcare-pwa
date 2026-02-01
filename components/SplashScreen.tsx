
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] animate-pulse">
      <div className="w-32 h-32 bg-blue-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
        <i className="fa-solid fa-paw text-white text-6xl"></i>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 tracking-wider">萌宠日记</h1>
      <p className="text-slate-400 mt-2">记录宠物的每一刻温情</p>
    </div>
  );
};

export default SplashScreen;
