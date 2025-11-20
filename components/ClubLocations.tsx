
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

  // Use full bleed layout ONLY for DHL
  const containerClass = isDhl ? 'rounded-xl overflow-hidden' : '';
  const paddingClass = isDhl ? 'p-8 md:p-12' : '';

  return (
    <div className={`relative w-full ${containerClass}`}>
      {/* Background Image for DHL */}
      {isDhl && (
        <>
           <div 
             className="absolute inset-0 z-0"
             style={{
               backgroundImage: `url('https://www.freightwaves.com/wp-content/uploads/2025/08/05/DHL-Post-EVs_1.jpg')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
             }}
           />
           {/* Overlay with very low opacity (20%) to keep the image sharp and clear */}
           <div className="absolute inset-0 z-0 bg-white/20" />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 ${paddingClass}`}>
        <div className="flex justify-center items-center mb-8">
          {isDhl ? (
            <h2 className="text-5xl font-black italic text-[#D40511] tracking-tighter drop-shadow-md">
              {country.name}
            </h2>
          ) : (
            <>
              <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-10 h-auto mr-4 rounded-sm shadow-md"
              />
              <h2 className="text-2xl font-bold text-[#0d1a2e] drop-shadow-sm">
                {country.name}
              </h2>
            </>
          )}
        </div>
        <p className={`mb-6 text-center font-bold ${isDhl ? 'text-[#D40511] drop-shadow-sm' : 'text-[#0d1a2e]'}`}>
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
        
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className={`${isDhl ? 'bg-[#D40511] hover:bg-[#b0040e] focus:ring-[#D40511]' : 'bg-[#0d1a2e] hover:bg-[#1a2b4e] focus:ring-[#0d1a2e]'} text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {t('backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubLocations;
