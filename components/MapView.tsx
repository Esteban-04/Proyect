
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

  // Coordenadas normalizadas (0-1000 x 0-500) para un mapa de Centroamérica y Caribe
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 150, y: 220 },
    'bz': { x: 175, y: 195 },
    'sv': { x: 175, y: 250 },
    'hn': { x: 230, y: 220 },
    'ni': { x: 260, y: 270 },
    'cr': { x: 300, y: 320 },
    'pa': { x: 360, y: 330 },
    'co': { x: 450, y: 450 },
    'jm': { x: 290, y: 140 },
    'do': { x: 440, y: 140 },
    'aw': { x: 420, y: 280 },
    'vi': { x: 520, y: 130 },
    'bb': { x: 620, y: 240 },
    'tt': { x: 590, y: 290 },
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-[#eef2f7] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl select-none group">
      {/* HUD de Información */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <h3 className="text-[#0d1a2e] font-black text-lg tracking-tighter uppercase italic">Network Map</h3>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Operations Center</p>
        </div>
      </div>

      <svg 
        viewBox="0 0 800 500" 
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo Oceánico con gradiente */}
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill="url(#oceanGrad)" />

        {/* Formas simplificadas de continentes para contexto visual */}
        <g fill="#cbd5e1" opacity="0.4">
          {/* Norteamérica (México) */}
          <path d="M0,0 L180,0 L120,180 L50,220 L0,200 Z" />
          {/* Sudamérica */}
          <path d="M400,350 L550,340 L750,450 L650,500 L400,500 Z" />
        </g>

        {/* Conexiones de red visuales (Estética) */}
        <g stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3">
            {Object.values(markerPositions).map((pos, i) => (
                <line key={i} x1="400" y1="250" x2={pos.x} y2={pos.y} />
            ))}
        </g>

        {/* Marcadores de Países */}
        {countries.map(country => {
          const pos = markerPositions[country.code];
          if (!pos) return null;

          const isHovered = hoveredCountry === country.code;
          const isSelected = selectedCountryCode === country.code;

          return (
            <g 
              key={`marker-${country.code}`} 
              className="cursor-pointer group/marker"
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => onSelectCountry(country)}
            >
                {/* Aura de selección */}
                {(isHovered || isSelected) && (
                    <circle cx={pos.x} cy={pos.y} r="25" fill="#2563eb" className="animate-ping opacity-10" />
                )}
                
                {/* Base del marcador */}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 10 : isHovered ? 8 : 6}
                    fill={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#ffffff'}
                    stroke={isSelected || isHovered ? '#ffffff' : '#94a3b8'}
                    strokeWidth={isSelected || isHovered ? 3 : 2}
                    className="transition-all duration-300 shadow-lg"
                />

                {/* Etiqueta de país (Tooltip nativo del SVG) */}
                <text 
                  x={pos.x} 
                  y={pos.y + 25} 
                  textAnchor="middle" 
                  className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-300 pointer-events-none ${isSelected || isHovered ? 'fill-blue-700 opacity-100 translate-y-1' : 'fill-slate-400 opacity-0'}`}
                >
                  {country.name}
                </text>
            </g>
          );
        })}
      </svg>

      {/* Indicador de Leyenda */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Seleccionado</div>
         <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Disponible</div>
      </div>
    </div>
  );
};

export default MapView;
