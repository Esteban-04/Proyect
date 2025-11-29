import React, { useState } from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon } from '../assets/icons';

// --- Interfaces ---

interface ServerDetails {
  id: number;
  name: string;
  ip: string;
  user: string;
  password?: string;
  teamviewerId: string;
  teamviewerPassword?: string;
}

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
}

// --- Icons ---

const RemoteDesktopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={0} stroke="currentColor" {...props}>
     <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />
  </svg>
);

const TeamViewerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);


// --- Data ---

const CLUB_SERVERS: ServerDetails[] = [
  {
    id: 1,
    name: 'SERVER_01',
    ip: '192.168.11.10',
    user: 'administrator',
    password: 'Completeview!',
    teamviewerId: '1 626 036 641',
    teamviewerPassword: '@l3ss21++'
  },
  {
    id: 2,
    name: 'SERVER_02',
    ip: '192.168.11.20',
    user: 'administrator',
    password: 'Completeview!',
    teamviewerId: '703 111 643',
    teamviewerPassword: '@l3ss21++'
  },
  {
    id: 3,
    name: 'SERVER_03',
    ip: '192.168.11.30',
    user: 'administrator',
    password: 'Completeview!',
    teamviewerId: 'N/A',
    teamviewerPassword: '@l3ss21++'
  }
];

// Updated camera data to match the screenshot
const SERVER_CAMERA_DATA: CameraData[] = [
  { id: 1, name: 'VA | BOVEDA 1', ip: '192.168.2.187', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 2, name: 'VA | BOVEDA 2', ip: '192.168.2.188', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H264' },
  { id: 3, name: 'VA | BOVEDA CLICK & GO', ip: '192.168.2.230', manufacturer: 'Vivotek', user: 'root', password: 'password123', compression: 'H265' },
  { id: 4, name: 'VA | CONTEO 1', ip: '192.168.2.186', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 5, name: 'VA | ENTRADA CONTEO', ip: '192.168.2.189', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H265' },
  { id: 6, name: 'FE | ENTRADA SOCIOS', ip: '192.168.2.120', manufacturer: 'Milesight', user: 'admin', password: 'password123', compression: 'H264' },
  { id: 7, name: 'FE | FACIAL', ip: '192.168.2.224', manufacturer: 'Vivotek', user: 'root', password: 'password123', compression: 'H264' },
];

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack }) => {
  const { t } = useLanguage();
  const [selectedServer, setSelectedServer] = useState<ServerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  
  // State for editable camera data
  const [cameras, setCameras] = useState<CameraData[]>(SERVER_CAMERA_DATA);

  const togglePassword = (id: number) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCameraChange = (id: number, field: keyof CameraData, value: string) => {
      setCameras(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const handleSave = () => {
      // In a real application, you would save this data to a backend or context
      alert(t('saveSuccess'));
  };

  // If a server is selected, show the detailed table modal
  if (selectedServer) {
    const filteredData = cameras.filter(camera => 
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      camera.ip.includes(searchTerm)
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="bg-[#0d1a2e] text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {t('modalTitle', selectedServer.name, clubName)}
            </h2>
            <button onClick={() => setSelectedServer(null)} className="text-gray-300 hover:text-white">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#0d1a2e] focus:border-[#0d1a2e] sm:text-sm"
                />
            </div>
          </div>

          {/* Table */}
          <div className="flex-grow overflow-auto p-0">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">
                    {t('colIndex')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">
                    {t('colName')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('colIp')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('colManufacturer')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('colUser')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('colPassword')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t('colCompression')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((camera) => (
                  <tr key={camera.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                      {camera.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {camera.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                       <input 
                         type="text" 
                         value={camera.ip} 
                         onChange={(e) => handleCameraChange(camera.id, 'ip', e.target.value)}
                         className="w-full bg-transparent border-none focus:ring-0 sm:text-sm font-mono py-1 px-0 text-center text-gray-500"
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.manufacturer} 
                         onChange={(e) => handleCameraChange(camera.id, 'manufacturer', e.target.value)}
                         className="w-full bg-transparent border-none focus:ring-0 sm:text-sm py-1 px-0 text-center text-gray-500"
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.user} 
                         onChange={(e) => handleCameraChange(camera.id, 'user', e.target.value)}
                         className="w-full bg-transparent border-none focus:ring-0 sm:text-sm py-1 px-0 text-center text-gray-500"
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2 justify-center">
                             <input 
                                type={visiblePasswords[camera.id] ? 'text' : 'password'}
                                value={camera.password} 
                                onChange={(e) => handleCameraChange(camera.id, 'password', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 sm:text-sm font-mono py-1 px-0 text-center text-gray-500"
                             />
                            <button 
                                onClick={() => togglePassword(camera.id)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
                            >
                                {visiblePasswords[camera.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.compression} 
                         onChange={(e) => handleCameraChange(camera.id, 'compression', e.target.value)}
                         className="w-full bg-transparent border-none focus:ring-0 sm:text-sm py-1 px-0 text-center text-gray-500"
                       />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
             <button
              onClick={() => setSelectedServer(null)}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 shadow-sm font-medium"
            >
              {t('closeButton')}
            </button>
            <button
              onClick={handleSave}
              className="bg-[#0d1a2e] text-white px-4 py-2 rounded-md hover:bg-[#1a2b4e] flex items-center shadow-md font-medium"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {t('saveButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        <img
            src={`https://flagcdn.com/w40/${country.code}.png`}
            alt={`${country.name} flag`}
            className="w-8 h-auto mr-3 rounded-sm shadow-sm"
        />
        <h2 className="text-3xl font-bold text-[#0d1a2e]">
            {clubName}
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        
        {/* Server 01 - Full Width */}
        <div 
          onClick={() => setSelectedServer(CLUB_SERVERS[0])}
          className="col-span-1 md:col-span-2 bg-[#0d1a2e] rounded-lg p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border border-[#1a2b4e] relative"
        >
            <div className="text-center border-b border-gray-600 pb-2 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wider">{CLUB_SERVERS[0].name}</h3>
            </div>
            
            <div className="flex flex-col space-y-6 px-4">
                {/* Remote Desktop Section */}
                <div>
                    <div className="flex items-center mb-1">
                        <RemoteDesktopIcon className="w-5 h-5 mr-2" />
                        <span className="text-gray-300 text-sm font-medium">Escritorio Remoto:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-2xl font-bold mb-1">{CLUB_SERVERS[0].ip}</div>
                        <div className="text-sm text-gray-400">
                            Usuario: <span className="text-white font-medium">{CLUB_SERVERS[0].user}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[0].password}</span>
                        </div>
                    </div>
                </div>

                {/* TeamViewer Section */}
                <div>
                     <div className="flex items-center mb-1">
                         <div className="bg-gray-600 rounded-full p-0.5 mr-2">
                            <TeamViewerIcon className="w-3 h-3 text-white" />
                         </div>
                        <span className="text-gray-300 text-sm font-medium">TeamViewer:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-xl font-bold mb-1">ID: {CLUB_SERVERS[0].teamviewerId}</div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[0].teamviewerPassword}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Server 02 */}
        <div 
           onClick={() => setSelectedServer(CLUB_SERVERS[1])}
           className="bg-[#0d1a2e] rounded-lg p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border border-[#1a2b4e]"
        >
            <div className="text-center border-b border-gray-600 pb-2 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wider">{CLUB_SERVERS[1].name}</h3>
            </div>
             <div className="flex flex-col space-y-6 px-2">
                {/* Remote Desktop Section */}
                <div>
                    <div className="flex items-center mb-1">
                        <RemoteDesktopIcon className="w-5 h-5 mr-2" />
                        <span className="text-gray-300 text-sm font-medium">Escritorio Remoto:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-2xl font-bold mb-1">{CLUB_SERVERS[1].ip}</div>
                        <div className="text-sm text-gray-400">
                            Usuario: <span className="text-white font-medium">{CLUB_SERVERS[1].user}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[1].password}</span>
                        </div>
                    </div>
                </div>

                {/* TeamViewer Section */}
                <div>
                     <div className="flex items-center mb-1">
                         <div className="bg-gray-600 rounded-full p-0.5 mr-2">
                            <TeamViewerIcon className="w-3 h-3 text-white" />
                         </div>
                        <span className="text-gray-300 text-sm font-medium">TeamViewer:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-xl font-bold mb-1">ID: {CLUB_SERVERS[1].teamviewerId}</div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[1].teamviewerPassword}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Server 03 */}
        <div 
           onClick={() => setSelectedServer(CLUB_SERVERS[2])}
           className="bg-[#0d1a2e] rounded-lg p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border border-[#1a2b4e]"
        >
            <div className="text-center border-b border-gray-600 pb-2 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wider">{CLUB_SERVERS[2].name}</h3>
            </div>
             <div className="flex flex-col space-y-6 px-2">
                {/* Remote Desktop Section */}
                <div>
                    <div className="flex items-center mb-1">
                        <RemoteDesktopIcon className="w-5 h-5 mr-2" />
                        <span className="text-gray-300 text-sm font-medium">Escritorio Remoto:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-2xl font-bold mb-1">{CLUB_SERVERS[2].ip}</div>
                        <div className="text-sm text-gray-400">
                            Usuario: <span className="text-white font-medium">{CLUB_SERVERS[2].user}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[2].password}</span>
                        </div>
                    </div>
                </div>

                {/* TeamViewer Section */}
                <div>
                     <div className="flex items-center mb-1">
                         <div className="bg-gray-600 rounded-full p-0.5 mr-2">
                            <TeamViewerIcon className="w-3 h-3 text-white" />
                         </div>
                        <span className="text-gray-300 text-sm font-medium">TeamViewer:</span>
                    </div>
                    <div className="pl-7">
                        <div className="text-xl font-bold mb-1">ID: {CLUB_SERVERS[2].teamviewerId}</div>
                        <div className="text-sm text-gray-400">
                            Contraseña: <span className="text-white font-medium">{CLUB_SERVERS[2].teamviewerPassword}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <div className="mt-12 mb-4">
        <button
          onClick={onBack}
          className="bg-[#0d1a2e] text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-[#1a2b4e] transition-colors duration-200"
        >
          Volver
        </button>
      </div>

    </div>
  );
};

export default FinalSelection;