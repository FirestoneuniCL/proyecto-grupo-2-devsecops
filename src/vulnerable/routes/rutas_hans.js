const express = require('express');
const router = express.Router();

// A01: Control de acceso roto (Broken Access Control)
router.get('/api/record/:id', (req, res) => {
    // VULNERABILIDAD: Entrega los datos médicos de cualquier ID sin preguntar quién es el usuario
    res.json({
        paciente_id: req.params.id,
        diagnostico: "Hipertensión",
        receta: "Losartán 50mg"
    });
});

// A03: Inyección NoSQL (Injection)
router.post('/api/diagnosticos/buscar', (req, res) => {
    // VULNERABILIDAD: Confía ciegamente en req.body y lo ejecutaría directo en MongoDB
    res.json({
        mensaje: "Búsqueda procesada sin sanitizar",
        query_ejecutada: req.body
    });
});

// Aquí agregarás luego tus endpoints para A02 y A04

// Exportamos el módulo para que app.js lo pueda usar
module.exports = router;