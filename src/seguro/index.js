const express = require('express');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const https = require('https'); 
const fs = require('fs');       
const helmet = require('helmet'); // A05: Añade cabeceras de seguridad HTTP

const { authenticate } = require('./src/middleware'); // Se elimina el errorHandler vulnerable
const authRoutes = require('./src/routes/auth');
const recordsRoutes = require('./src/routes/records');
const prescriptionsRoutes = require('./src/routes/prescriptions');
const diagnosisRoutes = require('./src/routes/diagnosis');
const filesRoutes = require('./src/routes/files');
const externalRoutes = require('./src/routes/external');

const app = express();

// A05 SEGURO: Activación de Helmet para proteger cabeceras
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz (Oculta información del SO)
app.get('/', (req, res) => {
  res.json({
    app: 'API de Recetas e Historiales Clínicos (Segura)',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    serverInfo: { estado: 'Operativo y Blindado' }
  });
});

// A06 SEGURO: Verificación de firmas con timingSafeEqual
app.get('/api/verify-signature', authenticate, (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) return res.status(400).json({ error: 'Parámetros a y b requeridos' });
  
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    
    if (bufA.length !== bufB.length) {
      return res.json({ valid: false, mensaje: 'Longitudes de firma desiguales' });
    }

    const valid = crypto.timingSafeEqual(bufA, bufB);
    res.json({ valid, metodo: 'crypto.timingSafeEqual (Seguro)' });
  } catch (error) {
    res.status(400).json({ error: 'Error al procesar las firmas' });
  }
});

// Enrutamiento modular
app.use('/api', authRoutes);
app.use('/api', recordsRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api', prescriptionsRoutes);
app.use('/api', filesRoutes);
app.use('/api', externalRoutes);

// A04 SEGURO: Bloqueo explícito de acceso público a expedientes
app.use('/patients', (req, res) => {
    res.status(403).json({
        error: "Violación de política ONF: Los expedientes médicos no son de acceso público.",
        codigo: "SEC-403"
    });
});

// Archivos estáticos protegidos (debe ir después del bloqueo de /patients)
app.use(express.static(path.join(__dirname, 'public')));

// A05 SEGURO: Interceptor global de errores corporativos (Oculta Stack Trace)
app.use((err, req, res, next) => {
    console.error("Alerta de Seguridad: Intento de solicitud malformada detectada.");
    res.status(400).json({
        error: "Violación de política ONF: Solicitud malformada o error de procesamiento.",
        codigo: "SEC-400"
    });
});

// A02 SEGURO: Servidor HTTPS estricto
const opcionesSSL = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

https.createServer(opcionesSSL, app).listen(3443, () => {
    console.log('Servidor SEGURO corriendo en https://localhost:3443');
});