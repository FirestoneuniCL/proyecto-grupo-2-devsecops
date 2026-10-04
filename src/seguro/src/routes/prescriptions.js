const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 1. MITIGACIÓN A09: Generador de logs inmutables locales
const generarLogAuditoria = (usuario, ip, accion, detalles) => {
    const logDir = path.join(__dirname, '../../../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    const logPath = path.join(logDir, 'audit.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] IP: ${ip} | Usuario: ${usuario} | Acción: ${accion} | Detalles: ${detalles}\n`;
    
    fs.appendFileSync(logPath, logEntry);
};

router.put('/prescription/:id', (req, res) => {
    try {
        const idReceta = req.params.id;
        const { dosage } = req.body; 

        if (!/^[0-9]+$/.test(idReceta)) {
            return res.status(400).json({ error: "ID inválido.", codigo: "SEC-400" });
        }

        const usuarioActual = req.user ? req.user.username : 'SISTEMA';
        const ipOrigen = req.ip || req.connection.remoteAddress;

        // 2. REGISTRO OBLIGATORIO DE EVENTOS CRÍTICOS
        generarLogAuditoria(usuarioActual, ipOrigen, "MODIFICACION_RECETA", `Receta ID ${idReceta}. Nueva dosis: ${dosage}`);

        res.json({ status: "OK", mensaje: "Modificación registrada en la bitácora." });
    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;