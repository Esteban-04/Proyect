
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COUNTRIES, DHL_DATA } from '../constants';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';
import { ServerDetails } from '../types';
import { XIcon, GlobeIcon, ActivityIcon } from '../assets/icons';
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

interface StatusReport {
    timestamp: string;
    total: number;
    online: number;
    offline: number;
    offlineList: { club: string, country: string, name: string }[];
    percentage: string;
}

const LightningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const ServerStatusSummary: React.FC = () => {
    const { t } = useLanguage();
    const [allServers, setAllServers] = useState<FlatServer[]>([]);
    const [offlineServers, setOfflineServers] = useState<FlatServer[]>([]);
    const [checking, setChecking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [reports, setReports] = useState<StatusReport[]>([]);
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
            const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
            setLastUpdated(timeStr);

            return { total: gatheredServers.length, offline: finalOffline };
        } catch (error) {
            console.error("Global monitor error:", error);
            return null;
        } finally {
            setChecking(false);
            checkingRef.current = false;
        }
    }, []);

    const generateSnapshotReport = useCallback(async () => {
        const data = await checkGlobalStatus(true);
        if (data) {
            const online = data.total - data.offline.length;
            const percentage = ((online / data.total) * 100).toFixed(1);
            const newReport: StatusReport = {
                timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                total: data.total,
                online: online,
                offline: data.offline.length,
                offlineList: data.offline.map(s => ({ club: s.club, country: s.country, name: s.name })),
                percentage: percentage
            };
            setReports(prev => [newReport, ...prev].slice(0, 20)); // Guardar últimos 20 reportes
        }
    }, [checkGlobalStatus]);

    useEffect(() => {
        checkGlobalStatus();
        // Verificación cada 10 segundos
        const statusInterval = setInterval(() => checkGlobalStatus(false), 10000);
        // Reporte resumido cada 5 minutos
        const reportInterval = setInterval(() => generateSnapshotReport(), 5 * 60 * 1000);
        
        return () => {
            clearInterval(statusInterval);
            clearInterval(reportInterval);
        };
    }, [checkGlobalStatus, generateSnapshotReport]);

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
                    <div className="bg-[#f4f7f9] rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-gray-200">
                        
                        {/* Header Rojo */}
                        <div className="bg-[#d32f2f] text-white p-6 relative shrink-0">
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Monitor de Sitios</h3>
                            </div>
                            <p className="text-white/80 text-xs mt-1">Captura en tiempo real - {lastUpdated}</p>
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity">
                                <XIcon className="w-7 h-7" />
                            </button>
                        </div>
                        
                        {/* Dashboard Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-white border-b border-gray-200 shrink-0">
                             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-[#6b7c93] text-[10px] font-bold uppercase mb-1">TOTAL SERVIDORES</p>
                                <p className="text-3xl font-black text-[#1a2b4e]">{totalServers}</p>
                             </div>
                             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-[#6b7c93] text-[10px] font-bold uppercase mb-1">EN LÍNEA</p>
                                <p className="text-3xl font-black text-[#2e7d32]">{totalOnline}</p>
                             </div>
                             <div className="bg-[#fffafa] p-5 rounded-xl border border-red-100 shadow-sm">
                                <p className="text-[#6b7c93] text-[10px] font-bold uppercase mb-1">FUERA DE LÍNEA</p>
                                <p className="text-3xl font-black text-[#d32f2f]">{totalOffline}</p>
                             </div>
                             <div className="bg-blue-50/30 p-5 rounded-xl border border-blue-100 shadow-sm">
                                <p className="text-[#6b7c93] text-[10px] font-bold uppercase mb-1">DISPONIBILIDAD</p>
                                <p className="text-3xl font-black text-blue-600">{totalServers > 0 ? ((totalOnline / totalServers) * 100).toFixed(1) : 0}%</p>
                             </div>
                        </div>

                        {/* Contenido principal */}
                        <div className="overflow-y-auto grow p-6 bg-[#fbfcfd] flex flex-col md:flex-row gap-8">
                            
                            {/* Columna Izquierda: Estado Actual */}
                            <div className="flex-1 space-y-8">
                                {totalOffline > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <LightningIcon className="w-5 h-5 text-[#d32f2f]" />
                                            <h4 className="text-[#b71c1c] font-black text-lg">Alertas Críticas</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {offlineServers.map((s, idx) => (
                                                <div key={idx} className="bg-white rounded-lg border-l-4 border-l-[#d32f2f] border border-gray-200 p-4 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-[#1a2b4e] text-sm">{s.club}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{s.country}</p>
                                                        </div>
                                                        <span className="text-[9px] font-black text-[#d32f2f] bg-[#ffebee] px-2 py-0.5 rounded uppercase">{s.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-slate-700 font-black text-lg flex items-center gap-2">
                                        <GlobeIcon className="w-5 h-5 text-slate-400" />
                                        Desglose Geográfico
                                    </h4>
                                    {countryStats.map((stat) => (
                                        <div key={stat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="bg-[#f8f9fa] px-6 py-3 flex justify-between items-center border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://flagcdn.com/w40/${stat.code === 'dhl' ? 'un' : stat.code}.png`} className="w-5 rounded-sm" alt="" />
                                                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{stat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {stat.offline > 0 ? (
                                                        <span className="bg-[#ffebee] text-[#d32f2f] px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter">
                                                            {stat.offline} OFFLINE
                                                        </span>
                                                    ) : (
                                                        <span className="bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter">
                                                            SISTEMAS OK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-3 flex flex-wrap gap-2">
                                                {stat.clubs.map((club) => (
                                                    <div key={club.name} className={`px-2 py-1 rounded border flex items-center gap-2 text-[10px] font-bold ${club.offlineCount > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50/20 border-green-100 text-green-700'}`}>
                                                        <span>{club.name}</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${club.offlineCount > 0 ? 'bg-[#d32f2f] animate-pulse' : 'bg-[#2e7d32]'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Columna Derecha: Reportes Históricos (Cada 5 min) */}
                            <div className="w-full md:w-80 shrink-0 border-l md:pl-8 border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <FileTextIcon className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-slate-800 font-black text-lg">Reportes (5 min)</h4>
                                </div>
                                <div className="space-y-4">
                                    {reports.length === 0 ? (
                                        <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Esperando primer reporte automático...</p>
                                        </div>
                                    ) : (
                                        reports.map((report, idx) => (
                                            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.timestamp}</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${parseFloat(report.percentage) > 95 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {report.percentage}%
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Online</span>
                                                        <span className="text-sm font-black text-green-600">{report.online}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Offline</span>
                                                        <span className="text-sm font-black text-red-600">{report.offline}</span>
                                                    </div>
                                                </div>
                                                {report.offlineList.length > 0 && (
                                                    <div className="border-t pt-2 mt-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sedes con fallo:</p>
                                                        <div className="max-h-20 overflow-y-auto space-y-1">
                                                            {report.offlineList.map((off, i) => (
                                                                <p key={i} className="text-[9px] font-bold text-red-500">• {off.club} ({off.country})</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-white flex justify-end items-center gap-3 shrink-0">
                            <button 
                                onClick={() => generateSnapshotReport()} 
                                disabled={checking} 
                                className="bg-white border border-[#d1d5db] px-5 py-2 rounded-lg font-bold text-sm text-[#1a2b4e] hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <FileTextIcon className="w-4 h-4" />
                                Generar Reporte Ahora
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
