
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
    code: string;
    total: number;
    offline: number;
    clubs: {
        name: string;
        offlineCount: number;
        totalInClub: number;
    }[];
}

const ServerStatusSummary: React.FC = () => {
    const { t } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [offlineServers, setOfflineServers] = useState<FlatServer[]>([]);
    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');

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
            }, 3500);
            img.onload = () => { clearTimeout(timer); resolve('online'); };
            img.onerror = () => { clearTimeout(timer); resolve('online'); };
            img.src = `http://${ip}/favicon.ico?t=${Date.now()}`;
        });
    };

    const checkGlobalStatus = useCallback(async () => {
        if (checking) return;
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

            const cloudCheckRes = await fetch(`${backendUrl}/api/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: gatheredServers.filter(s => s.ip && !s.ip.includes('X')).map((s, i) => ({ id: i, ip: s.ip })) })
            }).catch(() => null);

            const cloudResults = cloudCheckRes && cloudCheckRes.ok ? await cloudCheckRes.json() : { results: [] };
            const finalOffline: FlatServer[] = [];
            
            for (let i = 0; i < gatheredServers.length; i++) {
                const s = gatheredServers[i];
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
            setLastUpdated(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase());
        } catch (error) {
            console.error("Global monitor error:", error);
        } finally {
            setChecking(false);
        }
    }, [checking]);

    useEffect(() => {
        checkGlobalStatus();
        const interval = setInterval(checkGlobalStatus, 15000);
        return () => clearInterval(interval);
    }, [checkGlobalStatus]);

    const getCountryStats = (): CountryStatus[] => {
        const stats: Record<string, CountryStatus> = {};
        allServers.forEach(server => {
            if (!stats[server.country]) {
                stats[server.country] = { name: server.country, code: server.countryCode, total: 0, offline: 0, clubs: [] };
            }
            stats[server.country].total++;
            const isOffline = offlineServers.some(os => os.ip === server.ip && os.club === server.club);
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
    const onlineCount = allServers.length - offlineServers.length;

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className={`flex items-center space-x-2 text-sm font-black px-4 py-2 rounded-xl shadow-lg transition-all border ${
                    checking ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    offlineServers.length > 0 ? 'bg-red-600 text-white border-red-700' : 'bg-green-600 text-white border-green-700'
                }`}
            >
                {checking ? <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div> : <GlobeIcon className="w-5 h-5" />}
                <span className="uppercase tracking-widest text-[10px]">
                    {checking ? 'Verificando' : (offlineServers.length > 0 ? `${offlineServers.length} Alertas` : 'Sistemas OK')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#f4f7f9] rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Header Rojo */}
                        <div className="bg-[#d32f2f] text-white p-6 relative">
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="w-7 h-7" />
                                <h3 className="text-2xl font-bold tracking-tight">Monitor de Sitios</h3>
                            </div>
                            <p className="text-white/80 text-sm mt-1">Última actualización: {lastUpdated}</p>
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity">
                                <XIcon className="w-8 h-8" />
                            </button>
                        </div>
                        
                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100">
                             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">TOTAL SERVIDORES</p>
                                <p className="text-5xl font-black text-slate-800">{allServers.length}</p>
                             </div>
                             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">EN LÍNEA</p>
                                <p className="text-5xl font-black text-green-600">{onlineCount}</p>
                             </div>
                             <div className="bg-white p-6 rounded-xl border border-red-100 bg-red-50/30 shadow-sm">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">FUERA DE LÍNEA</p>
                                <p className="text-5xl font-black text-red-600">{offlineServers.length}</p>
                             </div>
                        </div>

                        <div className="overflow-y-auto grow p-6 space-y-8">
                            {/* Servidores con problemas */}
                            {offlineServers.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <ActivityIcon className="w-5 h-5 text-red-600" />
                                        <h4 className="text-red-700 font-bold text-lg">Servidores con problemas</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {offlineServers.map((s, idx) => (
                                            <div key={idx} className="bg-white rounded-lg border-l-4 border-l-red-600 border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{s.club}</p>
                                                        <p className="text-[10px] text-slate-400">{s.country}</p>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase tracking-tighter">FUERA DE LÍNEA</span>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
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
                                        <div className="bg-slate-50/50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <img src={`https://flagcdn.com/w20/${stat.code}.png`} className="w-5 rounded-sm" alt="" />
                                                <span className="font-bold text-slate-700 text-sm">{stat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] text-slate-400 font-medium">{stat.total} Servers</span>
                                                {stat.offline > 0 ? (
                                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{stat.offline} Fuera de Línea</span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">100% En Línea</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-wrap gap-2">
                                            {stat.clubs.map((club) => (
                                                <div 
                                                    key={club.name} 
                                                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[11px] font-medium transition-all ${
                                                        club.offlineCount > 0 
                                                        ? 'bg-red-50 border-red-100 text-red-700' 
                                                        : 'bg-green-50/30 border-green-100 text-green-700'
                                                    }`}
                                                >
                                                    <span>{club.name}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${club.offlineCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer con Botones */}
                        <div className="p-4 border-t bg-white flex justify-end items-center gap-3">
                            <button 
                                onClick={checkGlobalStatus} 
                                disabled={checking} 
                                className="bg-white border border-gray-200 px-6 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {checking ? 'Actualizando...' : 'Actualizar Ahora'}
                            </button>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="bg-[#0b1626] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
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
