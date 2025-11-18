import React, { useState, useEffect } from 'react';
import { Country } from '../types';
import { REMOTE_DESKTOP_ICON } from '../assets/remote-desktop-icon';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon } from '../assets/icons';

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
  server2?: ServerDetails;
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
  'Rio Negro': {
    server1: { ip: '10.20.5.10', user: 'dhl_admin', teamviewerId: '2 523 456 789' },
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
const InfoCard: React.FC<{ title: string; details: ServerDetails; onClick?: () => void }> = ({ title, details, onClick }) => {
  const { t } = useLanguage();
  return (
    <div 
      className={`bg-gray-800 text-white rounded-lg shadow-xl p-6 flex flex-col ${onClick ? 'cursor-pointer hover:bg-gray-700 transition-colors' : ''}`}
      onClick={onClick}
    >
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

// --- Data for Modal ---
interface ServerRow {
  name: string;
  ip: string;
  manufacturer: string;
  user: string;
  pass: string;
  comp: string;
}

const BARRANQUILLA_SERVER1_DATA: ServerRow[] = [
  { name: 'VA | BOVEDA 1', ip: '192.168.2.187', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'VA | BOVEDA 2', ip: '192.168.2.188', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'VA | BOVEDA CLICK & GO', ip: '192.168.2.230', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H265' },
  { name: 'VA | CONTEO 1', ip: '192.168.2.186', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'VA | ENTRADA CONTEO', ip: '192.168.2.189', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | ENTRADA SOCIOS', ip: '192.168.2.120', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'FE | FACIAL', ip: '192.168.2.224', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H264' },
  { name: 'FE | MEMBERCHIP', ip: '192.168.2.175', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | PODIUM', ip: '192.168.2.117', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'FE | SALIDA SOCIOS', ip: '192.168.2.103', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'FE | 1-2 CAJAS', ip: '192.168.2.194', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | 3-4-5-6 CAJAS', ip: '192.168.2.192', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | 7-8-9-10 CAJAS', ip: '192.168.2.193', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | 11-12-13 CAJAS', ip: '192.168.2.195', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'FE | LINEA CAJAS', ip: '192.168.2.176', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | COMPACTADORA', ip: '192.168.2.162', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | CONTENEDORES', ip: '192.168.2.164', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | DOMO RECIBO', ip: '192.168.2.161', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | ENTRADA PEATONAL', ip: '192.168.2.152', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'RA | ENTRADA PISO RECIBO', ip: '192.168.2.149', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'RA | ENTRADA RECIBO', ip: '192.168.2.9', manufacturer: 'Milesight', user: 'admin', pass: 'mssg7509', comp: 'H265' },
  { name: 'RA | GARITA GUARDAS', ip: '192.168.2.168', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | MUELLE 1', ip: '192.168.2.209', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | MUELLE 2', ip: '192.168.2.115', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'RA | MUELLES CONTENEDORES', ip: '192.168.2.148', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'RA | PROVEDORES NACIONALES', ip: '192.168.2.212', manufacturer: 'Milesight', user: 'admin', pass: 'mssg7509', comp: 'H265' },
  { name: 'RA | OFICINA RAPPI', ip: '192.168.2.93', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H265' },
  { name: 'RA | CENTRO LLANTAS', ip: '192.168.2.191', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PA | CAJA FOOD', ip: '192.168.2.184', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PA | DELI', ip: '192.168.2.113', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PA | DEMO', ip: '192.168.2.169', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PA | FOOD SERVICE 1', ip: '192.168.2.171', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PA | FOOD SERVICE 2', ip: '192.168.2.111', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PA | PROCESOS', ip: '192.168.2.185', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'EX | EXTERNA 2', ip: '192.168.2.159', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | ACCESO 1', ip: '192.168.2.94', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H265' },
  { name: 'PK | ACCESO 2', ip: '192.168.2.135', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | ALFA 3', ip: '192.168.2.96', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H265' },
  { name: 'PK | ASCENSOR NIVEL 2', ip: '192.168.2.146', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | CAMARA PLACA LPR', ip: '192.168.2.225', manufacturer: 'Vivotek', user: 'root', pass: 'red12345', comp: 'H265' },
  { name: 'PK | DOMO PARQUEADERO', ip: '192.168.2.181', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | ESCALERA ELECTRICA', ip: '192.168.2.134', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | ESCALERA ELECTRICA 2 PISO', ip: '192.168.2.213', manufacturer: 'Milesight', user: 'admin', pass: 'mssg7509', comp: 'H264' },
  { name: 'PK | LATERAL ALFA 3', ip: '192.168.2.139', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | LATERAL CRA 53', ip: '192.168.2.210', manufacturer: 'Milesight', user: 'admin', pass: 'mssg7509', comp: 'H265' },
  { name: 'PK | PARQUEADERO 6', ip: '192.168.2.143', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'PK | PARQUEADERO FOOD', ip: '192.168.2.178', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PK | PARQUEADERO LLANTAS', ip: '192.168.2.182', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H265' },
  { name: 'PK | SALIDA VEHICULAR 1', ip: '192.168.2.142', manufacturer: 'Milesight', user: 'admin', pass: 'ms1234', comp: 'H264' },
  { name: 'RA | RECIBO EXTERNA 2', ip: '192.168.2.160', manufacturer: 'Milesight', user: 'admin', pass: 'Mssg7509', comp: 'H265' },
];

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ServerRow[];
  title: string;
  onSave: (newData: ServerRow[]) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data, title, onSave }) => {
  const { t } = useLanguage();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [localData, setLocalData] = useState<ServerRow[]>(data);

  // Sync local state with props when modal opens or data changes
  useEffect(() => {
    setLocalData(data);
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, field: keyof ServerRow, value: string) => {
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  
  const handleSave = () => {
      onSave(localData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">{t('closeButton')}</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colIndex')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colName')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colIp')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colManufacturer')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colUser')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colPassword')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('colCompression')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {localData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-4 whitespace-nowrap text-gray-500 text-xs text-center">{index + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 hover:border-gray-300 transition-colors text-center"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                         <input
                          type="text"
                          value={row.ip}
                          onChange={(e) => handleInputChange(index, 'ip', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 hover:border-gray-300 transition-colors text-center"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                        <input
                          type="text"
                          value={row.manufacturer}
                          onChange={(e) => handleInputChange(index, 'manufacturer', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 hover:border-gray-300 transition-colors text-center"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                        <input
                          type="text"
                          value={row.user}
                          onChange={(e) => handleInputChange(index, 'user', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 hover:border-gray-300 transition-colors text-center"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                        <div className="relative flex items-center">
                            <input
                              type={visiblePasswords[index] ? "text" : "password"}
                              value={row.pass}
                              onChange={(e) => handleInputChange(index, 'pass', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 pr-8 hover:border-gray-300 transition-colors text-center"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility(index)}
                                className="absolute right-0 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {visiblePasswords[index] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                        <input
                          type="text"
                          value={row.comp}
                          onChange={(e) => handleInputChange(index, 'comp', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 hover:border-gray-300 transition-colors text-center"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0d1a2e] text-base font-medium text-white hover:bg-[#1a2b4e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e] sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSave}
            >
              {t('saveButton')}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t('closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessModal: React.FC<{ isOpen: boolean; onClose: () => void; message: string }> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {message}
              </h3>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0d1a2e] text-base font-medium text-white hover:bg-[#1a2b4e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e] sm:text-sm"
              onClick={onClose}
            >
              OK
            </button>
          </div>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalData, setModalData] = useState<ServerRow[]>([]);
  const [activeServerKey, setActiveServerKey] = useState<string | null>(null);

  const clubData = serverData[clubName] || serverData['Cali - Cañas Gordas']; // Fallback
  const isDhl = country.code === 'dhl';
  
  // Create an array of servers from the data object to map over
  const servers = Object.entries(clubData)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value], index) => ({
      title: `SERVER_0${index + 1}`,
      details: value as ServerDetails,
    }));

  const handleInfoCardClick = (title: string) => {
    if (clubName === 'Barranquilla' && title === 'SERVER_01') {
      const storageKey = 'barranquilla_s1_data';
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
          try {
              setModalData(JSON.parse(savedData));
          } catch (e) {
              console.error("Failed to parse saved data", e);
              setModalData(BARRANQUILLA_SERVER1_DATA);
          }
      } else {
          setModalData(BARRANQUILLA_SERVER1_DATA);
      }
      
      setActiveServerKey('barranquilla_s1');
      setIsModalOpen(true);
    }
  };

  const handleSaveData = (newData: ServerRow[]) => {
      if (activeServerKey === 'barranquilla_s1') {
          setModalData(newData);
          localStorage.setItem('barranquilla_s1_data', JSON.stringify(newData));
          setShowSuccess(true);
      }
  };

  // Determine title dynamically based on active server/key
  let dynamicModalTitle = '';
  if (activeServerKey === 'barranquilla_s1') {
    dynamicModalTitle = t('modalTitle');
  }

  return (
    <div className="w-full">
      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={modalData}
        title={dynamicModalTitle}
        onSave={handleSaveData}
      />
      
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={t('saveSuccess')}
      />

      <div className="flex justify-center items-center text-center mb-8">
        {isDhl ? (
          <h2 className="flex items-baseline flex-wrap justify-center">
            <span className="text-5xl font-black italic text-[#D40511] tracking-tighter mr-2">{country.name}</span>
            <span className="text-5xl font-bold text-gray-800">- {clubName}</span>
          </h2>
        ) : (
          <>
            <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-10 h-auto mr-4 rounded-sm shadow-md"
            />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {country.name} - {clubName}
            </h2>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servers.map((server, index) => {
            const isOddLayout = servers.length % 2 !== 0 && servers.length > 1;
            const isFirstItem = index === 0;
            const spanClass = isOddLayout && isFirstItem ? 'md:col-span-2' : '';
            
            // Determine if this specific card should be clickable
            const isClickable = clubName === 'Barranquilla' && server.title === 'SERVER_01';

            return (
              <div key={server.title} className={spanClass}>
                <InfoCard 
                  title={server.title} 
                  details={server.details} 
                  onClick={isClickable ? () => handleInfoCardClick(server.title) : undefined}
                />
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