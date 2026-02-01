
import React, { useState, useEffect } from 'react';
import { User, Pet, Record, TaskType } from './types';
import { DEFAULT_TASK_TYPES } from './constants';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import PetList from './views/PetList';
import CalendarView from './views/CalendarView';
import AddRecord from './views/AddRecord';
import NotificationView from './views/NotificationView';
import ProfileView from './views/ProfileView';
import PetDetail from './views/PetDetail';

const App: React.FC = () => {
  const [isSplashing, setIsSplashing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'pets' | 'calendar' | 'add' | 'notifications' | 'profile' | 'petDetail'>('pets');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [calendarFilterPet, setCalendarFilterPet] = useState<string>('all');
  const [detailTaskFilter, setDetailTaskFilter] = useState<string>('all');
  
  const [showPwaTip, setShowPwaTip] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(DEFAULT_TASK_TYPES);
  const [users, setUsers] = useState<User[]>([]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 30, heavy: 60 };
      navigator.vibrate(patterns[style]);
    }
  };

  useEffect(() => {
    // 检测环境
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIos(ios);
    setIsStandalone(standalone);

    // 如果未安装，显示提示
    if (!standalone) {
      const hasShownTip = localStorage.getItem('pwa_tip_shown');
      if (!hasShownTip) {
        setTimeout(() => setShowPwaTip(true), 3000);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaTip(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const savedUsers = localStorage.getItem('petcare_users');
    const savedPets = localStorage.getItem('petcare_pets');
    const savedRecords = localStorage.getItem('petcare_records');
    const savedTasks = localStorage.getItem('petcare_tasks');
    const savedLogin = localStorage.getItem('petcare_current_user');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedPets) setPets(JSON.parse(savedPets));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedTasks) setTaskTypes(JSON.parse(savedTasks));
    if (savedLogin) setCurrentUser(JSON.parse(savedLogin));

    const timer = setTimeout(() => setIsSplashing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('petcare_users', JSON.stringify(users));
    localStorage.setItem('petcare_pets', JSON.stringify(pets));
    localStorage.setItem('petcare_records', JSON.stringify(records));
    localStorage.setItem('petcare_tasks', JSON.stringify(taskTypes));
  }, [users, pets, records, taskTypes]);

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPwaTip(false);
        localStorage.setItem('pwa_tip_shown', 'true');
      }
    } else if (isIos) {
      alert('请点击浏览器底部的【分享】图标，然后选择【添加到主屏幕】。');
      setShowPwaTip(false);
      localStorage.setItem('pwa_tip_shown', 'true');
    }
  };

  const handleLogin = (user: User) => {
    triggerHaptic('medium');
    setCurrentUser(user);
    localStorage.setItem('petcare_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    triggerHaptic('light');
    setCurrentUser(null);
    localStorage.removeItem('petcare_current_user');
  };

  const addPet = (pet: Pet) => {
    triggerHaptic('heavy');
    setPets([...pets, pet]);
    const weightRecord: Record = {
      id: `init-weight-${pet.id}`,
      petId: pet.id,
      taskTypeId: '1', 
      date: new Date().toISOString(),
      value: pet.initialWeight,
      note: '初始体重记录'
    };
    setRecords(prev => [...prev, weightRecord]);
  };

  const updatePet = (updatedPet: Pet) => setPets(pets.map(p => p.id === updatedPet.id ? updatedPet : p));
  const deletePet = (id: string) => {
    setPets(pets.filter(p => p.id !== id));
    setRecords(prev => prev.filter(r => r.petId !== id));
    if (selectedPetId === id) setSelectedPetId(null);
  };

  const addRecord = (record: Record) => {
    triggerHaptic('medium');
    setRecords(prev => [...prev, record]);
  };

  const updateRecord = (updated: Record) => setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  const deleteRecord = (id: string) => setRecords(prev => prev.filter(r => r.id !== id));

  const navigateTo = (view: any) => {
    triggerHaptic('light');
    if(view !== 'calendar') setCalendarFilterPet('all'); 
    if(view !== 'petDetail') setDetailTaskFilter('all');
    setCurrentView(view);
  };

  if (isSplashing) return <SplashScreen />;
  if (!currentUser) return <Login users={users} setUsers={setUsers} onLogin={handleLogin} />;

  const renderContent = () => {
    const ViewWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="view-transition flex-1 pb-24 overflow-y-auto no-scrollbar">
        {children}
      </div>
    );

    switch (currentView) {
      case 'pets':
        return <ViewWrapper><PetList pets={pets} records={records} taskTypes={taskTypes} onSelectPet={(id) => { setSelectedPetId(id); setDetailTaskFilter('all'); setCurrentView('petDetail'); }} onAddPet={addPet} onDeletePet={deletePet} onEditPet={updatePet} /></ViewWrapper>;
      case 'petDetail':
        return selectedPetId ? (
          <ViewWrapper>
            <PetDetail pet={pets.find(p => p.id === selectedPetId)!} records={records.filter(r => r.petId === selectedPetId)} taskTypes={taskTypes} initialTaskFilter={detailTaskFilter} onBack={() => setCurrentView('pets')} onUpdateRecord={updateRecord} onDeleteRecord={deleteRecord} onNavigateToCalendar={(petId) => { setCalendarFilterPet(petId); setCurrentView('calendar'); }} />
          </ViewWrapper>
        ) : null;
      case 'calendar':
        return <ViewWrapper><CalendarView pets={pets} records={records} taskTypes={taskTypes} initialPetFilter={calendarFilterPet} onFilterChange={setCalendarFilterPet} onEditRecord={updateRecord} onDeleteRecord={deleteRecord} onViewRecordHistory={(petId, taskId) => { setSelectedPetId(petId); setDetailTaskFilter(taskId); setCurrentView('petDetail'); }} /></ViewWrapper>;
      case 'add':
        return <ViewWrapper><AddRecord pets={pets} taskTypes={taskTypes} onAdd={addRecord} onFinish={() => setCurrentView('pets')} /></ViewWrapper>;
      case 'notifications':
        return <ViewWrapper><NotificationView pets={pets} records={records} taskTypes={taskTypes} /></ViewWrapper>;
      case 'profile':
        return <ViewWrapper><ProfileView user={currentUser} setUser={(u) => { setCurrentUser(u); setUsers(users.map(us => us.id === u.id ? u : us)); }} pets={pets} taskTypes={taskTypes} setTaskTypes={setTaskTypes} onLogout={handleLogout} onDeletePet={deletePet} onEditPet={updatePet} /></ViewWrapper>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#fff8f5] relative overflow-hidden shadow-2xl font-sans">
      {!isOnline && (
        <div className="absolute top-[var(--safe-top)] left-0 right-0 bg-slate-800 text-white text-[10px] py-1 text-center z-[110] font-black tracking-widest animate-pulse">
          <i className="fa-solid fa-wifi-slash mr-2"></i> 离线模式：部分功能受限
        </div>
      )}

      <div className="safe-top-padding"></div>
      
      {renderContent()}
      
      {showPwaTip && !isStandalone && (
        <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white">
            <div className="flex items-center gap-3" onClick={handleInstallClick}>
              <i className="fa-solid fa-cloud-arrow-down text-2xl animate-bounce"></i>
              <div>
                <p className="text-sm font-black">安装“萌宠日记”到桌面</p>
                <p className="text-[10px] opacity-90">{isIos ? '点击分享选择“添加到主屏幕”' : '享受全屏、离线使用的完整体验'}</p>
              </div>
            </div>
            <button onClick={() => { triggerHaptic('light'); setShowPwaTip(false); localStorage.setItem('pwa_tip_shown', 'true'); }} className="bg-white/20 p-2 rounded-full h-8 w-8 flex items-center justify-center ml-2">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-orange-500 mx-auto"></div>
        </div>
      )}

      <Navbar active={currentView} onNavigate={navigateTo} />
    </div>
  );
};

export default App;
