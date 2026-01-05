
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

  // Coordenadas calibradas para un ViewBox de 800x500 (Región Centro y Caribe)
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 120, y: 220 },
    'sv': { x: 140, y: 260 },
    'hn': { x: 190, y: 230 },
    'ni': { x: 220, y: 280 },
    'cr': { x: 260, y: 330 },
    'pa': { x: 330, y: 340 },
    'co': { x: 420, y: 440 },
    'jm': { x: 260, y: 140 },
    'do': { x: 420, y: 140 },
    'aw': { x: 400, y: 290 },
    'vi': { x: 500, y: 130 },
    'bb': { x: 620, y: 250 },
    'tt': { x: 580, y: 300 },
  };

  // Polígonos simplificados pero representativos para cada país
  const countryPaths: Record<string, string> = {
    'gt': "M100,210 L140,210 L140,240 L115,250 L100,230 Z",
    'sv': "M130,255 L155,255 L155,265 L130,265 Z",
    'hn': "M150,210 L210,210 L225,245 L165,250 Z",
    'ni': "M210,245 L245,245 L255,295 L200,285 Z",
    'cr': "M250,300 L285,300 L295,340 L245,340 Z",
    'pa': "M300,325 L360,325 L375,350 L310,350 Z",
    'co': "M380,360 L460,360 L520,480 L400,500 L370,420 Z",
    'jm': "M240,135 L285,135 L285,150 L240,150 Z",
    'do': "M400,130 L470,130 L470,155 L400,155 Z",
    'aw': "M390,285 L415,285 L415,300 L390,300 Z",
    'tt': "M565,290 L600,290 L600,315 L565,315 Z",
    'bb': "M610,240 L635,240 L635,260 L610,260 Z",
    'vi': "M490,120 L530,120 L530,140 L490,140 Z"
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-[#0d1a2e] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl select-none group">
      {/* HUD de Operaciones */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">Global Map</h3>
            </div>
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.3em]">Saltex Infrastructure Monitor</p>
        </div>
      </div>

      <svg 
        viewBox="0 0 800 500" 
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="800" height="500" fill="#0d1a2e" />

        {/* Rejilla de Red (Estética Cyberpunk) */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />

        {/* Dibujado de Países */}
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
                fill: isSelected ? 'rgba(37, 99, 235, 0.4)' : isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                stroke: isSelected ? '#2563eb' : isHovered ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                strokeWidth: isSelected || isHovered ? 2 : 1
              }}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => onSelectCountry(country)}
            />
          );
        })}

        {/* Marcadores de Sedes */}
        {countries.map(country => {
          const pos = markerPositions[country.code];
          if (!pos) return null;

          const isHovered = hoveredCountry === country.code;
          const isSelected = selectedCountryCode === country.code;

          return (
            <g key={`marker-${country.code}`} className="cursor-pointer" onClick={() => onSelectCountry(country)}>
                {(isHovered || isSelected) && (
                    <circle cx={pos.x} cy={pos.y} r="30" fill="#2563eb" className="animate-ping opacity-10" />
                )}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 10 : isHovered ? 8 : 5}
                    className="transition-all duration-300"
                    fill={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : 'rgba(255,255,255,0.4)'}
                    stroke="#0d1a2e"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredCountry(country.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                />
            </g>
          );
        })}
      </svg>

      {/* Leyenda y Tooltips */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
         {hoveredCountry && (
             <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                 <img src={`https://flagcdn.com/w40/${hoveredCountry}.png`} className="w-8 rounded-sm shadow-md" />
                 <div>
                     <p className="text-slate-900 font-black uppercase text-xs tracking-widest leading-none mb-1">
                        {countries.find(c => c.code === hoveredCountry)?.name}
                     </p>
                     <p className="text-blue-600 font-bold text-[10px] uppercase">
                        {countries.find(c => c.code === hoveredCountry)?.count} Sedes Activas
                     </p>
                 </div>
             </div>
         )}
         <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
             Interactive Global Access Node
         </div>
      </div>
    </div>
  );
};

export default MapView;
