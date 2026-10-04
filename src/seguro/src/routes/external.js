const express = require('express');
const router = express.Router();

router.get('/fetch-external-record', async (req, res) => {
    try {
        const urlDestino = req.query.url;

        // 1. CONTROL NORMATIVO ASC-01: Dominios estrictamente autorizados
        const dominiosSegurosRegex = /^https:\/\/(www\.)?(minsal\.cl|hospital\.gob)\/.*$/;

        if (!urlDestino || !dominiosSegurosRegex.test(urlDestino)) {
            return res.status(400).json({
                error: "Violación de política ONF (ASC-01): Destino no autorizado.",
                codigo: "SEC-400"
            });
        }

        res.json({ status: "OK", mensaje: "Conexión externa permitida.", destino: urlDestino });

    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;