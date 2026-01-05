
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { XIcon, GlobeIcon } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';

interface FlatServer extends ServerDetails {
    club: string;
    country: string;
    countryCode: string;
}

interface CountryStatus {
    name: string;
    code: string;
    total: number;
    offline: number;
    clubs: {
        name: string;
        offlineCount: number;
        totalInClub: number;
    }[];
}

const LightningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const ServerStatusSummary: React.FC = () => {
    const { t } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [offlineServers, setOfflineServers] = useState<FlatServer[]>([]);
    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const checkingRef = useRef(false);

    const getBackendUrl = () => {
        const saved = localStorage.getItem('saltex_backend_url');
        return (saved && saved.trim() !== '') ? saved : window.location.origin;
    };

    const probeLocalVPN = (ip: string): Promise<'online' | 'offline'> => {
        if (!ip || ip.includes('X') || ip === 'N/A' || ip === '0.0.0.0') return Promise.resolve('offline');
        return new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => { 
                resolve('offline'); 
                img.src = ""; 
            }, 3000);
            img.onload = () => { clearTimeout(timer); resolve('online'); };
            img.onerror = () => { clearTimeout(timer); resolve('online'); };
            img.src = `http://${ip}/favicon.ico?t=${Date.now()}`;
        });
    };

    const checkGlobalStatus = useCallback(async (isManual = false) => {
        if (checkingRef.current && !isManual) return;
        checkingRef.current = true;
        setChecking(true);
        const backendUrl = getBackendUrl();
        
        try {
            const cloudRes = await fetch(`${backendUrl}/api/get-all-configs`);
            const allConfigs = await cloudRes.json();
            let gatheredServers: FlatServer[] = [];

            const processClub = (countryName: string, countryCode: string, club: string) => {
                const configKey = `config_${countryCode}_${club.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const config = allConfigs[configKey] || { servers: CLUB_SPECIFIC_DEFAULTS[club] || [] };
                config.servers.forEach((s: any) => {
                    gatheredServers.push({ ...s, club, country: countryName, countryCode });
                });
            };

            COUNTRIES.forEach(c => c.clubs?.forEach(club => processClub(c.name, c.code, club)));
            DHL_DATA.clubs?.forEach(club => processClub('DHL Global', DHL_DATA.code, club));

            setAllServers(gatheredServers);

            const serversToPing = gatheredServers.filter(s => s.ip && !s.ip.includes('X'));
            const cloudCheckRes = await fetch(`${backendUrl}/api/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: serversToPing.map((s, i) => ({ id: i, ip: s.ip })) })
            }).catch(() => null);

            const cloudResults = cloudCheckRes && cloudCheckRes.ok ? await cloudCheckRes.json() : { results: [] };
            const finalOffline: FlatServer[] = [];
            
            for (const s of gatheredServers) {
                if (!s.ip || s.ip.includes('X')) {
                    finalOffline.push(s);
                    continue;
                }
                const res = cloudResults.results?.find((r: any) => r.ip === s.ip);
                let status = res ? res.status : 'offline';
                if (status === 'offline') status = await probeLocalVPN(s.ip);
                if (status === 'offline') finalOffline.push(s);
            }

            setOfflineServers(finalOffline);
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
        } catch (error) {
            console.error("Global monitor error:", error);
        } finally {
            setChecking(false);
            checkingRef.current = false;
        }
    }, []);

    useEffect(() => {
        checkGlobalStatus();
        const interval = setInterval(() => checkGlobalStatus(false), 10000);
        return () => clearInterval(interval);
    }, [checkGlobalStatus]);

    const getCountryStats = (): CountryStatus[] => {
        const stats: Record<string, CountryStatus> = {};
        allServers.forEach(server => {
            if (!stats[server.country]) {
                stats[server.country] = { name: server.country, code: server.countryCode, total: 0, offline: 0, clubs: [] };
            }
            stats[server.country].total++;
            const isOffline = offlineServers.some(os => os.ip === server.ip && os.club === server.club && os.name === server.name);
            if (isOffline) stats[server.country].offline++;

            let clubEntry = stats[server.country].clubs.find(c => c.name === server.club);
            if (!clubEntry) {
                clubEntry = { name: server.club, offlineCount: 0, totalInClub: 0 };
                stats[server.country].clubs.push(clubEntry);
            }
            clubEntry.totalInClub++;
            if (isOffline) clubEntry.offlineCount++;
        });
        return Object.values(stats);
    };

    const countryStats = getCountryStats();
    const totalServers = allServers.length;
    const totalOffline = offlineServers.length;
    const totalOnline = totalServers - totalOffline;

    return (
        <>
            {/* Botón Rojo Principal idéntico a la imagen */}
            <button 
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl shadow-lg transition-all border-none ${
                    totalOffline > 0 ? 'bg-[#8b222a] text-[#ffffff]/90' : 'bg-[#2e7d32] text-white'
                } hover:scale-105 active:scale-95`}
            >
                <LightningIcon className={`w-5 h-5 ${totalOffline > 0 ? 'text-[#ffffff]/60' : 'text-white'}`} />
                <span className="font-bold text-sm">
                    {checking ? 'Verificando...' : (totalOffline > 0 ? `${totalOffline} Fuera de Línea` : 'Sistemas OK')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#f4f7f9] rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
                        
                        {/* Header Rojo */}
                        <div className="bg-[#d32f2f] text-white p-6 relative shrink-0">
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Monitor de Sitios</h3>
                            </div>
                            <p className="text-white/80 text-xs mt-1">Última actualización: {lastUpdated}</p>
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity">
                                <XIcon className="w-7 h-7" />
                            </button>
                        </div>
                        
                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-white border-b border-gray-200 shrink-0">
                             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-[#6b7c93] text-[11px] font-bold uppercase mb-2">TOTAL SERVIDORES</p>
                                <p className="text-4xl font-bold text-[#1a2b4e]">{totalServers}</p>
                             </div>
                             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-[#6b7c93] text-[11px] font-bold uppercase mb-2">EN LÍNEA</p>
                                <p className="text-4xl font-bold text-[#2e7d32]">{totalOnline}</p>
                             </div>
                             <div className="bg-[#fffafa] p-6 rounded-xl border border-red-100 shadow-sm">
                                <p className="text-[#6b7c93] text-[11px] font-bold uppercase mb-2">FUERA DE LÍNEA</p>
                                <p className="text-4xl font-bold text-[#d32f2f]">{totalOffline}</p>
                             </div>
                        </div>

                        {/* Contenido principal con scroll */}
                        <div className="overflow-y-auto grow p-6 space-y-8 bg-[#fbfcfd]">
                            
                            {/* Servidores con problemas */}
                            {totalOffline > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <LightningIcon className="w-5 h-5 text-[#d32f2f]" />
                                        <h4 className="text-[#b71c1c] font-bold text-lg">Servidores con problemas</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {offlineServers.map((s, idx) => (
                                            <div key={idx} className="bg-white rounded-lg border-l-4 border-l-[#d32f2f] border border-gray-100 p-4 shadow-sm relative">
                                                <div className="mb-4">
                                                    <p className="font-bold text-[#1a2b4e] text-base">{s.club}</p>
                                                    <p className="text-xs text-slate-400">{s.country}</p>
                                                </div>
                                                <span className="absolute top-4 right-4 text-[9px] font-bold text-[#d32f2f] bg-[#ffebee] px-2 py-0.5 rounded uppercase">FUERA DE LÍNEA</span>
                                                <div className="bg-[#f8f9fa] p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
                                                    {s.name}: {s.ip}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Desglose por País */}
                            <div className="space-y-4">
                                {countryStats.map((stat) => (
                                    <div key={stat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="bg-[#f8f9fa] px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                  src={`https://flagcdn.com/w40/${stat.code === 'dhl' ? 'un' : stat.code}.png`} 
                                                  className="w-5 h-auto rounded-sm" 
                                                  alt="" 
                                                />
                                                <span className="font-bold text-slate-700 text-sm">{stat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] text-slate-400 font-medium">{stat.total} Servers</span>
                                                {stat.offline > 0 ? (
                                                    <span className="bg-[#ffebee] text-[#d32f2f] px-3 py-1 rounded-lg text-[10px] font-bold">
                                                        {stat.offline} Fuera de Línea
                                                    </span>
                                                ) : (
                                                    <span className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded-lg text-[10px] font-bold">
                                                        100% En Línea
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-wrap gap-2">
                                            {stat.clubs.map((club) => (
                                                <div 
                                                    key={club.name} 
                                                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[11px] font-medium transition-all ${
                                                        club.offlineCount > 0 
                                                        ? 'bg-[#fff5f5] border-red-100 text-[#d32f2f]' 
                                                        : 'bg-[#e8f5e9]/20 border-green-100 text-[#2e7d32]'
                                                    }`}
                                                >
                                                    <span>{club.name}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${club.offlineCount > 0 ? 'bg-[#d32f2f]' : 'bg-[#2e7d32]'}`}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer con Botones Estilizados */}
                        <div className="p-4 border-t bg-white flex justify-end items-center gap-3 shrink-0">
                            <button 
                                onClick={() => checkGlobalStatus(true)} 
                                disabled={checking} 
                                className="bg-white border border-[#d1d5db] px-5 py-2 rounded-lg font-bold text-sm text-[#1a2b4e] hover:bg-slate-50 transition-colors"
                            >
                                {checking ? 'Actualizando...' : 'Actualizar Ahora'}
                            </button>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="bg-[#0b1626] text-white px-8 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
