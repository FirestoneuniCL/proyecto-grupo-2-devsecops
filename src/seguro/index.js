const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { authenticate, securityHeaders, notFound, errorHandler } = require('./src/middleware');
const { RE, isValid, onlyKeys, bad } = require('./src/validate');
const authRoutes = require('./src/routes/auth');
const recordsRoutes = require('./src/routes/records');
const prescriptionsRoutes = require('./src/routes/prescriptions');
const diagnosisRoutes = require('./src/routes/diagnosis');
const filesRoutes = require('./src/routes/files');
const externalRoutes = require('./src/routes/external');

const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 3443;

const app = express();
app.disable('x-powered-by');            // A05: no revelar que usamos Express
app.set('query parser', 'simple');      // A03: "a[$ne]=x" NO se convierte en objeto
app.use(securityHeaders);               // A05: cabeceras de seguridad
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
// A04: NO hay express.static. Ninguna carpeta con datos de pacientes se sirve por web.

// A05: la raiz ya no revela SO, version de Node, hostname ni memoria
app.get('/', (req, res) => res.json({ app: 'MediCare Core API', status: 'ok' }));

// A06: se elimino el paquete "cryptiles". Comparacion en tiempo constante con "crypto" nativo.
app.get('/api/verify-signature', authenticate, (req, res) => {
  const { a, b } = req.query;
  if (!onlyKeys(req.query, ['a', 'b']) || !isValid(a, RE.hexSig) || !isValid(b, RE.hexSig)) return bad(res);
  res.json({ valid: crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')) });
});

app.use('/api', authRoutes);
app.use('/api', recordsRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api', prescriptionsRoutes);
app.use('/api', filesRoutes);
app.use('/api', externalRoutes);

app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------- A02: HTTPS obligatorio
const keyFile = path.join(__dirname, 'certs', 'server.key');
const crtFile = path.join(__dirname, 'certs', 'server.crt');
if (!fs.existsSync(keyFile) || !fs.existsSync(crtFile)) {
  console.error('Falta el certificado TLS. Ejecuta primero:  npm run gen-cert');
  process.exit(1);
}
https.createServer({ key: fs.readFileSync(keyFile), cert: fs.readFileSync(crtFile), minVersion: 'TLSv1.2' }, app)
  .listen(HTTPS_PORT, '0.0.0.0', () => console.log(`HTTPS seguro en https://0.0.0.0:${HTTPS_PORT}`));

// El puerto HTTP ya NO entrega datos: solo redirige (301) hacia HTTPS.
http.createServer((req, res) => {
  const host = String(req.headers.host || '').split(':')[0];
  if (!/^[A-Za-z0-9.\-]{1,253}$/.test(host) || !String(req.url).startsWith('/')) {
    res.writeHead(400, { 'Content-Length': 0 }); return res.end();
  }
  try {
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}`, 'Content-Length': 0,
                         'X-Content-Type-Options': 'nosniff' });
  } catch (_) { res.writeHead(400, { 'Content-Length': 0 }); }
  res.end();
}).listen(HTTP_PORT, '0.0.0.0', () => console.log(`HTTP en :${HTTP_PORT} solo redirige a HTTPS`));
