
const express = require('express');
const cors = require('cors');
const ping = require('ping');

const app = express();
const PORT = 3001;

// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Configure CORS specifically to allow Private Network Access (Localhost/VPN)
app.use(cors({
    origin: true, // Reflect the request origin
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Private-Network'],
    credentials: true,
}));

// Manual header override for preflight checks on some strict browsers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Private-Network", "true");
    next();
});

app.use(express.json());

app.post('/api/check-status', async (req, res) => {
    const { servers } = req.body;

    if (!servers || !Array.isArray(servers)) {
        return res.status(400).json({ error: 'Lista de servidores inválida' });
    }

    console.log(`--- Verificando ${servers.length} servidores ---`);

    // Procesar todos los pings en paralelo
    const promises = servers.map(async (server) => {
        // Si la IP contiene 'X' o está vacía, asumimos que es configuración por defecto/inválida
        if (!server.ip || server.ip.includes('X')) {
            console.log(`[ID:${server.id}] IP no válida (${server.ip}) -> OFFLINE`);
            return { id: server.id, status: 'offline' };
        }

        try {
            // Hacemos el ping real. timeout de 2 segundos.
            const res = await ping.promise.probe(server.ip, {
                timeout: 2,
            });
            
            console.log(`[ID:${server.id}] Ping a ${server.ip} -> ${res.alive ? 'ONLINE' : 'OFFLINE'} (${res.time}ms)`);

            return { 
                id: server.id, 
                status: res.alive ? 'online' : 'offline',
                latency: res.time
            };
        } catch (error) {
            console.error(`[ID:${server.id}] Error haciendo ping a ${server.ip}:`, error.message);
            return { id: server.id, status: 'offline' };
        }
    });

    const results = await Promise.all(promises);
    res.json({ results });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`📡 SERVIDOR DE MONITOREO ACTIVO`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`👉 http://127.0.0.1:${PORT}`); 
    console.log(`=========================================`);
});
