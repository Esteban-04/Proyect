
import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

// Inicializar archivo de datos si no existe
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {}, users: [] }, null, 2));
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Utilidades de Persistencia ---
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// --- API Endpoints ---

// Salud del sistema
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', persistence: fs.existsSync(DATA_FILE) });
});

// Guardar configuración de una sede (Clubs/Servidores)
app.post('/api/save-config', (req, res) => {
    const { key, servers, cameras } = req.body;
    const data = readData();
    data.configs[key] = { servers, cameras, updatedAt: new Date().toISOString() };
    writeData(data);
    res.json({ success: true });
});

// Obtener configuración de una sede
app.get('/api/get-config/:key', (req, res) => {
    const data = readData();
    res.json(data.configs[req.params.key] || { servers: [], cameras: [] });
});

// Chequeo de estado desde la nube (Cloud Check)
app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers) return res.status(400).send();

    const results = await Promise.all(servers.map(async (server) => {
        if (!server.ip || server.ip.includes('X') || server.ip === '0.0.0.0' || server.ip === 'N/A') {
            return { id: server.id, status: 'offline' };
        }
        try {
            // Intento 1: ICMP Ping
            const resPing = await ping.promise.probe(server.ip, { timeout: 1 });
            if (resPing.alive) return { id: server.id, status: 'online' };

            // Intento 2: Puerto 80 (TCP)
            const socket = new net.Socket();
            const isOnline = await new Promise((resolve) => {
                socket.setTimeout(1000);
                socket.on('connect', () => { socket.destroy(); resolve(true); });
                socket.on('timeout', () => { socket.destroy(); resolve(false); });
                socket.on('error', () => { socket.destroy(); resolve(false); });
                socket.connect(80, server.ip);
            });
            
            return { id: server.id, status: isOnline ? 'online' : 'offline' };
        } catch (e) {
            return { id: server.id, status: 'offline' };
        }
    }));
    res.json({ results });
});

// Servir frontend
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Monitor Cloud Server active on port ${PORT}`);
});
