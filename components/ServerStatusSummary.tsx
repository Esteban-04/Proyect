
import React, { useState, useEffect } from 'react';
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
    const [checking, setChecking] = useState(true);
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

    const checkGlobalStatus = async () => {
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
        const payload = gatheredServers.map((s, i) => ({ id: i, ip: s.ip }));
        
        if (payload.length === 0) {
            setChecking(false);
            setOfflineServers([]);
            setLastUpdated(new Date());
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            // CORRECCIÓN: Usar ruta relativa para que funcione en Railway independientemente del dominio
            const backendUrl = localStorage.getItem('saltex_backend_url') || '';
            const apiEndpoint = backendUrl ? `${backendUrl}/api/check-status` : '/api/check-status';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: payload }),
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);

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
    };

    useEffect(() => {
        checkGlobalStatus();
        const interval = setInterval(checkGlobalStatus, 60000 * 5);
        return () => clearInterval(interval);
    }, []);

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
                    checking ? 'bg-gray-100 text-gray-600 border-gray-300' : 
                    hasIssues ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                }`}
            >
                {checking ? <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div> : <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="hidden sm:inline">
                    {backendDisconnected ? 'Backend Offline' : checking ? t('monitorChecking') : (hasIssues ? `${offlineServers.length} ${t('monitorOffline')}` : t('monitorSystemOnline'))}
                </span>
                <span className="sm:hidden">
                     {backendDisconnected ? 'ERR' : checking ? '...' : (hasIssues ? `${offlineServers.length} ${t('monitorOfflineShort')}` : t('monitorOnlineShort'))}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className={`${hasIssues ? 'bg-red-600' : 'bg-[#0d1a2e]'} text-white p-4 sm:p-6 flex justify-between items-center transition-colors`}>
                            <div>
                                <h3 className="font-bold text-xl sm:text-2xl flex items-center"><GlobeIcon className="w-6 h-6 mr-2" />{t('monitorTitle')}</h3>
                                <p className="text-white/80 text-sm mt-1">{backendDisconnected ? '⚠️ Backend no responde' : checking ? t('monitorStatusUpdate') : `${t('monitorLastUpdate')}: ${lastUpdated?.toLocaleTimeString()}`}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><XIcon className="w-8 h-8" /></button>
                        </div>
                        
                        <div className="p-4 sm:p-6 bg-gray-50 border-b flex flex-wrap gap-4">
                             <div className="flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">{t('monitorTotalServers')}</div>
                                <div className="text-3xl font-black text-gray-800">{allServers.length}</div>
                             </div>
                             <div className="flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">{t('monitorOnline')}</div>
                                <div className="text-3xl font-black text-green-600">{allServers.length - offlineServers.length}</div>
                             </div>
                             <div className={`flex-1 min-w-[140px] bg-white p-4 rounded-lg shadow-sm border ${hasIssues ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">{t('monitorOffline')}</div>
                                <div className={`text-3xl font-black ${hasIssues ? 'text-red-600' : 'text-gray-400'}`}>{offlineServers.length}</div>
                             </div>
                        </div>

                        <div className="overflow-y-auto flex-grow p-4 sm:p-6 space-y-6">
                            {backendDisconnected && <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm font-medium">⚠️ El backend de monitoreo no responde. Verifica que el servidor esté activo.</div>}
                            {hasIssues && (
                                <div>
                                    <h4 className="text-red-700 font-bold text-lg mb-3 flex items-center"><ActivityIcon className="w-5 h-5 mr-2" />{t('monitorIssuesTitle')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {offlineServers.map((s, idx) => (
                                            <div key={idx} className="bg-white border-l-4 border-red-500 rounded shadow-sm p-3">
                                                <div className="flex justify-between items-start">
                                                    <div><div className="font-bold text-gray-900 text-sm">{s.club}</div><div className="text-xs text-gray-500">{s.country}</div></div>
                                                </div>
                                                <div className="mt-2 text-xs font-mono text-gray-600 truncate">{s.name}: {s.ip}</div>
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
                                                <div className="flex items-center">
                                                    <span className="font-bold text-gray-700">{stat.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <span className="text-gray-500">{stat.total} Servers</span>
                                                    {stat.offline > 0 ? <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded">{stat.offline} {t('monitorOffline')}</span> : <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded">OK</span>}
                                                </div>
                                            </div>
                                            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {stat.clubs.map((club) => (
                                                    <div key={club.name} className={`text-xs p-2 rounded border flex items-center justify-between ${club.offlineCount > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                                                        <span className="truncate mr-2 font-medium" title={club.name}>{club.name}</span>
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${club.offlineCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end items-center">
                            <button onClick={checkGlobalStatus} disabled={checking} className="mr-3 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50">{checking ? t('monitorUpdating') : t('monitorUpdateNow')}</button>
                            <button onClick={() => setShowModal(false)} className="bg-[#0d1a2e] text-white px-6 py-2 rounded-lg font-medium text-sm">{t('monitorClose')}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServerStatusSummary;
