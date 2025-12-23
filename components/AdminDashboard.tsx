
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
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar URL del backend persistida
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('saltex_backend_url') || 'http://localhost:3001';
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

  const handleSaveAllConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      localStorage.setItem('saltex_backend_url', backendUrl);
      localStorage.setItem('saltex_alert_config', JSON.stringify(alertConfig));
      
      try {
          const response = await fetch(`${backendUrl}/api/config-alerts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: alertConfig })
          });
          if (response.ok) showSuccess(t('globalSaveSuccess'));
      } catch (err) {
          alert("Cambios guardados localmente, pero no se pudo sincronizar con el backend: " + backendUrl);
      }
  };

  const testEmailConnection = async () => {
      setIsTestingEmail(true);
      try {
          const res = await fetch(`${backendUrl}/api/test-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: alertConfig })
          });
          if (res.ok) alert("✅ Correo enviado a " + alertConfig.recipient);
          else alert("❌ Error en el envío.");
      } catch (e) { alert("❌ Backend inalcanzable."); }
      finally { setIsTestingEmail(false); }
  };

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

  // --- User Management Logic ---

  // Fix: Added toggleUserStatus implementation
  const toggleUserStatus = (username: string) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, isDisabled: !u.isDisabled } : u));
    showSuccess(t('userUpdateSuccess'));
  };

  // Fix: Added deleteUser implementation
  const deleteUser = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user && !user.isDisabled) {
        alert(t('deleteActiveUserError'));
        return;
    }
    if (window.confirm(t('confirmDeleteUser'))) {
        setUsers(prev => prev.filter(u => u.username !== username));
        showSuccess(t('userDeleteSuccess'));
    }
  };

  // Fix: Added openPermissionsModal implementation
  const openPermissionsModal = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) {
        setEditingUser(username);
        setTempAllowedCountries(user.allowedCountries || []);
        setShowPermissionsModal(true);
    }
  };

  // Fix: Added savePermissions implementation
  const savePermissions = () => {
    if (editingUser) {
        setUsers(prev => prev.map(u => u.username === editingUser ? { ...u, allowedCountries: tempAllowedCountries } : u));
        setShowPermissionsModal(false);
        showSuccess(t('userUpdateSuccess'));
    }
  };

  const SUPER_ADMIN: User = { name: 'Super Admin', username: 'admin', password: 'Pr1c3sm4rt2025!', role: 'admin', isDisabled: false, allowedCountries: [] };
  const displayUsers = [SUPER_ADMIN, ...users.filter(u => u.username !== 'admin')];

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative font-sans">
      {successMessage && <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">{successMessage}</div>}

      <div className="bg-[#0d1a2e] px-8 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">{t('adminDashboardTitle')}</h2>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                Backend {backendStatus}
              </div>
          </div>
          <p className="text-cyan-200 text-sm font-medium">{t('adminDashboardSubtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            {/* Fix: changed setShowAdminDashboard to onContinue prop */}
            <button onClick={onContinue} className="bg-white text-[#0d1a2e] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-100 shadow-md transition-all active:scale-95 border border-gray-200">{t('goToAppButton')}</button>
            <button onClick={onLogout} className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 shadow-md transition-all active:scale-95">{t('logoutButton')}</button>
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
                                                {/* Fix: call toggleUserStatus */}
                                                <button onClick={() => toggleUserStatus(user.username)} disabled={isSuper} className={`relative h-6 w-11 rounded-full transition-colors ${!user.isDisabled ? 'bg-green-400' : 'bg-gray-300'} disabled:opacity-40`}>
                                                    <span className={`absolute left-1 top-1 inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${!user.isDisabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <span className="text-[13px] font-medium text-gray-400">{user.isDisabled ? t('statusDisabled') : t('statusActive')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center font-bold text-gray-800">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center justify-between">
                                            <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{user.role?.toUpperCase()}</span>
                                            {!isSuper && (
                                                <div className="flex gap-2">
                                                    {/* Fix: call openPermissionsModal and deleteUser */}
                                                    <button onClick={() => openPermissionsModal(user.username)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><GlobeIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => deleteUser(user.username)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
              </div>
          ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-blue-50 p-3 rounded-full"><GlobeIcon className="w-8 h-8 text-blue-600" /></div>
                          <div>
                              <h3 className="text-2xl font-bold text-[#0d1a2e]">Servidor Backend</h3>
                              <p className="text-gray-500 text-sm">Configura la URL donde está alojado tu backend de pings.</p>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">URL DEL BACKEND API</label>
                          <input 
                            type="text" 
                            value={backendUrl} 
                            onChange={e => setBackendUrl(e.target.value)} 
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
                            placeholder="https://mi-backend.render.com"
                          />
                          <p className="text-[10px] text-gray-400">Si estás en local usa <code>http://localhost:3001</code>. Si estás en la nube usa la URL proporcionada por Render/Railway.</p>
                      </div>
                  </div>

                  <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-4 mb-8">
                          <div className="bg-red-50 p-3 rounded-full"><ActivityIcon className="w-8 h-8 text-red-600" /></div>
                          <div>
                              <h3 className="text-2xl font-bold text-[#0d1a2e]">{t('smtpSettingsTitle')}</h3>
                              <p className="text-gray-500 text-sm">Configura alertas para {alertConfig.recipient}</p>
                          </div>
                      </div>
                      <form onSubmit={handleSaveAllConfig} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Host</label><input type="text" value={alertConfig.host} onChange={e => setAlertConfig({...alertConfig, host: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div>
                              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Puerto</label><input type="number" value={alertConfig.port} onChange={e => setAlertConfig({...alertConfig, port: parseInt(e.target.value)})} className="w-full border p-2.5 rounded-lg" /></div>
                          </div>
                          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Usuario SMTP</label><input type="email" value={alertConfig.user} onChange={e => setAlertConfig({...alertConfig, user: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div>
                          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Contraseña</label><input type="password" value={alertConfig.pass} onChange={e => setAlertConfig({...alertConfig, pass: e.target.value})} className="w-full border p-2.5 rounded-lg" /></div>
                          
                          <div className="flex gap-4 pt-4">
                              <button type="submit" className="flex-1 bg-[#0d1a2e] text-white py-4 rounded-lg font-bold shadow-lg hover:bg-[#1a2b4e] transition-all flex items-center justify-center"><SaveIcon className="w-5 h-5 mr-2" />{t('saveChangesButton')}</button>
                              <button type="button" onClick={testEmailConnection} disabled={isTestingEmail} className="flex-1 bg-amber-500 text-white py-4 rounded-lg font-bold shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center disabled:opacity-50">
                                {isTestingEmail ? "Probando..." : "📧 Probar Email"}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
      </div>

      {/* MODAL: Permisos */}
      {showPermissionsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b flex justify-between items-center">
                      <h4 className="text-xl font-bold">{t('modalPermissionsTitle')}</h4>
                      <button onClick={() => setTempAllowedCountries([...COUNTRIES.map(c => c.code), 'dhl'])} className="text-sm font-bold text-blue-600">Select All</button>
                  </div>
                  <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
                      {COUNTRIES.map(c => (
                          <label key={c.code} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                              <input type="checkbox" checked={tempAllowedCountries.includes(c.code)} onChange={() => setTempAllowedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code])} />
                              <span className="text-sm font-medium">{c.name}</span>
                          </label>
                      ))}
                      <label className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer col-span-2 bg-yellow-50 border-yellow-200">
                          <input type="checkbox" checked={tempAllowedCountries.includes('dhl')} onChange={() => setTempAllowedCountries(prev => prev.includes('dhl') ? prev.filter(x => x !== 'dhl') : [...prev, 'dhl'])} />
                          <span className="text-sm font-bold">DHL GLOBAL</span>
                      </label>
                  </div>
                  <div className="p-6 border-t flex justify-end gap-3">
                      <button onClick={() => setShowPermissionsModal(false)} className="px-4 py-2 text-gray-400 font-bold">Cerrar</button>
                      {/* Fix: call savePermissions */}
                      <button onClick={savePermissions} className="bg-[#0d1a2e] text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
