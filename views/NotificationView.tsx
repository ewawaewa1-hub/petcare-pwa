
import React from 'react';
import { Pet, Record, TaskType } from '../types';

interface Props {
  pets: Pet[];
  records: Record[];
  taskTypes: TaskType[];
}

const NotificationView: React.FC<Props> = ({ pets, records, taskTypes }) => {
  const notifications = pets.flatMap(pet => {
    const petRecords = records.filter(r => r.petId === pet.id);
    
    return taskTypes
      .filter(tt => tt.cycleDays !== null)
      .map(tt => {
        const sortedRecs = petRecords
          .filter(r => r.taskTypeId === tt.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const lastRec = sortedRecs[0];
        
        // RULE: No history, no overdue notification
        if (!lastRec) return null;

        const lastDate = new Date(lastRec.date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + (tt.cycleDays || 0));
        
        const diff = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff <= 0) {
          return {
            pet,
            taskType: tt,
            daysLeft: diff,
            lastRecord: lastRec,
            status: diff === 0 ? 'today' : 'overdue'
          };
        }
        return null;
      })
      .filter(n => n !== null);
  });

  return (
    <div className="p-6 bg-[#fffaf8] min-h-full pb-20">
      <div className="flex flex-col mb-8 pt-4">
        <h2 className="text-2xl font-black text-orange-600 tracking-tight italic">提醒中心</h2>
        <p className="text-[10px] font-black text-orange-300 uppercase tracking-[3px] mt-1">关注TA的健康需求</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-orange-100/50">
            <i className="fa-solid fa-face-smile-wink text-5xl mb-4 text-orange-100"></i>
            <p className="text-slate-400 font-black italic">暂无待办事项，轻松一下吧</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <div key={idx} className={`bg-white p-5 rounded-[32px] shadow-sm border-l-[10px] ${n?.status === 'overdue' ? 'border-red-400' : 'border-orange-400'}`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-[18px] overflow-hidden mr-4 shadow-md border-2 border-white">
                  <img src={n?.pet.avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    {n?.pet.name} 的 {n?.taskType.name}
                  </h4>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${n?.status === 'overdue' ? 'text-red-500' : 'text-orange-500'}`}>
                    {n?.status === 'overdue' ? `已逾期 ${Math.abs(n?.daysLeft || 0)} 天` : '今日待办'}
                  </p>
                </div>
              </div>
              
              <div className="bg-orange-50/20 p-4 rounded-[24px] border border-orange-50/50">
                <p className="text-[9px] text-orange-300 mb-2 font-black uppercase tracking-widest flex items-center gap-1">
                   <i className="fa-solid fa-clock-rotate-left"></i> 上次记录
                </p>
                {n?.lastRecord ? (
                  <>
                    <p className="text-xs text-slate-600 font-black">日期: {new Date(n.lastRecord.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {n.lastRecord.note && <p className="text-xs text-slate-500 mt-2 italic font-medium p-2 bg-white rounded-xl">"{n.lastRecord.note}"</p>}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">暂无历史记录</p>
                )}
              </div>
              
              <button className={`w-full mt-5 py-4 rounded-[20px] text-xs font-black transition-all shadow-md active:scale-95 ${n?.status === 'overdue' ? 'bg-red-500 text-white shadow-red-100' : 'bg-orange-500 text-white shadow-orange-100'}`}>
                立即去记录
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationView;
