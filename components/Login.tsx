
import React, { useState } from 'react';
import { User } from '../types';
import { DEFAULT_USER_AVATAR } from '../constants';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ users, setUsers, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAction = () => {
    setError('');
    
    if (isRegister) {
      if (!username) {
        setError('请输入账号');
        return;
      }
      if (users.find(u => u.username === username)) {
        setError('账号已经存在');
        return;
      }
      if (password.length < 8 || password.length > 20) {
        setError('密码长度需在8-20位之间');
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        nickname: username, // 默认昵称设为账号名
        avatar: DEFAULT_USER_AVATAR
      };
      setUsers([...users, newUser]);
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username === username);
      if (!user) {
        setError('账号不存在');
        return;
      }
      if (user.password !== password) {
        setError('密码错误请重新输入');
        return;
      }
      onLogin(user);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 bg-white max-w-md mx-auto">
      <div className="w-20 h-20 bg-orange-100 rounded-[32px] flex items-center justify-center mb-8 shadow-xl rotate-3">
        <i className="fa-solid fa-paw text-orange-500 text-3xl"></i>
      </div>
      <h2 className="text-2xl font-black mb-8 text-slate-800 tracking-tight">{isRegister ? '新用户注册' : '欢迎回来'}</h2>
      
      <div className="w-full space-y-4">
        <div className="relative">
          <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="请输入账号" 
            className="w-full pl-12 pr-4 py-4 bg-orange-50/50 rounded-[24px] outline-none focus:ring-2 focus:ring-orange-400 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="relative">
          <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="password" 
            placeholder="请输入密码" 
            className="w-full pl-12 pr-4 py-4 bg-orange-50/50 rounded-[24px] outline-none focus:ring-2 focus:ring-orange-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
      </div>

      <button 
        onClick={handleAction}
        className="w-full mt-10 py-4 bg-orange-500 text-white font-black rounded-[24px] shadow-lg shadow-orange-200 active:scale-95 transition-transform"
      >
        {isRegister ? '注册并登录' : '立即登录'}
      </button>

      <button 
        onClick={() => { setIsRegister(!isRegister); setError(''); }}
        className="mt-6 text-slate-400 text-sm font-medium hover:text-orange-500 transition"
      >
        {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
      </button>
    </div>
  );
};

export default Login;
