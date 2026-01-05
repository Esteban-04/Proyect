
import React, { useState, useEffect } from 'react';
import { Country, ServerDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon, PlusIcon, TrashIcon, ActivityIcon, GlobeIcon } from '../assets/icons';
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

const RemoteDesktopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);

const TeamViewerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const SERVER_CAMERA_DATA: CameraData[] = [
  { id: 1, name: 'VA | BOVEDA 1', ip: '192.168.2.187', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 2, name: 'VA | BOVEDA 2', ip: '192.168.2.188', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H264' },
  { id: 3, name: 'VA | BOVEDA CLICK & GO', ip: '192.168.2.230', manufacturer: 'Vivotek', user: 'root', password: 'password123', compression: 'H265' },
];

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack, canEdit }) => {
  const { t } = useLanguage();
  const [selectedServer, setSelectedServer] = useState<ServerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 'hybrid' es el modo por defecto que intenta Cloud y luego Local (VPN)
  const [verificationMode, setVerificationMode] = useState<'hybrid' | 'cloud'>('hybrid');

  const [visibleTablePasswords, setVisibleTablePasswords] = useState<Record<number, boolean>>({});
  const [visibleCardPasswords, setVisibleCardPasswords] = useState<Record<number, boolean>>({});
  const [visibleTvPasswords, setVisibleTvPasswords] = useState<Record<number, boolean>>({});

  const getStorageKey = (type: 'servers' | 'cameras') => {
      const safeClub = clubName.replace(/[^a-zA-Z0-9]/g, '_');
      return `config_${country.code}_${safeClub}_${type}`;
  };

  const [servers, setServers] = useState<ServerDetails[]>(() => {
    try {
        const key = getStorageKey('servers');
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(p => ({ ...p, status: 'checking' }));
        }
    } catch (e) {}
    return (CLUB_SPECIFIC_DEFAULTS[clubName] || []).map(s => ({...s, status: 'checking'}));
  });

  const [cameras, setCameras] = useState<CameraData[]>(() => {
      try {
          const key = getStorageKey('cameras');
          const saved = localStorage.getItem(key);
          if (saved) return JSON.parse(saved);
      } catch (e) {}
      return SERVER_CAMERA_DATA;
  });

  // TÉCNICA VPN AVANZADA: Intenta cargar un recurso desde el navegador. 
  // Funciona con VPN porque el navegador tiene acceso a la red local.
  const probeLocalIP = (ip: string): Promise<'online' | 'offline'> => {
      if (!ip || ip.includes('X') || ip === '0.0.0.0' || ip === 'N/A') return Promise.resolve('offline');
      
      return new Promise((resolve) => {
          // Usamos una técnica de carga de script/imagen para detectar presencia del host
          // sin disparar bloqueos de CORS (Mixed Content)
          const img = new Image();
          const timeout = setTimeout(() => {
              img.src = ""; // Abortar carga
              resolve('offline');
          }, 3500);

          img.onload = () => { clearTimeout(timeout); resolve('online'); };
          img.onerror = () => { 
              // En muchos casos, un error 404 o 403 significa que el servidor RESPONDIO, por lo tanto está online.
              clearTimeout(timeout); 
              resolve('online'); 
          };
          
          // Intentamos cargar algo común o simplemente tocar el puerto 80
          img.src = `http://${ip}/favicon.ico?nocache=${Date.now()}`;
      });
  };

  const checkServerStatus = async (isManual = false) => {
    if (isVerifying) return;
    setIsVerifying(true);
    
    // Resetear estados a 'verificando'
    setServers(prev => prev.map(s => ({ ...s, status: 'checking' })));

    const backendUrl = localStorage.getItem('saltex_backend_url') || window.location.origin;

    try {
        // 1. Primero intentamos vía Backend (siempre es bueno tener la info del server)
        const payload = servers.map(s => ({ id: s.id, ip: s.ip }));
        let cloudResults: any[] = [];
        
        try {
            const response = await fetch(`${backendUrl}/api/check-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servers: payload })
            });
            if (response.ok) {
                const data = await response.json();
                cloudResults = data.results || [];
            }
        } catch (e) {
            console.warn("Cloud check failed, falling back to local only");
        }

        // 2. Procesamiento híbrido: Si el cloud falla o dice offline, el navegador prueba localmente
        const finalStatuses = await Promise.all(servers.map(async (server) => {
            const cloudRes = cloudResults.find(r => r.id === server.id);
            let status = cloudRes ? cloudRes.status : 'offline';

            // Si el modo es híbrido y el cloud no lo ve, el navegador intenta por VPN
            if (verificationMode === 'hybrid' && status === 'offline') {
                const localStatus = await probeLocalIP(server.ip);
                status = localStatus;
            }

            return { id: server.id, status };
        }));

        setServers(prev => prev.map(s => {
            const res = finalStatuses.find(f => f.id === s.id);
            return { ...s, status: res ? res.status : 'offline' };
        }));

        if (isManual) showSuccess(t('saveSuccess'));
    } catch (error) {
        console.error("Critical verification error:", error);
        setServers(prev => prev.map(s => ({ ...s, status: 'offline' })));
    } finally {
        setIsVerifying(false);
    }
  };

  useEffect(() => {
      checkServerStatus(false);
      const interval = setInterval(() => checkServerStatus(false), 300000);
      return () => clearInterval(interval);
  }, [verificationMode]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleTablePassword = (id: number) => setVisibleTablePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCardPassword = (e: React.MouseEvent, id: number) => { e.stopPropagation(); setVisibleCardPasswords(prev => ({ ...prev, [id]: !prev[id] })); };
  const toggleTvPassword = (e: React.MouseEvent, id: number) => { e.stopPropagation(); setVisibleTvPasswords(prev => ({ ...prev, [id]: !prev[id] })); };

  const handleCameraChange = (id: number, field: keyof CameraData, value: string) => {
      if (!canEdit) return;
      setCameras(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleServerChange = (id: number, field: keyof ServerDetails, value: string) => {
      if (!canEdit) return;
      setServers(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const handleAddServer = () => {
      if (!canEdit) return;
      const newId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) + 1 : 1;
      setServers([...servers, { id: newId, name: `SERVER_${String(newId).padStart(2, '0')}`, ip: '', user: 'administrator', password: 'Completeview!', teamviewerId: '', teamviewerPassword: '', status: 'checking' }]);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => { e.stopPropagation(); if (canEdit) setServerToDelete(id); };

  const confirmDeleteServer = () => {
      if (serverToDelete !== null) {
          setServers(prev => prev.filter(s => s.id !== serverToDelete));
          setServerToDelete(null);
          showSuccess(t('serverDeleteSuccess'));
      }
  };
  
  const handleSave = () => {
      if (!canEdit) return;
      localStorage.setItem(getStorageKey('servers'), JSON.stringify(servers));
      localStorage.setItem(getStorageKey('cameras'), JSON.stringify(cameras));
      showSuccess(t('saveSuccess'));
  };

  if (selectedServer) {
    const filteredData = cameras.filter(camera => camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || camera.ip.includes(searchTerm));
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
          <div className="bg-[#0d1a2e] text-white p-6 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-xl font-black uppercase tracking-widest">{selectedServer.name}</h2>
                <p className="text-blue-400 text-xs font-bold uppercase">{clubName} - {country.name}</p>
            </div>
            <button onClick={() => setSelectedServer(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><XIcon className="h-6 w-6" /></button>
          </div>
          <div className="p-4 border-b bg-slate-50 flex items-center shrink-0">
            <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="text" placeholder={t('searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <div className="flex-grow overflow-auto">
             <div className="min-w-[900px]">
                 <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cámara</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">IP</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Codec</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredData.map((camera) => (
                      <tr key={camera.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{camera.id}</td>
                        <td className="px-6 py-4 text-sm font-black text-[#0d1a2e]">{camera.name}</td>
                        <td className="px-4 py-3"><input type="text" value={camera.ip} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'ip', e.target.value)} className="w-full bg-transparent border-none text-center font-mono text-xs" /></td>
                        <td className="px-4 py-3"><input type="text" value={camera.manufacturer} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'manufacturer', e.target.value)} className="w-full bg-transparent border-none text-center text-xs uppercase font-bold" /></td>
                        <td className="px-4 py-3"><input type="text" value={camera.user} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'user', e.target.value)} className="w-full bg-transparent border-none text-center text-xs" /></td>
                        <td className="px-4 py-3">
                            <div className="flex items-center space-x-2 justify-center">
                                 <input type={visibleTablePasswords[camera.id] ? 'text' : 'password'} value={camera.password} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'password', e.target.value)} className="w-full bg-transparent border-none text-center text-xs" />
                                <button onClick={() => toggleTablePassword(camera.id)} className="text-slate-300 hover:text-blue-500">{visibleTablePasswords[camera.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
                            </div>
                        </td>
                        <td className="px-4 py-3"><input type="text" value={camera.compression} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'compression', e.target.value)} className="w-full bg-transparent border-none text-center text-[10px] font-black text-blue-500" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
             <button onClick={() => setSelectedServer(null)} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100">Cerrar</button>
            {canEdit && <button onClick={handleSave} className="px-8 py-3 bg-[#0d1a2e] text-white rounded-xl flex items-center shadow-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800"><SaveIcon className="w-4 h-4 mr-2" />Guardar Cambios</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center relative px-2 py-4">
      {successMessage && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black animate-bounce text-sm uppercase tracking-widest">Success! {successMessage}</div>}
      
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-[#0d1a2e] tracking-tighter uppercase italic drop-shadow-sm">{clubName}</h2>
        <div className="flex items-center gap-3 mt-2">
            <img src={`https://flagcdn.com/w40/${country.code}.png`} className="h-4 rounded-sm border" />
            <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
            <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{country.name}</span>
        </div>
      </div>
      
      <div className="mb-8 w-full flex flex-col sm:flex-row justify-center sm:justify-between max-w-5xl items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto shadow-inner">
              <button onClick={() => setVerificationMode('cloud')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${verificationMode === 'cloud' ? 'bg-[#0d1a2e] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Cloud (Admin)</button>
              <button onClick={() => setVerificationMode('hybrid')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${verificationMode === 'hybrid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>VPN (Hybrid)</button>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="hidden lg:flex flex-col items-end mr-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Health</span>
                  <span className="text-xs font-bold text-slate-600 italic">Modo: {verificationMode === 'hybrid' ? 'Local VPN active' : 'Server Cloud only'}</span>
              </div>
              <button onClick={() => checkServerStatus(true)} disabled={isVerifying} className="w-full sm:w-auto flex items-center justify-center space-x-3 text-xs font-black uppercase tracking-widest text-white bg-[#0d1a2e] px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                {isVerifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ActivityIcon className="w-5 h-5" />}
                <span>{isVerifying ? 'Scanning...' : 'Verify Status'}</span>
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {servers.map((server) => (
            <div key={server.id} onClick={() => setSelectedServer(server)} className="group bg-[#0d1a2e] rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl cursor-pointer hover:shadow-blue-500/20 transition-all border border-slate-800 relative overflow-hidden active:scale-[0.98]">
                {/* Indicador de Status Visual Grande */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 transition-colors ${server.status === 'online' ? 'bg-green-500' : server.status === 'offline' ? 'bg-red-500' : 'bg-slate-500'}`}></div>

                {canEdit && <button onClick={(e) => handleDeleteClick(e, server.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 z-20 transition-colors"><TrashIcon className="w-5 h-5" /></button>}
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full border shadow-sm ${server.status === 'offline' ? 'bg-red-500/10 border-red-500/50 text-red-400' : server.status === 'online' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-500/10 border-slate-500/50 text-slate-400 animate-pulse'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${server.status === 'online' ? 'bg-green-400' : server.status === 'offline' ? 'bg-red-400' : 'bg-slate-400'}`}></div>
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">{server.status === 'offline' ? 'Offline' : server.status === 'online' ? 'Online' : 'Checking'}</span>
                        </div>
                        <h3 className="text-xl font-black italic tracking-tighter text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity">0{server.id}</h3>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{server.name}</h4>
                        <div className="flex items-center text-slate-500 font-mono text-lg bg-slate-900/50 p-3 rounded-xl border border-white/5">
                            <RemoteDesktopIcon className="w-5 h-5 mr-3 text-blue-500" />
                            <input type="text" value={server.ip || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'ip', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent border-none w-full text-white placeholder-slate-700 outline-none" placeholder="0.0.0.0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Acceso RDP</span>
                            <div className="text-xs font-bold text-slate-300 flex flex-col gap-1">
                                <span className="truncate opacity-60">U: {server.user}</span>
                                <div className="flex items-center justify-between">
                                    <span className="truncate opacity-60">P: {visibleCardPasswords[server.id] ? server.password : '••••••'}</span>
                                    <button onClick={(e) => toggleCardPassword(e, server.id)} className="text-slate-500 hover:text-white transition-colors">{visibleCardPasswords[server.id] ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}</button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">TeamViewer</span>
                            <div className="text-xs font-bold text-slate-300 flex flex-col gap-1">
                                <span className="truncate opacity-60">ID: {server.teamviewerId || '---'}</span>
                                <div className="flex items-center justify-between">
                                    <span className="truncate opacity-60">P: {visibleTvPasswords[server.id] ? server.teamviewerPassword : '••••••'}</span>
                                    <button onClick={(e) => toggleTvPassword(e, server.id)} className="text-slate-500 hover:text-white transition-colors">{visibleTvPasswords[server.id] ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {server.ip && !server.ip.includes('X') && server.ip !== 'N/A' && (
                        <div className="mt-6 flex justify-center">
                            <a 
                                href={`http://${server.ip}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center gap-2 text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-all"
                            >
                                <GlobeIcon className="w-4 h-4" /> Open Web UI
                            </a>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      <div className="mt-12 mb-10 w-full max-w-5xl flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="flex-1 bg-white text-[#0d1a2e] border-2 border-slate-200 font-black py-4 rounded-2xl shadow-lg hover:bg-slate-50 text-xs uppercase tracking-widest transition-all">Volver al Mapa</button>
        {canEdit && (
            <>
                <button onClick={handleAddServer} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center text-xs uppercase tracking-widest"><PlusIcon className="w-5 h-5 mr-2" />Añadir Servidor</button>
                <button onClick={handleSave} className="flex-1 bg-[#0d1a2e] text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-xs uppercase tracking-widest"><SaveIcon className="w-5 h-5 mr-2" />Guardar Cambios</button>
            </>
        )}
      </div>

      {serverToDelete !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <TrashIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar Servidor?</h3>
                  <p className="text-slate-400 text-sm mb-8 font-medium">Esta acción no se puede deshacer y eliminará toda la configuración de cámaras.</p>
                  <div className="flex gap-4">
                      <button onClick={() => setServerToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">No, cancelar</button>
                      <button onClick={confirmDeleteServer} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Sí, eliminar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FinalSelection;
