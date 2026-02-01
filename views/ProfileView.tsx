
import React, { useState, useRef, useMemo } from 'react';
import { User, Pet, TaskType, PetType } from '../types';
import { THEME_COLORS, AVAILABLE_ICONS, DEFAULT_USER_AVATAR, CAT_BREEDS, DOG_BREEDS, DEFAULT_CAT_AVATAR, DEFAULT_DOG_AVATAR, DEFAULT_OTHER_AVATAR } from '../constants';

interface Props {
  user: User;
  setUser: (user: User) => void;
  pets: Pet[];
  taskTypes: TaskType[];
  setTaskTypes: React.Dispatch<React.SetStateAction<TaskType[]>>;
  onLogout: () => void;
  onDeletePet: (id: string) => void;
  onEditPet: (pet: Pet) => void;
}

const ProfileView: React.FC<Props> = ({ user, setUser, pets, taskTypes, setTaskTypes, onLogout, onDeletePet, onEditPet }) => {
  const [showPetManager, setShowPetManager] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [confirmDeletePetId, setConfirmDeletePetId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(0);
  
  // Nickname editing
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(user.nickname);

  // User avatar upload
  const userAvatarRef = useRef<HTMLInputElement>(null);
  const handleUserAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser({ ...user, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // Task adding/editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskCycle, setTaskCycle] = useState<string>('');
  const [taskColor, setTaskColor] = useState(THEME_COLORS[0]);
  const [taskIcon, setTaskIcon] = useState(AVAILABLE_ICONS[0]);
  const [hasValue, setHasValue] = useState(false);
  const [valueName, setValueName] = useState('');

  const handleDeletePet = (id: string) => {
    if (confirmStep === 0) {
      setConfirmStep(1);
      setConfirmDeletePetId(id);
    } else {
      onDeletePet(id);
      setConfirmStep(0);
      setConfirmDeletePetId(null);
    }
  };

  const handleSaveNickname = () => {
    if (tempNickname.trim()) {
      setUser({ ...user, nickname: tempNickname.trim() });
      setIsEditingNickname(false);
    }
  };

  const handleSaveTask = () => {
    if (!taskName) return;
    if (editingTaskId) {
      setTaskTypes(taskTypes.map(t => t.id === editingTaskId ? {
        ...t,
        name: taskName,
        color: taskColor,
        icon: taskIcon,
        cycleDays: taskCycle ? parseInt(taskCycle) : null,
        hasValue,
        valueName: hasValue ? valueName : undefined
      } : t));
    } else {
      const newTask: TaskType = {
        id: Date.now().toString(),
        name: taskName,
        color: taskColor,
        icon: taskIcon,
        cycleDays: taskCycle ? parseInt(taskCycle) : null,
        isDefault: false,
        hasValue,
        valueName: hasValue ? valueName : undefined
      };
      setTaskTypes([...taskTypes, newTask]);
    }
    resetTaskForm();
  };

  const startEditTask = (task: TaskType) => {
    setEditingTaskId(task.id);
    setTaskName(task.name);
    setTaskCycle(task.cycleDays?.toString() || '');
    setTaskColor(task.color);
    setTaskIcon(task.icon);
    setHasValue(task.hasValue);
    setValueName(task.valueName || '');
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setTaskName(''); setTaskCycle('');
    setTaskColor(THEME_COLORS[0]); setTaskIcon(AVAILABLE_ICONS[0]);
    setHasValue(false); setValueName('');
  };

  const handleUpdatePet = (updated: Pet) => {
    onEditPet(updated);
    setEditingPet(null);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-full pb-10">
      <div className="flex flex-col items-center mb-10 pt-6">
        <div onClick={() => userAvatarRef.current?.click()} className="w-28 h-28 rounded-[40px] overflow-hidden shadow-2xl mb-5 border-4 border-white relative group cursor-pointer ring-8 ring-orange-100">
          <img src={user.avatar || DEFAULT_USER_AVATAR} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-camera text-white text-xl"></i></div>
        </div>
        <input type="file" ref={userAvatarRef} onChange={handleUserAvatar} className="hidden" accept="image/*" />
        
        {isEditingNickname ? (
          <div className="flex flex-col items-center gap-2">
            <input 
              autoFocus
              className="text-2xl font-black text-slate-800 tracking-tight text-center bg-white rounded-xl px-4 py-1 outline-none ring-2 ring-orange-400"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onBlur={handleSaveNickname}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
            />
            <span className="text-[10px] text-orange-400 font-bold">按回车或点击空白处保存</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingNickname(true); setTempNickname(user.nickname); }}>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.nickname}</h2>
            <i className="fa-solid fa-pen text-slate-300 text-xs group-hover:text-orange-500 transition-colors"></i>
          </div>
        )}
        
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">专属 ID: {user.username}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-2 rounded-[32px] shadow-sm border border-orange-50">
          <button onClick={() => setShowPetManager(true)} className="w-full p-5 rounded-[28px] flex items-center justify-between active:bg-orange-50 transition-all">
            <div className="flex items-center"><div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mr-5 shadow-sm"><i className="fa-solid fa-paw text-lg"></i></div><span className="font-black text-slate-700">宠物管理</span></div>
            <i className="fa-solid fa-chevron-right text-slate-200 text-xs"></i>
          </button>
          <div className="h-[1px] bg-slate-50 mx-6"></div>
          <button onClick={() => setShowTaskManager(true)} className="w-full p-5 rounded-[28px] flex items-center justify-between active:bg-orange-50 transition-all">
            <div className="flex items-center"><div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mr-5 shadow-sm"><i className="fa-solid fa-list-check text-lg"></i></div><span className="font-black text-slate-700">事项配置</span></div>
            <i className="fa-solid fa-chevron-right text-slate-200 text-xs"></i>
          </button>
        </div>
        <button onClick={onLogout} className="w-full bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-center active:bg-red-50 transition-all border border-slate-100 group"><i className="fa-solid fa-arrow-right-from-bracket text-red-500 mr-3 group-hover:translate-x-1 transition-transform"></i><span className="font-black text-red-500">退出账号</span></button>
      </div>

      {showPetManager && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowPetManager(false)}>
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="text-xl font-black mb-6 text-slate-800">成员列表</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar">
              {pets.map(pet => (
                <div key={pet.id} className="flex flex-col p-4 bg-slate-50 rounded-[24px] border border-white">
                  <div className="flex items-center justify-between mb-3"><div className="flex items-center"><img src={pet.avatar} className="w-10 h-10 rounded-xl mr-4 shadow-sm" /><span className="text-sm font-black text-slate-700">{pet.name}</span></div></div>
                  <div className="flex gap-2"><button onClick={() => { setEditingPet(pet); setShowPetManager(false); }} className="flex-1 text-[10px] font-black bg-orange-50 text-orange-600 py-2 rounded-xl">编辑</button><button onClick={() => handleDeletePet(pet.id)} className={`flex-1 text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all ${confirmDeletePetId === pet.id ? 'bg-red-500 text-white shadow-lg' : 'bg-red-50 text-red-500'}`}>{confirmDeletePetId === pet.id ? '确认' : '删除'}</button></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPetManager(false)} className="w-full mt-10 py-4 bg-slate-800 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl">确定</button>
          </div>
        </div>
      )}

      {editingPet && <PetEditModal pet={editingPet} onSave={handleUpdatePet} onClose={() => setEditingPet(null)} />}

      {showTaskManager && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowTaskManager(false)}>
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800">{editingTaskId ? '修改规则' : '新增规则'}</h3>
              {editingTaskId && <button onClick={resetTaskForm} className="text-[10px] font-black text-orange-500 uppercase">返回新增</button>}
            </div>
            <div className="space-y-6 mb-8">
              <div className="bg-orange-50/50 p-6 rounded-[32px] border-2 border-dashed border-orange-100">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">名称</label><input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="名称" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-4 focus:ring-orange-100 outline-none text-sm font-bold shadow-sm" /></div>
                    <div className="w-1/3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">周期(天)</label><input type="number" value={taskCycle} onChange={e=>setTaskCycle(e.target.value)} placeholder="无" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-4 focus:ring-orange-100 outline-none text-sm font-bold shadow-sm" /></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-2xl">
                    <input type="checkbox" id="hasValue" checked={hasValue} onChange={e=>setHasValue(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="hasValue" className="text-xs font-black text-slate-600">需要附加数值(如重量、用量)</label>
                  </div>
                  {hasValue && <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">数值名称</label><input value={valueName} onChange={e=>setValueName(e.target.value)} placeholder="如: 体重 (kg)" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-4 focus:ring-orange-100 outline-none text-sm font-bold shadow-sm" /></div>}
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">图标</label><div className="grid grid-cols-6 gap-2">{AVAILABLE_ICONS.map(icon => <button key={icon} onClick={()=>setTaskIcon(icon)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${taskIcon === icon ? 'bg-orange-600 text-white shadow-lg scale-110' : 'bg-white text-slate-400 hover:bg-orange-50'}`}><i className={icon}></i></button>)}</div></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">色彩</label><div className="flex gap-2 flex-wrap">{THEME_COLORS.map(c => <button key={c} onClick={()=>setTaskColor(c)} className={`w-6 h-6 rounded-full border-4 transition-all ${taskColor === c ? 'border-orange-500 scale-110 shadow-md' : 'border-white'}`} style={{ backgroundColor: c }} />)}</div></div>
                  <button onClick={handleSaveTask} className="w-full bg-orange-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg active:scale-95 transition-all mt-4">{editingTaskId ? '确认修改' : '确认添加'}</button>
                </div>
              </div>
              <div className="space-y-3 pr-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">全部事项 ({taskTypes.length})</p>
                {taskTypes.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-[24px] shadow-sm hover:border-orange-100 transition-all">
                    <div className="flex items-center"><div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-white shadow-lg" style={{ backgroundColor: task.color }}><i className={task.icon}></i></div><div><p className="text-sm font-black text-slate-800">{task.name}</p><p className="text-[10px] font-bold text-slate-300 uppercase">{task.cycleDays ? `${task.cycleDays}天周期` : '不提醒'}</p></div></div>
                    <div className="flex gap-2"><button onClick={() => startEditTask(task)} className="p-2 text-slate-300 hover:text-orange-500 transition-colors"><i className="fa-solid fa-pen text-xs"></i></button><button onClick={() => setTaskTypes(taskTypes.filter(t=>t.id!==task.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button></div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowTaskManager(false)} className="w-full py-4 bg-slate-100 rounded-[20px] text-slate-400 font-black uppercase tracking-widest text-xs">返回</button>
          </div>
        </div>
      )}
    </div>
  );
};

const PetEditModal: React.FC<{ pet: Pet; onSave: (p: Pet) => void; onClose: () => void; }> = ({ pet, onSave, onClose }) => {
  const [name, setName] = useState(pet.name);
  const [type, setType] = useState(pet.type);
  const [breed, setBreed] = useState(pet.breed);
  const [birthday, setBirthday] = useState(pet.birthday);
  const [weight, setWeight] = useState(pet.initialWeight.toString());
  const [themeColor, setThemeColor] = useState(pet.themeColor);
  const [avatar, setAvatar] = useState<string | undefined>(pet.avatar);
  const [breedSearch, setBreedSearch] = useState(pet.breed);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBreeds = useMemo(() => {
    const list = type === PetType.CAT ? CAT_BREEDS : (type === PetType.DOG ? DOG_BREEDS : []);
    return list.filter(b => b.includes(breedSearch));
  }, [type, breedSearch]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !breed || !birthday || !weight) return;
    onSave({
      ...pet,
      name, type, breed, birthday,
      initialWeight: parseFloat(weight),
      themeColor,
      avatar: avatar || (type === PetType.CAT ? DEFAULT_CAT_AVATAR : (type === PetType.DOG ? DEFAULT_DOG_AVATAR : DEFAULT_OTHER_AVATAR))
    });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar" onClick={e=>e.stopPropagation()}>
        <h3 className="text-xl font-black mb-6">修改资料</h3>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden cursor-pointer">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-slate-300"></i>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="名称" className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-bold" />
          <div className="flex gap-2">
            {[PetType.CAT, PetType.DOG, PetType.OTHER].map(t => (
              <button key={t} onClick={() => { setType(t); setBreed(''); setBreedSearch(''); }} className={`flex-1 py-3 text-xs font-black rounded-xl border-2 transition-all ${type === t ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' : 'bg-white text-slate-400 border-slate-100'}`}>{t}</button>
            ))}
          </div>
          <div className="relative">
            <input value={breedSearch} onFocus={()=>setShowBreedDropdown(true)} onChange={e=>{setBreedSearch(e.target.value); setShowBreedDropdown(true);}} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-bold" placeholder="品种" />
            {showBreedDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-orange-100 z-50 max-h-32 overflow-y-auto no-scrollbar animate-in slide-in-from-top-2">
                {filteredBreeds.map(b => <button key={b} onClick={() => { setBreed(b); setBreedSearch(b); setShowBreedDropdown(false); }} className="w-full text-left p-3 hover:bg-orange-50 text-xs font-bold border-b border-orange-50 last:border-none">{b}</button>)}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-bold text-xs" />
            <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-4 bg-orange-50/50 rounded-2xl outline-none font-bold text-xs" placeholder="kg" />
          </div>
          <div className="flex flex-wrap gap-2">
            {THEME_COLORS.map(c => <button key={c} onClick={() => setThemeColor(c)} className={`w-6 h-6 rounded-full border-2 ${themeColor === c ? 'border-orange-500 scale-110 shadow-lg' : 'border-white shadow-sm'}`} style={{ backgroundColor: c }} />)}
          </div>
          <button onClick={handleSave} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl mt-4 active:scale-95 transition-transform">确认保存</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
