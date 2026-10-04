const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// 1. MITIGACIÓN A07: Bloqueo de tasa contra fuerza bruta
const limitadorFuerzaBruta = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 3, 
    message: {
        error: "Demasiados intentos fallidos. Cuenta bloqueada temporalmente.",
        codigo: "SEC-429"
    }
});

router.post('/login', (req, res) => {
    res.json({ status: "OK", token: "token-simulado-123" });
});

router.post('/recover-password', limitadorFuerzaBruta, (req, res) => {
    try {
        const { username, securityAnswer } = req.body;

        // 2. BLINDAJE REGEX (Lista Blanca)
        const alfanumericoRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!username || !alfanumericoRegex.test(username)) {
            return res.status(400).json({ error: "Usuario inválido.", codigo: "SEC-400" });
        }

        if (securityAnswer !== "RespuestaCorrectaSecreta") {
            return res.status(401).json({ error: "Credenciales incorrectas.", codigo: "SEC-401" });
        }

        res.json({ status: "OK", mensaje: "Contraseña actualizada bajo estándares seguros." });
    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;