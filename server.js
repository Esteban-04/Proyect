
const express = require('express');
const cors = require('cors');
const ping = require('ping');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
            text: 'Si recibes esto, tu backend en la nube está configurado correctamente.'
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
            // timeout de 3 segundos para entornos de nube
            const resPing = await ping.promise.probe(server.ip, { timeout: 3 });
            return { id: server.id, status: resPing.alive ? 'online' : 'offline', name: server.name, ip: server.ip };
        } catch (e) {
            return { id: server.id, status: 'offline' };
        }
    }));

    const currentlyOffline = results.filter(r => r.status === 'offline' && r.ip);
    const newOffline = currentlyOffline.filter(s => !lastOfflineIps.has(s.ip));

    if (newOffline.length > 0 && emailConfig.enabled) {
        // Lógica de envío de alertas por correo aquí
        console.log(`⚠️ Se detectaron ${newOffline.length} nuevos servidores caídos`);
    }

    lastOfflineIps = new Set(currentlyOffline.map(s => s.ip));
    res.json({ results });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor SALTEX activo en puerto ${PORT}`);
});
