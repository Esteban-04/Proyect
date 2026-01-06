
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

  if (isDhl) {
    return (
      <div className="relative w-full min-h-[650px] flex flex-col items-center justify-start overflow-hidden rounded-2xl bg-slate-900">
        {/* Background Image for DHL - Optimized for sharpness */}
        <div className="absolute inset-0 z-0">
          <img 
            src={DHL_HEADER_IMAGE} 
            className="w-full h-full object-cover object-center scale-105" 
            alt="DHL Warehouse"
            loading="eager"
          />
          {/* Subtle gradient to ensure text readability without losing image crispness */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center pt-10 pb-12 px-6">
          <div className="mb-2">
            <h1 className="text-[#D40511] text-4xl sm:text-5xl font-black italic tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              DHL GLOBAL
            </h1>
          </div>

          <p className="text-[#D40511] font-black text-lg sm:text-xl mb-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
            {t('selectClubPrompt')}
          </p>

          <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto mb-12">
            {country.clubs?.map((clubName) => (
              <button
                key={clubName}
                onClick={() => onClubSelect(clubName)}
                className="w-full bg-white text-slate-700 py-4 px-6 rounded-xl font-bold text-lg text-left shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:bg-slate-50 transition-all active:scale-[0.98] border border-transparent"
              >
                {clubName}
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            className="bg-[#D40511] hover:bg-[#b0040e] text-white font-black py-4 px-12 rounded-xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative z-10">
        <div className="flex justify-center items-center mb-10">
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
        </div>

        <p className="mb-8 text-center font-bold text-lg text-[#0d1a2e]">
          {t('selectClubPrompt')}
        </p>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {country.clubs?.map((clubName) => (
              <ClubButton
                key={clubName}
                name={clubName}
                isSelected={selectedClub === clubName}
                onClick={onClubSelect}
                isDhl={false}
              />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="bg-[#0d1a2e] hover:bg-[#1a2b4e] text-white font-black py-3 px-10 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubLocations;
