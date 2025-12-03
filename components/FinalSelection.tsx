
import React, { useState } from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SearchIcon, EyeIcon, EyeOffIcon, SaveIcon, PlusIcon, TrashIcon } from '../assets/icons';

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
  canEdit: boolean;
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


// --- Data & Configuration ---

// Helper function to easily define a server in the configuration list below.
// Usage: s(ID, IP, User, Password, TV_ID, TV_Pass)
const s = (
    id: number, 
    ip: string, 
    user: string = 'administrator', 
    password: string = 'Completeview!', 
    tvId: string = '', 
    tvPass: string = ''
): ServerDetails => ({
    id,
    name: `SERVER_${String(id).padStart(2, '0')}`,
    ip,
    user,
    password,
    teamviewerId: tvId,
    teamviewerPassword: tvPass
});

// ==================================================================================
// CONFIGURACIÓN DE SERVIDORES
// Edite aquí la información de cada sitio.
// ==================================================================================

const CLUB_SPECIFIC_DEFAULTS: Record<string, ServerDetails[]> = {
  // --- COLOMBIA ---
  'Barranquilla': [
      s(1, '192.168.11.10','administrator','Completeview!','1626036641','@l3ss21++' ),
      s(2, '192.168.11.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.11.30','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Cali - Cañas Gordas': [
      s(1, '192.168.12.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.21.10','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Cali - Menga': [
      s(1, '192.168.13.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.13.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Pereira': [
      s(1, '192.168.14.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.14.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.14.40','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Bogotá - Salitre': [
      s(1, '192.168.15.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.15.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.15.30','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Medellín - Las Américas': [
      s(1, '192.168.16.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.16.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Chía': [
      s(1, '192.168.17.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.17.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.17.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.17.40','administrator','Completeview!','1626036641','@l3ss21++'),
      s(5, '192.168.17.60','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Bogotá - Usaquén': [
      s(1, '192.168.18.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.18.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.18.30','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Bucaramanga - Floridablanca': [
      s(1, '192.168.19.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.19.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.19.30','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Medellín - El Poblado': [
      s(1, '192.168.101.10','administrator','Completeview!@','1626036641','@l3ss21++'),
      s(2, '192.168.101.20','administrator','Completeview!@','1626036641','@l3ss21++'),
  ],

  // --- DHL ---
  'Intexzona': [
      s(1, '192.168.205.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.205.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'San Carlos II': [
      s(1, '192.168.202.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.202.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Easy': [
      s(1, '192.168.203.10','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'PLC': [
       s(1, '192.168.201.10','administrator','Completeview!','1626036641','@l3ss21++'),
       s(2, '192.168.201.20','administrator','Completeview!','1626036641','@l3ss21++'),
  ],
  'Rio Negro': [
       s(1, '192.168.204.10','administrator','Completeview!','1626036641','@l3ss21++'),
  ],

  // --- COSTA RICA ---
  'Cartago': [
      s(1, '192.168.1.10'),
      s(2, '192.168.1.20'),
      s(3, '192.168.1.30'),
  ],

  // --- EL SALVADOR ---
  'Santa Elena': [ 
      s(1, '192.168.71.10','administrator','Completeview!','1626036641','@l3ss21++'), 
      s(2, '192.168.71.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.71.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.71.40','admin','Completeview!','1626036641','@l3ss21++'),
  ],
  'Los Héroes': [ 
      s(1, '192.168.72.10','administrator','Completeview!','1626036641','@l3ss21++'), 
      s(2, '192.168.72.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.72.30','administrator','Completeview!','1626036641','@l3ss21++'), 
  ],
  'San Miguel': [ 
      s(1, '192.168.73.10','administrator','Completeview!@','1626036641','@l3ss21++'),
      s(2, '192.168.73.20','administrator','Completeview!@','1626036641','@l3ss21++'),
 ],
  'Santa Ana': [ 
      s(1, '192.168.74.10','Server 1 6704','Completeview!@','1626036641','@l3ss21++'),
      s(2, '192.168.74.20','Server 2 6704','Completeview!@','1626036641','@l3ss21++'),
   ],

  // --- GUATEMALA ---
  'Pradera': [ 
      s(1, '192.168.33.10','administrador','Completeview!','1626036641','@l3ss21++'), 
      s(2, '192.168.33.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.33.30','administrador','Completeview!','1626036641','@l3ss21++'), 
  ],
  'Fraijanes': [ 
      s(1, '192.168.34.10','administrador','Completeview!','1626036641','@l3ss21++'), 
      s(2, '192.168.34.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.34.30','administrador','Completeview!','1626036641','@l3ss21++'), 
  ],
  'San Cristóbal': [ 
      s(1, '192.168.35.10','administrador','Completeview!','1626036641','@l3ss21++'), 
      s(2, '192.168.35.20','administrador','Completeview!','1626036641','@l3ss21++'),
  ],
  'Aranda': [ 
      s(1, '192.168.36.10','admin','Seg-6306','1626036641','@l3ss21++'), 
      s(2, '192.168.36.20','admin','Seg-6306','1626036641','@l3ss21++'),
  ],
  'Escuintla': [ 
      s(1, '192.168.37.10','administrador','Completeview!@','1626036641','@l3ss21++'), 
      s(2, '192.168.37.20','administrador','Completeview!@','1626036641','@l3ss21++'),
  ],

  // --- HONDURAS ---
  'Florencia': [ 
      s(1, '192.168.62.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.62.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.62.93','','!','','@l3ss21++'),
      s(4, '192.168.62.50','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Pedro Sula': [ 
      s(1, '192.168.63.30','','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.63.20','','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.63.10','','Completeview!','1626036641','@l3ss21++'),
   ],
  'El Sauce':  [ 
      s(1, '192.168.64.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.64.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- NICARAGUA ---
  'Managua': [ 
      s(1, '192.168.91.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.91.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.91.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Masaya': [ 
      s(1, '192.168.92.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.92.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  // --- PANAMA ---
  'Vía Brasil': [ 
      s(1, '192.168.20.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.20.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.20.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.20.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'El Dorado':  [ 
      s(1, '192.168.23.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.23.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.23.13','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'David': [ 
      s(1, '192.168.24.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.24.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.24.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Brisas': [ 
      s(1, '192.168.25.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.25.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.25.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.25.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Costa Verde': [ 
      s(1, '192.168.26.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.26.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Santiago de Veraguas': [ 
      s(1, '192.168.27.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.27.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.27.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Metro Park': [ 
      s(1, '192.168.28.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.28.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.28.30','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- ARUBA ---
  'Oranjestad': [ s(1, '192.168.1.10'), s(2, '192.168.1.20'), s(3, '192.168.1.30') ],

  // --- BARBADOS ---
  'St. Michaels': [ 
      s(1, '192.168.85.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.85.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- DOMINICAN REPUBLIC ---
  'Los Prados': [ 
      s(1, '192.168.61.10','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.61.20','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.61.30','admin','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.61.40','admin','S@ltex7509!','1626036641','@l3ss21++'),
   ],
  'Santiago': [ 
      s(1, '192.168.168.10','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.168.20','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.168.30','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.168.40','administrador','S@ltex7509!','1626036641','@l3ss21++'),
   ],
  'Arroyo Hondo':  [ 
      s(1, '192.168.84.10','administrador','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.84.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.84.30','administrador','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Isidro': [ 
      s(1, '192.168.185.10','administrador','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.185.20','administrador','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.185.30','administrador','Completeview!','1626036641','@l3ss21++'),
   ],
  'Bolívar': [ 
      s(1, '192.168.138.10','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(2, '192.168.138.20','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(3, '192.168.138.30','administrador','S@ltex7509!','1626036641','@l3ss21++'),
      s(4, '192.168.138.40','administrador','S@ltex7509!','1626036641','@l3ss21++'),
   ],

  // --- JAMAICA ---
  'Kingston': [ 
      s(1, '192.168.171.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.171.20','administrator','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.171.30','administrator','Completeview!','1626036641','@l3ss21++'),
      s(4, '192.168.171.40','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Portmore':  [ 
      s(1, '192.168.172.10','salient','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.172.20','vivotek','Completeview!','1626036641','@l3ss21++'),
      s(3, '192.168.172.30','vivotek','vivotek!','1626036641','@l3ss21++'),
   ],

  // --- TRINIDAD & TOBAGO ---
  'Chaguanas': [ 
      s(1, '192.168.81.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.81.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Port of Spain': [ 
      s(1, '192.168.82.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.82.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'Mausica': [ 
      s(1, '192.168.183.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.183.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
  'San Fernando': [ 
      s(1, '192.168.184.10','administrator','Completeview!','1626036641','@l3ss21++'),
      s(2, '192.168.184.20','administrator','Completeview!','1626036641','@l3ss21++'),
   ],

  // --- VIRGIN ISLANDS ---
  'St. Thomas': [ 
      s(1, '192.168.201.10','administrator','Completeview!','1626036641','@l3ss21++'),
   ],
};

// Fallback creator if a club is not in the list (should not happen if all are listed)
const createDefaultServers = (count: number, baseIp: string): ServerDetails[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `SERVER_${String(i + 1).padStart(2, '0')}`,
      ip: baseIp.includes('X') ? baseIp.replace('X', String((i + 1) * 10)) : baseIp,
      user: 'administrator',
      password: 'Completeview!',
      teamviewerId: '',
      teamviewerPassword: ''
    }));
};

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

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack, canEdit }) => {
  const { t } = useLanguage();
  const [selectedServer, setSelectedServer] = useState<ServerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State for delete confirmation modal
  const [serverToDelete, setServerToDelete] = useState<number | null>(null);

  // State for password visibility inside the modal table
  const [visibleTablePasswords, setVisibleTablePasswords] = useState<Record<number, boolean>>({});
  
  // State for password visibility on the server cards (User Password)
  const [visibleCardPasswords, setVisibleCardPasswords] = useState<Record<number, boolean>>({});

  // State for password visibility on the server cards (TeamViewer Password)
  const [visibleTvPasswords, setVisibleTvPasswords] = useState<Record<number, boolean>>({});

  // Helper to generate a unique storage key for this specific club
  const getStorageKey = (type: 'servers' | 'cameras') => {
      const safeClub = clubName.replace(/[^a-zA-Z0-9]/g, '_');
      return `config_${country.code}_${safeClub}_${type}`;
  };

  // Initialize servers state based on club configuration AND local storage
  const [servers, setServers] = useState<ServerDetails[]>(() => {
    try {
        const key = getStorageKey('servers');
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Error loading saved servers:", e);
    }

    // Default fallback if no saved data exists
    
    // Check if we have specific defaults for this club
    if (CLUB_SPECIFIC_DEFAULTS[clubName]) {
        return CLUB_SPECIFIC_DEFAULTS[clubName].map(s => ({...s}));
    }

    // Fallback: Generic creation if not found in list (should not happen if list is complete)
    return createDefaultServers(3, '192.168.1.X');
  });

  // State for editable camera data, also loaded from storage
  const [cameras, setCameras] = useState<CameraData[]>(() => {
      try {
          const key = getStorageKey('cameras');
          const saved = localStorage.getItem(key);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                  return parsed;
              }
          }
      } catch (e) {
          console.error("Error loading saved cameras:", e);
      }
      return SERVER_CAMERA_DATA;
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleTablePassword = (id: number) => {
    setVisibleTablePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCardPassword = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent opening modal
    setVisibleCardPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTvPassword = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent opening modal
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
      
      // Calculate next ID
      const maxId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) : 0;
      const newId = maxId + 1;
      
      // Create new server with default values and next index for name
      const newServer: ServerDetails = {
          id: newId,
          name: `SERVER_${String(newId).padStart(2, '0')}`,
          ip: '',
          user: 'administrator',
          password: 'Completeview!',
          teamviewerId: '',
          teamviewerPassword: ''
      };

      setServers([...servers, newServer]);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (!canEdit) return;
      // Instead of confirming immediately, set the state to show modal
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
          // Save both servers and cameras to localStorage specific to this club
          localStorage.setItem(getStorageKey('servers'), JSON.stringify(servers));
          localStorage.setItem(getStorageKey('cameras'), JSON.stringify(cameras));
          showSuccess(t('saveSuccess'));
      } catch (e) {
          console.error("Error saving data:", e);
          alert("Error al guardar los datos.");
      }
  };

  // If a server is selected, show the detailed table modal
  if (selectedServer) {
    const filteredData = cameras.filter(camera => 
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      camera.ip.includes(searchTerm)
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        
        {/* Success Toast for Modal Context */}
        {successMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl font-bold transition-all duration-300 animate-bounce">
                {successMessage}
            </div>
        )}

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
                         readOnly={!canEdit}
                         onChange={(e) => handleCameraChange(camera.id, 'ip', e.target.value)}
                         className={`w-full bg-transparent border-none sm:text-sm font-mono py-1 px-0 text-center ${canEdit ? 'focus:ring-0 text-gray-700' : 'text-gray-500 cursor-default'}`}
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.manufacturer} 
                         readOnly={!canEdit}
                         onChange={(e) => handleCameraChange(camera.id, 'manufacturer', e.target.value)}
                         className={`w-full bg-transparent border-none sm:text-sm py-1 px-0 text-center ${canEdit ? 'focus:ring-0 text-gray-700' : 'text-gray-500 cursor-default'}`}
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.user} 
                         readOnly={!canEdit}
                         onChange={(e) => handleCameraChange(camera.id, 'user', e.target.value)}
                         className={`w-full bg-transparent border-none sm:text-sm py-1 px-0 text-center ${canEdit ? 'focus:ring-0 text-gray-700' : 'text-gray-500 cursor-default'}`}
                       />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2 justify-center">
                             <input 
                                type={visibleTablePasswords[camera.id] ? 'text' : 'password'}
                                value={camera.password} 
                                readOnly={!canEdit}
                                onChange={(e) => handleCameraChange(camera.id, 'password', e.target.value)}
                                className={`w-full bg-transparent border-none sm:text-sm font-mono py-1 px-0 text-center ${canEdit ? 'focus:ring-0 text-gray-700' : 'text-gray-500 cursor-default'}`}
                             />
                            <button 
                                onClick={() => toggleTablePassword(camera.id)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
                            >
                                {visibleTablePasswords[camera.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <input 
                         type="text" 
                         value={camera.compression} 
                         readOnly={!canEdit}
                         onChange={(e) => handleCameraChange(camera.id, 'compression', e.target.value)}
                         className={`w-full bg-transparent border-none sm:text-sm py-1 px-0 text-center ${canEdit ? 'focus:ring-0 text-gray-700' : 'text-gray-500 cursor-default'}`}
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
            {canEdit && (
                <button
                onClick={handleSave}
                className="bg-[#0d1a2e] text-white px-4 py-2 rounded-md hover:bg-[#1a2b4e] flex items-center shadow-md font-medium"
                >
                <SaveIcon className="w-4 h-4 mr-2" />
                {t('saveButton')}
                </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="w-full flex flex-col items-center relative">
      
      {/* Success Toast (Main View) */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl font-bold transition-all duration-300 animate-bounce flex items-center">
            <span className="mr-2">✓</span>
            {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serverToDelete !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-60">
              <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full text-center border-t-4 border-red-500 transform transition-all scale-100">
                  <div className="mb-4">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                         <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('actionDelete')}</h3>
                  <p className="text-sm text-gray-500 mb-6">{t('deleteServerConfirm')}</p>
                  
                  <div className="flex justify-center space-x-4">
                      <button 
                        onClick={() => setServerToDelete(null)}
                        className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                          {t('noButton')}
                      </button>
                      <button 
                        onClick={confirmDeleteServer}
                        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                      >
                          {t('yesButton')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        {country.code === 'dhl' ? (
             <img 
               src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" 
               alt="DHL Logo" 
               className="h-10 w-auto mr-3 object-contain"
             />
        ) : (
            <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-8 h-auto mr-3 rounded-sm shadow-sm"
            />
        )}
        <h2 className="text-3xl font-bold text-[#0d1a2e]">
            {clubName}
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        
        {servers.map((server, index) => {
             // If total servers is odd (e.g. 3 or 5), make the first one span full width on desktop for balance
             const isOddTotal = servers.length % 2 !== 0;
             const isFirst = index === 0;
             const spanClass = (isOddTotal && isFirst) ? 'md:col-span-2' : 'col-span-1';

             return (
                <div 
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className={`${spanClass} bg-[#0d1a2e] rounded-lg p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border border-[#1a2b4e] relative group`}
                >
                    {/* Delete Button (Only if canEdit) */}
                    {canEdit && (
                        <button
                            onClick={(e) => handleDeleteClick(e, server.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
                            title={t('actionDelete')}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}

                    <div className="text-center border-b border-gray-600 pb-2 mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-wider">{server.name}</h3>
                    </div>
                    
                    <div className="flex flex-col space-y-6 px-4">
                        {/* Remote Desktop Section */}
                        <div>
                            <div className="flex items-center mb-1">
                                <RemoteDesktopIcon className="w-5 h-5 mr-2" />
                                <span className="text-gray-300 text-sm font-medium">Escritorio Remoto:</span>
                            </div>
                            <div className="pl-7">
                                {/* IP Input */}
                                <input
                                    type="text"
                                    value={server.ip || ''}
                                    readOnly={!canEdit}
                                    onChange={(e) => handleServerChange(server.id, 'ip', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-2xl font-bold mb-1 bg-transparent border-b hover:border-gray-400 focus:border-white focus:outline-none w-full ${!canEdit ? 'border-transparent cursor-default' : 'border-transparent'}`}
                                />
                                
                                {/* User Input */}
                                <div className="flex items-center text-sm text-gray-400">
                                    <span className="mr-2">Usuario:</span>
                                    <input
                                        type="text"
                                        value={server.user || ''}
                                        readOnly={!canEdit}
                                        onChange={(e) => handleServerChange(server.id, 'user', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`text-white font-medium bg-transparent border-b hover:border-gray-400 focus:border-white focus:outline-none flex-grow ${!canEdit ? 'border-transparent cursor-default' : 'border-transparent'}`}
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="flex items-center text-sm text-gray-400 mt-1">
                                    <span className="mr-2">Contraseña:</span>
                                    <div className="flex items-center flex-grow">
                                        <input
                                            type={visibleCardPasswords[server.id] ? 'text' : 'password'}
                                            value={server.password || ''}
                                            readOnly={!canEdit}
                                            onChange={(e) => handleServerChange(server.id, 'password', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-white font-medium bg-transparent border-b hover:border-gray-400 focus:border-white focus:outline-none w-full ${!canEdit ? 'border-transparent cursor-default' : 'border-transparent'}`}
                                        />
                                        <button 
                                            onClick={(e) => toggleCardPassword(e, server.id)}
                                            className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                                        >
                                            {visibleCardPasswords[server.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
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
                                {/* TeamViewer ID Input */}
                                <div className="flex items-center text-xl font-bold mb-1">
                                    <span className="mr-2 text-gray-400 text-base font-normal">ID:</span>
                                    <input
                                        type="text"
                                        value={server.teamviewerId || ''}
                                        readOnly={!canEdit}
                                        onChange={(e) => handleServerChange(server.id, 'teamviewerId', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`bg-transparent border-b hover:border-gray-400 focus:border-white focus:outline-none w-full ${!canEdit ? 'border-transparent cursor-default' : 'border-transparent'}`}
                                    />
                                </div>

                                {/* TeamViewer Password Input */}
                                <div className="flex items-center text-sm text-gray-400">
                                    <span className="mr-2">Contraseña:</span>
                                    <div className="flex items-center flex-grow">
                                        <input
                                            type={visibleTvPasswords[server.id] ? 'text' : 'password'}
                                            value={server.teamviewerPassword || ''}
                                            readOnly={!canEdit}
                                            onChange={(e) => handleServerChange(server.id, 'teamviewerPassword', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-white font-medium bg-transparent border-b hover:border-gray-400 focus:border-white focus:outline-none w-full ${!canEdit ? 'border-transparent cursor-default' : 'border-transparent'}`}
                                        />
                                        <button 
                                            onClick={(e) => toggleTvPassword(e, server.id)}
                                            className="ml-2 text-gray-400 hover:text-white focus:outline-none"
                                        >
                                            {visibleTvPasswords[server.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
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

      <div className="mt-12 mb-4 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
           className="bg-white text-[#0d1a2e] border border-[#0d1a2e] font-bold py-2 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          {t('backButton')}
        </button>
        {canEdit && (
            <>
                <button
                onClick={handleAddServer}
                className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                <PlusIcon className="w-5 h-5 mr-2" />
                {t('addServerButton')}
                </button>

                <button
                onClick={handleSave}
                className="bg-[#0d1a2e] text-white font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-[#1a2b4e] transition-colors duration-200 flex items-center justify-center"
                >
                <SaveIcon className="w-5 h-5 mr-2" />
                {t('saveButton')}
                </button>
            </>
        )}
      </div>

    </div>
  );
};

export default FinalSelection;
