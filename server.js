
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
    } catch (e) {
        console.error("❌ Error cargando configuración");
    }
}

app.use(cors());
app.use(express.json());

const checkTcpPort = (host, port = 80, timeout = 1500) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let status = false;
        socket.setTimeout(timeout);
        socket.on('connect', () => { status = true; socket.destroy(); });
        socket.on('timeout', () => { socket.destroy(); });
        socket.on('error', () => { socket.destroy(); });
        socket.on('close', () => { resolve(status); });
        socket.connect(port, host);
    });
};

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', msg: "SALTEX Monitor Backend Active" });
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers || !Array.isArray(servers)) return res.status(400).send();

    // Limitamos el tiempo total de respuesta para no colgar el frontend
    const results = await Promise.race([
        Promise.all(servers.map(async (server) => {
            if (!server.ip || server.ip.includes('X') || server.ip === '0.0.0.0') {
                return { id: server.id, status: 'offline' };
            }
            try {
                // Intento 1: Ping
                const resPing = await ping.promise.probe(server.ip, { timeout: 1 });
                if (resPing.alive) return { id: server.id, status: 'online' };

                // Intento 2: TCP 80
                const isTcp80 = await checkTcpPort(server.ip, 80);
                if (isTcp80) return { id: server.id, status: 'online' };

                // Intento 3: TCP 443
                const isTcp443 = await checkTcpPort(server.ip, 443);
                if (isTcp443) return { id: server.id, status: 'online' };

                return { id: server.id, status: 'offline' };
            } catch (e) {
                return { id: server.id, status: 'offline' };
            }
        })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 12000))
    ]).catch(() => servers.map(s => ({ id: s.id, status: 'offline' })));

    res.json({ results: Array.isArray(results) ? results : [] });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Monitor Server running on port ${PORT}`);
});
