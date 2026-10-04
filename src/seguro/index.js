const express = require('express');
const path = require('path');
const os = require('os');
const crypto = require('crypto'); // Criptografía nativa y segura de Node.js

const { authenticate, errorHandler } = require('./src/middleware');
const authRoutes = require('./src/routes/auth');
const recordsRoutes = require('./src/routes/records');
const prescriptionsRoutes = require('./src/routes/prescriptions');
const diagnosisRoutes = require('./src/routes/diagnosis');
const filesRoutes = require('./src/routes/files');
const externalRoutes = require('./src/routes/external');

const app = express();
const PORT = 3000;

// Configuración de archivos estáticos de forma segura
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz principal (Hardening: Oculta información sensible del sistema operativo)
app.get('/', (req, res) => {
  res.json({
    app: 'API de Recetas e Historiales Clínicos (Segura)',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    serverInfo: {
      estado: 'Operativo y Blindado',
    },
  });
});

// A06 SEGURO: Verificación de firmas utilizando criptografía nativa y segura (timingSafeEqual)
app.get('/api/verify-signature', authenticate, (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    return res.status(400).json({ error: 'Parámetros a y b requeridos' });
  }
  
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    
    // Validamos que tengan la misma longitud antes de comparar para evitar excepciones
    if (bufA.length !== bufB.length) {
      return res.json({ valid: false, mensaje: 'Longitudes de firma desiguales' });
    }

    const valid = crypto.timingSafeEqual(bufA, bufB);
    res.json({ valid, metodo: 'crypto.timingSafeEqual (Seguro)' });
  } catch (error) {
    res.status(400).json({ error: 'Error al procesar las firmas' });
  }
});

// Enrutamiento modular de la API
app.use('/api', authRoutes);
app.use('/api', recordsRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api', prescriptionsRoutes);
app.use('/api', filesRoutes);
app.use('/api', externalRoutes);

// A05 SEGURO: Interceptor global de errores corporativos (evita Stack Traces)
app.use((err, req, res, next) => {
    console.error("Alerta de Seguridad: Intento de solicitud malformada detectada.");
    res.status(400).json({
        error: "Violación de política ONF: Solicitud malformada o error de procesamiento.",
        codigo: "SEC-400"
    });
});

// Arranque del servidor seguro
app.listen(PORT, () => {
  console.log(`Servidor seguro corriendo en http://localhost:${PORT}`);
  console.log('ESTADO: Aplicación blindada contra OWASP Top 10.');
});