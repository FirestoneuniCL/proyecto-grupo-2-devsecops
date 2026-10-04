const express = require('express');
const router = express.Router();

router.get('/search', (req, res) => {
    try {
        const queryDiagnostico = req.query.diagnosis;

        // 1. BLINDAJE REGEX (Lista Blanca): Evita operadores inyectados como $ne
        const seguroRegex = /^[a-zA-Z0-9\s]{3,50}$/;

        if (!queryDiagnostico || typeof queryDiagnostico !== 'string' || !seguroRegex.test(queryDiagnostico)) {
            return res.status(400).json({
                error: "Violación de política ONF (ASC-02): Formato de búsqueda inválido.",
                codigo: "SEC-400"
            });
        }

        res.json({ status: "OK", busqueda: queryDiagnostico, resultados: "Diagnósticos seguros" });

    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;