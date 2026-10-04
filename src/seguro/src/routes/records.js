const express = require('express');
const router = express.Router();

router.get('/record/:id', (req, res) => {
    try {
        const idSolicitado = req.params.id;

        // 1. BLINDAJE REGEX: Obliga a que el ID sea numérico
        const idRegex = /^[0-9]+$/;

        if (!idRegex.test(idSolicitado)) {
            return res.status(400).json({ 
                error: "Violación de política ONF: Formato de ID inválido.", 
                codigo: "SEC-400" 
            });
        }

        // 2. CONTROL DE ACCESO (A01): Validación de autorización
        if (req.user && req.user.role === 'paciente' && req.user.patientId !== parseInt(idSolicitado)) {
            return res.status(403).json({ 
                error: "Acceso denegado: No tienes permiso para ver esta ficha.", 
                codigo: "SEC-403" 
            });
        }

        res.json({ status: "OK", ficha: idSolicitado, datos: "Información médica confidencial" });

    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;