
import React, { useState, useEffect, useCallback } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { ActivityIcon, XIcon, GlobeIcon } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';

interface FlatServer extends ServerDetails {
    club: string;
    country: string;
    type: 'pricesmart' | 'dhl';
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
    const [backendDisconnected, setBackendDisconnected] = useState(false);

    const getServersForClub = (countryCode: string, clubName: string): ServerDetails[] => {
        const safeClub = clubName.replace(/[^a-zA-Z0-9]/g, '_');
        const key = `config_${countryCode}_${safeClub}_servers`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return CLUB_SPECIFIC_DEFAULTS[clubName] || [];
    };

    const checkGlobalStatus = useCallback(async () => {
        if (checking) return;
        setChecking(true);
        let gatheredServers: FlatServer[] = [];

        COUNTRIES.forEach(c => {
            c.clubs?.forEach(club => {
                const svs = getServersForClub(c.code, club);
                svs.forEach(s => {
                    if(s.ip && !s.ip.includes('X')) {
                        gatheredServers.push({ ...s, club: club, country: c.name, type: 'pricesmart' });
                    }
                });
            });
        });

        DHL_DATA.clubs?.forEach(club => {
            const svs = getServersForClub(DHL_DATA.code, club);
            svs.forEach(s => {
                if(s.ip && !s.ip.includes('X')) {
                    gatheredServers.push({ ...s, club: club, country: 'DHL Global', type: 'dhl' });
                }
            });
        });

        setAllServers(gatheredServers);
        
        if (gatheredServers.length === 0) {
            setChecking(false);
            setLastUpdated(new Date());
            return;
        }

        const payload = gatheredServers.map((s, i) => ({ id: i, ip: s.ip }));

        try {
            const backendUrl = localStorage.getItem('saltex_backend_url') || '';
            const apiEndpoint = backendUrl ? `${backendUrl}/api/check-status` : '/api/check-status';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: payload })
            });

            if (response && response.ok) {
                const data = await response.json();
                const results = data.results || [];
                const offline = gatheredServers.filter((_, i) => {
                    const res = results.find((r: any) => r.id === i);
                    return res && res.status === 'offline';
                });
                setOfflineServers(offline);
                setBackendDisconnected(false);
            } else {
                setBackendDisconnected(true);
            }
        } catch (error) {
            setBackendDisconnected(true);
        } finally {
            setChecking(false);
            setLastUpdated(new Date());
        }
    }, [checking, t]);

    useEffect(() => {
        checkGlobalStatus();
        const interval = setInterval(checkGlobalStatus, 1000 * 60 * 10); // Cada 10 min por defecto
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
                className={`flex items-center space-x-2 text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md transition-all duration-300 border ${
                    backendDisconnected ? 'bg-amber-100 text-amber-700 border-amber-300' :
                    checking ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' : 
                    hasIssues ? 'bg-red-600 text-white border-red-700' : 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                }`}
            >
                {checking ? <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div> : <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="hidden sm:inline">
                    {backendDisconnected ? 'Backend Offline' : checking ? t('monitorChecking') : (hasIssues ? `${offlineServers.length} ${t('monitorOffline')}` : t('monitorSystemOnline'))}
                </span>
                <span className="sm:hidden">
                     {backendDisconnected ? 'ERR' : checking ? '...' : (hasIssues ? `${offlineServers.length} OFF` : 'OK')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className={`${hasIssues ? 'bg-red-600' : 'bg-[#0d1a2e]'} text-white p-4 sm:p-6 flex justify-between items-center`}>
                            <div>
                                <h3 className="font-bold text-xl sm:text-2xl flex items-center"><GlobeIcon className="w-6 h-6 mr-2" />{t('monitorTitle')}</h3>
                                <p className="text-white/80 text-sm mt-1">{backendDisconnected ? '⚠️ Backend no responde' : checking ? t('monitorStatusUpdate') : `${t('monitorLastUpdate')}: ${lastUpdated?.toLocaleTimeString()}`}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><XIcon className="w-8 h-8" /></button>
                        </div>
                        
                        <div className="p-4 sm:p-6 bg-gray-50 border-b flex flex-wrap gap-4">
                             <div className="flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-wider">{t('monitorTotalServers')}</div>
                                <div className="text-3xl font-black text-gray-800">{allServers.length}</div>
                             </div>
                             <div className="flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-wider">{t('monitorOnline')}</div>
                                <div className="text-3xl font-black text-green-600">{allServers.length - offlineServers.length}</div>
                             </div>
                             <div className={`flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border ${hasIssues ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-wider">{t('monitorOffline')}</div>
                                <div className={`text-3xl font-black ${hasIssues ? 'text-red-600' : 'text-gray-400'}`}>{offlineServers.length}</div>
                             </div>
                        </div>

                        <div className="overflow-y-auto flex-grow p-4 sm:p-6 space-y-6">
                            {backendDisconnected && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
                                    <p className="font-bold">⚠️ Error de Comunicación</p>
                                    <p className="mt-1">El backend de monitoreo no responde. Verifica que el servidor backend esté encendido.</p>
                                </div>
                            )}
                            {hasIssues && (
                                <div>
                                    <h4 className="text-red-700 font-bold text-lg mb-3 flex items-center"><ActivityIcon className="w-5 h-5 mr-2" />{t('monitorIssuesTitle')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {offlineServers.map((s, idx) => (
                                            <div key={idx} className="bg-white border-l-4 border-red-500 rounded shadow-sm p-3">
                                                <div className="font-bold text-gray-900 text-sm truncate">{s.club}</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">{s.country}</div>
                                                <div className="mt-2 text-xs font-mono text-gray-600 truncate bg-gray-50 p-1 rounded border border-gray-100">{s.ip}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h4 className="text-gray-800 font-bold text-lg mb-3">{t('monitorSummaryCountry')}</h4>
                                <div className="space-y-3">
                                    {countryStats.map((stat) => (
                                        <div key={stat.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                                                <span className="font-bold text-gray-700">{stat.name}</span>
                                                <div className="flex items-center space-x-3 text-[11px] font-black uppercase">
                                                    <span className="text-gray-400">{stat.total} Servers</span>
                                                    {stat.offline > 0 ? <span className="text-red-600">{stat.offline} OFF</span> : <span className="text-green-600">ONLINE</span>}
                                                </div>
                                            </div>
                                            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {stat.clubs.map((club) => (
                                                    <div key={club.name} className={`text-[10px] p-2 rounded border flex items-center justify-between font-bold ${club.offlineCount > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                                        <span className="truncate mr-2">{club.name}</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${club.offlineCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end items-center gap-3">
                            <button onClick={checkGlobalStatus} disabled={checking} className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-bold text-xs uppercase transition-colors hover:bg-gray-100 disabled:opacity-50">{checking ? t('monitorUpdating') : t('monitorUpdateNow')}</button>
                            <button onClick={() => setShowModal(false)} className="bg-[#0d1a2e] text-white px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-slate-800">{t('monitorClose')}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
