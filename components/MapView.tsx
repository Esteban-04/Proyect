
import React, { useState } from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MapViewProps {
  countries: Country[];
  selectedCountryCode: string | null;
  onSelectCountry: (country: Country) => void;
}

const MapView: React.FC<MapViewProps> = ({ countries, selectedCountryCode, onSelectCountry }) => {
  const { t } = useLanguage();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Coordenadas calibradas (Región Centro, Caribe y Norte de Suramérica)
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 120, y: 220 },
    'sv': { x: 145, y: 255 },
    'hn': { x: 195, y: 225 },
    'ni': { x: 230, y: 275 },
    'cr': { x: 270, y: 325 },
    'pa': { x: 340, y: 335 },
    'co': { x: 440, y: 440 },
    'jm': { x: 280, y: 150 },
    'do': { x: 430, y: 145 },
    'aw': { x: 410, y: 280 },
    'vi': { x: 520, y: 135 },
    'bb': { x: 640, y: 240 },
    'tt': { x: 600, y: 295 },
    'dhl': { x: 50, y: 50 } // Icono especial arriba
  };

  const countryPaths: Record<string, string> = {
    'gt': "M100,200 L140,200 L140,240 L110,250 L95,230 Z",
    'sv': "M135,250 L160,250 L160,265 L135,265 Z",
    'hn': "M155,200 L215,205 L230,245 L165,255 Z",
    'ni': "M220,245 L260,245 L270,300 L210,290 Z",
    'cr': "M265,300 L300,305 L310,340 L260,340 Z",
    'pa': "M315,325 L375,330 L390,360 L320,360 Z",
    'co': "M400,370 L480,370 L540,500 L410,500 L380,430 Z",
    'jm': "M260,145 L310,145 L310,165 L260,165 Z",
    'do': "M410,140 L490,140 L490,170 L410,170 Z",
    'aw': "M400,275 L430,275 L430,295 L400,295 Z",
    'tt': "M580,285 L625,285 L625,315 L580,315 Z",
    'bb': "M630,230 L660,230 L660,260 L630,260 Z",
    'vi': "M510,125 L550,125 L550,145 L510,145 Z"
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-[#0d1a2e] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl select-none group">
      <div className="absolute top-10 left-10 z-20 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                <h3 className="text-white font-black text-3xl tracking-tighter uppercase italic leading-none">Global Infrastructure</h3>
            </div>
            <p className="text-blue-400/50 text-[11px] font-black uppercase tracking-[0.4em]">Saltex Real-time Monitoring</p>
        </div>
      </div>

      <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="#0d1a2e" />
        <rect width="800" height="500" fill="url(#grid)" />

        {countries.map(country => {
          const path = countryPaths[country.code];
          if (!path) return null;
          const isSelected = selectedCountryCode === country.code;
          const isHovered = hoveredCountry === country.code;

          return (
            <path
              key={`path-${country.code}`}
              d={path}
              className="transition-all duration-500 cursor-pointer"
              style={{
                fill: isSelected ? 'rgba(37, 99, 235, 0.5)' : isHovered ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                stroke: isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : 'rgba(255,255,255,0.08)',
                strokeWidth: isSelected || isHovered ? 2.5 : 1
              }}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => onSelectCountry(country)}
            />
          );
        })}

        {countries.map(country => {
          const pos = markerPositions[country.code];
          if (!pos) return null;
          const isHovered = hoveredCountry === country.code;
          const isSelected = selectedCountryCode === country.code;

          return (
            <g key={`marker-${country.code}`} className="cursor-pointer" onClick={() => onSelectCountry(country)}>
                {(isHovered || isSelected) && (
                    <circle cx={pos.x} cy={pos.y} r="35" fill="#3b82f6" className="animate-ping opacity-10" />
                )}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 11 : isHovered ? 9 : 6}
                    className="transition-all duration-300"
                    fill={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : 'rgba(255,255,255,0.4)'}
                    stroke="#0d1a2e"
                    strokeWidth="3"
                    onMouseEnter={() => setHoveredCountry(country.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                />
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-10 right-10 flex flex-col items-end gap-3">
         {hoveredCountry && (
             <div className="bg-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-5 animate-in slide-in-from-right-8 duration-500">
                 <img src={`https://flagcdn.com/w40/${hoveredCountry}.png`} className="w-10 rounded-sm shadow-md" alt="Flag" />
                 <div>
                     <p className="text-slate-900 font-black uppercase text-sm tracking-widest leading-none mb-1">
                        {countries.find(c => c.code === hoveredCountry)?.name}
                     </p>
                     <p className="text-blue-600 font-bold text-[11px] uppercase tracking-wider">
                        {countries.find(c => c.code === hoveredCountry)?.count} {t('allCountriesTitle')}
                     </p>
                 </div>
             </div>
         )}
         <div className="bg-white/5 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
             Satellite Uplink Active
         </div>
      </div>
    </div>
  );
};

export default MapView;
