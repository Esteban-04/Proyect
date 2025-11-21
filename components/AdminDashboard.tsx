
import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, TrashIcon, GlobeIcon, UserIcon, LockClosedIcon, KeyIcon } from '../assets/icons';
import { COUNTRIES, DHL_DATA } from '../constants';
import { translations } from '../lib/i18n';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onContinue: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

type TranslationKey = keyof typeof translations.es;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, onContinue, onLogout, currentUser }) => {
  const { t, language, setLanguage } = useLanguage();
  
  // State for password visibility (map of username -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  // State for Permissions Modal
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempAllowedCountries, setTempAllowedCountries] = useState<string[]>([]);

  // State for Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [newUserError, setNewUserError] = useState<TranslationKey | ''>('');

  // State for Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEditingUser, setPasswordEditingUser] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Hardcoded Super Admin
  const SUPER_ADMIN: User = {
    name: 'Super Admin',
    username: 'admin',
    password: 'Pr1c3sm4rt2025!',
    role: 'admin',
    isDisabled: false,
    allowedCountries: [] // Implicitly all
  };

  // Combine Super Admin with registered users for display
  // Filter out any registered user named 'admin' to avoid duplicates if one was created manually
  const displayUsers = [SUPER_ADMIN, ...users.filter(u => u.username !== 'admin')];

  const toggleUserStatus = (username: string) => {
    if (username === 'admin') return; // Prevent disabling super admin
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === username 
          ? { ...user, isDisabled: !user.isDisabled } 
          : user
      )
    );
  };

  const togglePasswordVisibility = (username: string) => {
    setVisiblePasswords(prev => ({
        ...prev,
        [username]: !prev[username]
    }));
  };

  const changeUserRole = (username: string, newRole: 'admin' | 'user') => {
      if (username === 'admin') return; // Prevent changing super admin role
      setUsers(prevUsers => 
        prevUsers.map(user => 
            user.username === username
            ? { ...user, role: newRole }
            : user
        )
      );
  };

  const deleteUser = (username: string) => {
    if (username === 'admin') return; // Prevent deleting super admin
    if (window.confirm(t('confirmDeleteUser'))) {
      setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
    }
  };

  // --- Permissions Modal Logic ---
  const openPermissionsModal = (username: string) => {
      const user = displayUsers.find(u => u.username === username);
      if (user) {
          setEditingUser(username);
          setTempAllowedCountries(user.allowedCountries || []);
          setShowPermissionsModal(true);
      }
  };

  const toggleCountryPermission = (code: string) => {
      setTempAllowedCountries(prev => {
          if (prev.includes(code)) {
              return prev.filter(c => c !== code);
          } else {
              return [...prev, code];
          }
      });
  };

  const toggleSelectAllCountries = () => {
      const allCodes = [...COUNTRIES.map(c => c.code), DHL_DATA.code];
      if (tempAllowedCountries.length === allCodes.length) {
          setTempAllowedCountries([]);
      } else {
          setTempAllowedCountries(allCodes);
      }
  };

  const savePermissions = () => {
      if (editingUser) {
          if (editingUser === 'admin') {
             setShowPermissionsModal(false);
             setEditingUser(null);
             return;
          }

          setUsers(prevUsers => 
            prevUsers.map(user => 
                user.username === editingUser
                ? { ...user, allowedCountries: tempAllowedCountries }
                : user
            )
          );
          setShowPermissionsModal(false);
          setEditingUser(null);
      }
  };

  // --- Change Password Modal Logic ---
  const openPasswordModal = (username: string) => {
      setPasswordEditingUser(username);
      setNewPasswordValue('');
      setShowPasswordModal(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordEditingUser && newPasswordValue) {
          if (passwordEditingUser === 'admin') return; // Security check

          setUsers(prevUsers => 
            prevUsers.map(user => 
                user.username === passwordEditingUser
                ? { ...user, password: newPasswordValue }
                : user
            )
          );
          setShowPasswordModal(false);
          setPasswordEditingUser(null);
          setNewPasswordValue('');
      }
  };


  // --- Add User Modal Logic ---
  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (newUser.username === 'admin') {
           setNewUserError('registerErrorUserExists'); // Technically name reserved
           return;
      }
      // Check against current users prop for validation
      if (users.some(u => u.username === newUser.username)) {
          setNewUserError('registerErrorUserExists');
          return;
      }
      
      const userToAdd: User = {
          ...newUser,
          isDisabled: false,
          role: 'user',
          allowedCountries: []
      };

      // Use functional update to ensure we append to the latest state
      setUsers(prevUsers => [...prevUsers, userToAdd]);
      
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '' });
      setNewUserError('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="bg-[#0d1a2e] px-8 py-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h2>
          <p className="text-cyan-200 text-sm">{t('adminDashboardSubtitle')}</p>
          {currentUser && (
            <div className="mt-2 flex items-center text-sm text-gray-400">
               <UserIcon className="w-4 h-4 mr-1" />
               <span>{t('loggedInAs')} <span className="text-white font-semibold">{currentUser.name || currentUser.username}</span></span>
            </div>
          )}
        </div>
        <div className="flex space-x-4 items-center">
             {/* Language Switcher */}
             <div className="flex items-center text-white text-sm font-medium border-r border-gray-600 pr-4 mr-2">
               <button 
                 onClick={() => setLanguage('es')}
                 className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'es' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700 text-gray-300'}`}
               >
                 ES
               </button>
               <span className="mx-1 text-gray-500">|</span>
               <button
                 onClick={() => setLanguage('en')}
                 className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'en' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700 text-gray-300'}`}
               >
                 EN
               </button>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t('addUserButton')}
            </button>

             <button
                onClick={onLogout}
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm"
              >
                {t('logoutButton')}
              </button>
              <button
                onClick={onContinue}
                className="bg-white text-[#0d1a2e] font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                {t('continueToApp')}
              </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 overflow-auto bg-gray-50 flex-grow">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableEmail')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTablePassword')}
                </th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableRole')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t('noRegisteredUsers')}
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => {
                  const isSuperAdmin = user.username === 'admin';
                  return (
                    <tr key={user.username} className="hover:bg-gray-50 transition-colors">
                        {/* Status Toggle */}
                        <td className="px-6 py-4 whitespace-nowrap">
                        <button
                            onClick={() => toggleUserStatus(user.username)}
                            disabled={isSuperAdmin}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e] ${
                                isSuperAdmin ? 'bg-green-500 opacity-50 cursor-not-allowed' : (!user.isDisabled ? 'bg-green-500' : 'bg-gray-300')
                            }`}
                        >
                            <span
                                className={`${
                                    !user.isDisabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                        <span className="ml-2 text-xs text-gray-500 align-middle">
                            {!user.isDisabled ? t('statusActive') : t('statusDisabled')}
                        </span>
                        </td>
                        
                        {/* Name */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name || 'N/A'} {isSuperAdmin && <span className="text-xs text-gray-400 ml-1">(System)</span>}
                        </td>

                        {/* Email/Username */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                        </td>
                        
                        {/* Password View */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <span className="font-mono">
                                    {visiblePasswords[user.username] ? user.password : t('passwordHidden')}
                                </span>
                                <button 
                                    onClick={() => togglePasswordVisibility(user.username)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {visiblePasswords[user.username] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </td>

                        {/* Role & Actions Unified */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={user.role || 'user'}
                                        onChange={(e) => changeUserRole(user.username, e.target.value as 'admin' | 'user')}
                                        disabled={isSuperAdmin}
                                        className={`block w-32 pl-3 pr-8 py-1 text-sm text-gray-900 border-gray-300 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm rounded-md bg-gray-50 ${isSuperAdmin ? 'cursor-not-allowed text-gray-500 bg-gray-100' : 'cursor-pointer'}`}
                                    >
                                        <option value="user">{t('roleUser')}</option>
                                        <option value="admin">{t('roleAdmin')}</option>
                                    </select>
                                    
                                    {user.role !== 'admin' && !isSuperAdmin && (
                                        <button
                                            onClick={() => openPermissionsModal(user.username)}
                                            className="text-[#0d1a2e] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                                            title={t('modalPermissionsTitle')}
                                        >
                                            <GlobeIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                
                                {!isSuperAdmin && (
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => openPasswordModal(user.username)}
                                            className="text-amber-600 hover:text-amber-800 p-1.5 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                                            title={t('changePasswordTooltip')}
                                        >
                                            <KeyIcon className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => deleteUser(user.username)}
                                            className="text-gray-400 hover:text-red-600 p-1.5 transition-colors"
                                            title={t('actionDelete')}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                );
               })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh]">
                  <div className="bg-gray-100 px-6 py-4 rounded-t-xl border-b border-gray-200 flex justify-between items-center">
                      <div>
                         <h3 className="text-lg font-bold text-gray-800">{t('modalPermissionsTitle')}</h3>
                         <p className="text-sm text-gray-500">{editingUser}</p>
                      </div>
                      <button 
                        onClick={() => setShowPermissionsModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto">
                      <div className="flex justify-end mb-4">
                          <button 
                            onClick={toggleSelectAllCountries}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                              {t('selectAll')}
                          </button>
                      </div>
                      
                      {/* PriceSmart Section */}
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">PriceSmart</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                          {COUNTRIES.map(country => (
                              <label key={country.code} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                  <input 
                                    type="checkbox" 
                                    checked={tempAllowedCountries.includes(country.code)}
                                    onChange={() => toggleCountryPermission(country.code)}
                                    className="h-5 w-5 text-[#0d1a2e] focus:ring-[#0d1a2e] border-gray-300 rounded"
                                  />
                                  <div className="flex items-center space-x-2">
                                      <img 
                                        src={`https://flagcdn.com/w40/${country.code}.png`} 
                                        alt={country.name}
                                        className="w-6 h-auto shadow-sm rounded-sm" 
                                      />
                                      <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                  </div>
                              </label>
                          ))}
                      </div>

                      {/* DHL Section */}
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">DHL</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <label key={DHL_DATA.code} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={tempAllowedCountries.includes(DHL_DATA.code)}
                                onChange={() => toggleCountryPermission(DHL_DATA.code)}
                                className="h-5 w-5 text-[#0d1a2e] focus:ring-[#0d1a2e] border-gray-300 rounded"
                              />
                              <div className="flex items-center space-x-2">
                                  <div className="w-6 h-4 bg-[#FFCC00] flex items-center justify-center rounded-sm shadow-sm border border-gray-200">
                                      <span className="text-[8px] font-black text-[#D40511]">DHL</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{DHL_DATA.name}</span>
                              </div>
                          </label>
                      </div>
                  </div>

                  <div className="bg-gray-100 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end space-x-3">
                      <button 
                        onClick={() => setShowPermissionsModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                      >
                          {t('closeButton')}
                      </button>
                      <button 
                        onClick={savePermissions}
                        className="px-4 py-2 bg-[#0d1a2e] text-white rounded-lg hover:bg-[#1a2b4e] font-medium shadow-md"
                      >
                          {t('savePermissions')}
                      </button>
                  </div>
              </div>
          </div>
      )}

       {/* Add User Modal */}
       {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="bg-gray-100 px-6 py-4 rounded-t-xl border-b border-gray-200">
               <h3 className="text-lg font-bold text-gray-800">{t('addUserTitle')}</h3>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {newUserError && <p className="text-red-600 text-sm">{t(newUserError)}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullNamePlaceholder')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={newUser.name}
                            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#0d1a2e] focus:border-[#0d1a2e]"
                            placeholder="John Doe"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('usernamePlaceholder')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#0d1a2e] focus:border-[#0d1a2e]"
                            placeholder="username"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('passwordPlaceholder')}</label>
                     <div className="relative">
                        <input
                            type="text"
                            required
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#0d1a2e] focus:border-[#0d1a2e]"
                            placeholder="********"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                    >
                        {t('cancelButton')}
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
                    >
                        {t('createButton')}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="bg-gray-100 px-6 py-4 rounded-t-xl border-b border-gray-200">
               <h3 className="text-lg font-bold text-gray-800">{t('changePasswordTitle')}</h3>
               <p className="text-sm text-gray-500">{passwordEditingUser}</p>
            </div>
            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPasswordLabel')}</label>
                     <div className="relative">
                        <input
                            type="text"
                            required
                            value={newPasswordValue}
                            onChange={(e) => setNewPasswordValue(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#0d1a2e] focus:border-[#0d1a2e]"
                            placeholder="********"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
                    >
                        {t('cancelButton')}
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-[#0d1a2e] text-white rounded-lg hover:bg-[#1a2b4e] font-medium shadow-md"
                    >
                        {t('updateButton')}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
