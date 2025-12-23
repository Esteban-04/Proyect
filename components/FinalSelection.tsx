
import React, { useState, useEffect } from 'react';
import { Country, ServerDetails } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon, PlusIcon, TrashIcon, ActivityIcon } from '../assets/icons';
import { CLUB_SPECIFIC_DEFAULTS } from '../config/serverDefaults';

// --- Interfaces ---

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

// --- Icons ---

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

const createDefaultServers = (count: number, baseIp: string): ServerDetails[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `SERVER_${String(i + 1).padStart(2, '0')}`,
      ip: baseIp.includes('X') ? baseIp.replace('X', String((i + 1) * 10)) : baseIp,
      user: 'administrator',
      password: 'Completeview!',
      teamviewerId: '',
      teamviewerPassword: '',
      status: 'checking'
    }));
};

const SERVER_CAMERA_DATA: CameraData[] = [
  { id: 1, name: 'VA | BOVEDA 1', ip: '192.168.2.187', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 2, name: 'VA | BOVEDA 2', ip: '192.168.2.188', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H264' },
  { id: 3, name: 'VA | BOVEDA CLICK & GO', ip: '192.168.2.230', manufacturer: 'Vivotek', user: 'root', password: 'password123', compression: 'H265' },
  { id: 4, name: 'VA | CONTEO 1', ip: '192.168.2.186', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 5, name: 'VA | ENTRADA CONTEO', ip: '192.168.2.189', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 6, name: 'FE | ENTRADA SOCIOS', ip: '192.168.2.120', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H264' },
  { id: 7, name: 'FE | FACIAL', ip: '192.168.2.224', manufacturer: 'Vivotek', user: 'root', password: 'password123', compression: 'H264' },
];

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack, canEdit }) => {
  const { t } = useLanguage();
  const [selectedServer, setSelectedServer] = useState<ServerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);
  const [visibleTablePasswords, setVisibleTablePasswords] = useState<Record<number, boolean>>({});
  const [visibleCardPasswords, setVisibleCardPasswords] = useState<Record<number, boolean>>({});
  const [visibleTvPasswords, setVisibleTvPasswords] = useState<Record<number, boolean>>({});

  const getStorageKey = (type: 'servers' | 'cameras') => {
      const safeClub = clubName.replace(/[^a-zA-Z0-9]/g, '_');
      return `config_${country.code}_${safeClub}_${type}`;
  };

  const getServerName = (id: number) => {
      return `${t('serverNamePrefix')} ${String(id).padStart(2, '0')}`;
  };

  const [servers, setServers] = useState<ServerDetails[]>(() => {
    try {
        const key = getStorageKey('servers');
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(p => ({ ...p, status: p.status || 'checking' }));
            }
        }
    } catch (e) {
        console.error("Error loading saved servers:", e);
    }
    if (CLUB_SPECIFIC_DEFAULTS[clubName]) {
        return CLUB_SPECIFIC_DEFAULTS[clubName].map(s => ({...s, status: 'checking'}));
    }
    return createDefaultServers(3, '192.168.1.X');
  });

  const [cameras, setCameras] = useState<CameraData[]>(() => {
      try {
          const key = getStorageKey('cameras');
          const saved = localStorage.getItem(key);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) return parsed;
          }
      } catch (e) {
          console.error("Error loading saved cameras:", e);
      }
      return SERVER_CAMERA_DATA;
  });

  const checkServerStatus = async (isManual = false) => {
    setServers(prev => prev.map(s => ({ ...s, status: 'checking' })));
    if (isManual) setAlertMessage(null);

    const backendUrl = localStorage.getItem('saltex_backend_url') || 'http://localhost:3001';

    try {
        const payload = servers.map(s => ({ id: s.id, ip: s.ip }));
        const response = await fetch(`${backendUrl}/api/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servers: payload })
        });

        if (!response.ok) throw new Error('Backend not reachable');

        const data = await response.json();
        const results = data.results || [];

        setServers(prev => prev.map(s => {
            const result = results.find((r: any) => r.id === s.id);
            return { ...s, status: result ? result.status : 'offline' };
        }));
        
    } catch (error) {
        setServers(prev => prev.map(s => ({ ...s, status: 'offline' })));
    }
  };

  useEffect(() => {
      checkServerStatus(false);
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleTablePassword = (id: number) => {
    setVisibleTablePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCardPassword = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setVisibleCardPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTvPassword = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setVisibleTvPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      const maxId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) : 0;
      const newId = maxId + 1;
      const newServer: ServerDetails = {
          id: newId,
          name: `SERVER_${String(newId).padStart(2, '0')}`,
          ip: '',
          user: 'administrator',
          password: 'Completeview!',
          teamviewerId: '',
          teamviewerPassword: '',
          status: 'checking'
      };
      setServers([...servers, newServer]);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (!canEdit) return;
      setServerToDelete(id);
  };

  const confirmDeleteServer = () => {
      if (serverToDelete !== null) {
          setServers(prev => prev.filter(s => s.id !== serverToDelete));
          setServerToDelete(null);
          showSuccess(t('serverDeleteSuccess'));
      }
  };
  
  const handleSave = () => {
      if (!canEdit) return;
      try {
          localStorage.setItem(getStorageKey('servers'), JSON.stringify(servers));
          localStorage.setItem(getStorageKey('cameras'), JSON.stringify(cameras));
          showSuccess(t('saveSuccess'));
      } catch (e) {
          console.error("Error saving data:", e);
          alert("Error al guardar los datos.");
      }
  };

  if (selectedServer) {
    const filteredData = cameras.filter(camera => 
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      camera.ip.includes(searchTerm)
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="bg-[#0d1a2e] text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('modalTitle', getServerName(selectedServer.id), clubName)}</h2>
            <button onClick={() => setSelectedServer(null)} className="text-gray-300 hover:text-white"><XIcon className="h-6 w-6" /></button>
          </div>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder={t('searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0d1a2e] sm:text-sm" />
            </div>
          </div>
          <div className="flex-grow overflow-auto p-0">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">{t('colIndex')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">{t('colName')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('colIp')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('colManufacturer')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('colUser')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('colPassword')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('colCompression')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((camera) => (
                  <tr key={camera.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{camera.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{camera.name}</td>
                    <td className="px-4 py-3 text-center"><input type="text" value={camera.ip} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'ip', e.target.value)} className="w-full bg-transparent border-none text-center sm:text-sm" /></td>
                    <td className="px-4 py-3 text-center"><input type="text" value={camera.manufacturer} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'manufacturer', e.target.value)} className="w-full bg-transparent border-none text-center sm:text-sm" /></td>
                    <td className="px-4 py-3 text-center"><input type="text" value={camera.user} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'user', e.target.value)} className="w-full bg-transparent border-none text-center sm:text-sm" /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2 justify-center">
                             <input type={visibleTablePasswords[camera.id] ? 'text' : 'password'} value={camera.password} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'password', e.target.value)} className="w-full bg-transparent border-none text-center sm:text-sm" />
                            <button onClick={() => toggleTablePassword(camera.id)} className="text-gray-400 hover:text-gray-600 focus:outline-none">{visibleTablePasswords[camera.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center"><input type="text" value={camera.compression} readOnly={!canEdit} onChange={(e) => handleCameraChange(camera.id, 'compression', e.target.value)} className="w-full bg-transparent border-none text-center sm:text-sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
             <button onClick={() => setSelectedServer(null)} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-sm font-medium">{t('closeButton')}</button>
            {canEdit && <button onClick={handleSave} className="bg-[#0d1a2e] text-white px-4 py-2 rounded-md hover:bg-[#1a2b4e] flex items-center shadow-md font-medium"><SaveIcon className="w-4 h-4 mr-2" />{t('saveButton')}</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center relative">
      {successMessage && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl font-bold animate-bounce">{successMessage}</div>}
      {alertMessage && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-center max-w-xl animate-pulse"><span>{alertMessage}</span><button onClick={() => setAlertMessage(null)} className="ml-4 hover:opacity-75">✕</button></div>}
      
      {serverToDelete !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-60">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full text-center border-t-4 border-red-500">
                  <h3 className="text-lg font-bold mb-2">{t('actionDelete')}</h3>
                  <p className="text-sm text-gray-500 mb-6">{t('deleteServerConfirm')}</p>
                  <div className="flex justify-center space-x-4">
                      <button onClick={() => setServerToDelete(null)} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium">{t('noButton')}</button>
                      <button onClick={confirmDeleteServer} className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-medium shadow-sm">{t('yesButton')}</button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex items-center justify-center mb-8">
        <h2 className="text-3xl font-bold text-[#0d1a2e]">{clubName}</h2>
      </div>
      
      <div className="mb-6 w-full flex justify-end max-w-5xl items-center space-x-2">
          <button onClick={() => checkServerStatus(true)} className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-[#0d1a2e] bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all"><ActivityIcon className="w-5 h-5" /><span>{t('checkStatusButton')}</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {servers.map((server) => (
            <div key={server.id} onClick={() => setSelectedServer(server)} className="rounded-lg p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border relative group bg-[#0d1a2e] border-[#1a2b4e]">
                {canEdit && <button onClick={(e) => handleDeleteClick(e, server.id)} className="absolute top-2 right-2 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 z-20"><TrashIcon className="w-5 h-5" /></button>}
                <div className="border-b border-white/20 pb-2 mb-4 flex flex-col justify-between min-h-[4rem]">
                    <div className="flex justify-start w-full mb-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-md border shadow-sm ${server.status === 'offline' ? 'bg-red-600 border-red-400' : server.status === 'online' ? 'bg-green-600 border-green-500' : 'bg-gray-600 border-gray-500 animate-pulse'}`}>
                            <span className="w-2.5 h-2.5 rounded-full mr-2 bg-white"></span>
                            <span className="text-xs font-bold tracking-wider uppercase">{server.status === 'offline' ? t('statusOffline') : server.status === 'online' ? t('statusOnline') : t('statusChecking')}</span>
                        </div>
                    </div>
                    <div className="text-center w-full"><h3 className="text-xl font-bold uppercase tracking-wider">{getServerName(server.id)}</h3></div>
                </div>
                <div className="flex flex-col space-y-6 px-4">
                    <div>
                        <div className="flex items-center mb-1"><RemoteDesktopIcon className="w-5 h-5 mr-2" /><span className="text-gray-300 text-sm font-medium">{t('remoteDesktopLabel')}</span></div>
                        <div className="pl-7">
                            <input type="text" value={server.ip || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'ip', e.target.value)} onClick={(e) => e.stopPropagation()} className="text-2xl font-bold bg-transparent border-none focus:outline-none w-full" />
                            <div className="flex items-center text-sm text-gray-300 mt-2"><span className="mr-2 opacity-80">{t('userLabel')}</span><input type="text" value={server.user || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'user', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent border-none focus:outline-none flex-grow" /></div>
                            <div className="flex items-center text-sm text-gray-300 mt-1"><span className="mr-2 opacity-80">{t('finalPasswordLabel')}</span><div className="flex items-center flex-grow"><input type={visibleCardPasswords[server.id] ? 'text' : 'password'} value={server.password || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'password', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent border-none focus:outline-none w-full" /><button onClick={(e) => toggleCardPassword(e, server.id)} className="ml-2 text-gray-400 hover:text-white">{visibleCardPasswords[server.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button></div></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center mb-1"><div className="bg-gray-600 rounded-full p-0.5 mr-2"><TeamViewerIcon className="w-3 h-3 text-white" /></div><span className="text-gray-300 text-sm font-medium">TeamViewer:</span></div>
                        <div className="pl-7">
                            <div className="flex items-center text-xl font-bold mb-1"><span className="mr-2 text-gray-300 text-base font-normal opacity-80">{t('idLabel')}</span><input type="text" value={server.teamviewerId || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'teamviewerId', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent border-none focus:outline-none w-full" /></div>
                            <div className="flex items-center text-sm text-gray-300"><span className="mr-2 opacity-80">{t('finalPasswordLabel')}</span><div className="flex items-center flex-grow"><input type={visibleTvPasswords[server.id] ? 'text' : 'password'} value={server.teamviewerPassword || ''} readOnly={!canEdit} onChange={(e) => handleServerChange(server.id, 'teamviewerPassword', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent border-none focus:outline-none w-full" /><button onClick={(e) => toggleTvPassword(e, server.id)} className="ml-2 text-gray-400 hover:text-white">{visibleTvPasswords[server.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button></div></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-12 mb-4 flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="bg-white text-[#0d1a2e] border border-[#0d1a2e] font-bold py-2 px-8 rounded-lg shadow-md hover:bg-gray-100"> {t('backButton')} </button>
        {canEdit && (
            <>
                <button onClick={handleAddServer} className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"><PlusIcon className="w-5 h-5 mr-2" />{t('addServerButton')}</button>
                <button onClick={handleSave} className="bg-[#0d1a2e] text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-[#1a2b4e] transition-colors flex items-center justify-center"><SaveIcon className="w-5 h-5 mr-2" />{t('saveButton')}</button>
            </>
        )}
      </div>
    </div>
  );
};

export default FinalSelection;
