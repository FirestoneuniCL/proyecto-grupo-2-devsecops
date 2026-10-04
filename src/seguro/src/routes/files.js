const express = require('express');
const router = express.Router();
const multer = require('multer');

// 1. BLINDAJE REGEX: Filtro estricto de extensiones permitidas
const upload = multer({
    dest: 'public/uploads/',
    fileFilter: (req, file, cb) => {
        const extensionSegura = /\.(pdf|jpg|jpeg|png)$/i;
        if (!extensionSegura.test(file.originalname)) {
            return cb(new Error('FormatoBloqueado'), false);
        }
        cb(null, true);
    }
});

router.post('/upload-exam', upload.single('examFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Archivo ausente.", codigo: "SEC-400" });
        }
        res.json({ status: "OK", mensaje: "Examen guardado.", archivo: req.file.filename });
    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

// 2. MANEJO SEGURO DE RECHAZOS MULTER
router.use((err, req, res, next) => {
    if (err.message === 'FormatoBloqueado') {
        return res.status(415).json({ error: "Tipo de archivo no permitido.", codigo: "SEC-415" });
    }
    next(err);
});

module.exports = router;