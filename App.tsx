import React, { useState } from 'react';
import { Country } from './types';
import { COUNTRIES, DHL_DATA } from './constants';
import CountryCard from './components/CountryCard';
import ClubLocations from './components/ClubLocations';
import FinalSelection from './components/FinalSelection';
import Login from './components/Login';
import { useLanguage } from './context/LanguageContext';
import CodeBackground from './components/CodeBackground';
import BrandCard from './components/BrandCard';

// Main App Component
const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedBrand(null);
    setSelectedCountry(null);
    setSelectedClub(null);
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

  // As per constants.ts, Colombia is handled specially in the layout.
  const colombia = COUNTRIES.find(c => c.code === 'co');
  const otherCountries = COUNTRIES.filter(c => c.code !== 'co');

  const showFinalSelection = !!selectedClub;

  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundColor: '#0d1a2e' }}
      >
        <CodeBackground />
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- Brand Selection View ---
  const brandSelectionView = (
    <div>
      <p className="text-gray-600 mb-8 text-center font-semibold text-xl">{t('selectBrandTitle')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <BrandCard
          name="PriceSmart"
          onClick={() => handleBrandSelect('pricesmart')}
        />
        <BrandCard
          name="DHL"
          onClick={() => handleBrandSelect('dhl')}
        />
      </div>
    </div>
  );

  // --- PriceSmart Country Selection View ---
  const countrySelectionView = (
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
        />
      );
    }

    return null; // Should not happen
  };
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
       <header className="shadow-md" style={{ backgroundColor: '#0d1a2e' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-xl md:text-2xl font-bold text-white">SALTEX GROUP</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-white text-sm font-medium">
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
                        className="bg-white text-[#0d1a2e] font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1a2e] focus:ring-white text-sm"
                    >
                        {t('logoutButton')}
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex items-center justify-center p-4 mt-4">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
