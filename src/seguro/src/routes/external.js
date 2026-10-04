const express = require('express');
const router = express.Router();

router.get('/fetch-external-record', async (req, res) => {
    try {
        const urlDestino = req.query.url;

        // 1. CONTROL NORMATIVO ASC-01 (Lista Blanca Regex): 
        // Solo permitimos peticiones HTTPS hacia un dominio oficial y autorizado (ej. minsal.cl).
        // Esto bloquea automáticamente IPs internas como 127.0.0.1, localhost o 169.254.169.254 (AWS).
        const dominiosSegurosRegex = /^https:\/\/(www\.)?(minsal\.cl|hospital\.gob)\/.*$/;

        if (!urlDestino || !dominiosSegurosRegex.test(urlDestino)) {
            // 2. MANEJO DE ERRORES: Reemplazamos errores crudos por el código corporativo SEC-400
            return res.status(400).json({
                error: "Violación de política ONF (ASC-01): Destino de red no autorizado o esquema inseguro.",
                codigo: "SEC-400"
            });
        }

        // Si pasa la validación estricta, la aplicación se conectaría de forma segura
        res.json({ 
            status: "OK", 
            mensaje: "Conexión externa permitida.", 
            destino_validado: urlDestino 
        });

    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor.", codigo: "SEC-500" });
    }
});

module.exports = router;