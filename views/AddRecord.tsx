
import React, { useState } from 'react';
import { Pet, TaskType, Record } from '../types';

interface Props {
  pets: Pet[];
  taskTypes: TaskType[];
  onAdd: (record: Record) => void;
  onFinish: () => void;
}

const AddRecord: React.FC<Props> = ({ pets, taskTypes, onAdd, onFinish }) => {
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [taskId, setTaskId] = useState(taskTypes[0]?.id || '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!petId || !taskId || !date) return;
    onAdd({
      id: Date.now().toString(),
      petId,
      taskTypeId: taskId,
      date,
      value: value ? parseFloat(value) : undefined,
      note
    });
    onFinish();
  };

  const selectedTask = taskTypes.find(t => t.id === taskId);

  return (
    <div className="p-5 bg-[#fffaf8] h-full flex flex-col no-scrollbar">
      <header className="mb-4 pt-2">
        <h2 className="text-2xl font-black text-orange-600 tracking-tight italic">此刻记忆</h2>
        <p className="text-[10px] font-black text-orange-300 uppercase tracking-[3px]">记下所有的温馨与爱</p>
      </header>

      <div className="flex-1 flex flex-col gap-5 bg-white p-6 rounded-[40px] shadow-sm border border-orange-50/50 overflow-hidden">
        {/* Compact Pet Picker */}
        <section>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">谁的时光？</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {pets.map(pet => (
              <button 
                key={pet.id} 
                onClick={() => setPetId(pet.id)}
                className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-full transition-all border-2 ${petId === pet.id ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'}`}
              >
                <img src={pet.avatar} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[10px] font-black">{pet.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Task Selection - Grid with rounded squares as per image */}
        <section className="flex flex-col">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">发生了什么？</label>
          <div className="max-h-48 overflow-y-auto no-scrollbar pr-1">
            <div className="grid grid-cols-5 gap-3">
              {taskTypes.map(task => (
                <button 
                  key={task.id} 
                  onClick={() => setTaskId(task.id)}
                  className={`aspect-square rounded-[20px] transition-all flex flex-col items-center justify-center border-2 ${taskId === task.id ? 'border-orange-500 bg-orange-50/30' : 'border-slate-50 bg-white hover:border-orange-100'}`}
                >
                  <i className={`${task.icon} text-lg mb-1 transition-colors ${taskId === task.id ? 'text-orange-500' : 'text-slate-300'}`}></i>
                  <span className={`text-[8px] font-black truncate w-full px-1 text-center leading-tight ${taskId === task.id ? 'text-orange-600' : 'text-slate-400'}`}>
                    {task.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Inputs row - Conditional Value Field */}
        <div className={`grid ${selectedTask?.hasValue ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mt-auto`}>
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">记录时间</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={e=>setDate(e.target.value)} 
              className="w-full p-3 bg-orange-50/20 rounded-2xl outline-none font-black text-[10px] text-slate-700 border-2 border-transparent focus:border-orange-100" 
            />
          </section>
          {selectedTask?.hasValue && (
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                {selectedTask.valueName || '记录值'}
              </label>
              <input 
                type="number" 
                step="0.01" 
                value={value} 
                onChange={e=>setValue(e.target.value)} 
                className="w-full p-3 bg-orange-50/20 rounded-2xl outline-none font-black text-[10px] text-slate-800 border-2 border-transparent focus:border-orange-100" 
                placeholder="0.00" 
              />
            </section>
          )}
        </div>

        {/* Note Area */}
        <section>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">悄悄话/备注</label>
          <textarea 
            rows={2}
            value={note} 
            onChange={e=>setNote(e.target.value)} 
            className="w-full p-4 bg-orange-50/20 rounded-[20px] outline-none focus:ring-4 focus:ring-orange-50 transition-all font-black text-[10px] text-slate-700 resize-none border-2 border-transparent focus:border-orange-100" 
            placeholder="今天TA的表现怎么样？" 
          />
        </section>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-orange-500 text-white font-black rounded-[24px] shadow-xl shadow-orange-100 active:scale-95 transition-all text-sm tracking-widest uppercase"
        >
          保存珍贵一刻
        </button>
      </div>
    </div>
  );
};

export default AddRecord;
