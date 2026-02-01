
import React, { useState, useMemo, useRef } from 'react';
import { Pet, Record, TaskType, PetType, Gender } from '../types';
import { THEME_COLORS, CAT_BREEDS, DOG_BREEDS, DEFAULT_CAT_AVATAR, DEFAULT_DOG_AVATAR, DEFAULT_OTHER_AVATAR } from '../constants';

interface Props {
  pets: Pet[];
  records: Record[];
  taskTypes: TaskType[];
  onSelectPet: (id: string) => void;
  onAddPet: (pet: Pet) => void;
  onDeletePet: (id: string) => void;
  onEditPet: (pet: Pet) => void;
}

const PetList: React.FC<Props> = ({ pets, records, taskTypes, onSelectPet, onAddPet, onEditPet }) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>(PetType.CAT);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [weight, setWeight] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [breedSearch, setBreedSearch] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBreeds = useMemo(() => {
    const list = type === PetType.CAT ? CAT_BREEDS : (type === PetType.DOG ? DOG_BREEDS : []);
    return list.filter(b => b.includes(breedSearch));
  }, [type, breedSearch]);

  const calculateAge = (birth: string) => {
    if (!birth) return '未知';
    const birthDate = new Date(birth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    return years > 0 ? `${years}岁${months}个月` : `${months}个月`;
  };

  const getLatestWeight = (petId: string, initial: number) => {
    const weights = records
      .filter(r => r.petId === petId && r.taskTypeId === '1') 
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return weights.length > 0 ? weights[0].value : initial;
  };

  const getUpcomingReminders = (petId: string) => {
    const petRecords = records.filter(r => r.petId === petId);
    const reminders: { name: string, daysLeft: number }[] = [];
    taskTypes.forEach(tt => {
      if (tt.cycleDays === null) return;
      const lastRec = petRecords
        .filter(r => r.taskTypeId === tt.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (!lastRec) return;
      const lastDate = new Date(lastRec.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + tt.cycleDays);
      const diff = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      reminders.push({ name: tt.name, daysLeft: diff });
    });
    return reminders.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);
  };

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
    const petData: Pet = {
      id: modalMode === 'edit' && editingPetId ? editingPetId : Date.now().toString(),
      name, type, gender, breed, birthday,
      initialWeight: parseFloat(weight),
      themeColor,
      avatar: avatar || (type === PetType.CAT ? DEFAULT_CAT_AVATAR : (type === PetType.DOG ? DEFAULT_DOG_AVATAR : DEFAULT_OTHER_AVATAR))
    };
    if (modalMode === 'edit') { onEditPet(petData); } else { onAddPet(petData); }
    setModalMode(null);
    resetForm();
  };

  const openEdit = (e: React.MouseEvent, pet: Pet) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditingPetId(pet.id);
    setName(pet.name);
    setType(pet.type);
    setGender(pet.gender || Gender.MALE);
    setBreed(pet.breed);
    setBirthday(pet.birthday);
    setWeight(getLatestWeight(pet.id, pet.initialWeight).toString());
    setThemeColor(pet.themeColor);
    setAvatar(pet.avatar);
    setBreedSearch(pet.breed);
  };

  const resetForm = () => {
    setName(''); setType(PetType.CAT); setGender(Gender.MALE); setBreed(''); setBirthday(''); setWeight(''); 
    setThemeColor(THEME_COLORS[0]); setBreedSearch(''); setAvatar(undefined); setEditingPetId(null);
    setShowBreedDropdown(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-orange-600 italic">萌宠日记</h1>
          <p className="text-xs text-orange-300 font-bold uppercase tracking-widest">温暖陪伴每一天</p>
        </div>
        <button onClick={() => { resetForm(); setModalMode('add'); }} className="bg-orange-500 text-white w-12 h-12 rounded-[20px] flex items-center justify-center shadow-lg shadow-orange-100 active:scale-95 transition-all">
          <i className="fa-solid fa-plus text-xl"></i>
        </button>
      </div>

      <div className="space-y-4">
        {pets.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-orange-100 shadow-sm shadow-orange-50/50">
            <i className="fa-solid fa-paw text-5xl mb-4 text-orange-100"></i>
            <p className="text-slate-400 font-black">开启你的宠物记录之旅</p>
          </div>
        )}
        {pets.map(pet => {
          const reminders = getUpcomingReminders(pet.id);
          return (
            <div key={pet.id} onClick={() => onSelectPet(pet.id)} className="bg-white p-5 rounded-[32px] shadow-sm border border-orange-50/50 flex flex-col active:scale-[0.98] transition-transform relative group" style={{ borderLeft: `8px solid ${pet.themeColor}` }}>
              <button onClick={(e) => openEdit(e, pet)} className="absolute top-4 right-4 text-slate-200 hover:text-orange-500 transition-colors">
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-[20px] overflow-hidden shadow-sm bg-orange-50/50 mr-4 border border-orange-100/30 p-1">
                   <img src={pet.avatar} alt={pet.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{pet.name}</h3>
                    <i className={`fa-solid ${pet.gender === Gender.FEMALE ? 'fa-venus text-pink-400' : 'fa-mars text-blue-400'} text-xs`}></i>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 mt-1 flex items-center gap-2">
                    <span className="text-orange-400 opacity-80">{pet.breed}</span>
                    <span className="opacity-30">|</span>
                    <span>{calculateAge(pet.birthday)}</span>
                    <span className="opacity-30">|</span>
                    <span>{getLatestWeight(pet.id, pet.initialWeight)}kg</span>
                  </p>
                </div>
              </div>
              {reminders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-orange-50/50">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {reminders.map((r, idx) => (
                      <div key={idx} className={`text-[9px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${r.daysLeft < 0 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'}`}>
                        <div className={`w-1 h-1 rounded-full ${r.daysLeft < 0 ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                        {r.name} {r.daysLeft < 0 ? `逾期${Math.abs(r.daysLeft)}天` : `${r.daysLeft}天后`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalMode(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">{modalMode === 'add' ? '欢迎新成员' : '修改成员资料'}</h2>
              <button onClick={() => setModalMode(null)} className="text-slate-300 p-2"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col items-center mb-2">
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-[32px] bg-orange-50/50 border-4 border-white shadow-xl flex items-center justify-center relative group cursor-pointer overflow-hidden">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-orange-200 text-2xl"></i>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <p className="text-[10px] font-black text-orange-300 mt-2 uppercase tracking-widest">点击更换头像</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">昵称</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-orange-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-orange-200 transition-all font-black text-slate-700" placeholder="TA的名字" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">种类</label>
                  <div className="flex gap-2">
                    {[PetType.CAT, PetType.DOG, PetType.OTHER].map(t => (
                      <button key={t} onClick={() => { setType(t); setBreed(''); setBreedSearch(''); }} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${type === t ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">性别</label>
                  <div className="flex gap-2">
                    {[Gender.MALE, Gender.FEMALE].map(g => (
                      <button key={g} onClick={() => setGender(g)} className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all ${gender === g ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                        {g}性
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">品种</label>
                <input 
                  value={breedSearch} 
                  onFocus={() => setShowBreedDropdown(true)}
                  onChange={e=>{setBreedSearch(e.target.value); setShowBreedDropdown(true);}} 
                  className="w-full p-4 bg-orange-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-orange-200 transition-all font-black text-slate-700" 
                  placeholder="搜索或手动输入" 
                />
                {showBreedDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-orange-50 z-50 max-h-48 overflow-y-auto no-scrollbar animate-in fade-in zoom-in duration-200">
                    {filteredBreeds.length > 0 ? filteredBreeds.map(b => (
                      <button key={b} onClick={() => { setBreed(b); setBreedSearch(b); setShowBreedDropdown(false); }} className="w-full text-left p-3 hover:bg-orange-50 text-sm font-black text-slate-600 border-b border-orange-50 last:border-none">
                        {b}
                      </button>
                    )) : breedSearch && (
                      <button onClick={() => {setBreed(breedSearch); setShowBreedDropdown(false);}} className="w-full text-left p-3 text-sm font-black text-orange-500 italic">使用自定义: "{breedSearch}"</button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">生日</label>
                  <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="w-full p-4 bg-orange-50/30 rounded-2xl outline-none font-black text-slate-700" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">体重 (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-4 bg-orange-50/30 rounded-2xl outline-none font-black text-slate-700" placeholder="0.0" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">专属卡片色彩</label>
                <div className="flex flex-wrap gap-2.5">
                  {THEME_COLORS.map(c => (
                    <button key={c} onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-full border-4 transition-all ${themeColor === c ? 'border-orange-500 scale-110 shadow-lg' : 'border-white shadow-sm'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="w-full mt-8 py-4 bg-orange-500 text-white font-black rounded-[24px] shadow-xl shadow-orange-100 active:scale-95 transition-all text-lg tracking-widest">
              {modalMode === 'add' ? '正式入驻' : '保存更新'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetList;
