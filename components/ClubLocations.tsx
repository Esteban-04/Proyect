
import React from 'react';
import { Country } from '../types';
import ClubButton from './ClubButton';
import { useLanguage } from '../context/LanguageContext';

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
    <div className="relative w-full">
      <div className="relative z-10">
        <div className="flex justify-center items-center mb-10">
          {isDhl ? (
            <div className="flex items-center gap-4 py-4">
              <span className="text-[#D40511] text-3xl sm:text-5xl font-black italic tracking-tighter">
                DHL GLOBAL
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-8 h-auto md:w-10 rounded-sm shadow-md"
              />
              <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-[#0d1a2e]">
                {country.name}
              </h2>
            </div>
          )}
        </div>

        <p className={`mb-8 text-center font-bold text-lg ${isDhl ? 'text-[#00172f]' : 'text-[#0d1a2e]'}`}>
          {t('selectClubPrompt')}
        </p>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {country.clubs?.map((clubName) => (
              <ClubButton
                key={clubName}
                name={clubName}
                isSelected={selectedClub === clubName}
                onClick={onClubSelect}
                isDhl={isDhl}
              />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className={`${isDhl ? 'bg-[#D40511] hover:bg-[#b0040e]' : 'bg-[#0d1a2e] hover:bg-[#1a2b4e]'} text-white font-black py-3 px-10 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs`}
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubLocations;
