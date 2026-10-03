const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authenticate, errorHandler } = require('./src/middleware');
const authRoutes = require('./src/routes/auth');
const recordsRoutes = require('./src/routes/records');
const prescriptionsRoutes = require('./src/routes/prescriptions');
const diagnosisRoutes = require('./src/routes/diagnosis');
const filesRoutes = require('./src/routes/files');
const externalRoutes = require('./src/routes/external');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ strictTransportSecurity: process.env.NODE_ENV === 'production' }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) return res.status(426).json({ error: 'Se requiere HTTPS' });
  next();
});

app.get('/', (req, res) => res.json({ app: 'API de Recetas e Historiales Clinicos', version: '2.0.0', status: 'secure' }));
app.get('/api/verify-signature', authenticate, (req, res) => res.status(410).json({ error: 'Endpoint retirado' }));

app.use('/api', authRoutes);
app.use('/api', recordsRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api', prescriptionsRoutes);
app.use('/api', filesRoutes);
app.use('/api', externalRoutes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Servidor seguro escuchando en el puerto ${PORT}`));

module.exports = app;
