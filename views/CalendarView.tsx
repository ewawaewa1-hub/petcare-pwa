
import React, { useState, useEffect, useMemo } from 'react';
import { Pet, Record, TaskType } from '../types';

interface Props {
  pets: Pet[];
  records: Record[];
  taskTypes: TaskType[];
  initialPetFilter?: string;
  onFilterChange?: (petId: string) => void;
  onEditRecord: (record: Record) => void;
  onDeleteRecord: (id: string) => void;
  onViewRecordHistory: (petId: string, taskId: string) => void;
}

const CalendarView: React.FC<Props> = ({ pets, records, taskTypes, initialPetFilter = 'all', onFilterChange, onEditRecord, onDeleteRecord, onViewRecordHistory }) => {
  const [filterPet, setFilterPet] = useState<string>(initialPetFilter);
  const [filterTask, setFilterTask] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  // Record editing state
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    if (initialPetFilter !== filterPet) setFilterPet(initialPetFilter);
  }, [initialPetFilter]);

  const handlePetFilterChange = (id: string) => {
    setFilterPet(id);
    if (onFilterChange) onFilterChange(id);
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getDayData = (day: number | null) => {
    if (!day) return { records: [], tasks: [], birthdays: [] };
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toDateString();
    const isToday = dateStr === new Date().toDateString();

    const dayRecords = records.filter(r => {
      const isCorrectDate = new Date(r.date).toDateString() === dateStr;
      const petMatch = filterPet === 'all' || r.petId === filterPet;
      const taskMatch = filterTask === 'all' || r.taskTypeId === filterTask;
      return isCorrectDate && petMatch && taskMatch;
    });

    const dayBirthdays = pets.filter(p => {
      if (filterPet !== 'all' && p.id !== filterPet) return false;
      const b = new Date(p.birthday);
      return b.getMonth() === currentMonth.getMonth() && b.getDate() === day;
    });

    const dayTasks = pets.filter(p => filterPet === 'all' || p.id === filterPet).flatMap(pet => {
      return taskTypes.filter(tt => tt.cycleDays !== null && (filterTask === 'all' || tt.id === filterTask)).map(tt => {
        const petRecords = records.filter(r => r.petId === pet.id && r.taskTypeId === tt.id);
        const lastRec = petRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (!lastRec) return null;

        const lastDate = new Date(lastRec.date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + tt.cycleDays!);
        const nextDateStr = nextDate.toDateString();
        
        if (dateStr === nextDateStr) {
          const overdueDays = Math.max(0, Math.ceil((new Date().getTime() - nextDate.getTime()) / (1000*60*60*24)));
          return { type: 'reminder', pet, taskType: tt, date: nextDate, overdueDays };
        }

        if (isToday && new Date() > nextDate) {
          const overdueDays = Math.ceil((new Date().getTime() - nextDate.getTime()) / (1000*60*60*24));
          return { type: 'overdue', pet, taskType: tt, date: nextDate, overdueDays };
        }

        return null;
      }).filter(t => t !== null);
    });

    return { records: dayRecords, tasks: dayTasks, birthdays: dayBirthdays };
  };

  const dayData = useMemo(() => getDayData(selectedDay), [selectedDay, currentMonth, records, pets, taskTypes, filterPet, filterTask]);

  const handleEditInit = (rec: Record) => {
    setEditingRecord(rec);
    setEditValue(rec.value?.toString() || '');
    setEditNote(rec.note || '');
    const d = new Date(rec.date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    setEditDate(localISOTime);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    onEditRecord({
      ...editingRecord,
      date: new Date(editDate).toISOString(),
      value: editValue ? parseFloat(editValue) : undefined,
      note: editNote
    });
    setEditingRecord(null);
  };

  return (
    <div className="p-4 bg-[#fffaf8] min-h-full pb-10">
      <div className="flex flex-col mb-6 px-2 pt-4">
        <h2 className="text-2xl font-black text-orange-600 tracking-tight italic">时光记录簿</h2>
        <p className="text-[10px] font-black text-orange-300 uppercase tracking-[2px] mt-1">记录与TA的点点滴滴</p>
      </div>
      
      <div className="flex gap-2 mb-6 px-2">
        <div className="flex-1 relative">
          <select value={filterPet} onChange={e=>handlePetFilterChange(e.target.value)} className="w-full p-4 pl-5 pr-10 rounded-[20px] bg-white border-none shadow-sm shadow-orange-100/50 text-xs font-black outline-none appearance-none text-slate-600">
            <option value="all">所有成员</option>
            {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-orange-200 pointer-events-none"></i>
        </div>
        <div className="flex-1 relative">
          <select value={filterTask} onChange={e=>setFilterTask(e.target.value)} className="w-full p-4 pl-5 pr-10 rounded-[20px] bg-white border-none shadow-sm shadow-orange-100/50 text-xs font-black outline-none appearance-none text-slate-600">
            <option value="all">全部事项</option>
            {taskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-orange-200 pointer-events-none"></i>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm shadow-orange-50/50 p-6 mb-6 border border-orange-50/50">
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="font-black text-orange-600 text-lg uppercase tracking-tight">{currentMonth.toLocaleString('zh-CN', { month: 'long', year: 'numeric' })}</h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50/50 text-orange-500 active:scale-90 transition-all shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50/50 text-orange-500 active:scale-90 transition-all shadow-sm"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center mb-6">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <span key={d} className="text-[10px] font-black text-orange-200 uppercase tracking-widest">{d}</span>)}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day, idx) => {
            const data = getDayData(day);
            const isSelected = day === selectedDay;
            const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
            
            const recordPetColors = Array.from(new Set(data.records.map(r => pets.find(p=>p.id===r.petId)?.themeColor || '#ccc')));
            const taskColors = Array.from(new Set(data.tasks.map(t => t.taskType.color)));
            const birthdayColors = Array.from(new Set(data.birthdays.map(p => p.themeColor)));

            return (
              <div key={idx} onClick={() => day && setSelectedDay(day)} className={`h-14 relative flex flex-col items-center justify-center rounded-[20px] transition-all ${day ? 'cursor-pointer active:scale-90' : ''} ${isSelected ? 'bg-orange-500 text-white shadow-xl shadow-orange-100 z-10' : ''}`}>
                {day && (
                  <>
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : (isToday ? 'text-orange-500 ring-2 ring-orange-100 px-2 rounded-lg' : 'text-slate-700')}`}>{day}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1.5 h-1 justify-center max-w-[80%]">
                      {recordPetColors.map((color, i) => <div key={`rec-${i}`} className={`w-1 h-1 rounded-full shrink-0 ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? undefined : color }}></div>)}
                      {taskColors.map((color, i) => <div key={`task-${i}`} className={`w-1 h-1 rounded-full shrink-0 animate-pulse ${isSelected ? 'bg-white shadow-[0_0_5px_white]' : ''}`} style={{ backgroundColor: isSelected ? undefined : color }}></div>)}
                      {birthdayColors.map((color, i) => <div key={`bday-${i}`} className={`w-1 h-1 rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-red-400 animate-bounce shadow-[0_0_3px_#f87171]'}`} style={{ backgroundColor: isSelected ? undefined : color }}></div>)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 px-2">
        <div className="flex justify-between items-center px-2 mb-4">
          <h4 className="text-[10px] font-black text-orange-300 uppercase tracking-[3px]">{currentMonth.getMonth()+1}月{selectedDay}日 生活志</h4>
          <span className="text-[10px] font-black bg-white px-3 py-1.5 rounded-xl text-orange-400 shadow-sm border border-orange-50/50">共 {dayData.records.length + dayData.tasks.length + dayData.birthdays.length} 项</span>
        </div>
        
        {dayData.records.length === 0 && dayData.tasks.length === 0 && dayData.birthdays.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[40px] border-2 border-dashed border-orange-100/50">
            <i className="fa-solid fa-mug-hot text-4xl mb-3 text-orange-50"></i>
            <p className="text-slate-400 font-black italic text-sm">今天悠然自得，暂无记录</p>
          </div>
        )}

        <div className="space-y-3">
          {dayData.birthdays.map((p, idx) => (
            <div key={`bday-row-${idx}`} className={`bg-white p-5 rounded-[32px] shadow-sm border border-red-100 flex items-center border-l-[10px] border-l-red-400`}>
              <div className="w-12 h-12 rounded-[20px] overflow-hidden mr-4 shrink-0 shadow-lg border-2 border-white ring-2 ring-red-50/30"><img src={p.avatar} className="w-full h-full object-cover" /></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">{p.name} <span className="text-[10px] font-black text-red-500 px-2 py-0.5 bg-red-50 rounded-lg">生日快乐!</span></p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">🎂 今天的头等大事</p>
                  </div>
                  <i className="fa-solid fa-cake-candles text-red-300 text-xl animate-bounce"></i>
                </div>
              </div>
            </div>
          ))}

          {dayData.tasks.map((t, idx) => (
            <div key={`task-row-${idx}`} onClick={() => onViewRecordHistory(t.pet.id, t.taskType.id)} className={`bg-white p-5 rounded-[32px] shadow-sm border border-orange-50 flex items-center group active:scale-[0.98] transition-transform ${t.overdueDays > 0 ? 'border-l-[10px] border-l-red-400' : 'border-l-[10px] border-l-orange-400'}`}>
              <div className="w-12 h-12 rounded-[20px] overflow-hidden mr-4 shrink-0 shadow-lg border-2 border-white ring-2 ring-orange-50/30"><img src={t.pet.avatar} className="w-full h-full object-cover" /></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">{t.pet.name} <span className="text-[10px] font-black text-orange-400 px-2 py-0.5 bg-orange-50 rounded-lg">{t.taskType.name}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center">到期提醒 <i className="fa-solid fa-arrow-right ml-1 text-[8px]"></i></p>
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md ${t.overdueDays > 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{t.overdueDays > 0 ? `逾期${t.overdueDays}天` : '今日到期'}</div>
                </div>
              </div>
            </div>
          ))}

          {dayData.records.map(rec => {
            const pet = pets.find(p => p.id === rec.petId);
            const task = taskTypes.find(t => t.id === rec.taskTypeId);
            return (
              <div key={`rec-row-${rec.id}`} className="bg-white p-5 rounded-[32px] shadow-sm border border-orange-50/50 flex items-center group relative active:scale-[0.98] transition-transform">
                <div className="w-12 h-12 rounded-[20px] overflow-hidden mr-4 shrink-0 shadow-lg border-2 border-white ring-2 ring-orange-50/30"><img src={pet?.avatar} className="w-full h-full object-cover" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">{pet?.name} <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">{task?.name}</span></p>
                      <p className="text-[10px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">{new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {task?.hasValue && <span className="text-sm font-black text-orange-500">{rec.value} {task.valueName?.includes('kg') ? 'kg' : ''}</span>}
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEditInit(rec); }} className="text-slate-300 hover:text-orange-500 transition-colors"><i className="fa-solid fa-pen text-[10px]"></i></button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm('确定要删除这条记录吗？')) onDeleteRecord(rec.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash text-[10px]"></i></button>
                      </div>
                    </div>
                  </div>
                  {rec.note && <p className="text-xs text-slate-500 mt-2 p-3 bg-orange-50/20 rounded-2xl font-black italic border-l-4 border-orange-100">"{rec.note}"</p>}
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

export default CalendarView;
