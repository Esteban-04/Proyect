
import React, { useState, useEffect, useCallback } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { ActivityIcon, XIcon, GlobeIcon } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';

interface FlatServer extends ServerDetails {
    club: string;
    country: string;
    countryCode: string;
}

interface CountryStatus {
    name: string;
    total: number;
    offline: number;
    clubs: {
        name: string;
        offlineCount: number;
    }[];
}

const ServerStatusSummary: React.FC = () => {
    const { t } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [offlineServers, setOfflineServers] = useState<FlatServer[]>([]);
    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Obtener la URL del backend desde el almacenamiento o usar relativa
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
            }, 3500); // Tiempo de espera para red local
            
            img.onload = () => { clearTimeout(timer); resolve('online'); };
            img.onerror = () => { clearTimeout(timer); resolve('online'); }; // Si hay error de carga, hubo contacto con la IP
            img.src = `http://${ip}/favicon.ico?t=${Date.now()}`;
        });
    };

    const checkGlobalStatus = useCallback(async () => {
        if (checking) return;
        setChecking(true);
        const backendUrl = getBackendUrl();
        
        try {
            // 1. Obtener configuraciones desde el Cloud
            const cloudRes = await fetch(`${backendUrl}/api/get-all-configs`);
            
            // Validar que la respuesta sea JSON
            const contentType = cloudRes.headers.get("content-type");
            if (!cloudRes.ok || !contentType || !contentType.includes("application/json")) {
                throw new Error("Respuesta del servidor no es JSON válido");
            }
            
            const allConfigs = await cloudRes.json();
            let gatheredServers: FlatServer[] = [];

            const processClub = (countryName: string, countryCode: string, club: string) => {
                const configKey = `config_${countryCode}_${club.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const config = allConfigs[configKey] || { servers: CLUB_SPECIFIC_DEFAULTS[club] || [] };
                config.servers.forEach((s: any) => {
                    if (s.ip && !s.ip.includes('X')) {
                        gatheredServers.push({ ...s, club, country: countryName, countryCode });
                    }
                });
            };

            COUNTRIES.forEach(c => c.clubs?.forEach(club => processClub(c.name, c.code, club)));
            DHL_DATA.clubs?.forEach(club => processClub('DHL Global', DHL_DATA.code, club));

            setAllServers(gatheredServers);

            // 2. Verificación Híbrida
            // Primero intentamos por el backend (para IPs públicas)
            const cloudCheckRes = await fetch(`${backendUrl}/api/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: gatheredServers.map((s, i) => ({ id: i, ip: s.ip })) })
            }).catch(() => null);

            const cloudResults = cloudCheckRes && cloudCheckRes.ok ? await cloudCheckRes.json() : { results: [] };
            const finalOffline: FlatServer[] = [];
            
            // Verificamos cada servidor (Loteado para no saturar)
            for (let i = 0; i < gatheredServers.length; i++) {
                const s = gatheredServers[i];
                const res = cloudResults.results?.find((r: any) => r.id === i);
                let status = res ? res.status : 'offline';

                // Si el Cloud dice offline, probamos localmente (VPN)
                if (status === 'offline') {
                    status = await probeLocalVPN(s.ip);
                }

                if (status === 'offline') {
                    finalOffline.push(s);
                }
            }

            setOfflineServers(finalOffline);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Global monitor error:", error);
        } finally {
            setChecking(false);
        }
    }, [checking]);

    useEffect(() => {
        checkGlobalStatus();
        const interval = setInterval(checkGlobalStatus, 1000 * 60 * 10); // Cada 10 min
        return () => clearInterval(interval);
    }, [checkGlobalStatus]);

    const getCountryStats = (): CountryStatus[] => {
        const stats: Record<string, CountryStatus> = {};
        allServers.forEach(server => {
            if (!stats[server.country]) stats[server.country] = { name: server.country, total: 0, offline: 0, clubs: [] };
            stats[server.country].total++;
            const isOffline = offlineServers.some(os => os.ip === server.ip && os.club === server.club);
            if (isOffline) stats[server.country].offline++;
            let clubEntry = stats[server.country].clubs.find(c => c.name === server.club);
            if (!clubEntry) {
                clubEntry = { name: server.club, offlineCount: 0 };
                stats[server.country].clubs.push(clubEntry);
            }
            if (isOffline) clubEntry.offlineCount++;
        });
        return Object.values(stats).sort((a, b) => b.offline - a.offline);
    };

    const countryStats = getCountryStats();
    const hasIssues = offlineServers.length > 0;

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-lg transition-all border ${
                    checking ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' : 
                    hasIssues ? 'bg-red-600 text-white border-red-700' : 'bg-green-600 text-white border-green-700'
                }`}
            >
                {checking ? <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div> : <ActivityIcon className="w-5 h-5" />}
                <span className="hidden md:inline uppercase tracking-widest text-[10px]">
                    {checking ? 'Sincronizando' : (hasIssues ? `${offlineServers.length} Problemas` : 'Sistemas OK')}
                </span>
                <span className="md:hidden">
                     {checking ? '...' : (hasIssues ? `${offlineServers.length} OFF` : 'OK')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className={`${hasIssues ? 'bg-red-600' : 'bg-[#0d1a2e]'} text-white p-8 flex justify-between items-center`}>
                            <div>
                                <h3 className="font-black text-2xl uppercase italic tracking-tighter flex items-center"><GlobeIcon className="w-8 h-8 mr-3" />Monitor de Infraestructura</h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{checking ? 'Validando conexiones remotas...' : `Último Escaneo: ${lastUpdated?.toLocaleTimeString() || '--:--'}`}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><XIcon className="w-8 h-8" /></button>
                        </div>
                        
                        <div className="p-8 bg-slate-50 border-b flex flex-wrap gap-6">
                             <div className="flex-1 min-w-[180px] bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Nodos Totales</div>
                                <div className="text-4xl font-black text-slate-800 tracking-tighter italic">{allServers.length}</div>
                             </div>
                             <div className="flex-1 min-w-[180px] bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Estables</div>
                                <div className="text-4xl font-black text-green-600 tracking-tighter italic">{allServers.length - offlineServers.length}</div>
                             </div>
                             <div className={`flex-1 min-w-[180px] bg-white p-6 rounded-3xl shadow-sm border ${hasIssues ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}>
                                <div className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Alertas Críticas</div>
                                <div className={`text-4xl font-black tracking-tighter italic ${hasIssues ? 'text-red-600' : 'text-slate-200'}`}>{offlineServers.length}</div>
                             </div>
                        </div>

                        <div className="overflow-y-auto flex-grow p-8 space-y-8 bg-white">
                            {hasIssues && (
                                <div>
                                    <h4 className="text-red-600 font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center"><ActivityIcon className="w-5 h-5 mr-2" />Nodos Fuera de Servicio</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {offlineServers.map((s, idx) => (
                                            <div key={idx} className="bg-slate-900 rounded-2xl p-4 border border-white/5 shadow-xl group">
                                                <div className="font-black text-white text-xs truncate group-hover:text-red-400 transition-colors">{s.club}</div>
                                                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{s.country}</div>
                                                <div className="mt-3 text-[10px] font-mono text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{s.ip}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h4 className="text-slate-800 font-black text-sm uppercase tracking-[0.2em] mb-6">Estado de Infraestructura Regional</h4>
                                <div className="space-y-4">
                                    {countryStats.map((stat) => (
                                        <div key={stat.name} className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                            <div className="bg-white px-8 py-5 flex justify-between items-center border-b border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-slate-800 uppercase italic tracking-tighter">{stat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.total} Nodos</span>
                                                    {stat.offline > 0 ? (
                                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">{stat.offline} Alertas</span>
                                                    ) : (
                                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Estable</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                {stat.clubs.map((club) => (
                                                    <div key={club.name} className={`text-[9px] p-3 rounded-xl border flex flex-col gap-2 font-black uppercase tracking-tighter transition-all ${club.offlineCount > 0 ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
                                                        <span className="truncate">{club.name}</span>
                                                        <div className={`h-1 rounded-full w-full ${club.offlineCount > 0 ? 'bg-white/40' : 'bg-slate-200'}`}>
                                                            <div className={`h-full rounded-full ${club.offlineCount > 0 ? 'bg-white' : 'bg-green-500'}`} style={{ width: '100%' }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t bg-slate-50 flex justify-end items-center gap-4">
                            <button onClick={checkGlobalStatus} disabled={checking} className="bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50">Sincronizar</button>
                            <button onClick={() => setShowModal(false)} className="bg-[#0d1a2e] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 active:scale-95">Cerrar Monitor</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
