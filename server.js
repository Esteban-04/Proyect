
import express from 'express';
import cors from 'cors';
import ping from 'ping';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

let lastOfflineIps = new Set();

app.use(cors());
app.use(express.json());

// --- Endpoints de API ---
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        msg: "SALTEX Monitor Backend is running"
    });
});

app.post('/api/config-alerts', (req, res) => {
    const { config } = req.body;
    if (config) {
        emailConfig = { ...emailConfig, ...config };
        try {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(emailConfig, null, 2));
        } catch(e) {
            console.error("No se pudo persistir la configuración en disco");
        }
        return res.json({ success: true });
    }
    res.status(400).json({ error: 'Configuración inválida' });
});

app.post('/api/test-email', async (req, res) => {
    const { config } = req.body;
    const testTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
    });

    try {
        await testTransporter.sendMail({
            from: `"SALTEX TEST" <${config.user}>`,
            to: config.recipient,
            subject: '🧪 SALTEX: Prueba de Conexión en la Nube',
            text: 'Si recibes esto, tu backend en Railway está configurado correctamente.'
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;
    if (!servers) return res.status(400).send();

    const results = await Promise.all(servers.map(async (server) => {
        if (!server.ip || server.ip.includes('X')) return { id: server.id, status: 'offline' };
        try {
            // Nota: Algunos entornos de nube bloquean ICMP. Si el ping falla siempre, 
            // considera usar chequeos de puerto TCP si es posible.
            const resPing = await ping.promise.probe(server.ip, { timeout: 3 });
            return { id: server.id, status: resPing.alive ? 'online' : 'offline', name: server.name, ip: server.ip };
        } catch (e) {
            return { id: server.id, status: 'offline' };
        }
    }));

    lastOfflineIps = new Set(results.filter(r => r.status === 'offline' && r.ip).map(s => s.ip));
    res.json({ results });
});

// --- Servir Frontend (Vite Build) ---
// Servimos los archivos estáticos de la carpeta /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Cualquier ruta que no sea de la API, sirve el index.html (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor SALTEX corriendo en puerto ${PORT}`);
});
