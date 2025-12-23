
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, GlobeIcon, UserIcon, KeyIcon, PencilIcon, SaveIcon, TrashIcon, ActivityIcon, XIcon } from '../assets/icons';
import { COUNTRIES, USER_STORAGE_KEY } from '../constants';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onContinue: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, onContinue, onLogout, currentUser }) => {
  const { language, setLanguage, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'users' | 'alerts'>('users');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Configuración de Backend y Alertas
  const [backendUrl, setBackendUrl] = useState(() => {
      const saved = localStorage.getItem('saltex_backend_url');
      if (saved) return saved;
      // En producción, si se sirve desde el mismo servidor, la URL es relativa
      return window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
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

  // Estado de los Modales
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordEditingUser, setPasswordEditingUser] = useState<string | null>(null);
  const [tempAllowedCountries, setTempAllowedCountries] = useState<string[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Form states
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'user' as 'admin' | 'user' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const checkBackend = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/health`);
            if (res.ok) setBackendStatus('online');
            else setBackendStatus('offline');
        } catch (e) { setBackendStatus('offline'); }
    };
    checkBackend();
  }, [backendUrl]);

  const showSuccess = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveAll = async () => {
      localStorage.setItem('saltex_backend_url', backendUrl);
      localStorage.setItem('saltex_alert_config', JSON.stringify(alertConfig));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      
      try {
          await fetch(`${backendUrl}/api/config-alerts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: alertConfig })
          });
      } catch (err) {}
      showSuccess(t('globalSaveSuccess'));
  };

  const toggleUserStatus = (username: string) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, isDisabled: !u.isDisabled } : u));
  };

  const deleteUser = (username: string) => {
    if (window.confirm(t('confirmDeleteUser'))) {
        setUsers(prev => prev.filter(u => u.username !== username));
        showSuccess(t('userDeleteSuccess'));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username === formData.username)) {
        alert("El usuario ya existe");
        return;
    }
    const newUser: User = { 
        name: formData.name, 
        username: formData.username, 
        password: formData.password, 
        role: formData.role, 
        isDisabled: false, 
        allowedCountries: [] 
    };
    setUsers([...users, newUser]);
    setShowAddUserModal(false);
    setFormData({ name: '', username: '', password: '', role: 'user' });
    showSuccess(t('userCreateSuccess'));
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        setUsers(prev => prev.map(u => u.username === editingUser.username ? { ...u, name: formData.name, role: formData.role } : u));
        setShowEditUserModal(false);
        setEditingUser(null);
        showSuccess(t('userUpdateSuccess'));
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordEditingUser) {
        setUsers(prev => prev.map(u => u.username === passwordEditingUser ? { ...u, password: newPassword } : u));
        setShowPasswordModal(false);
        setPasswordEditingUser(null);
        setNewPassword('');
        showSuccess(t('passwordUpdateSuccess'));
    }
  };

  const SUPER_ADMIN_USERNAME = 'admin';
  // CORRECCIÓN: Se cambió (a, b) por (a, _b) para evitar error de variable no utilizada
  const displayUsers = [...users].sort((a, _b) => a.username === SUPER_ADMIN_USERNAME ? -1 : 1);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh] relative font-sans">
      {successMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">
            {successMessage}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="bg-[#0b1626] px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-cyan-400 text-sm font-medium">User and permission management</p>
             <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {backendStatus}
             </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
             <UserIcon className="w-3.5 h-3.5" />
             <span>{t('loggedInAs')} <span className="text-white font-bold">{currentUser?.name || 'Super Admin'}</span></span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center bg-white/10 rounded-lg p-1 mr-2">
                <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'es' ? 'bg-white text-[#0b1626]' : 'text-white hover:bg-white/5'}`}>ES</button>
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-[10px] font-bold rounded ${language === 'en' ? 'bg-white text-[#0b1626]' : 'text-white hover:bg-white/5'}`}>EN</button>
            </div>
            <button onClick={handleSaveAll} className="bg-[#2ecc71] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#27ae60] shadow-md transition-all flex items-center gap-2">
                <SaveIcon className="w-4 h-4" /> {t('saveChangesButton')}
            </button>
            <button onClick={() => { setFormData({name: '', username: '', password: '', role: 'user'}); setShowAddUserModal(true); }} className="bg-[#3498db] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#2980b9] shadow-md transition-all flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> {t('addUserButton')}
            </button>
            <button onClick={onLogout} className="bg-[#e74c3c] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#c0392b] shadow-md transition-all">
                {t('logoutButton')}
            </button>
            <button onClick={onContinue} className="bg-white text-[#0b1626] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-100 shadow-md transition-all border border-gray-200">
                {t('goToAppButton')}
            </button>
        </div>
      </div>

      {/* TABS SELECTION */}
      <div className="bg-white px-8 flex border-b">
          <button onClick={() => setActiveTab('users')} className={`px-8 py-4 text-sm font-bold transition-all border-b-4 ${activeTab === 'users' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('usersTab')}</button>
          <button onClick={() => setActiveTab('alerts')} className={`px-8 py-4 text-sm font-bold transition-all border-b-4 ${activeTab === 'alerts' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('alertsTab')}</button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-y-auto bg-[#fdfdfd]">
          {activeTab === 'users' ? (
              <div className="p-8">
                  <div className="bg-white border-x border-t border-gray-100 rounded-t-xl overflow-hidden">
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
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => toggleUserStatus(user.username)} 
                                                    disabled={isSuper} 
                                                    className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-[#2ecc71]' : 'bg-gray-300'} disabled:opacity-40 cursor-pointer`}
                                                >
                                                    <span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <span className={`text-[13px] font-bold ${!user.isDisabled ? 'text-blue-400' : 'text-gray-400'}`}>
                                                    {!user.isDisabled ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{user.name}</span>
                                                    {isSuper && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SYSTEM ACCOUNT</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-400">{user.username}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-400 tracking-widest">
                                                    {visiblePasswords[user.username] ? user.password : '••••••'}
                                                </span>
                                                <button onClick={() => setVisiblePasswords(prev => ({...prev, [user.username]: !prev[user.username]}))} className="text-slate-300 hover:text-slate-500">
                                                    {visiblePasswords[user.username] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[13px] font-bold px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {(user.role || 'user').toUpperCase()}
                                                </span>

                                                {!isSuper && user.role === 'user' && (
                                                    <button onClick={() => { setEditingUser(user); setTempAllowedCountries(user.allowedCountries || []); setShowPermissionsModal(true); }} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                                        <GlobeIcon className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {!isSuper && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                        <button onClick={() => { setEditingUser(user); setFormData({name: user.name || '', username: user.username, password: user.password, role: user.role || 'user'}); setShowEditUserModal(true); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-5 h-5" /></button>
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
              <div className="max-w-2xl mx-auto py-12 space-y-8">
                  {/* CONFIGURACIÓN BACKEND */}
                  <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><GlobeIcon className="w-8 h-8" /></div>
                          <div>
                              <h3 className="text-2xl font-bold text-slate-800">Servidor Backend</h3>
                              <p className="text-slate-400 text-sm font-medium">Configura la URL de monitoreo en la nube.</p>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL API BACKEND</label>
                          <input 
                            type="text" 
                            value={backendUrl} 
                            onChange={e => setBackendUrl(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
                            placeholder="https://mi-backend.render.com"
                          />
                          <p className="text-[10px] text-slate-300 font-bold">Por defecto: {window.location.origin}</p>
                      </div>
                  </div>

                  <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-red-50 p-4 rounded-xl text-red-600"><ActivityIcon className="w-8 h-8" /></div>
                          <div>
                              <h3 className="text-2xl font-bold text-slate-800">{t('smtpSettingsTitle')}</h3>
                              <p className="text-slate-400 text-sm font-medium">Alertas automáticas de servidores caídos.</p>
                          </div>
                      </div>
                      <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-[11px] font-bold text-slate-400 mb-2 block">Host SMTP</label><input type="text" value={alertConfig.host} onChange={e => setAlertConfig({...alertConfig, host: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl" /></div>
                              <div><label className="text-[11px] font-bold text-slate-400 mb-2 block">Puerto</label><input type="number" value={alertConfig.port} onChange={e => setAlertConfig({...alertConfig, port: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl" /></div>
                          </div>
                          <div><label className="text-[11px] font-bold text-slate-400 mb-2 block">Usuario SMTP</label><input type="email" value={alertConfig.user} onChange={e => setAlertConfig({...alertConfig, user: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl" /></div>
                          <div><label className="text-[11px] font-bold text-slate-400 mb-2 block">Contraseña</label><input type="password" value={alertConfig.pass} onChange={e => setAlertConfig({...alertConfig, pass: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl" /></div>
                          
                          <button onClick={handleSaveAll} className="w-full bg-[#0b1626] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><SaveIcon className="w-5 h-5" />{t('saveChangesButton')}</button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* MODAL: AGREGAR USUARIO */}
      {showAddUserModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <form onSubmit={handleAddUser} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-[#0b1626] p-6 flex justify-between items-center">
                      <h4 className="text-xl font-bold text-white">{t('addUserTitle')}</h4>
                      <button type="button" onClick={() => setShowAddUserModal(false)} className="text-white/60 hover:text-white"><XIcon className="w-6 h-6"/></button>
                  </div>
                  <div className="p-8 space-y-4">
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nombre Completo</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" /></div>
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Usuario / Email</label><input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" /></div>
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Contraseña Inicial</label><input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" /></div>
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full border p-3 rounded-xl bg-slate-50">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t flex gap-3">
                      <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                      <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Crear Usuario</button>
                  </div>
              </form>
          </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {showEditUserModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <form onSubmit={handleEditUser} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-[#0b1626] p-6 flex justify-between items-center">
                      <h4 className="text-xl font-bold text-white">{t('editUserTitle')}</h4>
                      <button type="button" onClick={() => setShowEditUserModal(false)} className="text-white/60 hover:text-white"><XIcon className="w-6 h-6"/></button>
                  </div>
                  <div className="p-8 space-y-4">
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nombre Completo</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" /></div>
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Usuario (No editable)</label><input disabled value={formData.username} className="w-full border p-3 rounded-xl bg-slate-100 text-slate-400" /></div>
                      <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full border p-3 rounded-xl bg-slate-50">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t flex gap-3">
                      <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                      <button type="submit" className="flex-1 py-3 bg-[#0b1626] text-white rounded-xl font-bold shadow-lg hover:bg-slate-800">Actualizar</button>
                  </div>
              </form>
          </div>
      )}

      {/* MODAL: CAMBIAR CONTRASEÑA */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-amber-500 p-6 flex justify-between items-center">
                      <h4 className="text-xl font-bold text-white">{t('changePasswordTitle')}</h4>
                      <button type="button" onClick={() => setShowPasswordModal(false)} className="text-white/60 hover:text-white"><XIcon className="w-6 h-6"/></button>
                  </div>
                  <div className="p-8">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nueva Contraseña para {passwordEditingUser}</label>
                      <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-4 rounded-xl bg-slate-50 font-mono text-center text-lg" placeholder="••••••••" />
                  </div>
                  <div className="p-6 bg-slate-50 border-t flex gap-3">
                      <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                      <button type="submit" className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:bg-amber-600">Cambiar</button>
                  </div>
              </form>
          </div>
      )}

      {/* MODAL PERMISOS DE PAÍSES */}
      {showPermissionsModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in duration-200">
                  <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                      <div>
                        <h4 className="text-xl font-black text-slate-800">{t('modalPermissionsTitle')}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{editingUser?.name}</p>
                      </div>
                      <button onClick={() => setTempAllowedCountries([...COUNTRIES.map(c => c.code), 'dhl'])} className="text-xs font-black text-blue-600 uppercase tracking-widest">Select All</button>
                  </div>
                  <div className="p-8 overflow-y-auto grid grid-cols-2 gap-4">
                      {COUNTRIES.map(c => (
                          <label key={c.code} className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all cursor-pointer ${tempAllowedCountries.includes(c.code) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'}`}>
                              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={tempAllowedCountries.includes(c.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])} />
                              <span className="text-sm font-bold">{c.name}</span>
                          </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 border-2 rounded-xl col-span-2 transition-all cursor-pointer ${tempAllowedCountries.includes('dhl') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'}`}>
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" checked={tempAllowedCountries.includes('dhl')} onChange={() => setTempAllowedCountries(prev => prev.includes('dhl') ? prev.filter(x => x !== 'dhl') : [...prev, 'dhl'])} />
                          <span className="text-sm font-black uppercase tracking-tighter italic">DHL GLOBAL MONITOR</span>
                      </label>
                  </div>
                  <div className="p-6 border-t flex justify-end gap-4 bg-slate-50">
                      <button onClick={() => setShowPermissionsModal(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                      <button onClick={() => { setUsers(prev => prev.map(u => u.username === editingUser?.username ? {...u, allowedCountries: tempAllowedCountries} : u)); setShowPermissionsModal(false); showSuccess(t('userUpdateSuccess')); }} className="bg-[#0b1626] text-white px-10 py-3 rounded-xl font-bold shadow-lg">Save Changes</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
