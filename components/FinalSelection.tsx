
import React, { useState } from 'react';
import { Country } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon } from '../assets/icons';

// --- Icons ---

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75Z" clipRule="evenodd" />
  </svg>
);

const DoubleChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
  </svg>
);

// --- Interfaces ---

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

// --- Data ---

const INITIAL_CAMERA_DATA = [
  { id: 1, name: 'VA | BOVEDA 1', ip: '192.168.2.187', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 2, name: 'VA | BOVEDA 2', ip: '192.168.2.188', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 3, name: 'VA | BOVEDA CLICK & GO', ip: '192.168.2.230', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H265' },
  { id: 4, name: 'VA | CONTEO 1', ip: '192.168.2.186', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 5, name: 'VA | ENTRADA CONTEO', ip: '192.168.2.189', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 6, name: 'FE | ENTRADA SOCIOS', ip: '192.168.2.120', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 7, name: 'FE | FACIAL', ip: '192.168.2.224', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H264' },
  { id: 8, name: 'FE | MEMBERCHIP', ip: '192.168.2.175', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 9, name: 'FE | PODIUM', ip: '192.168.2.117', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 10, name: 'FE | SALIDA SOCIOS', ip: '192.168.2.103', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 11, name: 'FE | 1-2 CAJAS', ip: '192.168.2.194', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 12, name: 'FE | 3-4-5-6 CAJAS', ip: '192.168.2.192', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 13, name: 'FE | 7-8-9-10 CAJAS', ip: '192.168.2.193', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 14, name: 'FE | 11-12-13 CAJAS', ip: '192.168.2.195', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 15, name: 'FE | LINEA CAJAS', ip: '192.168.2.176', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 16, name: 'RA | COMPACTADORA', ip: '192.168.2.162', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 17, name: 'RA | CONTENEDORES', ip: '192.168.2.164', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 18, name: 'RA | DOMO RECIBO', ip: '192.168.2.161', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 19, name: 'RA | ENTRADA PEATONAL', ip: '192.168.2.152', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 20, name: 'RA | ENTRADA PISO RECIBO', ip: '192.168.2.149', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 21, name: 'RA | ENTRADA RECIBO', ip: '192.168.2.9', manufacturer: 'Milesight', user: 'admin', password: 'mssg7509', compression: 'H265' },
  { id: 22, name: 'RA | GARITA GUARDAS', ip: '192.168.2.168', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 23, name: 'RA | MUELLE 1', ip: '192.168.2.209', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 24, name: 'RA | MUELLE 2', ip: '192.168.2.115', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 25, name: 'RA | MUELLES CONTENEDORES', ip: '192.168.2.148', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 26, name: 'RA | PROVEDORES NACIONALES', ip: '192.168.2.212', manufacturer: 'Milesight', user: 'admin', password: 'mssg7509', compression: 'H265' },
  { id: 27, name: 'RA | OFICINA RAPPI', ip: '192.168.2.93', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H265' },
  { id: 28, name: 'RA | CENTRO LLANTAS', ip: '192.168.2.191', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 29, name: 'PA | CAJA FOOD', ip: '192.168.2.184', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 30, name: 'PA | DELI', ip: '192.168.2.113', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 31, name: 'PA | DEMO', ip: '192.168.2.169', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 32, name: 'PA | FOOD SERVICE 1', ip: '192.168.2.171', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 33, name: 'PA | FOOD SERVICE 2', ip: '192.168.2.111', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 34, name: 'PA | PROCESOS', ip: '192.168.2.185', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 35, name: 'EX | EXTERNA 2', ip: '192.168.2.159', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 36, name: 'PK | ACCESO 1', ip: '192.168.2.94', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H265' },
  { id: 37, name: 'PK | ACCESO 2', ip: '192.168.2.135', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 38, name: 'PK | ALFA 3', ip: '192.168.2.96', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H265' },
  { id: 39, name: 'PK | ASCENSOR NIVEL 2', ip: '192.168.2.146', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 40, name: 'PK | CAMARA PLACA LPR', ip: '192.168.2.225', manufacturer: 'Vivotek', user: 'root', password: 'red12345', compression: 'H265' },
  { id: 41, name: 'PK | DOMO PARQUEADERO', ip: '192.168.2.181', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 42, name: 'PK | ESCALERA ELECTRICA', ip: '192.168.2.134', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 43, name: 'PK | ESCALERA ELECTRICA 2 PISO', ip: '192.168.2.213', manufacturer: 'Milesight', user: 'admin', password: 'mssg7509', compression: 'H264' },
  { id: 44, name: 'PK | LATERAL ALFA 3', ip: '192.168.2.139', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 45, name: 'PK | LATERAL CRA 53', ip: '192.168.2.210', manufacturer: 'Milesight', user: 'admin', password: 'mssg7509', compression: 'H265' },
  { id: 46, name: 'PK | PARQUEADERO 6', ip: '192.168.2.143', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 47, name: 'PK | PARQUEADERO FOOD', ip: '192.168.2.178', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 48, name: 'PK | PARQUEADERO LLANTAS', ip: '192.168.2.182', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H265' },
  { id: 49, name: 'PK | SALIDA VEHICULAR 1', ip: '192.168.2.142', manufacturer: 'Milesight', user: 'admin', password: 'ms1234', compression: 'H264' },
  { id: 50, name: 'RA | RECIBO EXTERNA 2', ip: '192.168.2.160', manufacturer: 'Milesight', user: 'admin', password: 'Mssg7509', compression: 'H265' },
];

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
  'Intexzona': {
      server1: { ip: '10.20.30.40', user: 'admin', teamviewerId: '987 654 321', teamviewerPassword: 'password123' },
  },
  'San Carlos II': {
      server1: { ip: '10.20.30.41', user: 'admin', teamviewerId: '123 456 789', teamviewerPassword: 'password456' },
  },
  'Easy': {
      server1: { ip: '10.20.30.42', user: 'admin', teamviewerId: '456 789 123', teamviewerPassword: 'password789' },
  },
  'PLC': {
      server1: { ip: '10.20.30.43', user: 'admin', teamviewerId: '789 123 456', teamviewerPassword: 'password321' },
  },
  'Rio Negro': {
      server1: { ip: '10.20.30.44', user: 'admin', teamviewerId: '321 654 987', teamviewerPassword: 'password654' },
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
};

// --- FinalSelection Component ---

interface FinalSelectionProps {
  country: Country;
  clubName: string;
  onBack: () => void;
}

const FinalSelection: React.FC<FinalSelectionProps> = ({ country, clubName, onBack }) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [cameras, setCameras] = useState(INITIAL_CAMERA_DATA);
  const [tempCameras, setTempCameras] = useState(INITIAL_CAMERA_DATA);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const servers = serverData[clubName];
  const isDhl = country.code === 'dhl';

  if (!servers) {
    return (
      <div className="text-center">
        <p className="text-red-500 font-semibold mb-4">
            {t('noLocationsMessage')}
        </p>
        <button
          onClick={onBack}
          className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#1a2b4e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
        >
          {t('backButton')}
        </button>
      </div>
    );
  }

  const serverEntries = Object.entries(servers);
  const isOdd = serverEntries.length % 2 !== 0;

  const handleOpenModal = () => {
      setTempCameras(cameras);
      setShowSaveSuccess(false);
      setVisiblePasswords({});
      setShowModal(true);
  };

  const handleInputChange = (id: number, field: string, value: string) => {
    setTempCameras(prev => prev.map(cam => 
        cam.id === id ? { ...cam, [field]: value } : cam
    ));
    setShowSaveSuccess(false);
  };
  
  const togglePasswordVisibility = (id: number) => {
      setVisiblePasswords(prev => ({
          ...prev,
          [id]: !prev[id]
      }));
  }

  const handleSave = () => {
      setCameras(tempCameras);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-6 space-x-4">
         {isDhl ? (
             <h2 className="text-5xl font-black italic text-[#D40511] tracking-tighter">
                {country.name}
             </h2>
         ) : (
            <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={`${country.name} flag`}
                className="w-10 h-auto rounded-sm shadow-md"
            />
         )}
        <h2 className={`text-3xl font-bold text-gray-800 ${isDhl ? 'text-5xl italic font-black text-[#D40511] tracking-tighter' : ''}`}>
             {clubName}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {serverEntries.map(([key, info], index) => {
            const isFirst = index === 0;
            const isServer1 = key === 'server1';
            // If odd number of servers, span the first one across 2 columns to center it (as seen in screenshot)
            const spanClass = (isOdd && isFirst) ? 'md:col-span-2' : '';
            
            // Server 1 specific styles for interactivity
            const cursorClass = isServer1 ? 'cursor-pointer hover:ring-2 hover:ring-[#4f46e5] hover:scale-[1.01] transition-all duration-200' : '';

            return (
              <div 
                key={key} 
                onClick={() => isServer1 && handleOpenModal()}
                className={`bg-[#1a2233] text-white rounded-lg shadow-lg overflow-hidden border border-gray-800 ${spanClass} ${cursorClass}`}
              >
                <div className="p-5">
                   <div className="text-center border-b border-gray-600 pb-3 mb-5">
                      <h3 className="text-lg font-bold uppercase tracking-wider">SERVER_{String(index + 1).padStart(2, '0')}</h3>
                   </div>
                   
                   <div className="space-y-6">
                       {/* Remote Desktop Section */}
                       <div className="relative">
                           <div className="flex items-center mb-2">
                                <MonitorIcon />
                                <span className="ml-2 font-medium text-gray-300 text-sm">{t('remoteDesktopLabel')}</span>
                           </div>
                           <div className="pl-7">
                               <div className="text-xl font-bold tracking-wide mb-1">{info.ip}</div>
                               <div className="text-sm text-gray-400 flex flex-col space-y-0.5">
                                   <span>{t('userLabel')} <span className="text-white font-medium">{info.user}</span></span>
                                   <span>{t('finalPasswordLabel')} <span className="text-white font-medium">Completeview!</span></span>
                               </div>
                           </div>
                       </div>

                       {/* TeamViewer Section */}
                       <div className="relative">
                           <div className="flex items-center mb-2">
                                <div className="flex items-center justify-center bg-gray-500/40 rounded-full w-5 h-5">
                                    <DoubleChevronLeftIcon />
                                </div>
                                <span className="ml-2 font-medium text-gray-300 text-sm">TeamViewer:</span>
                           </div>
                           <div className="pl-7">
                               <div className="text-lg font-semibold tracking-wide mb-1">ID: {info.teamviewerId}</div>
                               <div className="text-sm text-gray-400">
                                   <span>{t('finalPasswordLabel')} <span className="text-white font-medium">{info.teamviewerPassword || '@l3ss21++'}</span></span>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Modal for Camera Details */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#0d1a2e] px-6 py-4 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold flex items-center">
                 {t('modalTitle')}
              </h3>
              <div className="flex items-center space-x-4">
                  {showSaveSuccess && <span className="text-green-400 text-sm font-semibold">{t('saveSuccess')}</span>}
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-auto bg-gray-50 flex-grow">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colIndex')}</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colName')}</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colIp')}</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colManufacturer')}</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colUser')}</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colPassword')}</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('colCompression')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tempCameras.map((cam) => (
                      <tr key={cam.id} className="hover:bg-blue-50 transition-colors group">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium text-center">{cam.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                            <input 
                                type="text" 
                                value={cam.name} 
                                onChange={(e) => handleInputChange(cam.id, 'name', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors"
                            />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                            <input 
                                type="text" 
                                value={cam.ip} 
                                onChange={(e) => handleInputChange(cam.id, 'ip', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors text-center"
                            />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                             <input 
                                type="text" 
                                value={cam.manufacturer} 
                                onChange={(e) => handleInputChange(cam.id, 'manufacturer', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors text-center"
                            />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                            <input 
                                type="text" 
                                value={cam.user} 
                                onChange={(e) => handleInputChange(cam.id, 'user', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors text-center"
                            />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                            <div className="flex items-center space-x-2">
                                <input 
                                    type={visiblePasswords[cam.id] ? "text" : "password"}
                                    value={cam.password}
                                    onChange={(e) => handleInputChange(cam.id, 'password', e.target.value)}
                                    className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors text-center"
                                />
                                <button 
                                    onClick={() => togglePasswordVisibility(cam.id)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {visiblePasswords[cam.id] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                             <input 
                                type="text" 
                                value={cam.compression} 
                                onChange={(e) => handleInputChange(cam.id, 'compression', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#0d1a2e] rounded px-2 py-1 focus:outline-none transition-colors text-center"
                            />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-4 flex justify-end items-center space-x-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="bg-[#0d1a2e] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#1a2b4e] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d1a2e]"
              >
                {t('closeButton')}
              </button>
               <button
                onClick={handleSave}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                {t('saveButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSelection;
