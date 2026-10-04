const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// 1. MITIGACIÓN A07: Política de bloqueo tras múltiples intentos fallidos
const limitadorFuerzaBruta = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    max: 3, // Bloquea estrictamente al tercer intento fallido
    message: {
        error: "Violación de política ONF: Demasiados intentos fallidos. Cuenta bloqueada temporalmente.",
        codigo: "SEC-429"
    }
});

// Ruta simulada de Login (para mantener la estructura de tu API)
router.post('/login', (req, res) => {
    res.json({ status: "OK", token: "token-simulado-123" });
});

// 2. APLICACIÓN DE LA DEFENSA en la ruta vulnerable
// Al inyectar "limitadorFuerzaBruta" como middleware, Express frena los bucles de ataques
router.post('/recover-password', limitadorFuerzaBruta, (req, res) => {
    try {
        const { username, securityAnswer, newPassword } = req.body;

        // 3. BLINDAJE REGEX (Lista Blanca): Validamos que los datos no contengan código malicioso
        const alfanumericoRegex = /^[a-zA-Z0-9_]{3,20}$/;
        
        if (!username || !alfanumericoRegex.test(username)) {
            return res.status(400).json({ 
                error: "Violación de política ONF: Formato de usuario inválido.", 
                codigo: "SEC-400" 
            });
        }

        // Simulación segura de validación de contraseña
        if (securityAnswer !== "RespuestaCorrectaSecreta") {
            // Cada rechazo suma al contador del limitador. Al llegar a 3, arrojará SEC-429 automáticamente.
            return res.status(401).json({ 
                error: "Credenciales de recuperación incorrectas.", 
                codigo: "SEC-401" 
            });
        }

        res.json({ status: "OK", mensaje: "Contraseña actualizada bajo estándares seguros." });

    } catch (error) {
        res.status(500).json({ error: "Error interno.", codigo: "SEC-500" });
    }
});

module.exports = router;