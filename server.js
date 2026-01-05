
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

// Inicializar base de datos JSON
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {} }, null, 2));
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const readDb = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeDb = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API: Guardar configuración
app.post('/api/save-config', (req, res) => {
    const { key, servers, cameras } = req.body;
    const db = readDb();
    db.configs[key] = { servers, cameras, timestamp: Date.now() };
    writeDb(db);
    res.json({ success: true });
});

// API: Obtener una configuración
app.get('/api/get-config/:key', (req, res) => {
    const db = readDb();
    res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

// API: Obtener todas las configuraciones (Para el Resumen Global)
app.get('/api/get-all-configs', (req, res) => {
    const db = readDb();
    res.json(db.configs);
});

// API: Chequeo desde la nube (Cloud Check)
app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers) return res.status(400).send();

    const results = await Promise.all(servers.map(async (server) => {
        // Railway solo puede pinglear IPs públicas. 192.168 siempre dará offline aquí.
        if (!server.ip || server.ip.startsWith('192.168') || server.ip === 'N/A') {
            return { id: server.id, status: 'offline' };
        }
        try {
            const resPing = await ping.promise.probe(server.ip, { timeout: 1 });
            return { id: server.id, status: resPing.alive ? 'online' : 'offline' };
        } catch (e) {
            return { id: server.id, status: 'offline' };
        }
    }));
    res.json({ results });
});

// Servir estáticos
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Cloud Backend running on port ${PORT}`);
});
