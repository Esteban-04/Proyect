
import React, { useState, useEffect, useCallback } from 'react';
import { Country, ServerDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon, PlusIcon, TrashIcon, ActivityIcon } from '../assets/icons';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';

interface CameraData {
  id: number;
  name: string;
  ip: string;
  manufacturer: string;
  user: string;
  password: string;
  compression: string;
}

interface FinalSelectionProps {
  country: Country;
  clubName: string;
  onBack: () => void;
  canEdit: boolean;
}

const MonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);

const TVIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack, canEdit }) => {
  const { t } = useLanguage();
  const [selectedServer, setSelectedServer] = useState<ServerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [servers, setServers] = useState<ServerDetails[]>([]);
  const [cameras, setCameras] = useState<CameraData[]>([]);

  const configKey = `config_${country.code}_${clubName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  const getBackendUrl = () => {
    const saved = localStorage.getItem('saltex_backend_url');
    return (saved && saved.trim() !== '') ? saved : window.location.origin;
  };

  const loadCloudData = useCallback(async () => {
    const backendUrl = getBackendUrl();
    try {
        const response = await fetch(`${backendUrl}/api/get-config/${configKey}`);
        if (!response.ok) throw new Error("Invalid response");
        const data = await response.json();
        if (data.servers && data.servers.length > 0) {
            setServers(data.servers.map((s: any) => ({ ...s, status: s.status || 'checking' })));
            setCameras(data.cameras || []);
        } else {
            setServers((CLUB_SPECIFIC_DEFAULTS[clubName] || []).map(s => ({ ...s, status: 'checking' })));
            setCameras([]);
        }
    } catch (e) {
        setServers((CLUB_SPECIFIC_DEFAULTS[clubName] || []).map(s => ({ ...s, status: 'checking' })));
    }
  }, [clubName, configKey]);

  useEffect(() => { loadCloudData(); }, [loadCloudData]);

  const probeLocalVPN = (ip: string): Promise<'online' | 'offline'> => {
      if (!ip || ip.includes('X') || ip === 'N/A' || ip === '0.0.0.0') return Promise.resolve('offline');
      return new Promise((resolve) => {
          const img = new Image();
          const timer = setTimeout(() => { resolve('offline'); }, 2500);
          img.onload = () => { clearTimeout(timer); resolve('online'); };
          img.onerror = () => { clearTimeout(timer); resolve('online'); };
          img.src = `http://${ip}/favicon.ico?t=${Date.now()}`;
      });
  };

  const checkServerStatus = async (isManual = false) => {
    if (isVerifying || servers.length === 0) return;
    setIsVerifying(true);
    setServers(prev => prev.map(s => ({ ...s, status: 'checking' })));
    const backendUrl = getBackendUrl();

    try {
        const cloudRes = await fetch(`${backendUrl}/api/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servers })
        }).catch(() => null);
        
        const cloudData = cloudRes && cloudRes.ok ? await cloudRes.json() : { results: [] };

        const updated = await Promise.all(servers.map(async (s) => {
            const res = cloudData.results.find((r: any) => r.id === s.id);
            let status = res ? res.status : 'offline';
            if (status === 'offline') status = await probeLocalVPN(s.ip);
            return { ...s, status };
        }));

        setServers(updated as ServerDetails[]);
        if (isManual) showSuccess(t('saveSuccess'));
    } finally {
        setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    const backendUrl = getBackendUrl();
    try {
        const res = await fetch(`${backendUrl}/api/save-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: configKey, servers, cameras })
        });
        if (res.ok) showSuccess(t('saveSuccess'));
    } catch (e) { showSuccess("Error"); }
  };

  const handleServerFieldChange = (serverId: number, field: keyof ServerDetails, value: string) => {
    setServers(prev => prev.map(s => s.id === serverId ? { ...s, [field]: value } : s));
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleVisibility = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddServer = () => {
      const newId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) + 1 : 1;
      const newName = `${t('serverNamePrefix')} ${String(newId).padStart(2, '0')}`;
      setServers([...servers, { id: newId, name: newName, ip: '', user: 'administrator', password: 'Completeview!', teamviewerId: '', teamviewerPassword: '', status: 'checking' }]);
  };

  const confirmDeleteServer = () => { if (serverToDelete !== null) { setServers(prev => prev.filter(s => s.id !== serverToDelete)); setServerToDelete(null); } };

  const inputStyle = "bg-transparent border-none text-white focus:ring-1 focus:ring-blue-500/50 rounded px-1 transition-all outline-none w-full";

  return (
    <div className="w-full flex flex-col items-center relative px-2 py-4 bg-gray-50/10">
      {successMessage && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black animate-bounce text-sm uppercase">{successMessage}</div>}
      
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <div className="flex items-center gap-3 mb-2">
            <img src={`https://flagcdn.com/w80/${country.code}.png`} className="h-6 rounded-sm shadow-sm" alt="Flag" />
            <h2 className="text-4xl font-black text-[#0d1a2e] tracking-tight uppercase italic">{clubName}</h2>
        </div>
      </div>
      
      <div className="mb-8 w-full flex justify-end max-w-6xl items-center gap-4">
          <button onClick={() => checkServerStatus(true)} disabled={isVerifying} className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-all group">
            <ActivityIcon className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 ${isVerifying ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{isVerifying ? t('statusChecking') : t('checkStatusButton')}</span>
          </button>
      </div>

      {/* Grid de Servidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl">
        {servers.map((server, index) => {
            const isOddTotal = servers.length % 2 !== 0;
            const isFirstAndOdd = index === 0 && isOddTotal;
            const serverTitle = server.name.toUpperCase().replace('SERVER', t('serverNamePrefix')).replace('SERVIDOR', t('serverNamePrefix')).replace('_', ' ');

            return (
                <div 
                    key={server.id} 
                    className={`group bg-[#0d1a2e] rounded-xl p-8 text-white shadow-2xl relative border border-white/5 transition-all duration-300 ${isFirstAndOdd ? 'md:col-span-2' : ''}`}
                >
                    {/* EN LÍNEA / FUERA DE LÍNEA */}
                    <div className="absolute top-6 left-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${server.status === 'online' ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'bg-red-600/20 border-red-500/30 text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`}></div>
                            <span className="text-[10px] font-black tracking-widest uppercase">{server.status === 'online' ? t('statusOnline') : t('statusOffline')}</span>
                        </div>
                    </div>

                    {/* Trash Button */}
                    {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); setServerToDelete(server.id); }} className="absolute top-6 right-6 text-slate-500 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div className="mt-8">
                        {/* SERVIDOR 0X */}
                        <div className="text-center mb-10">
                            <input 
                              value={serverTitle}
                              onChange={(e) => handleServerFieldChange(server.id, 'name', e.target.value)}
                              readOnly={!canEdit}
                              className="text-xl font-black uppercase tracking-[0.2em] text-white/90 bg-transparent border-none text-center focus:ring-0 w-full"
                            />
                            <div className="w-full h-px bg-white/10 mt-6"></div>
                        </div>

                        <div className={`space-y-10 ${isFirstAndOdd ? 'grid md:grid-cols-2 md:gap-x-12 md:space-y-0' : ''}`}>
                            {/* Escritorio Remoto Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MonitorIcon className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">{t('remoteDesktopLabel')}</span>
                                </div>
                                <div className="pl-6 space-y-3">
                                    <input 
                                      value={server.ip || ''} 
                                      onChange={(e) => handleServerFieldChange(server.id, 'ip', e.target.value)}
                                      readOnly={!canEdit}
                                      placeholder="0.0.0.0"
                                      className={`${inputStyle} text-2xl font-black tracking-tight`}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">{t('userLabel')}</span>
                                        <input 
                                          value={server.user || ''} 
                                          onChange={(e) => handleServerFieldChange(server.id, 'user', e.target.value)}
                                          readOnly={!canEdit}
                                          className={`${inputStyle} text-[13px] font-bold`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">{t('finalPasswordLabel')}</span>
                                            <input 
                                              type={visiblePasswords[`srv_${server.id}_p`] ? 'text' : 'password'}
                                              value={server.password || ''} 
                                              onChange={(e) => handleServerFieldChange(server.id, 'password', e.target.value)}
                                              readOnly={!canEdit}
                                              className={`${inputStyle} text-[13px] font-bold tracking-widest`}
                                            />
                                        </div>
                                        <button onClick={(e) => toggleVisibility(e, `srv_${server.id}_p`)} className="text-slate-500 hover:text-white transition-colors">
                                            {visiblePasswords[`srv_${server.id}_p`] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TeamViewer Section */}
                            <div className={`space-y-4 pt-8 border-t border-white/5 ${isFirstAndOdd ? 'md:pt-0 md:border-t-0 md:border-l md:pl-10' : ''}`}>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <TVIcon className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">TeamViewer:</span>
                                </div>
                                <div className="pl-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">{t('idLabel')}</span>
                                        <input 
                                          value={server.teamviewerId || ''} 
                                          onChange={(e) => handleServerFieldChange(server.id, 'teamviewerId', e.target.value)}
                                          readOnly={!canEdit}
                                          placeholder="--- --- ---"
                                          className={`${inputStyle} text-2xl font-black tracking-tight`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">{t('finalPasswordLabel')}</span>
                                            <input 
                                              type={visiblePasswords[`srv_${server.id}_tv`] ? 'text' : 'password'}
                                              value={server.teamviewerPassword || ''} 
                                              onChange={(e) => handleServerFieldChange(server.id, 'teamviewerPassword', e.target.value)}
                                              readOnly={!canEdit}
                                              className={`${inputStyle} text-[13px] font-bold tracking-widest`}
                                            />
                                        </div>
                                        <button onClick={(e) => toggleVisibility(e, `srv_${server.id}_tv`)} className="text-slate-500 hover:text-white transition-colors">
                                            {visiblePasswords[`srv_${server.id}_tv`] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-20 mb-10 w-full max-w-4xl flex flex-col sm:flex-row gap-6 justify-center">
        <button onClick={onBack} className="w-full sm:w-48 bg-white text-[#0d1a2e] border-2 border-slate-200 font-black py-4 rounded-xl shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">{t('backButton')}</button>
        {canEdit && (
            <>
                <button onClick={handleAddServer} className="w-full sm:w-64 bg-blue-600 text-white font-black py-4 rounded-xl shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center text-xs uppercase tracking-widest gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {t('addServerButton')}
                </button>
                <button onClick={handleSave} className="w-full sm:w-48 bg-[#0d1a2e] text-white font-black py-4 rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center text-xs uppercase tracking-widest gap-2">
                    <SaveIcon className="w-5 h-5" />
                    {t('saveButton')}
                </button>
            </>
        )}
      </div>

      {serverToDelete !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
              <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100">
                  <h3 className="text-2xl font-black text-[#0d1a2e] mb-4 uppercase italic tracking-tighter">{t('deleteServerConfirm')}</h3>
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setServerToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">{t('noButton')}</button>
                      <button onClick={confirmDeleteServer} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl tracking-widest">{t('yesButton')}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FinalSelection;
