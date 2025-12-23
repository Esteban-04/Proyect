
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

  // Coordenadas calibradas para el mapa (Base 1000x500)
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 198, y: 242 },
    'hn': { x: 218, y: 238 },
    'sv': { x: 206, y: 248 },
    'ni': { x: 226, y: 252 },
    'cr': { x: 238, y: 264 },
    'pa': { x: 254, y: 268 },
    'co': { x: 275, y: 300 },
    'jm': { x: 232, y: 230 },
    'do': { x: 268, y: 226 },
    'aw': { x: 272, y: 255 },
    'vi': { x: 292, y: 222 },
    'bb': { x: 312, y: 248 },
    'tt': { x: 304, y: 265 },
  };

  const worldPaths = {
    // Silueta global realista basada en la imagen de referencia
    world: [
        // América
        "M140,50 L180,50 L220,100 L240,180 L200,225 L210,235 L225,235 L240,260 L280,275 L300,290 L340,320 L320,480 L280,480 L260,350 L270,280 L230,265 L190,230 L150,220 L100,200 L60,180 L40,80 Z",
        // Groenlandia
        "M300,30 L380,30 L390,70 L340,110 L280,80 Z",
        // África
        "M450,185 L550,165 L620,200 L650,280 L620,420 L520,420 L440,300 L430,200 Z",
        // Europa
        "M450,175 L520,60 L600,60 L620,120 L580,180 Z",
        // Asia
        "M600,60 L950,60 L980,250 L880,380 L750,350 L650,280 Z",
        // Oceanía
        "M820,390 L920,390 L940,460 L840,460 Z"
    ],
    // Países del proyecto para interactividad
    projectAreas: {
        'gt': "M195,238 L202,238 L202,245 L195,245 Z",
        'sv': "M204,245 L208,245 L208,251 L204,251 Z",
        'hn': "M212,234 L224,234 L224,242 L212,242 Z",
        'ni': "M222,248 L230,248 L230,256 L222,256 Z",
        'cr': "M235,260 L242,260 L242,268 L235,268 Z",
        'pa': "M250,265 L260,265 L260,272 L250,272 Z",
        'co': "M268,275 L305,275 L310,320 L275,325 Z",
        'jm': "M228,228 L236,228 L236,233 L228,233 Z",
        'do': "M265,223 L278,223 L278,230 L265,230 Z",
        'aw': "M270,253 L274,253 L274,257 L270,257 Z",
        'tt': "M302,262 L306,262 L306,268 L302,268 Z",
        'bb': "M310,245 L314,245 L314,250 L310,250 Z",
        'vi': "M290,219 L294,219 L294,224 L290,224 Z"
    } as Record<string, string>
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xl group/map select-none">
      
      {/* Título de Dashboard */}
      <div className="absolute top-6 left-8 z-10">
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
            <h3 className="text-[#0d1a2e] font-black text-2xl tracking-tighter uppercase leading-none">World Site Map</h3>
        </div>
        <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">{t('monitorSummaryCountry')}</p>
      </div>

      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Continentes (Gris claro con fronteras blancas como la imagen) */}
        <g fill="#e5e7eb" stroke="#ffffff" strokeWidth="1">
          {worldPaths.world.map((d, i) => (
            <path key={`continent-${i}`} d={d} />
          ))}
        </g>

        {/* Resaltado de Países SALTEX */}
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
                fill: isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#d1d5db',
                fillOpacity: (isSelected || isHovered) ? 1 : 0.5
              }}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => onSelectCountry(country)}
            />
          );
        })}

        {/* Nodos de Ubicación */}
        {countries.map(country => {
          const pos = markerPositions[country.code];
          if (!pos) return null;

          const isHovered = hoveredCountry === country.code;
          const isSelected = selectedCountryCode === country.code;

          return (
            <g key={`marker-${country.code}`}>
                {/* Efecto Radar */}
                {(isHovered || isSelected) && (
                    <circle cx={pos.x} cy={pos.y} r="10" fill="#3b82f6" className="animate-ping opacity-25" />
                )}
                {/* Punto Principal */}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered || isSelected ? 4.5 : 3.5}
                    className="transition-all duration-300 pointer-events-none"
                    fill={isHovered || isSelected ? '#3b82f6' : '#ffffff'}
                    stroke={isHovered || isSelected ? '#ffffff' : '#94a3b8'}
                    strokeWidth={isHovered || isSelected ? "2" : "1.5"}
                />
            </g>
          );
        })}
      </svg>

      {/* Tooltips Dinámicos */}
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
            className="absolute z-30 pointer-events-none -translate-y-full -translate-x-1/2 pb-5 flex flex-col items-center animate-in fade-in zoom-in duration-200"
          >
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3">
                <div className="w-7 h-5 overflow-hidden rounded-sm border border-slate-200">
                    <img src={`https://flagcdn.com/w40/${country.code}.png`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{country.name}</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{country.count} ACTIVE SITES</span>
                </div>
            </div>
            <div className="w-2.5 h-2.5 bg-white border-r border-b border-slate-100 rotate-45 -mt-1.5 shadow-sm"></div>
          </div>
        );
      })}

      {/* Control Inferior */}
      <div className="absolute bottom-6 left-8 flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Status: Online</span>
        </div>
        <div className="w-px h-4 bg-slate-300"></div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{countries.length} monitored regions</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
