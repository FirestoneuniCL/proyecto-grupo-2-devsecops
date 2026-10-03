const express = require('express');
const path = require('path');
const os = require('os');

// A06: Dependency on a discontinued/vulnerable NPM crypto package.
// 'cryptiles' was deprecated due to CVE-2018-1000620 (timing attack on
// HMAC comparison). It is still installed and used in this project.
const cryptiles = require('cryptiles');

const { authenticate, errorHandler } = require('./src/middleware');
const authRoutes = require('./src/routes/auth');
const recordsRoutes = require('./src/routes/records');
const prescriptionsRoutes = require('./src/routes/prescriptions');
const diagnosisRoutes = require('./src/routes/diagnosis');
const filesRoutes = require('./src/routes/files');
const externalRoutes = require('./src/routes/external');

const app = express();
const PORT = 3000;

// A05: Security headers are intentionally absent.
// No helmet, no X-Content-Type-Options, no X-Frame-Options,
// no Content-Security-Policy, no Strict-Transport-Security, no X-XSS-Protection.

// A04: Static middleware serves the 'public' folder directly via web.
// Patient data files stored in public/patients/ are accessible to anyone.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'API de Recetas e Historiales Clinicos',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    // A05: Leaks server OS information on a public endpoint
    serverInfo: {
      os: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      hostname: os.hostname(),
      osRelease: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
    },
  });
});

// A06: Using the deprecated cryptiles package for signature "verification"
app.get('/api/verify-signature', authenticate, (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    return res.status(400).json({ error: 'Parametros a y b requeridos' });
  }
  // Uses the vulnerable fixedTimeComparison from the deprecated package
  const valid = cryptiles.fixedTimeComparison(a, b);
  res.json({ valid, package: 'cryptiles (CVE-2018-1000620)' });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', recordsRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api', prescriptionsRoutes);
app.use('/api', filesRoutes);
app.use('/api', externalRoutes);

// A05: Detailed error handler that exposes stack traces and server details
app.use(errorHandler);

// A02: Server runs on HTTP only — no HTTPS, no TLS certificate
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} (HTTP sin cifrar)`);
  console.log('ADVERTENCIA: Esta aplicacion contiene vulnerabilidades intencionales.');
  console.log('NO usar en produccion. Solo para fines educativos.');
});
