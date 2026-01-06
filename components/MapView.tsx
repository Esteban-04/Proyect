
import React, { useState, useEffect } from 'react';
import { Country, ServerDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MapViewProps {
  countries: Country[];
  selectedCountryCode: string | null;
  onSelectCountry: (country: Country) => void;
  offlineServers: any[]; // Lista de servidores caídos para calcular estado por país
  isChecking: boolean;
}

const MapView: React.FC<MapViewProps> = ({ countries, selectedCountryCode, onSelectCountry, offlineServers, isChecking }) => {
  const { t } = useLanguage();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Coordenadas calibradas para una visualización óptima
  const markerPositions: Record<string, { x: number, y: number }> = {
    'gt': { x: 130, y: 220 },
    'sv': { x: 155, y: 250 },
    'hn': { x: 205, y: 220 },
    'ni': { x: 240, y: 270 },
    'cr': { x: 280, y: 315 },
    'pa': { x: 350, y: 330 },
    'co': { x: 450, y: 430 },
    'jm': { x: 290, y: 140 },
    'do': { x: 440, y: 135 },
    'aw': { x: 420, y: 270 },
    'vi': { x: 530, y: 125 },
    'bb': { x: 650, y: 230 },
    'tt': { x: 610, y: 285 },
    'dhl': { x: 720, y: 60 }
  };

  const countryPaths: Record<string, string> = {
    'gt': "M110,200 L150,200 L150,240 L120,250 L105,230 Z",
    'sv': "M145,245 L170,245 L170,260 L145,260 Z",
    'hn': "M165,190 L225,195 L240,235 L175,245 Z",
    'ni': "M230,235 L270,235 L280,290 L220,280 Z",
    'cr': "M275,290 L310,295 L320,330 L270,330 Z",
    'pa': "M325,315 L385,320 L400,350 L330,350 Z",
    'co': "M410,360 L490,360 L550,490 L420,490 L390,420 Z",
    'jm': "M270,135 L320,135 L320,155 L270,155 Z",
    'do': "M420,130 L500,130 L500,160 L420,160 Z",
    'aw': "M410,265 L440,265 L440,285 L410,285 Z",
    'tt': "M590,275 L635,275 L635,305 L590,305 Z",
    'bb': "M640,220 L670,220 L670,250 L640,250 Z",
    'vi': "M520,115 L560,115 L560,135 L520,135 Z"
  };

  const getCountryStatus = (code: string) => {
    if (isChecking) return 'checking';
    const isOffline = offlineServers.some(s => s.countryCode === code || (code === 'dhl' && s.country === 'DHL GLOBAL'));
    return isOffline ? 'offline' : 'online';
  };

  const getOfflineCount = (code: string) => {
    return offlineServers.filter(s => s.countryCode === code || (code === 'dhl' && s.country === 'DHL GLOBAL')).length;
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-[#0b1626] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl select-none group">
      {/* HUD Superior */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px] ${isChecking ? 'bg-amber-400 animate-pulse shadow-amber-400' : 'bg-cyan-400 shadow-cyan-400'}`}></div>
                <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">
                  {isChecking ? 'Verificando VPN...' : 'Estado de Red en Vivo'}
                </h3>
            </div>
            <p className="text-cyan-400/40 text-[9px] font-black uppercase tracking-[0.4em]">Sincronización de Infraestructura Global</p>
        </div>
      </div>

      <svg viewBox="0 0 800 500" className="w-full h-full">
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" />
          </pattern>
          <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0b1626" />
          </radialGradient>
        </defs>

        <rect width="800" height="500" fill="url(#oceanGradient)" />
        <rect width="800" height="500" fill="url(#mapGrid)" />

        {/* Capa de Tierras */}
        {Object.keys(countryPaths).map(code => {
          const path = countryPaths[code];
          const isSelected = selectedCountryCode === code;
          const isHovered = hoveredCountry === code;
          const status = getCountryStatus(code);

          return (
            <path
              key={`land-${code}`}
              d={path}
              className="transition-all duration-500 cursor-pointer"
              style={{
                fill: status === 'offline' ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'rgba(34, 211, 238, 0.2)' : isHovered ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                stroke: status === 'offline' ? '#ef4444' : isSelected ? '#22d3ee' : isHovered ? '#67e8f9' : 'rgba(255,255,255,0.1)',
                strokeWidth: isSelected || isHovered || status === 'offline' ? 2 : 1
              }}
              onMouseEnter={() => setHoveredCountry(code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => {
                const country = countries.find(c => c.code === code) || (code === 'dhl' ? { name: 'DHL GLOBAL', code: 'dhl', count: 5 } : null);
                if (country) onSelectCountry(country as Country);
              }}
            />
          );
        })}

        {/* Marcadores Dinámicos */}
        {Object.keys(markerPositions).map(code => {
          const pos = markerPositions[code];
          const isHovered = hoveredCountry === code;
          const isSelected = selectedCountryCode === code;
          const status = getCountryStatus(code);
          const offlineCount = getOfflineCount(code);

          return (
            <g key={`marker-${code}`} 
               className="cursor-pointer" 
               onClick={() => {
                 const country = countries.find(c => c.code === code) || (code === 'dhl' ? { name: 'DHL GLOBAL', code: 'dhl', count: 5 } : null);
                 if (country) onSelectCountry(country as Country);
               }}
               onMouseEnter={() => setHoveredCountry(code)}
               onMouseLeave={() => setHoveredCountry(null)}
            >
                {/* Aura de alerta o conexión */}
                <circle 
                  cx={pos.x} cy={pos.y} r={status === 'offline' ? "35" : "25"} 
                  fill={status === 'offline' ? '#ef4444' : status === 'checking' ? '#f59e0b' : '#22d3ee'} 
                  className={`transition-opacity duration-500 ${isHovered || isSelected || status === 'offline' ? 'opacity-20 animate-ping' : 'opacity-0'}`} 
                />
                
                {/* Punto central */}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected || status === 'offline' ? 8 : 5}
                    className="transition-all duration-300"
                    fill={status === 'offline' ? '#ef4444' : status === 'checking' ? '#f59e0b' : isHovered || isSelected ? '#22d3ee' : '#ffffff'}
                    fillOpacity={isHovered || isSelected || status !== 'online' ? 1 : 0.4}
                    stroke="#0b1626"
                    strokeWidth="2"
                />

                {/* Contador de fallos si hay offline */}
                {status === 'offline' && (
                  <text x={pos.x} y={pos.y - 15} textAnchor="middle" className="fill-red-500 text-[10px] font-black uppercase tracking-tighter">
                    {offlineCount} FALLOS
                  </text>
                )}
            </g>
          );
        })}
      </svg>

      {/* Info Panel flotante */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4">
         {hoveredCountry && (
             <div className="bg-[#1e293b]/95 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="w-10 h-7 overflow-hidden rounded shadow-lg shrink-0 border border-white/10">
                    <img src={`https://flagcdn.com/w80/${hoveredCountry === 'dhl' ? 'un' : hoveredCountry}.png`} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div>
                     <p className="text-white font-black uppercase text-xs tracking-widest leading-none mb-1">
                        {hoveredCountry === 'dhl' ? 'DHL GLOBAL' : countries.find(c => c.code === hoveredCountry)?.name}
                     </p>
                     <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${getCountryStatus(hoveredCountry) === 'offline' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <p className={`${getCountryStatus(hoveredCountry) === 'offline' ? 'text-red-400' : 'text-cyan-400'} font-bold text-[10px] uppercase tracking-wider`}>
                           {getCountryStatus(hoveredCountry) === 'offline' ? `${getOfflineCount(hoveredCountry)} Servidores Caídos` : 'Operativo (VPN OK)'}
                        </p>
                     </div>
                 </div>
             </div>
         )}
         <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
             VPN TELEMETRY : {isChecking ? 'SYNCING...' : 'LIVE'}
         </div>
      </div>
    </div>
  );
};

export default MapView;
