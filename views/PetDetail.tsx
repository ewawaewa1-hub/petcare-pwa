
import React, { useState, useEffect } from 'react';
import { Pet, Record, TaskType, Gender } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  pet: Pet;
  records: Record[];
  taskTypes: TaskType[];
  initialTaskFilter?: string;
  onBack: () => void;
  onUpdateRecord: (record: Record) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToCalendar: (petId: string) => void;
}

const PetDetail: React.FC<Props> = ({ pet, records, taskTypes, initialTaskFilter = 'all', onBack, onUpdateRecord, onDeleteRecord, onNavigateToCalendar }) => {
  const [filterType, setFilterType] = useState<string>(initialTaskFilter);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    setFilterType(initialTaskFilter);
  }, [initialTaskFilter]);

  const weightData = records
    .filter(r => r.taskTypeId === '1') 
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      weight: r.value
    }));

  const upcomingReminders = taskTypes
    .filter(tt => tt.cycleDays !== null)
    .map(tt => {
      const lastRec = records
        .filter(r => r.taskTypeId === tt.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!lastRec) return null;

      const lastDate = new Date(lastRec.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + (tt.cycleDays || 0));
      const diff = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return { ...tt, daysLeft: diff, nextDate };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const [reminderExpanded, setReminderExpanded] = useState(false);
  const displayReminders = reminderExpanded ? upcomingReminders : upcomingReminders.slice(0, 5);

  const filteredRecords = records
    .filter(r => filterType === 'all' || r.taskTypeId === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditInit = (rec: Record) => {
    setEditingRecord(rec);
    setEditValue(rec.value?.toString() || '');
    setEditNote(rec.note || '');
    
    // Format date for datetime-local input
    const d = new Date(rec.date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    setEditDate(localISOTime);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    onUpdateRecord({
      ...editingRecord,
      date: new Date(editDate).toISOString(),
      value: editValue ? parseFloat(editValue) : undefined,
      note: editNote
    });
    setEditingRecord(null);
  };

  return (
    <div className="p-4 bg-[#fffaf8] min-h-full pb-10">
      <div className="flex items-center mb-6 px-2 pt-4">
        <button onClick={onBack} className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center shadow-sm shadow-orange-100 mr-4 active:scale-90 transition-transform text-orange-500">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">{pet.name}</h2>
            <i className={`fa-solid ${pet.gender === Gender.FEMALE ? 'fa-venus text-pink-400' : 'fa-mars text-blue-400'} text-lg`}></i>
          </div>
          <p className="text-[10px] font-black text-orange-300 uppercase tracking-[2px]">成长全记录</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[40px] shadow-sm mb-6 border border-orange-50/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div>基本资料</h3>
          <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">About Me</span>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-orange-50/30 p-3 rounded-2xl border border-orange-50">
            <p className="text-[8px] font-black text-orange-300 uppercase tracking-widest mb-1">生日</p>
            <p className="text-xs font-black text-slate-600">{pet.birthday}</p>
          </div>
          <div className="flex-1 bg-orange-50/30 p-3 rounded-2xl border border-orange-50">
            <p className="text-[8px] font-black text-orange-300 uppercase tracking-widest mb-1">性别</p>
            <p className="text-xs font-black text-slate-600">{pet.gender === Gender.FEMALE ? '女生' : '男生'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div>体重趋势 (kg)</h3>
          <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">Growth Curve</span>
        </div>
        <div className="h-48 w-full">
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff5f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#fda4af', fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#fda4af', fontWeight: 900 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(249 115 22 / 0.1)', padding: '16px' }} />
                <Line type="monotone" dataKey="weight" stroke={pet.themeColor} strokeWidth={5} dot={{ r: 6, fill: pet.themeColor, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-orange-100">
              <i className="fa-solid fa-chart-area text-4xl mb-2 opacity-30"></i>
              <p className="text-xs font-black italic">至少两条记录可生成曲线</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[40px] shadow-sm mb-6 border border-orange-50/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div>待办提醒</h3>
          <button onClick={() => onNavigateToCalendar(pet.id)} className="text-[10px] font-black text-orange-500 uppercase tracking-wider bg-orange-50 px-4 py-2 rounded-xl shadow-sm">日历视图</button>
        </div>
        <div className="space-y-3">
          {displayReminders.length === 0 && <div className="text-center py-6 text-orange-100"><p className="text-xs font-black italic opacity-60">暂无待办或逾期事项</p></div>}
          {displayReminders.map(rem => (
            <div key={rem.id} className={`flex items-center p-4 rounded-[24px] border-2 transition-all ${rem.daysLeft < 0 ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-[#fffaf8] border-white'}`} onClick={() => onNavigateToCalendar(pet.id)}>
              <div className="w-11 h-11 rounded-[16px] flex items-center justify-center mr-4 text-white shadow-lg" style={{ backgroundColor: rem.color }}><i className={rem.icon}></i></div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800">{rem.name}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">下一次: {rem.nextDate.toLocaleDateString()}</p>
              </div>
              <div className={`text-[10px] font-black px-4 py-2 rounded-xl shadow-md ${rem.daysLeft < 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{rem.daysLeft < 0 ? `逾期 ${Math.abs(rem.daysLeft)}天` : `${rem.daysLeft}天后`}</div>
            </div>
          ))}
          {upcomingReminders.length > 5 && (
            <button onClick={() => setReminderExpanded(!reminderExpanded)} className="w-full text-center py-2 text-[10px] text-orange-300 font-black uppercase tracking-[3px] mt-2">{reminderExpanded ? '收起' : `更多 (${upcomingReminders.length - 5})`}</button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-orange-50/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div>成长足迹</h3>
          <div className="relative">
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="text-[10px] font-black bg-orange-50/50 border-none outline-none pl-4 pr-10 py-2.5 rounded-[16px] text-orange-600 appearance-none uppercase tracking-widest shadow-inner">
              <option value="all">全部类型</option>
              {taskTypes.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-orange-300 pointer-events-none"></i>
          </div>
        </div>
        <div className="space-y-8 relative ml-4 border-l-2 border-orange-100/50 pl-7 pb-4">
          {filteredRecords.length === 0 && <p className="text-center py-6 text-orange-100 text-xs font-black italic -ml-7 opacity-70">暂无任何足迹</p>}
          {filteredRecords.map((rec) => {
            const task = taskTypes.find(t => t.id === rec.taskTypeId);
            return (
              <div key={rec.id} className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md ring-4 ring-orange-50/50" style={{ backgroundColor: task?.color || '#cbd5e1' }}></div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] text-orange-300 font-black uppercase tracking-widest">{new Date(rec.date).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <h4 className="text-sm font-black text-slate-800 mt-1.5 flex items-center gap-2">
                      <i className={`${task?.icon} text-[10px] text-orange-200`}></i>{task?.name} {rec.value ? <span className="text-orange-500 ml-1">{rec.value} {task.valueName?.includes('kg') ? 'kg' : ''}</span> : ''}
                    </h4>
                    {rec.note && <div className="mt-2.5 p-4 bg-orange-50/30 rounded-[20px] border-l-4 border-orange-200 shadow-sm"><p className="text-xs text-slate-500 font-black italic leading-relaxed">"{rec.note}"</p></div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditInit(rec)} className="text-slate-300 hover:text-orange-500 transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
                    <button onClick={() => { if(confirm('确定要删除这条记录吗？')) onDeleteRecord(rec.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash text-[10px]"></i></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingRecord(null)}>
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-pen-nib text-orange-500"></i> 修改记忆
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">修改时间</label>
                <input type="datetime-local" value={editDate} onChange={e=>setEditDate(e.target.value)} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-black text-slate-700 border-2 border-transparent focus:border-orange-200" />
              </div>

              {taskTypes.find(t=>t.id===editingRecord.taskTypeId)?.hasValue && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">数值</label>
                  <input type="number" step="0.01" value={editValue} onChange={e=>setEditValue(e.target.value)} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-black text-slate-700 border-2 border-transparent focus:border-orange-200" placeholder="0.00" />
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">备注</label>
                <textarea rows={3} value={editNote} onChange={e=>setEditNote(e.target.value)} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-bold text-slate-700 resize-none border-2 border-transparent focus:border-orange-200" placeholder="补充点什么..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingRecord(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-[20px] transition-all">取消</button>
                <button onClick={handleSaveEdit} className="flex-1 py-4 bg-orange-500 text-white font-black rounded-[20px] shadow-lg shadow-orange-100 active:scale-95 transition-all">保存修改</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetail;
