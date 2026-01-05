
import express from 'express';
import cors from 'cors';
import ping from 'ping';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// --- Configuración Inicial ---
let emailConfig = {
    enabled: false,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    recipient: 'esteban@saltexgroup.com'
};

if (fs.existsSync(CONFIG_FILE)) {
    try {
        const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        emailConfig = { ...emailConfig, ...savedConfig };
        console.log("✅ Configuración cargada correctamente");
    } catch (e) {
        console.error("❌ Error cargando configuración");
    }
}

app.use(cors());
app.use(express.json());

// Función para verificar si un puerto está abierto (TCP check)
// Útil cuando el entorno de nube bloquea ICMP (ping)
const checkTcpPort = (host, port = 80, timeout = 2000) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let status = false;

        socket.setTimeout(timeout);
        socket.on('connect', () => {
            status = true;
            socket.destroy();
        });
        socket.on('timeout', () => {
            socket.destroy();
        });
        socket.on('error', () => {
            socket.destroy();
        });
        socket.on('close', () => {
            resolve(status);
        });

        socket.connect(port, host);
    });
};

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        msg: "SALTEX Monitor Backend is running"
    });
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers || !Array.isArray(servers)) return res.status(400).send();

    console.log(`[${new Date().toISOString()}] Checking ${servers.length} servers...`);

    const results = await Promise.all(servers.map(async (server) => {
        if (!server.ip || server.ip.includes('X') || server.ip === '0.0.0.0' || server.ip === 'N/A') {
            return { id: server.id, status: 'offline' };
        }

        try {
            // 1. Intento de PING tradicional
            const resPing = await ping.promise.probe(server.ip, { timeout: 2 });
            if (resPing.alive) {
                return { id: server.id, status: 'online', ip: server.ip };
            }

            // 2. FALLBACK: Si falla el ping (común en cloud), intentamos conexión TCP al puerto 80
            // Muchos servidores de cámaras o equipos de red tienen un servidor web en el 80 o 443.
            const isTcpAlive = await checkTcpPort(server.ip, 80);
            if (isTcpAlive) {
                return { id: server.id, status: 'online', ip: server.ip };
            }

            // Intento con puerto 443 por si acaso
            const isHttpsAlive = await checkTcpPort(server.ip, 443);
            if (isHttpsAlive) {
                return { id: server.id, status: 'online', ip: server.ip };
            }

            return { id: server.id, status: 'offline', ip: server.ip };
        } catch (e) {
            return { id: server.id, status: 'offline', ip: server.ip };
        }
    }));

    res.json({ results });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor SALTEX corriendo en puerto ${PORT}`);
});
