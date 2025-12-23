
import React, { useState, useEffect } from 'react';
import { Country, User } from './types';
import { COUNTRIES, DHL_DATA, USER_STORAGE_KEY } from './constants';
import CountryCard from './components/CountryCard';
import ClubLocations from './components/ClubLocations';
import FinalSelection from './components/FinalSelection';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { useLanguage } from './context/LanguageContext';
import CodeBackground from './components/CodeBackground';
import BrandCard from './components/BrandCard';
import ServerStatusSummary from './components/ServerStatusSummary';

const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [users, setUsers] = useState<User[]>(() => {
    const requiredUsers: User[] = [
        { name: 'Cesar Correa', username: 'cesar', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Nick Pineda', username: 'nick', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Gio Vanegas', username: 'gio', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Mauricio Salmon', username: 'mauricio', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Pablo Estupiñan', username: 'pablo', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Cristian Salazar', username: 'csalazar', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] },
        { name: 'Cristian Ortega', username: 'cortega', password: 'S@ltex7509!', role: 'admin', isDisabled: false, allowedCountries: [] }
    ];
    try {
      const savedUsers = localStorage.getItem(USER_STORAGE_KEY);
      let initialUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      requiredUsers.forEach(reqUser => {
          const index = initialUsers.findIndex(u => u.username === reqUser.username);
          if (index !== -1) initialUsers[index] = { ...initialUsers[index], name: reqUser.name, password: reqUser.password, role: reqUser.role };
          else initialUsers.push(reqUser);
      });
      return initialUsers;
    } catch (error) { return requiredUsers; }
  });

  useEffect(() => { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users)); }, [users]);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const handleLoginSuccess = (user: User, isSuperAdmin: boolean) => {
    setIsAuthenticated(true); setIsAdmin(isSuperAdmin); setCurrentUser(user);
    if (isSuperAdmin) setShowAdminDashboard(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setIsAdmin(false); setCurrentUser(null);
    setShowAdminDashboard(false); setSelectedBrand(null); setSelectedCountry(null); setSelectedClub(null);
  };

  const getFilteredCountries = () => {
      const all = COUNTRIES;
      if (isAdmin || (currentUser && currentUser.role === 'admin')) return all;
      if (currentUser && currentUser.allowedCountries && currentUser.allowedCountries.length > 0) {
          return all.filter(c => currentUser.allowedCountries!.includes(c.code));
      }
      return [];
  };

  const visibleCountries = getFilteredCountries();
  const colombia = visibleCountries.find(c => c.code === 'co');
  const otherCountries = visibleCountries.filter(c => c.code !== 'co');

  const hasDhlAccess = isAdmin || (currentUser?.role === 'admin') || currentUser?.allowedCountries?.includes('dhl');
  const hasPriceSmartAccess = visibleCountries.length > 0;
  const canEditServers = isAdmin || (currentUser?.role === 'admin');

  if (!isAuthenticated) return (
      <div className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden bg-[#0d1a2e]">
        <CodeBackground />
        <Login onLoginSuccess={handleLoginSuccess} users={users} setUsers={setUsers} />
      </div>
  );

  if (showAdminDashboard) return (
        <div className="min-h-screen font-sans flex items-center justify-center p-2 sm:p-4 bg-gray-100">
             <AdminDashboard users={users} setUsers={setUsers} onContinue={() => setShowAdminDashboard(false)} onLogout={handleLogout} currentUser={currentUser} />
        </div>
  );

  const renderContent = () => {
    if (!selectedBrand) return (
        <div>
          <p className="text-gray-600 mb-8 text-center font-semibold text-xl">{t('selectBrandTitle')}</p>
          <div className={`grid ${hasPriceSmartAccess && hasDhlAccess ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' : 'grid-cols-1 max-w-md'} gap-6 mx-auto`}>
            {hasPriceSmartAccess && <BrandCard name="PriceSmart" onClick={() => setSelectedBrand('pricesmart')} />}
            {hasDhlAccess && <BrandCard name="DHL" onClick={() => setSelectedBrand('dhl')} />}
          </div>
        </div>
    );

    if (selectedBrand === 'pricesmart') {
      if (!selectedCountry) return (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('allCountriesTitle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherCountries.map(c => <CountryCard key={c.code} country={c} isSelected={false} onSelect={setSelectedCountry} />)}
          </div>
          {colombia && <div className="mt-4"><CountryCard country={colombia} isSelected={false} onSelect={setSelectedCountry} /></div>}
          
          <div className="mt-8 text-center">
            <button onClick={() => setSelectedBrand(null)} className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#1a2b4e]">{t('backButton')}</button>
          </div>
        </div>
      );
      if (!selectedClub) return <ClubLocations country={selectedCountry} selectedClub={null} onClubSelect={setSelectedClub} onBack={() => setSelectedCountry(null)} />;
      return <FinalSelection country={selectedCountry} clubName={selectedClub} onBack={() => setSelectedClub(null)} canEdit={canEditServers} />;
    }

    if (selectedBrand === 'dhl') {
      if (!selectedClub) return <ClubLocations country={DHL_DATA} selectedClub={null} onClubSelect={setSelectedClub} onBack={() => setSelectedBrand(null)} />;
      return <FinalSelection country={DHL_DATA} clubName={selectedClub} onBack={() => setSelectedClub(null)} canEdit={canEditServers} />;
    }
    return null;
  };
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
       <header className="shadow-md py-3 bg-[#0d1a2e]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
                 <h1 className="text-xl md:text-2xl font-bold text-white">SALTEX GROUP</h1>
                 {(isAdmin || (currentUser?.role === 'admin')) && <button onClick={() => setShowAdminDashboard(true)} className="text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded border border-gray-500">Admin</button>}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <ServerStatusSummary />
                <div className="flex items-center text-white text-xs font-medium border-l border-gray-600 pl-2 sm:pl-4">
                    <button onClick={() => setLanguage('es')} className={`px-2 py-1 rounded-md ${language === 'es' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700'}`}>ES</button>
                    <span className="mx-1 text-gray-500">|</span>
                    <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded-md ${language === 'en' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700'}`}>EN</button>
                </div>
                <button onClick={handleLogout} className="bg-white text-[#0d1a2e] font-bold py-1.5 px-3 rounded-lg shadow hover:bg-gray-100 text-xs sm:text-sm">{t('logoutButton')}</button>
            </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-2 sm:p-4">
        <div className={`w-full max-w-5xl mx-auto rounded-xl shadow-lg bg-white ${selectedBrand === 'dhl' && !selectedClub ? 'p-0 overflow-hidden' : 'p-4 sm:p-8'}`}>
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
