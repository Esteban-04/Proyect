
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

  // Coordenadas calibradas para el centro de cada país en el SVG
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 195, y: 242 },
    'hn': { x: 222, y: 238 },
    'sv': { x: 204, y: 252 },
    'ni': { x: 232, y: 255 },
    'cr': { x: 245, y: 272 },
    'pa': { x: 265, y: 275 },
    'co': { x: 300, y: 320 },
    'jm': { x: 240, y: 215 },
    'do': { x: 295, y: 212 },
    'aw': { x: 285, y: 252 },
    'vi': { x: 325, y: 205 },
    'bb': { x: 360, y: 245 },
    'tt': { x: 350, y: 265 },
  };

  const worldPaths = {
    region: [
        "M50,50 L180,50 L200,100 L180,180 L140,220 L80,200 Z",
        "M280,290 L380,290 L450,350 L420,480 L320,480 L270,360 Z",
        "M450,50 L600,50 L650,150 L580,200 L450,150 Z"
    ],
    projectAreas: {
        'gt': "M188,235 L202,235 L202,248 L188,248 Z",
        'sv': "M200,248 L210,248 L210,255 L200,255 Z",
        'hn': "M215,232 L230,232 L230,245 L215,245 Z",
        'ni': "M225,248 L240,248 L240,262 L225,262 Z",
        'cr': "M240,265 L252,265 L252,278 L240,278 Z",
        'pa': "M258,270 L275,270 L275,282 L258,282 Z",
        'co': "M285,285 L325,285 L335,345 L290,355 Z",
        'jm': "M235,212 L245,212 L245,220 L235,220 Z",
        'do': "M285,208 L310,208 L310,220 L285,220 Z",
        'aw': "M280,248 L290,248 L290,256 L280,256 Z",
        'tt': "M345,260 L355,260 L355,270 L345,270 Z",
        'bb': "M355,240 L365,240 L365,250 L355,250 Z",
        'vi': "M320,202 L330,202 L330,210 L320,210 Z"
    } as Record<string, string>
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner select-none">
      
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            <h3 className="text-[#0d1a2e] font-black text-xl tracking-tighter uppercase leading-none">Mapa de Monitoreo</h3>
        </div>
      </div>

      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="1000" height="500" fill="#f8fafc" />

        <g fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2">
            <path d="M0,0 L1000,0 L1000,500 L0,500 Z" fill="#ffffff" stroke="none" />
            <path d="M0,100 Q100,120 180,220 T260,280 T300,350 T320,500 L0,500 Z" fill="#f8fafc" />
            {worldPaths.region.map((d, i) => (
                <path key={`region-${i}`} d={d} fill="#f1f5f9" stroke="#cbd5e1" />
            ))}
        </g>

        {countries.map(country => {
          const path = worldPaths.projectAreas[country.code];
          if (!path) return null;

          const isSelected = selectedCountryCode === country.code;
          const isHovered = hoveredCountry === country.code;

          return (
            <path
              key={`area-${country.code}`}
              d={path}
              className="transition-all duration-300 cursor-pointer"
              style={{
                fill: isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#e2e8f0',
                stroke: isSelected || isHovered ? '#ffffff' : '#cbd5e1',
                strokeWidth: 1
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
                    <circle cx={pos.x} cy={pos.y} r="15" fill="#2563eb" className="animate-ping opacity-20" />
                )}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 8 : isHovered ? 7 : 6}
                    className="transition-all duration-300"
                    fill={isSelected || isHovered ? '#2563eb' : '#94a3b8'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredCountry(country.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                />
            </g>
          );
        })}
      </svg>

      {countries.map(country => {
        const pos = markerPositions[country.code];
        if (!pos) return null;

        const isSelected = selectedCountryCode === country.code;
        const isHovered = hoveredCountry === country.code;

        if (!isHovered && !isSelected) return null;

        return (
          <div 
            key={`tooltip-${country.code}`}
            style={{ 
                left: `${(pos.x / 1000) * 100}%`, 
                top: `${(pos.y / 500) * 100}%` 
            }}
            className="absolute z-30 pointer-events-none -translate-y-[115%] -translate-x-1/2 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-slate-100 flex items-center gap-2 min-w-[140px]">
                <div className="w-8 h-5 overflow-hidden rounded-md border border-slate-200 flex-shrink-0">
                    <img src={`https://flagcdn.com/w40/${country.code}.png`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-grow">
                    <span className="text-[10px] font-black text-slate-900 uppercase truncate">{country.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{country.count} Sedes</span>
                </div>
            </div>
            <div className="w-2 h-2 bg-white border-r border-b border-slate-100 rotate-45 -mt-1"></div>
          </div>
        );
      })}
    </div>
  );
};

export default MapView;
