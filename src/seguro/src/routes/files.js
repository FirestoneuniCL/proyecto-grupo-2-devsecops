const express = require('express');
const router = express.Router();
const multer = require('multer');

// 1. BLINDAJE REGEX (Lista Blanca) en configuración de subida:
const upload = multer({
    dest: 'public/uploads/',
    fileFilter: (req, file, cb) => {
        // Permitimos estrictamente PDF o imágenes. El Regex bloquea al instante .exe, .sh, .bat
        const extensionSegura = /\.(pdf|jpg|jpeg|png)$/i;
        if (!extensionSegura.test(file.originalname)) {
            return cb(new Error('FormatoBloqueado'), false);
        }
        cb(null, true);
    }
});

// Nota: Asegúrate de que la ruta coincida con tu archivo ('/upload-exam' o '/upload' según corresponda)
router.post('/upload-exam', upload.single('examFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Violación de política ONF: Archivo ausente.",
                codigo: "SEC-400"
            });
        }
        res.json({ status: "OK", mensaje: "Examen médico guardado con éxito.", archivo: req.file.filename });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor.", codigo: "SEC-500" });
    }
});

// 2. MANEJO DE ERRORES: Atrapamos el intento de subir ejecutables sin que el servidor caiga
router.use((err, req, res, next) => {
    if (err.message === 'FormatoBloqueado') {
        return res.status(415).json({
            error: "Violación de política ONF (ASC-02): El tipo de archivo no está permitido.",
            codigo: "SEC-415"
        });
    }
    next(err);
});

module.exports = router;