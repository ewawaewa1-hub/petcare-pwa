
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <div className="relative">
        {/* 背景光晕 */}
        <div className="absolute inset-0 bg-orange-400 blur-3xl opacity-20 animate-pulse scale-150"></div>
        
        <div className="w-32 h-32 bg-orange-500 rounded-[40px] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] mb-8 relative z-10 animate-bounce">
          <i className="fa-solid fa-paw text-white text-6xl"></i>
        </div>
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 italic">萌宠日记</h1>
        <div className="flex items-center justify-center gap-2">
          <span className="h-[2px] w-4 bg-orange-200"></span>
          <p className="text-orange-400 font-bold text-xs uppercase tracking-[0.2em]">Pet Care Diary</p>
          <span className="h-[2px] w-4 bg-orange-200"></span>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-slate-300 text-[10px] font-black tracking-widest uppercase">
        Version 1.2.0 • Pro Edition
      </div>
    </div>
  );
};

export default SplashScreen;
