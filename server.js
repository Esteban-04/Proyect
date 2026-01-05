
import express from 'express';
import cors from 'cors';
import ping from 'ping';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

// Inicializar base de datos JSON de forma segura
const initDb = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify({ configs: {} }, null, 2));
        }
    } catch (e) {
        console.error("Critical error initializing database:", e);
    }
};
initDb();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const readDb = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return { configs: {} };
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading database:", e);
        return { configs: {} };
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error writing database:", e);
    }
};

app.post('/api/save-config', (req, res) => {
    try {
        const { key, servers, cameras } = req.body;
        if (!key) return res.status(400).json({ error: "Key missing" });
        
        const db = readDb();
        db.configs[key] = { servers, cameras, timestamp: Date.now() };
        writeDb(db);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/get-config/:key', (req, res) => {
    const db = readDb();
    res.json(db.configs[req.params.key] || { servers: [], cameras: [] });
});

app.get('/api/get-all-configs', (req, res) => {
    const db = readDb();
    res.json(db.configs || {});
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), memory: process.memoryUsage() });
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers || !Array.isArray(servers)) return res.status(400).json({ error: "Invalid data" });

    const results = await Promise.all(servers.map(async (server) => {
        // El servidor Cloud solo pings a IPs públicas
        if (!server.ip || server.ip.startsWith('192.168') || server.ip.startsWith('10.') || server.ip === 'N/A') {
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

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).+/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Critical Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALTEX Monitor Backend stable on port ${PORT}`);
});
