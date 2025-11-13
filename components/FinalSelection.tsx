import React from 'react';
import { Country } from '../types';
import { REMOTE_DESKTOP_ICON } from '../assets/remote-desktop-icon';
import { useLanguage } from '../context/LanguageContext';
import { DhlLogo } from '../assets/dhl-logo';

// --- Helper Components & Interfaces ---

// Interfaces for structuring server data
interface ServerDetails {
  ip: string;
  user: string;
  teamviewerId: string;
  teamviewerPassword?: string;
}

interface ServerInfo {
  server1: ServerDetails;
  server2: ServerDetails;
  server3?: ServerDetails;
  server4?: ServerDetails;
  server5?: ServerDetails;
}

interface ClubServerData {
  [key: string]: ServerInfo;
}

// Data for each specific club location
const serverData: ClubServerData = {
  'Oranjestad': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Vía Brasil': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'El Dorado': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'David': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Brisas': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Costa Verde': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Santiago de Veraguas': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Metro Park': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'St. Thomas': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'St. Michaels': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Kingston': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Portmore': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Florencia': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'San Pedro Sula': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'El Sauce': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Cartago': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Santa Elena': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Los Héroes': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'San Miguel': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Santa Ana': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Cali - Cañas Gordas': {
    server1: { ip: '192.168.12.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.12.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
  },
  'Cali - Menga': {
    server1: { ip: '192.168.13.10', user: 'administrator', teamviewerId: '1 623 109 087', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.13.20', user: 'admin', teamviewerId: '307 986 008', teamviewerPassword: '@l3ss21++' },
  },
  'Barranquilla': {
    server1: { ip: '192.168.11.10', user: 'administrator', teamviewerId: '1 626 036 641', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.11.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.11.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Pereira': {
    server1: { ip: '192.168.14.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.14.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.14.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.14.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Bogotá - Salitre': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Medellín - Las Américas': {
    server1: { ip: '192.168.16.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.16.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.16.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.16.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Chía': {
    server1: { ip: '192.168.17.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.17.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.17.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.17.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Bogotá - Usaquén': {
    server1: { ip: '192.168.18.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.18.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.18.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.18.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Bucaramanga - Floridablanca': {
    server1: { ip: '192.168.19.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.19.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.19.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.19.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Medellín - El Poblado': {
    server1: { ip: '192.168.101.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.101.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.101.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.101.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Chaguanas': {
    server1: { ip: '192.168.20.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.20.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.20.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.20.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Port of Spain': {
    server1: { ip: '192.168.20.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.20.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.20.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.20.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Mausica': {
    server1: { ip: '192.168.20.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.20.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.20.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.20.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'San Fernando': {
    server1: { ip: '192.168.20.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.20.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.20.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.20.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Los Prados': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Santiago': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Arroyo Hondo': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'San Isidro': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Bolívar': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Managua': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Masaya': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Miraflores': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Pradera': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Fraijanes': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'San Cristóbal': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Aranda': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Escuintla': {
    server1: { ip: '192.168.15.10', user: 'administrator', teamviewerId: '1 279 617 762', teamviewerPassword: '@l3ss21++' },
    server2: { ip: '192.168.15.20', user: 'administrator', teamviewerId: '1 289 199 790', teamviewerPassword: '@l3ss21++' },
    server3: { ip: '192.168.15.30', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
    server4: { ip: '192.168.15.40', user: 'administrator', teamviewerId: 'N/A', teamviewerPassword: '@l3ss21++' },
  },
  'Intexzona': {
    server1: { ip: '10.20.1.10', user: 'dhl_admin', teamviewerId: '2 123 456 789' },
    server2: { ip: '10.20.1.20', user: 'dhl_admin', teamviewerId: '2 123 456 790' },
  },
  'San Carlos II': {
    server1: { ip: '10.20.2.10', user: 'dhl_admin', teamviewerId: '2 223 456 789' },
    server2: { ip: '10.20.2.20', user: 'dhl_admin', teamviewerId: '2 223 456 790' },
  },
  'Easy': {
    server1: { ip: '10.20.3.10', user: 'dhl_admin', teamviewerId: '2 323 456 789' },
  },
  'PLC': {
    server1: { ip: '10.20.4.10', user: 'dhl_admin', teamviewerId: '2 423 456 789' },
    server2: { ip: '10.20.4.20', user: 'dhl_admin', teamviewerId: '2 423 456 790' },
    server3: { ip: '10.20.4.30', user: 'dhl_admin', teamviewerId: '2 423 456 791' },
  },
};

// TeamViewer Icon Component
const TeamViewerIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        <path fill="white" d="M11,8.5L8,11.5L11,14.5H13L10,11.5L13,8.5H11M14.5,8.5L11.5,11.5L14.5,14.5H16.5L13.5,11.5L16.5,8.5H14.5Z" />
    </svg>
);

// Sub-component for a single information card
const InfoCard: React.FC<{ title: string; details: ServerDetails }> = ({ title, details }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 flex flex-col">
      <h3 className="text-xl font-bold text-center mb-4 border-b border-gray-600 pb-3">{title}</h3>
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-gray-400 flex items-center">
            <img src={REMOTE_DESKTOP_ICON} alt="Remote Desktop" className="w-5 h-5 mr-2" />
            {t('remoteDesktopLabel')}
          </p>
          <p className="text-lg pl-7">{details.ip}</p>
          <p className="text-sm text-gray-400 pl-7">{t('userLabel')} <span className="font-medium text-gray-200">{details.user}</span></p>
          <p className="text-sm text-gray-400 pl-7">{t('finalPasswordLabel')} <span className="font-medium text-gray-200">Completeview!</span></p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 flex items-center">
            <TeamViewerIcon />
            TeamViewer:
          </p>
          <p className="text-lg pl-7">{t('idLabel')} {details.teamviewerId}</p>
          {details.teamviewerPassword && (
            <p className="text-sm text-gray-400 pl-7">{t('finalPasswordLabel')} <span className="font-medium text-gray-200">{details.teamviewerPassword}</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main FinalSelection Component ---

interface FinalSelectionProps {
  country: Country;
  clubName: string;
  onBack: () => void;
}

const FinalSelection: React.FC<FinalSelectionProps> = ({
  country,
  clubName,
  onBack,
}) => {
  const { t } = useLanguage();
  const clubData = serverData[clubName] || serverData['Cali - Cañas Gordas']; // Fallback
  const isDhl = country.code === 'dhl';
  
  // Create an array of servers from the data object to map over
  const servers = Object.entries(clubData)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value], index) => ({
      title: `SERVER_0${index + 1}`,
      details: value as ServerDetails,
    }));

  return (
    <div className="w-full">
      <div className="flex justify-center items-center text-center mb-8">
        {isDhl ? (
          <DhlLogo className="w-20 h-auto mr-4" />
        ) : (
          <img
              src={`https://flagcdn.com/w40/${country.code}.png`}
              alt={`${country.name} flag`}
              className="w-10 h-auto mr-4 rounded-sm shadow-md"
          />
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {country.name} - {clubName}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servers.map((server, index) => {
            const isOddLayout = servers.length % 2 !== 0 && servers.length > 1;
            const isFirstItem = index === 0;
            const spanClass = isOddLayout && isFirstItem ? 'md:col-span-2' : '';

            return (
              <div key={server.title} className={spanClass}>
                <InfoCard title={server.title} details={server.details} />
              </div>
            );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#1a2b4e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
        >
          {t('backButton')}
        </button>
      </div>
    </div>
  );
};

export default FinalSelection;
