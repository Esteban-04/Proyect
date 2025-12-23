import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, GlobeIcon, UserIcon, LockClosedIcon, KeyIcon, PencilIcon, SaveIcon, TrashIcon, CameraIcon, XIcon, ActivityIcon } from '../assets/icons';
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

  // Estados para configuración de Alertas - Actualizado con el correo solicitado
  const [alertConfig, setAlertConfig] = useState({
      enabled: false,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: '',
      pass: '',
      recipient: 'esteban@saltexgroup.com'
  });

  const SUPER_ADMIN: User = {
    name: 'Super Admin',
    username: 'admin',
    password: 'Pr1c3sm4rt2025!',
    role: 'admin',
    isDisabled: false,
    allowedCountries: []
  };

  const displayUsers = [SUPER_ADMIN, ...users.filter(u => u.username !== 'admin')];

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

  const handleGlobalSave = () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      showSuccess(t('globalSaveSuccess'));
  };

  const saveAlertSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const response = await fetch('http://localhost:3001/api/config-alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: alertConfig })
          });
          if (response.ok) {
              showSuccess(t('alertsUpdateSuccess'));
          } else {
              alert("Error al conectar con el backend. Asegúrate de que node server.js esté corriendo.");
          }
      } catch (err) {
          alert("Error de red. ¿Está activo el servidor de monitoreo?");
      }
  };

  const toggleUserStatus = (username: string) => {
    if (username === 'admin') return;
    setUsers(prevUsers => prevUsers.map(user => user.username === username ? { ...user, isDisabled: !user.isDisabled } : user));
  };

  const togglePasswordVisibility = (username: string) => setVisiblePasswords(prev => ({ ...prev, [username]: !prev[username] }));
  
  const changeUserRole = (username: string, newRole: 'admin' | 'user') => {
      if (username === 'admin') return;
      setUsers(prevUsers => prevUsers.map(user => user.username === username ? { ...user, role: newRole } : user));
  };

  const deleteUser = (username: string) => {
      if (username === 'admin') return;
      const user = users.find(u => u.username === username);
      if (!user) return;
      if (!user.isDisabled) { alert(t('deleteActiveUserError')); return; }
      if (window.confirm(t('confirmDeleteUser'))) {
          const updatedUsers = users.filter(u => u.username !== username);
          setUsers(updatedUsers);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
          showSuccess(t('userDeleteSuccess'));
      }
  };

  const openPermissionsModal = (username: string) => {
      const user = displayUsers.find(u => u.username === username);
      if (user) { setEditingUser(username); setTempAllowedCountries(user.allowedCountries || []); setShowPermissionsModal(true); }
  };

  const savePermissions = () => {
      if (editingUser) {
          const updatedUsers = users.map(user => user.username === editingUser ? { ...user, allowedCountries: tempAllowedCountries } : user);
          setUsers(updatedUsers);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
          showSuccess(t('globalSaveSuccess'));
          setShowPermissionsModal(false);
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
      const updatedUsers = users.map(user => user.username === originalUsername ? { ...editUserData } : user);
      setUsers(updatedUsers);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
      setShowEditUserModal(false);
      showSuccess(t('userUpdateSuccess'));
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (users.some(u => u.username === newUser.username)) return;
      const updatedUsers = [...users, { ...newUser }];
      setUsers(updatedUsers);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
      showSuccess(t('userCreateSuccess'));
  };

  const handleSavePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordEditingUser && newPasswordValue) {
          const updatedUsers = users.map(user => user.username === passwordEditingUser ? { ...user, password: newPasswordValue } : user);
          setUsers(updatedUsers);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUsers));
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
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative font-sans">
      {successMessage && <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">{successMessage}</div>}

      <div className="bg-[#0d1a2e] px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">{t('adminDashboardTitle')}</h2>
          <p className="text-cyan-200 text-sm font-medium">{t('adminDashboardSubtitle')}</p>
          <p className="text-white text-sm flex items-center pt-1">
             <UserIcon className="w-4 h-4 mr-2 opacity-70" />
             {t('loggedInAs')} <span className="font-bold ml-1">{currentUser?.name || 'Super Admin'}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center text-white text-xs font-bold mr-4 border-r border-gray-600 pr-4">
                <button onClick={() => setLanguage('es')} className={`px-2 py-1 rounded transition-colors ${language === 'es' ? 'bg-white text-[#0d1a2e]' : 'text-gray-400 hover:text-white'}`}>ES</button>
                <span className="mx-1 text-gray-500">|</span>
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-white text-[#0d1a2e]' : 'text-gray-400 hover:text-white'}`}>EN</button>
            </div>
            <button onClick={handleGlobalSave} className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 shadow-md transition-all active:scale-95"><SaveIcon className="w-4 h-4 mr-2" />{t('saveChangesButton')}</button>
            <button onClick={() => setShowAddUserModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 shadow-md transition-all active:scale-95"><PlusIcon className="w-4 h-4 mr-2" />{t('addUserButton')}</button>
            <button onClick={onLogout} className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 shadow-md transition-all active:scale-95">{t('logoutButton')}</button>
            <button onClick={onContinue} className="bg-white text-[#0d1a2e] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-100 shadow-md transition-all active:scale-95 border border-gray-200">{t('goToAppButton')}</button>
        </div>
      </div>

      <div className="bg-gray-100 px-8 flex border-b">
          <button onClick={() => setActiveTab('users')} className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'users' ? 'border-[#0d1a2e] text-[#0d1a2e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('usersTab')}</button>
          <button onClick={() => setActiveTab('alerts')} className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'alerts' ? 'border-[#0d1a2e] text-[#0d1a2e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t('alertsTab')}</button>
      </div>

      <div className="p-8 overflow-y-auto bg-gray-50 flex-grow">
          {activeTab === 'users' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-[#f8fafc]">
                            <tr>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('userTableStatus')}</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('userTableName')}</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('userTableEmail')}</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('userTablePassword')}</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('userTableRole')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {displayUsers.map(user => {
                                const isSuper = user.username === 'admin';
                                return (
                                    <tr key={user.username} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => toggleUserStatus(user.username)} disabled={isSuper} className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-green-400' : 'bg-gray-300'} disabled:opacity-40`}>
                                                    <span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <span className="text-[13px] font-medium text-gray-400">{user.isDisabled ? t('statusDisabled') : t('statusActive')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 mr-3 border border-gray-200 flex items-center justify-center">
                                                    {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-gray-500" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-800">{user.name}</span>
                                                    {isSuper && <span className="text-[10px] text-gray-400 font-normal tracking-wide uppercase">{t('systemAccount')}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-[14px] text-gray-500 tracking-tighter">{visiblePasswords[user.username] ? user.password : '••••••'}</span>
                                                <button onClick={() => togglePasswordVisibility(user.username)} className="text-gray-300 hover:text-gray-500 transition-colors">{visiblePasswords[user.username] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex items-center space-x-3 w-40">
                                                    <select value={user.role} onChange={e => changeUserRole(user.username, e.target.value as any)} disabled={isSuper} className="text-[13px] text-gray-600 border border-gray-200 rounded-lg bg-white p-1.5 focus:ring-1 focus:ring-blue-500 outline-none w-32 shadow-sm disabled:bg-gray-50">
                                                        <option value="admin">{t('roleAdmin')}</option>
                                                        <option value="user">{t('roleUser')}</option>
                                                    </select>
                                                    {user.role === 'user' && !isSuper && (
                                                        <button onClick={() => openPermissionsModal(user.username)} className="text-gray-300 hover:text-blue-500 transition-colors" title={t('modalPermissionsTitle')}><GlobeIcon className="w-5 h-5" /></button>
                                                    )}
                                                </div>
                                                {!isSuper && (
                                                    <div className="flex items-center space-x-4 ml-auto">
                                                        <button onClick={() => openEditUserModal(user.username)} className="text-blue-500 hover:text-blue-700 transition-all active:scale-90" title={t('editUserTitle')}><PencilIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => { setPasswordEditingUser(user.username); setShowPasswordModal(true); }} className="text-amber-500 hover:text-amber-700 transition-all active:scale-90" title={t('changePasswordTitle')}><KeyIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => deleteUser(user.username)} className="text-red-500 hover:text-red-700 transition-all active:scale-90" title={t('actionDelete')}><TrashIcon className="w-5 h-5" /></button>
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
          ) : (
              <div className="max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-red-50 p-3 rounded-full"><ActivityIcon className="w-8 h-8 text-red-600" /></div>
                      <div>
                          <h3 className="text-2xl font-bold text-[#0d1a2e]">{t('smtpSettingsTitle')}</h3>
                          <p className="text-gray-500 text-sm">{t('smtpSettingsSubtitle')}</p>
                      </div>
                  </div>
                  <form onSubmit={saveAlertSettings} className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                              <span className="text-sm font-bold text-gray-700">{t('enableAlerts')}</span>
                              <p className="text-xs text-gray-500">Activa el envío de correos cuando un servidor se desconecte.</p>
                          </div>
                          <button type="button" onClick={() => setAlertConfig({...alertConfig, enabled: !alertConfig.enabled})} className={`relative h-6 w-11 rounded-full transition-colors ${alertConfig.enabled ? 'bg-red-600' : 'bg-gray-300'}`}><span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${alertConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('smtpHost')}</label><input type="text" value={alertConfig.host} onChange={e => setAlertConfig({...alertConfig, host: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#0d1a2e] outline-none" placeholder="smtp.gmail.com" /></div>
                          <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Puerto SMTP</label><input type="number" value={alertConfig.port} onChange={e => setAlertConfig({...alertConfig, port: parseInt(e.target.value)})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#0d1a2e] outline-none" /></div>
                      </div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('smtpUser')}</label><input type="email" value={alertConfig.user} onChange={e => setAlertConfig({...alertConfig, user: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#0d1a2e] outline-none" placeholder="tu-correo@gmail.com" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('smtpPass')}</label><input type="password" value={alertConfig.pass} onChange={e => setAlertConfig({...alertConfig, pass: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#0d1a2e] outline-none" placeholder="••••••••••••" /></div>
                      <div className="pt-4 border-t"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('recipientEmail')}</label><input type="email" value={alertConfig.recipient} onChange={e => setAlertConfig({...alertConfig, recipient: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none border-red-100" placeholder="destinatario@empresa.com" /></div>
                      <button type="submit" className="w-full bg-[#0d1a2e] text-white py-4 rounded-lg font-bold shadow-lg hover:bg-[#1a2b4e] transition-all flex items-center justify-center"><SaveIcon className="w-5 h-5 mr-2" />{t('saveAlertsButton')}</button>
                  </form>
              </div>
          )}
      </div>

      {/* MODAL: Agregar Usuario */}
      {showAddUserModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border-t-4 border-blue-600">
                  <h4 className="text-xl font-bold mb-6 text-gray-800">{t('addUserTitle')}</h4>
                  <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="flex justify-center mb-6">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              <div className="h-24 w-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center group-hover:border-blue-400 transition-colors shadow-inner">
                                  {newUser.avatar ? <img src={newUser.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-10 w-10 text-gray-300" />}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg"><CameraIcon className="w-4 h-4" /></div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'add')} />
                          </div>
                      </div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('userTableName')}</label><input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('userTableEmail')}</label><input type="text" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('userTablePassword')}</label><input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('roleLabel')}</label><select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="user">{t('roleUser')}</option><option value="admin">{t('roleAdmin')}</option></select></div>
                      <div className="flex justify-end space-x-3 pt-6"><button type="button" onClick={() => setShowAddUserModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700">{t('cancelButton')}</button><button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg">{t('createButton')}</button></div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: Editar Usuario */}
      {showEditUserModal && editUserData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border-t-4 border-blue-600">
                  <h4 className="text-xl font-bold mb-6 text-gray-800">{t('editUserTitle')}</h4>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div className="flex justify-center mb-6">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              <div className="h-24 w-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center group-hover:border-blue-400 transition-colors shadow-inner">
                                  {editUserData.avatar ? <img src={editUserData.avatar} className="h-full w-full object-cover" /> : <UserIcon className="h-10 w-10 text-gray-300" />}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg"><CameraIcon className="w-4 h-4" /></div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} />
                          </div>
                      </div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('userTableName')}</label><input type="text" required value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('userTableEmail')}</label><input type="text" required value={editUserData.username} onChange={e => setEditUserData({...editUserData, username: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">{t('roleLabel')}</label><select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value as any})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="user">{t('roleUser')}</option><option value="admin">{t('roleAdmin')}</option></select></div>
                      <div className="flex justify-end space-x-3 pt-6"><button type="button" onClick={() => setShowEditUserModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700">{t('cancelButton')}</button><button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg">{t('updateButton')}</button></div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: Cambiar Contraseña */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border-t-4 border-blue-600">
                  <h4 className="text-xl font-bold mb-6 text-gray-800">{t('changePasswordTitle')}: {passwordEditingUser}</h4>
                  <form onSubmit={handleSavePassword} className="space-y-4">
                      <input 
                        type="password" 
                        placeholder={t('newPasswordLabel')} 
                        required 
                        value={newPasswordValue} 
                        onChange={e => setNewPasswordValue(e.target.value)} 
                        className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        autoFocus 
                      />
                      <div className="flex justify-end space-x-3 pt-6">
                          <button 
                            type="button" 
                            onClick={() => setShowPasswordModal(false)} 
                            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {t('cancelButton')}
                          </button>
                          <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all"
                          >
                            {t('updateButton')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: Asignar Países Permitidos */}
      {showPermissionsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
                  <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                      <h4 className="text-[22px] font-bold text-[#0d1a2e]">{t('modalPermissionsTitle')}</h4>
                      <button onClick={toggleSelectAll} className="text-sm font-bold text-[#0d1a2e] hover:underline">{t('selectAll')}</button>
                  </div>
                  <div className="px-8 overflow-y-auto flex-grow custom-scrollbar">
                      <div className="border-t border-gray-100 mt-2 pt-6">
                          <div className="grid grid-cols-2 gap-x-12 gap-y-6 pb-6">
                              {COUNTRIES.map(c => (
                                  <label key={c.code} className="flex items-center space-x-3 group cursor-pointer">
                                      <input type="checkbox" checked={tempAllowedCountries.includes(c.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])} className="custom-white-checkbox" />
                                      <div className="flex items-center space-x-3">
                                          <img src={`https://flagcdn.com/w40/${c.code}.png`} className="w-7 h-auto rounded-sm border" alt={c.name} />
                                          <span className="text-[14px] font-medium text-gray-700">{c.name}</span>
                                      </div>
                                  </label>
                              ))}
                          </div>
                          <div className="border-t border-gray-100 mt-4 pt-6 pb-8">
                              <h5 className="text-[13px] font-bold text-[#0d1a2e] mb-4">DHL</h5>
                              <label className="flex items-center space-x-3 group cursor-pointer">
                                  <input type="checkbox" checked={tempAllowedCountries.includes(DHL_DATA.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(DHL_DATA.code) ? prev.filter(x => x !== DHL_DATA.code) : [...prev, DHL_DATA.code])} className="custom-white-checkbox" />
                                  <img src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" className="h-3 w-auto object-contain" alt="DHL" />
                              </label>
                          </div>
                      </div>
                  </div>
                  <div className="px-8 py-6 flex justify-end space-x-4">
                      <button onClick={() => setShowPermissionsModal(false)} className="px-6 py-2.5 rounded bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300 transition-colors">{t('cancelButton')}</button>
                      <button onClick={savePermissions} className="px-6 py-2.5 rounded bg-[#0d1a2e] text-white font-bold text-sm hover:bg-[#1a2b4e] transition-colors shadow-sm">{t('savePermissions')}</button>
                  </div>
              </div>
          </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 10px; }
        .custom-white-checkbox { appearance: none; background-color: #fff; width: 18px; height: 18px; border: 1px solid #d1d5db; border-radius: 4px; display: grid; place-content: center; cursor: pointer; }
        .custom-white-checkbox::before { content: ""; width: 10px; height: 10px; transform: scale(0); box-shadow: inset 1em 1em #0d1a2e; clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%); }
        .custom-white-checkbox:checked::before { transform: scale(1); }
        .custom-white-checkbox:checked { border-color: #0d1a2e; }
      `}} />
    </div>
  );
};

export default AdminDashboard;

