
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, PlusIcon, GlobeIcon, UserIcon, KeyIcon, PencilIcon, TrashIcon, CameraIcon, XIcon } from '../assets/icons';
import { COUNTRIES, USER_STORAGE_KEY } from '../constants';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onContinue: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 2.25 15v4.5a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25m-19.5 0h19.5" />
  </svg>
);

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
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [originalUsername, setOriginalUsername] = useState<string>('');

  const [backendUrl, setBackendUrl] = useState(() => {
      const saved = localStorage.getItem('saltex_backend_url');
      return saved || '';
  });

  const showSuccess = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
  };

  const syncToCloud = useCallback(async (currentUsersList: User[]) => {
      localStorage.setItem('saltex_backend_url', backendUrl);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUsersList));
      try {
          const base = backendUrl || window.location.origin;
          await fetch(`${base}/api/save-users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ users: currentUsersList })
          });
      } catch (err) {
          console.error("Cloud sync failed", err);
      }
  }, [backendUrl]);

  const handleSaveAll = async () => {
      await syncToCloud(users);
      showSuccess(t('globalSaveSuccess'));
  };

  const toggleUserStatus = async (username: string) => {
    if (username === SUPER_ADMIN_USERNAME) return;
    const updated = users.map(u => u.username === username ? { ...u, isDisabled: !u.isDisabled } : u);
    setUsers(updated);
    await syncToCloud(updated);
  };

  const togglePasswordVisibility = (username: string) => setVisiblePasswords(prev => ({ ...prev, [username]: !prev[username] }));
  
  const changeUserRole = async (username: string, newRole: 'admin' | 'user') => {
      if (username === SUPER_ADMIN_USERNAME) return;
      const updated = users.map(u => u.username === username ? { ...u, role: newRole } : u);
      setUsers(updated);
      await syncToCloud(updated);
  };

  const deleteUser = async (username: string) => {
      if (username === SUPER_ADMIN_USERNAME) return;
      if (window.confirm(t('confirmDeleteUser'))) {
          const updated = users.filter(u => u.username !== username);
          setUsers(updated);
          await syncToCloud(updated);
          showSuccess(t('userDeleteSuccess'));
      }
  };

  const openPermissionsModal = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user) { setEditingUser(username); setTempAllowedCountries(user.allowedCountries || []); setShowPermissionsModal(true); }
  };

  const savePermissions = async () => {
      if (editingUser) {
          const updated = users.map(u => u.username === editingUser ? { ...u, allowedCountries: tempAllowedCountries } : u);
          setUsers(updated);
          setShowPermissionsModal(false);
          await syncToCloud(updated);
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

  const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editUserData) return;
      const updated = users.map(user => user.username === originalUsername ? { ...editUserData } : user);
      setUsers(updated);
      setShowEditUserModal(false);
      await syncToCloud(updated);
      showSuccess(t('userUpdateSuccess'));
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (users.some(u => u.username === newUser.username)) return;
      const updated = [...users, { ...newUser }];
      setUsers(updated);
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '', role: 'user', avatar: '', isDisabled: false, allowedCountries: [] });
      await syncToCloud(updated);
      showSuccess(t('userCreateSuccess'));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'add') {
          setNewUser(prev => ({ ...prev, avatar: base64String }));
        } else if (type === 'edit') {
          setEditUserData(prev => prev ? { ...prev, avatar: base64String } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const SUPER_ADMIN_USERNAME = 'admin';
  const displayUsers = [...users].sort((a, _b) => a.username === SUPER_ADMIN_USERNAME ? -1 : 1);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] relative font-sans">
      {successMessage && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-bounce text-sm uppercase">{successMessage}</div>}

      {/* HEADER EXACTO SEGÚN IMAGEN */}
      <div className="bg-[#0b1626] px-6 sm:px-10 py-10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex flex-col w-full md:w-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-1">{t('adminDashboardTitle')}</h2>
          <p className="text-[#22d3ee] text-base font-medium mb-3">{t('adminDashboardSubtitle')}</p>
          <div className="flex items-center gap-2">
             <UserIcon className="w-4 h-4 text-white/50" />
             <p className="text-white text-xs">
               {t('loggedInAs')} <span className="font-bold">Super Admin</span>
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            {/* Cápsula de idioma oscura más pequeña - AJUSTE PARA EVITAR DESPLAZAMIENTO */}
            <div className="bg-[#1a2b4e] border border-white/10 rounded-lg p-1 flex items-center shrink-0">
                <button 
                  onClick={() => setLanguage('es')} 
                  className={`w-10 py-1.5 text-[10px] font-black rounded-md transition-all ${language === 'es' ? 'bg-[#334155] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  ES
                </button>
                <div className="w-px h-3 bg-white/10 mx-1"></div>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`w-10 py-1.5 text-[10px] font-black rounded-md transition-all ${language === 'en' ? 'bg-[#334155] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  EN
                </button>
            </div>

            {/* Botón Guardar - VERDE */}
            <button onClick={handleSaveAll} className="bg-[#2ecc71] text-white px-6 py-3.5 rounded-xl text-sm font-black hover:bg-[#27ae60] transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap">
              <FolderIcon className="w-5 h-5" /> 
              <span>{t('saveChangesButton')}</span>
            </button>

            {/* Botón Agregar - AZUL */}
            <button onClick={() => setShowAddUserModal(true)} className="bg-[#2563eb] text-white px-6 py-3.5 rounded-xl text-sm font-black hover:bg-[#1d4ed8] transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap">
              <PlusIcon className="w-5 h-5" /> 
              <span>{t('addUserButton')}</span>
            </button>

            {/* Botón Cerrar Sesión - ROJO INTENSO */}
            <button onClick={onLogout} className="bg-[#ff0000] text-white px-6 py-3.5 rounded-xl text-sm font-black hover:bg-[#cc0000] transition-all shadow-lg active:scale-95 whitespace-nowrap">
              {t('logoutButton')}
            </button>

            {/* Botón Ir a la App - BLANCO */}
            <button onClick={onContinue} className="bg-white text-[#0b1626] px-8 py-3.5 rounded-xl text-sm font-black hover:bg-slate-100 transition-all shadow-xl active:scale-95 whitespace-nowrap border-none">
              {t('continueToApp')}
            </button>
        </div>
      </div>

      {/* TABS CON TRADUCCIÓN */}
      <div className="bg-white px-4 sm:px-10 flex border-b shrink-0">
          <button onClick={() => setActiveTab('users')} className={`px-8 py-5 text-sm font-black transition-all border-b-4 uppercase tracking-widest ${activeTab === 'users' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}>{t('usersTab')}</button>
          <button onClick={() => setActiveTab('alerts')} className={`px-8 py-5 text-sm font-black transition-all border-b-4 uppercase tracking-widest ${activeTab === 'alerts' ? 'border-[#0b1626] text-[#0b1626]' : 'border-transparent text-gray-300 hover:text-gray-500'}`}>{t('alertsTab')}</button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow overflow-y-auto bg-[#f8fafc] p-6 sm:p-10">
          {activeTab === 'users' ? (
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-x-auto shadow-sm p-4">
                 <div className="min-w-[900px]">
                    <table className="min-w-full divide-y divide-slate-50">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableStatus')}</th>
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableName')}</th>
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableEmail')}</th>
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTablePassword')}</th>
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-300 uppercase tracking-widest">{t('userTableRole')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {displayUsers.map(user => {
                                const isSuper = user.username === SUPER_ADMIN_USERNAME;
                                return (
                                    <tr key={user.username} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => toggleUserStatus(user.username)} disabled={isSuper} className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-[#2ecc71]' : 'bg-slate-200'} disabled:opacity-30 cursor-pointer`}><span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                                                <span className={`text-[13px] font-medium ${!user.isDisabled ? 'text-slate-400' : 'text-slate-200'}`}>{!user.isDisabled ? t('statusActive') : t('statusDisabled')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-5">
                                                <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-50 flex items-center justify-center text-slate-300 shrink-0 shadow-inner overflow-hidden">{user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <UserIcon className="w-6 h-6" />}</div>
                                                <span className="text-[15px] font-medium text-slate-800 leading-tight">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap"><span className="text-[14px] font-medium text-slate-400">{user.username}</span></td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                              <span className="text-[14px] font-medium text-slate-400 tracking-tighter">••••••</span>
                                              <button onClick={() => togglePasswordVisibility(user.username)} className="text-slate-200 hover:text-slate-400 transition-colors">
                                                <EyeIcon className="h-4 w-4" />
                                              </button>
                                              {!isSuper && (
                                                <button onClick={() => openEditUserModal(user.username)} className="text-slate-200 hover:text-blue-400 transition-colors ml-2 opacity-0 group-hover:opacity-100">
                                                  <PencilIcon className="h-4 w-4" />
                                                </button>
                                              )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                  <select value={user.role} onChange={e => changeUserRole(user.username, e.target.value as any)} disabled={isSuper} className="appearance-none text-[13px] font-medium text-slate-600 border border-slate-200 rounded-xl bg-white px-5 py-2.5 pr-12 focus:border-blue-500 outline-none w-44 disabled:bg-slate-50 transition-all cursor-pointer">
                                                      <option value="admin">{t('roleAdmin')}</option>
                                                      <option value="user">{t('roleUser')}</option>
                                                  </select>
                                                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
                                                </div>
                                                {!isSuper && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                        {user.role === 'user' && <button onClick={() => openPermissionsModal(user.username)} className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title={t('btnManageCountries')}><GlobeIcon className="w-5 h-5" /></button>}
                                                        <button onClick={() => deleteUser(user.username)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title={t('actionDelete')}><TrashIcon className="w-5 h-5" /></button>
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
              <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-6 mb-10">
                        <div className="bg-blue-50 p-6 rounded-2xl text-blue-600 shrink-0 shadow-inner"><GlobeIcon className="w-12 h-12" /></div>
                        <div><h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Backend URL</h3><p className="text-slate-400 text-sm font-bold">API Global Synchronization.</p></div>
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-500 outline-none font-mono text-base shadow-inner transition-all" placeholder="Enter server URL..." />
                    </div>
                  </div>
              </div>
          )}
      </div>

      {/* MODALES */}
      {(showAddUserModal || showEditUserModal || showPermissionsModal) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in duration-300">
                  {showAddUserModal && (
                      <form onSubmit={handleAddUser} className="flex flex-col h-full">
                          <div className="bg-[#0b1626] p-8 flex justify-between items-center"><h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t('addUserTitle')}</h4><button type="button" onClick={() => setShowAddUserModal(false)} className="text-white/40 hover:text-white transition-colors"><XIcon className="w-8 h-8"/></button></div>
                          <div className="p-10 space-y-6 overflow-y-auto grow">
                              <div className="flex justify-center mb-10"><div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="h-32 w-32 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-50 flex items-center justify-center group-hover:border-blue-400 transition-all shadow-xl">{newUser.avatar ? <img src={newUser.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-12 w-12 text-slate-200" />}</div><div className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-full text-white shadow-xl border-4 border-white"><CameraIcon className="w-5 h-5" /></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'add')} /></div></div>
                              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('fullNamePlaceholder')}</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border-2 border-slate-100 p-5 rounded-2xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('usernamePlaceholder')}</label><input required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border-2 border-slate-100 p-5 rounded-2xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('passwordPlaceholder')}</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border-2 border-slate-100 p-5 rounded-2xl bg-slate-50 text-base font-bold outline-none focus:border-blue-500 transition-all" /></div>
                          </div>
                          <div className="p-10 bg-slate-50 border-t flex gap-4"><button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">{t('cancelButton')}</button><button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all">{t('createButton')}</button></div>
                      </form>
                  )}
                  {showPermissionsModal && (
                      <div className="flex flex-col h-full">
                          <div className="p-10 border-b flex justify-between items-center bg-slate-50"><h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{t('modalPermissionsTitle')}</h4><button onClick={() => setTempAllowedCountries(tempAllowedCountries.length === COUNTRIES.length ? [] : COUNTRIES.map(c => c.code))} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">{t('selectAll')}</button></div>
                          <div className="p-10 overflow-y-auto grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {COUNTRIES.map(c => (<label key={c.code} className={`flex items-center gap-4 p-5 border-2 rounded-2xl transition-all cursor-pointer ${tempAllowedCountries.includes(c.code) ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}><input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" checked={tempAllowedCountries.includes(c.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])} /><span className="text-sm font-black uppercase tracking-tight">{c.name}</span></label>))}
                          </div>
                          <div className="p-10 border-t flex gap-4 bg-slate-50"><button onClick={() => setShowPermissionsModal(false)} className="flex-1 py-5 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600">{t('cancelButton')}</button><button onClick={savePermissions} className="flex-1 py-5 bg-[#0b1626] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 active:scale-95 transition-all">{t('savePermissions')}</button></div>
                      </div>
                  )}
                  {showEditUserModal && editUserData && (
                      <form onSubmit={handleUpdateUser} className="p-12 space-y-8">
                          <h4 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">{t('editUserTitle')}</h4>
                          <div className="flex justify-center my-10"><div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className="h-36 w-36 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-50 flex items-center justify-center shadow-2xl">{editUserData.avatar ? <img src={editUserData.avatar} className="h-full w-full object-cover" alt="" /> : <UserIcon className="h-14 w-14 text-slate-200" />}</div><div className="absolute bottom-2 right-2 bg-blue-600 p-3.5 rounded-full text-white shadow-xl border-4 border-white"><CameraIcon className="w-5 h-5" /></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} /></div></div>
                          <div className="space-y-6">
                              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('fullNamePlaceholder')}</label><input required value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="w-full border-2 border-slate-100 p-5 rounded-2xl bg-slate-50 text-slate-800 text-base font-bold outline-none focus:border-blue-500" /></div>
                              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('roleLabel')}</label><select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value as any})} className="w-full border-2 border-slate-100 p-5 rounded-2xl bg-slate-50 text-slate-800 text-base font-black uppercase tracking-widest outline-none appearance-none"><option value="user">{t('roleUser')}</option><option value="admin">{t('roleAdmin')}</option></select></div>
                          </div>
                          <div className="flex justify-end items-center gap-8 mt-12"><button type="button" onClick={() => setShowEditUserModal(false)} className="text-slate-400 font-black uppercase tracking-widest hover:text-slate-600">{t('cancelButton')}</button><button type="submit" className="bg-blue-600 text-white px-12 py-5 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 active:scale-95 transition-all">{t('updateButton')}</button></div>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
