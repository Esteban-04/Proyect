
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon, PlusIcon, TrashIcon, GlobeIcon, UserIcon, LockClosedIcon, KeyIcon, PencilIcon, SaveIcon } from '../assets/icons';
import { COUNTRIES, DHL_DATA, USER_STORAGE_KEY } from '../constants';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State for Permissions Modal
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempAllowedCountries, setTempAllowedCountries] = useState<string[]>([]);

  // State for Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<{name: string, username: string, password: string, role: 'admin' | 'user'}>({ name: '', username: '', password: '', role: 'user' });
  const [newUserError, setNewUserError] = useState<TranslationKey | ''>('');

  // State for Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEditingUser, setPasswordEditingUser] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // State for Edit User Info Modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<{ originalUsername: string, name: string, username: string } | null>(null);
  const [editUserError, setEditUserError] = useState<TranslationKey | ''>('');

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

  const showSuccess = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
  };

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
    if (username === 'admin') return; // Prevent changing super admin
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === username 
          ? { ...user, role: newRole } 
          : user
      )
    );
  };

  const deleteUser = (username: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent weird UI issues
    if (username === 'admin') return; // Prevent deleting super admin
    
    if (window.confirm(t('confirmDeleteUser'))) {
      setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
      showSuccess(t('userDeleteSuccess'));
    }
  };

  // --- Global Save Handler ---
  const handleGlobalSave = () => {
      // Explicitly write to the same standardized key used in App.tsx
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      showSuccess(t('globalSaveSuccess'));
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
          showSuccess(t('passwordUpdateSuccess'));
      }
  };

  // --- Edit User Modal Logic ---
  const openEditUserModal = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user) {
          setEditUserData({ 
              originalUsername: username, 
              name: user.name || '', 
              username: user.username,
          });
          setShowEditUserModal(true);
          setEditUserError('');
      }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editUserData) return;

      // Check if username changed and if it conflicts
      if (editUserData.username !== editUserData.originalUsername) {
          if (editUserData.username === 'admin' || users.some(u => u.username === editUserData.username)) {
              setEditUserError('registerErrorUserExists');
              return;
          }
      }

      setUsers(prevUsers => 
          prevUsers.map(user => 
              user.username === editUserData.originalUsername
              ? { ...user, name: editUserData.name, username: editUserData.username }
              : user
          )
      );
      
      setShowEditUserModal(false);
      setEditUserData(null);
      showSuccess(t('userUpdateSuccess'));
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
          // role is taken from newUser state
          allowedCountries: []
      };

      // Use functional update to ensure we append to the latest state
      setUsers(prevUsers => [...prevUsers, userToAdd]);
      
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', password: '', role: 'user' });
      setNewUserError('');
      showSuccess(t('userCreateSuccess')); // Ensure distinct success message
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-all duration-500 ease-in-out animate-bounce text-center w-11/12 sm:w-auto">
            {successMessage}
        </div>
      )}

      {/* Responsive Header */}
      <div className="bg-[#0d1a2e] px-4 py-4 sm:px-8 sm:py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-1">Admin Dashboard</h2>
          <p className="text-cyan-200 text-xs sm:text-sm">{t('adminDashboardSubtitle')}</p>
          {currentUser && (
            <div className="mt-2 flex items-center justify-center md:justify-start text-sm text-gray-400">
               <UserIcon className="w-4 h-4 mr-1" />
               <span>{t('loggedInAs')} <span className="text-white font-semibold">{currentUser.name || currentUser.username}</span></span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-4 items-center w-full md:w-auto">
             {/* Language Switcher */}
             <div className="flex items-center text-white text-sm font-medium border-r border-gray-600 pr-2 sm:pr-4 mr-1 sm:mr-2">
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
              onClick={handleGlobalSave}
              className="bg-green-600 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center text-xs sm:text-sm"
            >
              <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('globalSaveButton')}</span>
              <span className="sm:hidden">Guardar</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center text-xs sm:text-sm"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('addUserButton')}</span>
               <span className="sm:hidden">Agregar</span>
            </button>

             <button
                onClick={onLogout}
                className="bg-red-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
              >
                {t('logoutButton')}
              </button>
              <button
                onClick={onContinue}
                className="bg-white text-[#0d1a2e] font-bold py-1.5 px-3 sm:py-2 sm:px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-xs sm:text-sm"
              >
                {t('continueToApp')}
              </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-2 sm:p-8 overflow-y-auto bg-gray-50 flex-grow">
        
        {/* Mobile View: Cards */}
        <div className="sm:hidden space-y-4 pb-20">
          {displayUsers.length === 0 ? (
             <div className="text-center text-gray-500 py-8">{t('noRegisteredUsers')}</div>
          ) : (
            displayUsers.map((user) => {
              const isSuperAdmin = user.username === 'admin';
              return (
                <div key={user.username} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
                  {/* Header: Name and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{user.name || 'N/A'}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <UserIcon className="w-3 h-3 mr-1" />
                        <span>{user.username}</span>
                      </div>
                    </div>
                     <button
                        onClick={() => toggleUserStatus(user.username)}
                        disabled={isSuperAdmin}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e] flex-shrink-0 ${
                            isSuperAdmin ? 'bg-green-500 opacity-50 cursor-not-allowed' : (!user.isDisabled ? 'bg-green-500' : 'bg-gray-300')
                        }`}
                    >
                        <span
                            className={`${
                                !user.isDisabled ? 'translate-x-4' : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                  </div>

                  {/* Password Row */}
                  <div className="mb-3 bg-gray-50 rounded p-2 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{t('userTablePassword')}</span>
                      <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-gray-800">
                              {visiblePasswords[user.username] ? user.password : t('passwordHidden')}
                          </span>
                          <button 
                              onClick={() => togglePasswordVisibility(user.username)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                          >
                              {visiblePasswords[user.username] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          </button>
                      </div>
                  </div>

                  {/* Role and Permissions */}
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 flex-grow">
                          <select
                              value={user.role || 'user'}
                              onChange={(e) => changeUserRole(user.username, e.target.value as 'admin' | 'user')}
                              disabled={isSuperAdmin}
                              className={`block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-[#0d1a2e] focus:border-[#0d1a2e] py-1 pl-2 pr-6 bg-white ${isSuperAdmin ? 'bg-gray-100' : ''}`}
                          >
                              <option value="admin">{t('roleAdmin')}</option>
                              <option value="user">{t('roleUser')}</option>
                          </select>
                      </div>
                      
                      {/* Permissions Icon */}
                      {(!user.role || user.role === 'user') && (
                          <button
                            onClick={() => openPermissionsModal(user.username)}
                            disabled={isSuperAdmin}
                            className={`ml-2 text-gray-500 hover:text-[#0d1a2e] p-2 rounded-full hover:bg-gray-100 ${isSuperAdmin ? 'invisible' : ''}`}
                            title={t('btnManageCountries')}
                          >
                            <GlobeIcon className="w-5 h-5" />
                          </button>
                      )}
                  </div>

                  {/* Actions Footer */}
                  <div className="border-t border-gray-100 pt-3 flex justify-end space-x-4">
                        <button
                            onClick={() => openEditUserModal(user.username)}
                            disabled={isSuperAdmin}
                            className={`text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium ${isSuperAdmin ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Editar
                        </button>

                        <button
                            onClick={() => openPasswordModal(user.username)}
                            disabled={isSuperAdmin}
                            className={`text-amber-600 hover:text-amber-800 flex items-center text-sm font-medium ${isSuperAdmin ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <KeyIcon className="w-4 h-4 mr-1" />
                            Pass
                        </button>

                        <button
                            onClick={(e) => deleteUser(user.username, e)}
                            disabled={isSuperAdmin}
                            className={`text-red-600 hover:text-red-800 flex items-center text-sm font-medium ${isSuperAdmin ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Borrar
                        </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableStatus')}
                </th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableName')}
                </th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTableEmail')}
                </th>
                <th className="px-3 py-3 sm:px-6 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {t('userTablePassword')}
                </th>
                 <th className="px-3 py-3 sm:px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
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
                        <td className="px-3 py-3 sm:px-6 whitespace-nowrap">
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
                        <span className="ml-2 text-xs text-gray-500 align-middle hidden sm:inline-block">
                            {!user.isDisabled ? t('statusActive') : t('statusDisabled')}
                        </span>
                        </td>
                        
                        {/* Name */}
                        <td className="px-3 py-3 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name || 'N/A'} {isSuperAdmin && <span className="text-xs text-gray-400 ml-1 hidden sm:inline">(System)</span>}
                        </td>

                        {/* Email/Username */}
                        <td className="px-3 py-3 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                        </td>
                        
                        {/* Password View */}
                        <td className="px-3 py-3 sm:px-6 whitespace-nowrap text-sm text-gray-700 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <span className="font-mono">
                                    {visiblePasswords[user.username] ? user.password : t('passwordHidden')}
                                </span>
                                <button 
                                    onClick={() => togglePasswordVisibility(user.username)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {visiblePasswords[user.username] ? <EyeOffIcon className="w-4 h-4 pointer-events-none" /> : <EyeIcon className="w-4 h-4 pointer-events-none" />}
                                </button>
                            </div>
                        </td>

                        {/* Role & Actions Unified */}
                        <td className="px-3 py-3 sm:px-6 whitespace-nowrap">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={user.role || 'user'}
                                        onChange={(e) => changeUserRole(user.username, e.target.value as 'admin' | 'user')}
                                        disabled={isSuperAdmin}
                                        className={`block w-20 sm:w-32 pl-1 sm:pl-3 pr-4 sm:pr-8 py-1 text-xs sm:text-sm border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] ${isSuperAdmin ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                    >
                                        <option value="admin">{t('roleAdmin')}</option>
                                        <option value="user">{t('roleUser')}</option>
                                    </select>
                                    
                                    {/* Only show manage countries for non-admin users or if user is being edited */}
                                    {(!user.role || user.role === 'user') && (
                                         <button
                                            onClick={() => openPermissionsModal(user.username)}
                                            disabled={isSuperAdmin}
                                            className={`text-gray-400 hover:text-[#0d1a2e] p-1 ${isSuperAdmin ? 'opacity-0 cursor-default' : ''}`}
                                            title={t('btnManageCountries')}
                                         >
                                            <GlobeIcon className="w-5 h-5" />
                                         </button>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    {/* Edit User Info Button */}
                                    <button
                                        onClick={() => openEditUserModal(user.username)}
                                        disabled={isSuperAdmin}
                                        className={`text-blue-600 hover:text-blue-900 p-1 ${isSuperAdmin ? 'opacity-0 cursor-default' : ''}`}
                                        title={t('editUserTooltip')}
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>

                                    {/* Change Password Button */}
                                    <button
                                        onClick={() => openPasswordModal(user.username)}
                                        disabled={isSuperAdmin}
                                        className={`text-amber-600 hover:text-amber-900 p-1 ${isSuperAdmin ? 'opacity-0 cursor-default' : ''}`}
                                        title={t('changePasswordTooltip')}
                                    >
                                        <KeyIcon className="w-5 h-5" />
                                    </button>

                                    {/* Delete User Button */}
                                    <button
                                        onClick={(e) => deleteUser(user.username, e)}
                                        disabled={isSuperAdmin}
                                        className={`text-red-600 hover:text-red-900 p-1 ${isSuperAdmin ? 'opacity-0 cursor-default' : ''}`}
                                        title={t('actionDelete')}
                                    >
                                        <TrashIcon className="w-5 h-5 pointer-events-none" />
                                    </button>
                                </div>
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

      {/* Add User Modal */}
      {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('addUserTitle')}</h3>
                  
                  <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">{t('fullNamePlaceholder')}</label>
                          <input
                            type="text"
                            required
                            value={newUser.name}
                            onChange={(e) => setNewUser(prev => ({...prev, name: e.target.value}))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                          />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">{t('usernamePlaceholder')}</label>
                          <input
                            type="text"
                            required
                            value={newUser.username}
                            onChange={(e) => setNewUser(prev => ({...prev, username: e.target.value}))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">{t('passwordPlaceholder')}</label>
                          <input
                            type="password"
                            required
                            value={newUser.password}
                            onChange={(e) => setNewUser(prev => ({...prev, password: e.target.value}))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                          />
                      </div>
                      
                      {/* Role Selection in Add User Modal */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700">{t('roleLabel')}</label>
                          <select
                            value={newUser.role}
                            onChange={(e) => setNewUser(prev => ({...prev, role: e.target.value as 'admin' | 'user'}))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                          >
                              <option value="user">{t('roleUser')}</option>
                              <option value="admin">{t('roleAdmin')}</option>
                          </select>
                      </div>


                      {newUserError && <p className="text-red-600 text-xs">{t(newUserError)}</p>}

                      <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
                          >
                              {t('cancelButton')}
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                              {t('createButton')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modalPermissionsTitle')}</h3>
                  <div className="mb-4 flex justify-end">
                      <button 
                        onClick={toggleSelectAllCountries}
                        className="text-sm text-[#0d1a2e] hover:underline font-medium"
                      >
                          {t('selectAll')}
                      </button>
                  </div>
                  <div className="overflow-y-auto flex-grow border-t border-b border-gray-200 py-4">
                      <div className="space-y-6">
                         {/* PriceSmart Section */}
                         <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 tracking-wide border-b pb-1">PriceSmart</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {COUNTRIES.map((country) => (
                                    <label key={country.code} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={tempAllowedCountries.includes(country.code)}
                                            onChange={() => toggleCountryPermission(country.code)}
                                            className="rounded text-[#0d1a2e] focus:ring-[#0d1a2e] h-4 w-4 border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">{country.name}</span>
                                    </label>
                                ))}
                            </div>
                         </div>

                         {/* DHL Section */}
                         <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase mb-2 tracking-wide border-b pb-1">DHL</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <label key={DHL_DATA.code} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={tempAllowedCountries.includes(DHL_DATA.code)}
                                        onChange={() => toggleCountryPermission(DHL_DATA.code)}
                                        className="rounded text-[#0d1a2e] focus:ring-[#0d1a2e] h-4 w-4 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">{DHL_DATA.name}</span>
                                </label>
                            </div>
                         </div>
                      </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowPermissionsModal(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
                      >
                          {t('cancelButton')}
                      </button>
                      <button
                        onClick={savePermissions}
                        className="bg-[#0d1a2e] text-white px-4 py-2 rounded-md hover:bg-[#1a2b4e] text-sm font-medium"
                      >
                          {t('savePermissions')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('changePasswordTitle')}</h3>
                <form onSubmit={handleSavePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('newPasswordLabel')}</label>
                        <input
                            type="text"
                            required
                            value={newPasswordValue}
                            onChange={(e) => setNewPasswordValue(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
                        >
                            {t('cancelButton')}
                        </button>
                        <button
                            type="submit"
                            className="bg-[#0d1a2e] text-white px-4 py-2 rounded-md hover:bg-[#1a2b4e] text-sm font-medium"
                        >
                            {t('updateButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Edit User Info Modal */}
      {showEditUserModal && editUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('editUserTitle')}</h3>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('fullNamePlaceholder')}</label>
                        <input
                            type="text"
                            required
                            value={editUserData.name}
                            onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('usernamePlaceholder')}</label>
                        <input
                            type="text"
                            required
                            value={editUserData.username}
                            onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                        />
                    </div>

                    {editUserError && <p className="text-red-600 text-xs">{t(editUserError)}</p>}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowEditUserModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
                        >
                            {t('cancelButton')}
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
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
