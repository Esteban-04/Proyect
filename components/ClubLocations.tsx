
import React from 'react';
import { Country } from '../types';
import ClubButton from './ClubButton';
import { useLanguage } from '../context/LanguageContext';
import { DHL_HEADER_IMAGE } from '../assets/dhl-header-image';

interface ClubLocationsProps {
  country: Country;
  selectedClub: string | null;
  onClubSelect: (club: string) => void;
  onBack: () => void;
}

const ClubLocations: React.FC<ClubLocationsProps> = ({
  country,
  selectedClub,
  onClubSelect,
  onBack,
}) => {
  const { t } = useLanguage();
  const isDhl = country.code === 'dhl';

  return (
    <div>
      {isDhl && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <img 
            src={DHL_HEADER_IMAGE} 
            alt="DHL Logistics" 
            className="w-full h-48 object-cover object-center"
          />
        </div>
      )}
      <div className="flex justify-center items-center mb-8">
        {isDhl ? (
          <h2 className="text-5xl font-black italic text-[#D40511] tracking-tighter">
            {country.name}
          </h2>
        ) : (
          <>
            <img
              src={`https://flagcdn.com/w40/${country.code}.png`}
              alt={`${country.name} flag`}
              className="w-10 h-auto mr-4 rounded-sm shadow-md"
            />
            <h2 className="text-2xl font-bold text-gray-800">
              {country.name}
            </h2>
          </>
        )}
      </div>
      <p className="text-gray-600 mb-6 text-center font-bold">
        {t('selectClubPrompt')}
      </p>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {country.clubs?.map((clubName) => (
            <ClubButton
              key={clubName}
              name={clubName}
              isSelected={selectedClub === clubName}
              onClick={onClubSelect}
            />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#1a2b4e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
        >
          {t('backButton')}
        </button>
      </div>
    </div>
  );
};

export default ClubLocations;
