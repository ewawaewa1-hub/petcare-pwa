
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

  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(DEFAULT_TASK_TYPES);
  const [users, setUsers] = useState<User[]>([]);

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('petcare_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('petcare_current_user');
  };

  const addPet = (pet: Pet) => {
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

  const addRecord = (record: Record) => setRecords(prev => [...prev, record]);
  const updateRecord = (updated: Record) => setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  const deleteRecord = (id: string) => setRecords(prev => prev.filter(r => r.id !== id));

  if (isSplashing) return <SplashScreen />;
  if (!currentUser) return <Login users={users} setUsers={setUsers} onLogin={handleLogin} />;

  const renderContent = () => {
    switch (currentView) {
      case 'pets':
        return <PetList 
          pets={pets} 
          records={records} 
          taskTypes={taskTypes}
          onSelectPet={(id) => { setSelectedPetId(id); setDetailTaskFilter('all'); setCurrentView('petDetail'); }} 
          onAddPet={addPet}
          onDeletePet={deletePet}
          onEditPet={updatePet}
        />;
      case 'petDetail':
        return selectedPetId ? (
          <PetDetail 
            pet={pets.find(p => p.id === selectedPetId)!} 
            records={records.filter(r => r.petId === selectedPetId)}
            taskTypes={taskTypes}
            initialTaskFilter={detailTaskFilter}
            onBack={() => setCurrentView('pets')}
            onUpdateRecord={updateRecord}
            onDeleteRecord={deleteRecord}
            onNavigateToCalendar={(petId) => {
              setCalendarFilterPet(petId);
              setCurrentView('calendar');
            }}
          />
        ) : null;
      case 'calendar':
        return <CalendarView 
          pets={pets} 
          records={records} 
          taskTypes={taskTypes} 
          initialPetFilter={calendarFilterPet} 
          onFilterChange={setCalendarFilterPet}
          onEditRecord={updateRecord}
          onDeleteRecord={deleteRecord}
          onViewRecordHistory={(petId, taskId) => {
            setSelectedPetId(petId);
            setDetailTaskFilter(taskId);
            setCurrentView('petDetail');
          }}
        />;
      case 'add':
        return <AddRecord pets={pets} taskTypes={taskTypes} onAdd={addRecord} onFinish={() => setCurrentView('pets')} />;
      case 'notifications':
        return <NotificationView pets={pets} records={records} taskTypes={taskTypes} />;
      case 'profile':
        return <ProfileView 
          user={currentUser} 
          setUser={(u) => { setCurrentUser(u); setUsers(users.map(us => us.id === u.id ? u : us)); }}
          pets={pets} 
          taskTypes={taskTypes} 
          setTaskTypes={setTaskTypes}
          onLogout={handleLogout} 
          onDeletePet={deletePet}
          onEditPet={updatePet}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#fff8f5] relative overflow-hidden shadow-2xl font-sans">
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {renderContent()}
      </div>
      <Navbar active={currentView} onNavigate={(v) => { 
        if(v !== 'calendar') setCalendarFilterPet('all'); 
        if(v !== 'petDetail') setDetailTaskFilter('all');
        setCurrentView(v); 
      }} />
    </div>
  );
};

export default App;
