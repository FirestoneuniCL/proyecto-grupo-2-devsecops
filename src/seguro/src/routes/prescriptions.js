const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 1. MITIGACIÓN A09: Función de auditoría forense
// Genera un registro centralizado e inmutable con fecha, IP y detalles del evento
const generarLogAuditoria = (usuario, ip, accion, detalles) => {
    // Definimos la ruta hacia una carpeta "logs" en la raíz del entorno seguro
    const logDir = path.join(__dirname, '../../../logs');
    
    // Si la carpeta no existe, el sistema la crea automáticamente
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, 'audit.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] IP: ${ip} | Usuario: ${usuario} | Acción: ${accion} | Detalles: ${detalles}\n`;
    
    // Escribimos la evidencia en el archivo de texto
    fs.appendFileSync(logPath, logEntry);
};

// Ruta de modificación de receta (interceptada por el script de auditoría)
router.put('/prescription/:id', (req, res) => {
    try {
        const idReceta = req.params.id;
        const { dosage } = req.body; 

        // BLINDAJE REGEX: Verificamos que el ID sea numérico
        if (!/^[0-9]+$/.test(idReceta)) {
            return res.status(400).json({ error: "Formato de ID inválido.", codigo: "SEC-400" });
        }

        // Simulamos la extracción del usuario autenticado desde el token
        const usuarioActual = req.user ? req.user.username : 'SISTEMA_O_ANONIMO';
        const ipOrigen = req.ip || req.connection.remoteAddress;

        // 2. REGISTRO OBLIGATORIO (A09): Guardamos la evidencia antes de procesar el cambio
        generarLogAuditoria(
            usuarioActual, 
            ipOrigen, 
            "MODIFICACION_RECETA_CRITICA", 
            `Intento de alteración en receta ID ${idReceta}. Nueva dosis solicitada: ${dosage}`
        );

        res.json({ 
            status: "OK", 
            mensaje: "Modificación procesada. El evento ha sido registrado en la bitácora forense.",
            receta: idReceta
        });

    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor.", codigo: "SEC-500" });
    }
});

module.exports = router;