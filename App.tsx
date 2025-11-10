import React, { useState } from 'react';
import { Country } from './types';
import { COUNTRIES } from './constants';
import CountryCard from './components/CountryCard';
import ClubLocations from './components/ClubLocations';
import FinalSelection from './components/FinalSelection';
import Login from './components/Login';
import { useLanguage } from './context/LanguageContext';

// Main App Component
const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedClub(null);
  };
  
  const handleBackToClubs = () => {
    setSelectedClub(null);
  }

  // As per constants.ts, Colombia is handled specially in the layout.
  const colombia = COUNTRIES.find(c => c.code === 'co');
  const otherCountries = COUNTRIES.filter(c => c.code !== 'co');

  const showFinalSelection = !!selectedClub;

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-4">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
       <header className="bg-blue-800 shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-xl md:text-2xl font-bold text-white">SALTEX GROUP</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-white text-sm font-medium">
                       <button 
                         onClick={() => setLanguage('es')}
                         className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'es' ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}
                       >
                         ES
                       </button>
                       <span className="mx-1 text-blue-600">|</span>
                       <button
                         onClick={() => setLanguage('en')}
                         className={`px-2 py-1 rounded-md transition-colors duration-200 ${language === 'en' ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}
                       >
                         EN
                       </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-blue-800 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white text-sm"
                    >
                        {t('logoutButton')}
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex items-center justify-center p-4 mt-4">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
            {!selectedCountry ? (
              // Step 1: Country Selection
              <div>
                <p className="text-gray-600 mb-8 text-center font-semibold text-xl">{t('allCountriesTitle')}</p>
                
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
              </div>
            ) : !showFinalSelection ? (
              // Step 2: Club Selection
              <ClubLocations
                country={selectedCountry}
                selectedClub={selectedClub}
                onClubSelect={handleClubSelect}
                onBack={handleBackToCountries}
              />
            ) : (
              // Step 3: Final Selection
              <FinalSelection
                country={selectedCountry}
                clubName={selectedClub}
                onBack={handleBackToClubs}
              />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;