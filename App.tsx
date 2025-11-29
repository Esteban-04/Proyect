
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

// Main App Component
const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Track if super admin (hardcoded)
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Track currently logged in user
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); // Toggle dashboard view

  // User Data State (Moved from Login.tsx)
  const [users, setUsers] = useState<User[]>(() => {
    // Define the required users as per request
    const requiredUsers: User[] = [
        {
            name: 'Cesar Correa',
            username: 'cesar',
            password: 'S@ltex7509!',
            role: 'user',
            isDisabled: false,
            allowedCountries: []
        },
        {
            name: 'Nick Pineda',
            username: 'nick',
            password: 'S@ltex7509!',
            role: 'user',
            isDisabled: false,
            allowedCountries: []
        },
        {
            name: 'Gio Vanegas',
            username: 'gio',
            password: 'S@ltex7509!',
            role: 'user',
            isDisabled: false,
            allowedCountries: []
        }
    ];

    try {
      // Use shared constant key to ensure consistency
      const savedUsers = localStorage.getItem(USER_STORAGE_KEY);
      let initialUsers: User[] = [];

      if (savedUsers) {
         const parsed = JSON.parse(savedUsers);
         if (Array.isArray(parsed)) {
             initialUsers = parsed;
         }
      }

      // Data Sanitization: Ensure all users have a valid role
      initialUsers = initialUsers.map(u => ({
          ...u,
          role: u.role || 'user', // Default to 'user' if undefined
          isDisabled: u.isDisabled || false,
          allowedCountries: u.allowedCountries || []
      }));

      // Merge required users into initialUsers
      requiredUsers.forEach(reqUser => {
          const index = initialUsers.findIndex(u => u.username === reqUser.username);
          
          if (index !== -1) {
              // User exists: Update credentials and role to match request
              initialUsers[index] = {
                  ...initialUsers[index],
                  name: reqUser.name,
                  password: reqUser.password,
                  role: reqUser.role
              };
          } else {
              // User does not exist: Add them
              initialUsers.push(reqUser);
          }
      });

      return initialUsers.length > 0 ? initialUsers : requiredUsers;

    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      // Fallback with required users
      return requiredUsers;
    }
  });

  // Save users to local storage when updated
  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Navigation State
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const handleLoginSuccess = (user: User, isSuperAdmin: boolean) => {
    setIsAuthenticated(true);
    setIsAdmin(isSuperAdmin);
    setCurrentUser(user);
    
    // Determine if we should show dashboard immediately
    // If super admin -> yes
    // If normal admin user -> maybe, but for now let's stick to the explicit "Admin" button or initial logic
    if (isSuperAdmin) {
        setShowAdminDashboard(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setShowAdminDashboard(false);
    setSelectedBrand(null);
    setSelectedCountry(null);
    setSelectedClub(null);
  };

  const handleContinueToApp = () => {
      setShowAdminDashboard(false);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedCountry(null);
    setSelectedClub(null);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSelectedClub(null); // Reset club when country changes
  };

  const handleClubSelect = (club: string) => {
    setSelectedClub(club);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setSelectedCountry(null);
    setSelectedClub(null);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedClub(null);
  };
  
  const handleBackToClubs = () => {
    setSelectedClub(null);
  }

  // Filter Countries Logic based on Permissions
  // If admin or super admin, show all.
  // If normal user, filter based on allowedCountries.
  const getFilteredCountries = () => {
      const all = COUNTRIES;
      
      // If super admin or user has 'admin' role, show all
      if (isAdmin || (currentUser && currentUser.role === 'admin')) {
          return all;
      }

      // If normal user, filter
      if (currentUser && currentUser.allowedCountries && currentUser.allowedCountries.length > 0) {
          return all.filter(c => currentUser.allowedCountries!.includes(c.code));
      }

      // If no allowed countries specified for normal user, return empty (or decide default)
      // Based on prompt, admin "activates" countries, so default is likely none.
      return [];
  };

  const visibleCountries = getFilteredCountries();
  
  // As per constants.ts, Colombia is handled specially in the layout.
  const colombia = visibleCountries.find(c => c.code === 'co');
  const otherCountries = visibleCountries.filter(c => c.code !== 'co');

  const showFinalSelection = !!selectedClub;
  
  // Check if we are currently in a view that requires full-bleed background (Club Selection)
  // This applies ONLY to DHL now, as PriceSmart background was removed.
  const isClubSelectionView = (selectedBrand === 'dhl' && !selectedClub);

  // Permission checks for Brands
  const hasDhlAccess = isAdmin || (currentUser?.role === 'admin') || currentUser?.allowedCountries?.includes('dhl');
  const hasPriceSmartAccess = visibleCountries.length > 0;

  // Determine if the current user has edit permissions (Super Admin or 'admin' role)
  const canEditServers = isAdmin || (currentUser?.role === 'admin');

  // --- 1. Not Authenticated ---
  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundColor: '#0d1a2e' }}
      >
        <CodeBackground />
        <Login 
            onLoginSuccess={handleLoginSuccess} 
            users={users} 
            setUsers={setUsers}
        />
      </div>
    );
  }

  // --- 2. Admin Dashboard (Only for Admin, before App) ---
  if (showAdminDashboard) {
      return (
        <div 
            className="min-h-screen font-sans flex items-center justify-center p-2 sm:p-4 relative overflow-hidden bg-gray-100"
        >
             <AdminDashboard 
                users={users} 
                setUsers={setUsers} 
                onContinue={handleContinueToApp}
                onLogout={handleLogout}
                currentUser={currentUser}
             />
        </div>
      );
  }

  // --- 3. Main Application Views ---
  
  // Determine layout for brand selection
  // If both brands are available, use 2 columns. If only one, use 1 column centered.
  const showBothBrands = hasPriceSmartAccess && hasDhlAccess;
  const brandGridClass = showBothBrands ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' : 'grid-cols-1 max-w-md';

  const brandSelectionView = (
    <div>
      <p className="text-gray-600 mb-8 text-center font-semibold text-xl">{t('selectBrandTitle')}</p>
      <div className={`grid ${brandGridClass} gap-6 sm:gap-8 mx-auto transition-all duration-300`}>
        {hasPriceSmartAccess && (
            <BrandCard
            name="PriceSmart"
            onClick={() => handleBrandSelect('pricesmart')}
            />
        )}
        {hasDhlAccess && (
            <BrandCard
            name="DHL"
            onClick={() => handleBrandSelect('dhl')}
            />
        )}
        {(!hasPriceSmartAccess && !hasDhlAccess) && (
            <div className="col-span-1 text-center p-8 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-gray-500 font-medium">{t('noAccessMessage')}</p>
            </div>
        )}
      </div>
    </div>
  );

  // --- PriceSmart Country Selection View ---
  const countrySelectionView = (
    <div>
      <p className="text-gray-600 mb-8 text-center font-semibold text-xl">{t('allCountriesTitle')}</p>
      
      {visibleCountries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
              No countries assigned to your account.
          </div>
      ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherCountries.map((country) => (
                <CountryCard
                    key={country.code}
                    country={country}
                    isSelected={selectedCountry?.code === country.code}
                    onSelect={handleCountrySelect}
                />
                ))}
            </div>
            {colombia && (
                <div className="mt-4">
                    <CountryCard
                    key={colombia.code}
                    country={colombia}
                    isSelected={selectedCountry?.code === colombia.code}
                    onSelect={handleCountrySelect}
                    />
                </div>
            )}
          </>
      )}
      
      <div className="mt-8 text-center">
        <button
          onClick={handleBackToBrands}
          className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#1a2b4e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
        >
          {t('backButton')}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!selectedBrand) {
      return brandSelectionView;
    }

    if (selectedBrand === 'pricesmart') {
      if (!selectedCountry) {
        return countrySelectionView;
      }
      if (!showFinalSelection) {
        return (
          <ClubLocations
            country={selectedCountry}
            selectedClub={selectedClub}
            onClubSelect={handleClubSelect}
            onBack={handleBackToCountries}
          />
        );
      }
      return (
        <FinalSelection
          country={selectedCountry}
          clubName={selectedClub}
          onBack={handleBackToClubs}
          canEdit={canEditServers}
        />
      );
    }

    if (selectedBrand === 'dhl') {
      if (!selectedClub) {
        return (
          <ClubLocations
            country={DHL_DATA}
            selectedClub={selectedClub}
            onClubSelect={handleClubSelect}
            onBack={handleBackToBrands}
          />
        );
      }
      return (
        <FinalSelection
          country={DHL_DATA}
          clubName={selectedClub}
          onBack={handleBackToClubs}
          canEdit={canEditServers}
        />
      );
    }

    return null; // Should not happen
  };
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
       {/* Updated Header for Responsiveness */}
       <header className="shadow-md py-3" style={{ backgroundColor: '#0d1a2e' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                     <h1 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">SALTEX GROUP</h1>
                     {/* Show Admin button if user is Super Admin OR has admin role */}
                     {(isAdmin || (currentUser?.role === 'admin')) && !showAdminDashboard && (
                         <button 
                            onClick={() => setShowAdminDashboard(true)}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded border border-gray-500"
                         >
                             Admin
                         </button>
                     )}
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex items-center text-white text-xs sm:text-sm font-medium">
                       <button 
                         onClick={() => setLanguage('es')}
                         className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'es' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700'}`}
                       >
                         ES
                       </button>
                       <span className="mx-1 text-gray-500">|</span>
                       <button
                         onClick={() => setLanguage('en')}
                         className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'en' ? 'bg-white text-[#0d1a2e]' : 'hover:bg-gray-700'}`}
                       >
                         EN
                       </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-[#0d1a2e] font-semibold py-1.5 px-3 sm:px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1a2e] focus:ring-white text-xs sm:text-sm whitespace-nowrap"
                    >
                        {t('logoutButton')}
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-2 sm:p-4">
        <div className={`w-full max-w-5xl mx-auto rounded-xl shadow-lg bg-white ${isClubSelectionView ? 'p-0 overflow-hidden' : 'p-4 sm:p-6 md:p-8'}`}>
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
