
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

    const probeLocalVPN = async (ip: string): Promise<'online' | 'offline'> => {
        if (!ip || ip.includes('X') || ip === 'N/A' || ip === '0.0.0.0') return 'offline';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        try {
            await fetch(`http://${ip}/favicon.ico?t=${Date.now()}`, { 
                mode: 'no-cors', 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            return 'online';
        } catch (e) {
            clearTimeout(timeoutId);
            const isNetworkError = e instanceof TypeError;
            return isNetworkError ? 'offline' : 'online';
        }
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
                
                if (status === 'offline') {
                    status = await probeLocalVPN(s.ip);
                }
                
                if (status === 'offline') {
                    finalOffline.push(s);
                }
            }

            setOfflineServers(finalOffline);
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));

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
            setReports(prev => [newReport, ...prev].slice(0, 20));
        }
    }, [checkGlobalStatus]);

    useEffect(() => {
        // Ejecución inmediata al montar
        checkGlobalStatus();
        // Se aumenta el intervalo de actualización a 60 segundos para evitar chequeos constantes de 10s
        const statusInterval = setInterval(() => checkGlobalStatus(false), 60000);
        const reportInterval = setInterval(() => generateSnapshotReport(), 5 * 60 * 1000);
        return () => { clearInterval(statusInterval); clearInterval(reportInterval); };
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
                className={`flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg transition-all border-none ${
                    totalOffline > 0 ? 'bg-[#8b222a] text-white' : 'bg-[#2e7d32] text-white'
                } hover:scale-105 active:scale-95`}
            >
                <LightningIcon className={`w-5 h-5 ${totalOffline > 0 ? 'text-white/70' : 'text-white'}`} />
                <span className="font-bold text-sm tracking-tight">
                    {checking ? 'Verificando...' : (totalOffline > 0 ? `${totalOffline} Fuera de Línea` : 'Sistemas OK')}
                </span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-[#f4f7f9] rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[96vh] border border-gray-200">
                        
                        <div className="bg-[#d32f2f] text-white px-6 py-5 relative shrink-0">
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="w-6 h-6" />
                                <h3 className="text-xl font-bold tracking-tight">Monitor de Sitios</h3>
                            </div>
                            <p className="text-white/80 text-[11px] mt-0.5">Captura en tiempo real - {lastUpdated}</p>
                            <button onClick={() => setShowModal(false)} className="absolute top-1/2 -translate-y-1/2 right-6 hover:opacity-70 transition-opacity">
                                <XIcon className="w-7 h-7" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 p-6 bg-white border-b border-gray-100 shrink-0">
                             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">TOTAL SERVIDORES</p>
                                <p className="text-5xl font-black text-[#1a2b4e]">{totalServers}</p>
                             </div>
                             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">EN LÍNEA</p>
                                <p className="text-5xl font-black text-[#2e7d32]">{totalOnline}</p>
                             </div>
                             <div className="bg-[#fffafa] p-6 rounded-xl border border-red-50 shadow-sm flex flex-col">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">FUERA DE LÍNEA</p>
                                <p className="text-5xl font-black text-[#d32f2f]">{totalOffline}</p>
                             </div>
                             <div className="bg-blue-50/20 p-6 rounded-xl border border-blue-50 shadow-sm flex flex-col">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">DISPONIBILIDAD</p>
                                <p className="text-5xl font-black text-blue-600">{totalServers > 0 ? ((totalOnline / totalServers) * 100).toFixed(1) : 0}%</p>
                             </div>
                        </div>

                        <div className="overflow-y-auto grow p-6 bg-[#fbfcfd] flex flex-col md:flex-row gap-8">
                            
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <GlobeIcon className="w-5 h-5 text-slate-400" />
                                    <h4 className="text-slate-800 font-black text-lg tracking-tight">Desglose Geográfico</h4>
                                </div>
                                <div className="space-y-4">
                                    {countryStats.map((stat) => (
                                        <div key={stat.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="bg-[#fcfdfe] px-6 py-3.5 flex justify-between items-center border-b border-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <img src={`https://flagcdn.com/w40/${stat.code === 'dhl' ? 'un' : stat.code}.png`} className="w-5 h-auto rounded-sm shadow-sm" alt="" />
                                                    <span className="font-black text-slate-700 text-xs uppercase tracking-widest">{stat.name}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    {stat.offline > 0 ? (
                                                        <span className="bg-[#ffebee] text-[#d32f2f] px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                                                            {stat.offline} FUERA DE LÍNEA
                                                        </span>
                                                    ) : (
                                                        <span className="bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                                                            SISTEMAS OK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-wrap gap-2.5">
                                                {stat.clubs.map((club) => (
                                                    <div key={club.name} className={`px-3 py-1.5 rounded-lg border flex items-center gap-2.5 text-[10px] font-bold ${club.offlineCount > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50/30 border-green-100 text-green-700'}`}>
                                                        <span>{club.name}</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${club.offlineCount > 0 ? 'bg-[#d32f2f] animate-pulse' : 'bg-[#2e7d32]'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-80 shrink-0 md:border-l md:pl-8 border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <FileTextIcon className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-slate-800 font-black text-lg tracking-tight">Reportes (5 min)</h4>
                                </div>
                                <div className="space-y-4">
                                    {reports.length === 0 ? (
                                        <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest leading-loose">
                                                ESPERANDO PRIMER REPORTE<br/>
                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded ml-1">AUTOMÁTICO...</span>
                                            </p>
                                        </div>
                                    ) : (
                                        reports.map((report, idx) => (
                                            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-in slide-in-from-right-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.timestamp}</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${parseFloat(report.percentage) > 95 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {report.percentage}% OK
                                                    </span>
                                                </div>
                                                <div className="flex gap-6 mb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">ONLINE</span>
                                                        <span className="text-base font-black text-green-600">{report.online}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">OFFLINE</span>
                                                        <span className="text-base font-black text-red-600">{report.offline}</span>
                                                    </div>
                                                </div>
                                                {report.offlineList.length > 0 && (
                                                    <div className="border-t border-gray-50 pt-3 mt-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Alertas detectadas:</p>
                                                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
                                                            {report.offlineList.slice(0, 5).map((off, i) => (
                                                                <p key={i} className="text-[9px] font-bold text-red-600 flex items-start gap-1">
                                                                    <span className="mt-1 w-1 h-1 bg-red-400 rounded-full shrink-0"></span>
                                                                    {off.club}
                                                                </p>
                                                            ))}
                                                            {report.offlineList.length > 5 && <p className="text-[8px] text-slate-400 italic font-bold">+ {report.offlineList.length - 5} más...</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t bg-white flex justify-end items-center gap-4 shrink-0 shadow-lg">
                            <button 
                                onClick={() => generateSnapshotReport()} 
                                disabled={checking} 
                                className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm text-[#1a2b4e] hover:bg-slate-50 transition-all flex items-center gap-2.5"
                            >
                                <FileTextIcon className="w-4 h-4 text-slate-400" />
                                Generar Reporte Ahora
                            </button>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="bg-[#0b1626] text-white px-10 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a2b4e] transition-all shadow-md"
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
