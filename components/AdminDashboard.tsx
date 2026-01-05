
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, GlobeIcon, UserIcon, KeyIcon, PencilIcon, SaveIcon, TrashIcon, CameraIcon, XIcon, ActivityIcon } from '../assets/icons';
import { COUNTRIES, DHL_DATA, USER_STORAGE_KEY } from '../constants';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onContinue: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, onContinue, onLogout, currentUser }) => {
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'users' | 'alerts'>('users');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempAllowedCountries, setTempAllowedCountries] = useState<string[]>([]);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<User>({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEditingUser, setPasswordEditingUser] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [originalUsername, setOriginalUsername] = useState<string>('');

  // Backend config
  const [backendUrl, setBackendUrl] = useState(() => {
      const saved = localStorage.getItem('saltex_backend_url');
      return saved || '';
  });

  const [alertConfig, setAlertConfig] = useState(() => {
    const saved = localStorage.getItem('saltex_alert_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: '',
      pass: '',
      recipient: 'esteban@saltexgroup.com'
    };
  });

  useEffect(() => {
    const checkBackend = async () => {
        try {
            // Use window.location.origin as fallback to ensure relative calls work
            const base = backendUrl || window.location.origin;
            const res = await fetch(`${base}/api/health`);
            if (res.ok) setBackendStatus('online');
            else setBackendStatus('offline');
        } catch (e) { 
            setBackendStatus('offline'); 
        }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const SUPER_ADMIN_USERNAME = 'admin';
  const displayUsers = [...users].sort((a, _b) => a.username === SUPER_ADMIN_USERNAME ? -1 : 1);

  const showSuccess = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              if (mode === 'add') {
                  setNewUser(prev => ({ ...prev, avatar: base64String }));
              } else if (editUserData) {
                  setEditUserData(prev => prev ? ({ ...prev, avatar: base64String }) : null);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveAll = async () => {
      localStorage.setItem('saltex_backend_url', backendUrl);
      localStorage.setItem('saltex_alert_config', JSON.stringify(alertConfig));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      
      try {
          const base = backendUrl || window.location.origin;
          await fetch(`${base}/api/config-alerts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: alertConfig })
          });
      } catch (err) {}
      showSuccess(t('globalSaveSuccess'));
  };

  const toggleUserStatus = (username: string) => {
    if (username === SUPER_ADMIN_USERNAME) return;
    setUsers(prev => prev.map(u => u.username === username ? { ...u, isDisabled: !u.isDisabled } : u));
  };

  const togglePasswordVisibility = (username: string) => setVisiblePasswords(prev => ({ ...prev, [username]: !prev[username] }));
  
  const changeUserRole = (username: string, newRole: 'admin' | 'user') => {
      if (username === SUPER_ADMIN_USERNAME) return;
      setUsers(prev => prev.map(u => u.username === username ? { ...u, role: newRole } : u));
  };

  const deleteUser = (username: string) => {
      if (username === SUPER_ADMIN_USERNAME) return;
      if (window.confirm(t('confirmDeleteUser'))) {
          setUsers(prev => prev.filter(u => u.username !== username));
          showSuccess(t('userDeleteSuccess'));
      }
  };

  const openPermissionsModal = (username: string) => {
      const user = displayUsers.find(u => u.username === username);
      if (user) { setEditingUser(username); setTempAllowedCountries(user.allowedCountries || []); setShowPermissionsModal(true); }
  };

  const savePermissions = () => {
      if (editingUser) {
          setUsers(prev => prev.map(u => u.username === editingUser ? { ...u, allowedCountries: tempAllowedCountries } : u));
          setShowPermissionsModal(false);
          showSuccess(t('globalSaveSuccess'));
      }
  };

  const openEditUserModal = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user) {
          setEditUserData({ ...user });
          setOriginalUsername(username);
          setShowEditUserModal(true);
      }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editUserData) return;
      setUsers(prev => prev.map(user => user.username === originalUsername ? { ...editUserData } : user));
      setShowEditUserModal(false);
      showSuccess(t('userUpdateSuccess'));
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (users.some(u => u.username === newUser.username)) return;
      setUsers(prev => [...prev, { ...newUser }]);
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
      showSuccess(t('userCreateSuccess'));
  };

  const handleSavePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordEditingUser && newPasswordValue) {
          setUsers(prev => prev.map(user => user.username === passwordEditingUser ? { ...user, password: newPasswordValue } : user));
          setShowPasswordModal(false);
          setNewPasswordValue('');
          showSuccess(t('passwordUpdateSuccess'));
      }
  };

  const toggleSelectAll = () => {
      const allCodes = [...COUNTRIES.map(c => c.code), DHL_DATA.code];
      setTempAllowedCountries(tempAllowedCountries.length === allCodes.length ? [] : allCodes);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] relative font-sans">
      {successMessage && <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-bounce text-sm">{successMessage}</div>}

      <div className="bg-[#0b1626] px-4 sm:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
             <p className="text-cyan-400 text-xs sm:text-sm font-medium">User management</p>
             <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {backendStatus}
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-white/10 rounded-lg p-1">
                <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'es' ? 'bg-white text-[#0b1626]' : 'text-white hover:bg-white/5'}`}>ES</button>
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'en' ? 'bg-white text-[#0b1626]' : 'text-white hover:bg-white/5'}`}>EN</button>
            </div>
            <button onClick={handleSaveAll} className="bg-[#2ecc71] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#27ae60] shadow-md transition-all flex items-center gap-2"><SaveIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t('saveChangesButton')}</span></button>
            <button onClick={() => setShowAddUserModal(true)} className="bg-[#3498db] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2980b9] shadow-md transition-all flex items-center gap-2"><PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t('addUserButton')}</span></button>
            <button onClick={onLogout} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#c0392b] shadow-md transition-all">{t('logoutButton')}</button>
            <button onClick={onContinue} className="bg-white text-[#0b1626] px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 shadow-md transition-all border border-gray-200">{t('goToAppButton')}</button>
        </div>
      </div>

      <div className="bg-white px-4 sm:px-8 flex border-b shrink-0">
          <button onClick={() => setActiveTab('users')} className={`px-4 sm:px-8 py-4 text-xs sm:text-sm font-bold transition-all border-b-4 ${activeTab === 'users' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('usersTab')}</button>
          <button onClick={() => setActiveTab('alerts')} className={`px-4 sm:px-8 py-4 text-xs sm:text-sm font-bold transition-all border-b-4 ${activeTab === 'alerts' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('alertsTab')}</button>
      </div>

      <div className="flex-grow overflow-y-auto bg-[#fdfdfd] p-4 sm:p-8">
          {activeTab === 'users' ? (
              <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
                 <div className="min-w-[800px]">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-[#fcfcfc]">
                            <tr>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">STATUS</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">NAME</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">USERNAME</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">PASSWORD</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">ROLE / PERMISSIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {displayUsers.map(user => {
                                const isSuper = user.username === SUPER_ADMIN_USERNAME;
                                return (
                                    <tr key={user.username} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleUserStatus(user.username)} disabled={isSuper} className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-[#2ecc71]' : 'bg-gray-300'} disabled:opacity-40 cursor-pointer`}>
                                                    <span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${!user.isDisabled ? 'text-green-500' : 'text-gray-400'}`}>{!user.isDisabled ? 'Active' : 'Disabled'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="" /> : <UserIcon className="w-6 h-6" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{user.name}</span>
                                                    {isSuper && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SYSTEM ACCOUNT</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-slate-400">{user.username}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-400 tracking-widest">{visiblePasswords[user.username] ? user.password : '••••••'}</span>
                                                <button onClick={() => togglePasswordVisibility(user.username)} className="text-slate-300 hover:text-slate-500 transition-colors">{visiblePasswords[user.username] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <select value={user.role} onChange={e => changeUserRole(user.username, e.target.value as any)} disabled={isSuper} className="text-[12px] font-bold text-slate-600 border border-slate-200 rounded-lg bg-white p-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-28 disabled:bg-slate-50">
                                                    <option value="admin">ADMIN</option>
                                                    <option value="user">USER</option>
                                                </select>
                                                {!isSuper && user.role === 'user' && (
                                                    <button onClick={() => openPermissionsModal(user.username)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><GlobeIcon className="w-5 h-5" /></button>
                                                )}
                                                {!isSuper && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                        <button onClick={() => openEditUserModal(user.username)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => { setPasswordEditingUser(user.username); setShowPasswordModal(true); }} className="p-2 text-amber-400 hover:bg-amber-50 rounded-lg"><KeyIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => deleteUser(user.username)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
              </div>
          ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
                      <ActivityIcon className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                      <div>
                          <p className="text-amber-800 font-bold text-sm">⚠️ Nota Técnica Importante</p>
                          <p className="text-amber-700 text-xs mt-1">Los servidores en la nube (como Railway) no pueden alcanzar IPs privadas (192.168.x.x) de tu red local. Si todos los servidores aparecen "Fuera de línea", es probable que el backend necesite un túnel VPN o ser ejecutado localmente.</p>
                      </div>
                  </div>

                  <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-blue-50 p-4 rounded-xl text-blue-600 shrink-0"><GlobeIcon className="w-8 h-8" /></div>
                          <div>
                              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Servidor Backend</h3>
                              <p className="text-slate-400 text-xs sm:text-sm font-medium">Configura la URL de monitoreo.</p>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL API BACKEND</label>
                          <input type="text" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="Dejar vacío para usar ruta relativa" />
                          <p className="text-[10px] text-slate-300 font-bold tracking-tight uppercase">Vacío = Autodetectar URL actual (Recomendado en Railway)</p>
                      </div>
                  </div>

                  <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-red-50 p-4 rounded-xl text-red-600 shrink-0"><ActivityIcon className="w-8 h-8" /></div>
                          <div>
                              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{t('smtpSettingsTitle')}</h3>
                              <p className="text-slate-400 text-xs sm:text-sm font-medium">Alertas automáticas.</p>
                          </div>
                      </div>
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div><label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Host SMTP</label><input type="text" value={alertConfig.host} onChange={e => setAlertConfig({...alertConfig, host: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Puerto</label><input type="number" value={alertConfig.port} onChange={e => setAlertConfig({...alertConfig, port: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm" /></div>
                          </div>
                          <div><label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Usuario SMTP</label><input type="email" value={alertConfig.user} onChange={e => setAlertConfig({...alertConfig, user: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm" /></div>
                          <div><label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Contraseña</label><input type="password" value={alertConfig.pass} onChange={e => setAlertConfig({...alertConfig, pass: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm" /></div>
                          <div><label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Destinatario</label><input type="email" value={alertConfig.recipient} onChange={e => setAlertConfig({...alertConfig, recipient: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm border-red-100" /></div>
                          
                          <button onClick={handleSaveAll} className="w-full bg-[#0b1626] text-white py-4 rounded-xl font-black text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"><SaveIcon className="w-5 h-5" />{t('saveChangesButton')}</button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* MODALES */}
      {(showAddUserModal || showEditUserModal || showPasswordModal || showPermissionsModal) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
                  {showAddUserModal && (
                      <form onSubmit={handleAddUser} className="flex flex-col h-full overflow-hidden">
                          <div className="bg-[#0b1626] p-6 flex justify-between items-center shrink-0">
                              <h4 className="text-xl font-bold text-white">{t('addUserTitle')}</h4>
                              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-white/60 hover:text-white shrink-0"><XIcon className="w-6 h-6"/></button>
                          </div>
                          <div className="p-6 sm:p-8 space-y-4 overflow-y-auto grow">
                              <div className="flex justify-center mb-4">
                                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                      <div className="h-20 w-20 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-blue-400 transition-colors shadow-inner">
                                          {newUser.avatar ? <img src={newUser.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-8 w-8 text-slate-300" />}
                                      </div>
                                      <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white shadow-lg"><CameraIcon className="w-3 h-3" /></div>
                                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'add')} />
                                  </div>
                              </div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Usuario / Email</label><input required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contraseña</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
                                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm font-bold">
                                    <option value="user">USER</option>
                                    <option value="admin">ADMIN</option>
                                </select>
                              </div>
                          </div>
                          <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
                              <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Crear</button>
                          </div>
                      </form>
                  )}

                  {showPermissionsModal && (
                      <div className="flex flex-col h-full overflow-hidden">
                          <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
                              <h4 className="text-xl font-black text-slate-800">{t('modalPermissionsTitle')}</h4>
                              <button onClick={toggleSelectAll} className="text-xs font-black text-blue-600 uppercase tracking-widest">Select All</button>
                          </div>
                          <div className="p-6 sm:p-8 overflow-y-auto grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {COUNTRIES.map(c => (
                                  <label key={c.code} className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all cursor-pointer ${tempAllowedCountries.includes(c.code) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'}`}>
                                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={tempAllowedCountries.includes(c.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])} />
                                      <span className="text-sm font-bold truncate">{c.name}</span>
                                  </label>
                              ))}
                              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl sm:col-span-2 transition-all cursor-pointer ${tempAllowedCountries.includes(DHL_DATA.code) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'}`}>
                                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" checked={tempAllowedCountries.includes(DHL_DATA.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(DHL_DATA.code) ? prev.filter(x => x !== DHL_DATA.code) : [...prev, DHL_DATA.code])} />
                                  <span className="text-sm font-black uppercase tracking-tighter italic">DHL GLOBAL MONITOR</span>
                              </label>
                          </div>
                          <div className="p-6 border-t flex gap-3 bg-slate-50 shrink-0">
                              <button onClick={() => setShowPermissionsModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
                              <button onClick={savePermissions} className="flex-1 py-3 bg-[#0b1626] text-white rounded-xl font-bold shadow-lg">Guardar</button>
                          </div>
                      </div>
                  )}
                  
                  {showPasswordModal && (
                      <form onSubmit={handleSavePassword} className="p-6 sm:p-8 space-y-6">
                           <div className="flex justify-between items-center mb-2">
                               <h4 className="text-xl font-black text-slate-800 tracking-tight">{t('changePasswordTitle')}</h4>
                               <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                           </div>
                           <div className="space-y-4">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nueva clave para: <span className="text-slate-700">{passwordEditingUser}</span></p>
                               <input required type="password" value={newPasswordValue} onChange={e => setNewPasswordValue(e.target.value)} className="w-full border-2 p-4 rounded-xl bg-slate-50 font-mono text-center text-xl focus:border-amber-500 outline-none" placeholder="••••••••" />
                           </div>
                           <div className="flex gap-3">
                               <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 font-bold text-slate-400">Cancelar</button>
                               <button type="submit" className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg">Actualizar</button>
                           </div>
                      </form>
                  )}
                  
                  {showEditUserModal && editUserData && (
                      <form onSubmit={handleUpdateUser} className="flex flex-col h-full overflow-hidden">
                          <div className="bg-[#0b1626] p-6 flex justify-between items-center shrink-0">
                              <h4 className="text-xl font-bold text-white">{t('editUserTitle')}</h4>
                              <button type="button" onClick={() => setShowEditUserModal(false)} className="text-white/60 hover:text-white shrink-0"><XIcon className="w-6 h-6"/></button>
                          </div>
                          <div className="p-6 sm:p-8 space-y-4 overflow-y-auto grow">
                               <div className="flex justify-center mb-4">
                                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                      <div className="h-20 w-20 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-blue-400 transition-colors shadow-inner">
                                          {editUserData.avatar ? <img src={editUserData.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-8 w-8 text-slate-300" />}
                                      </div>
                                      <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white shadow-lg"><CameraIcon className="w-3 h-3" /></div>
                                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} />
                                  </div>
                              </div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre</label><input required value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Usuario</label><input disabled value={editUserData.username} className="w-full border p-3 rounded-xl bg-slate-100 text-slate-400 text-sm" /></div>
                              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
                                <select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value as any})} className="w-full border p-3 rounded-xl bg-slate-50 text-sm font-bold">
                                    <option value="user">USER</option>
                                    <option value="admin">ADMIN</option>
                                </select>
                              </div>
                          </div>
                          <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
                              <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 py-3 font-bold text-slate-400">Cancelar</button>
                              <button type="submit" className="flex-1 py-3 bg-[#0b1626] text-white rounded-xl font-bold shadow-lg">Actualizar</button>
                          </div>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
