
import React from 'react';

interface Props {
  active: string;
  onNavigate: (view: any) => void;
}

const Navbar: React.FC<Props> = ({ active, onNavigate }) => {
  const items = [
    { id: 'pets', icon: 'fa-solid fa-dog', label: '宠物' },
    { id: 'calendar', icon: 'fa-solid fa-calendar-days', label: '日历' },
    { id: 'add', icon: 'fa-solid fa-circle-plus', label: '添加', center: true },
    { id: 'notifications', icon: 'fa-solid fa-bell', label: '通知' },
    { id: 'profile', icon: 'fa-solid fa-user', label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-orange-50 flex justify-around items-center px-4 py-3 safe-bottom z-50 rounded-t-[32px] shadow-[0_-8px_30px_-10px_rgba(249,115,22,0.15)]">
      {items.map(item => {
        const isActive = active === item.id || (active === 'petDetail' && item.id === 'pets');
        return (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${item.center ? 'mb-8' : ''} active:scale-90`}
          >
            <div className={`
              transition-all duration-300
              ${item.center ? 'w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 -mt-4 ring-4 ring-[#fff8f5] active:bg-orange-600' : ''}
              ${!item.center && isActive ? 'text-orange-500 transform scale-110' : 'text-slate-300'}
            `}>
              <i className={`${item.icon} ${item.center ? 'text-white text-2xl' : 'text-xl'}`}></i>
            </div>
            {!item.center && (
              <span className={`text-[10px] mt-1 font-black uppercase tracking-wider transition-colors ${isActive ? 'text-orange-500' : 'text-slate-300'}`}>
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;
