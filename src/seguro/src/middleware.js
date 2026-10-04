const crypto = require('crypto');
const { users } = require('./database');
const { audit } = require('./audit');
const { reject, RE } = require('./validate');

// ---------------------------------------------------------------- Sesiones (A07)
// Tokens aleatorios criptograficos (32 bytes) con expiracion. En la version vulnerable
// eran predecibles: "token-<id>-<fecha>".
const TOKEN_TTL_MS = 30 * 60 * 1000;
const sessions = new Map(); // token -> { userId, exp }

function createToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, exp: Date.now() + TOKEN_TTL_MS });
  return token;
}
function revokeUserTokens(userId) {
  for (const [t, s] of sessions) if (s.userId === userId) sessions.delete(t);
}

function authenticate(req, res, next) {
  const raw = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = RE.hexSig.test(raw) ? sessions.get(raw) : null; // formato valido: 64 hex
  if (!session || session.exp < Date.now()) {
    if (session) sessions.delete(raw);
    return reject(res, 401, 'SEC-401', 'No autenticado');
  }
  req.user = users.find((u) => u.id === session.userId);
  if (!req.user) return reject(res, 401, 'SEC-401', 'No autenticado');
  next();
}

// ---------------------------------------------------------------- Rate limiting (A07)
// Limitador en memoria (ONF-09). Equivalente a "express-rate-limit" pero sin dependencias.
const buckets = new Map();
function rateLimit({ windowMs, max, key, event }) {
  return (req, res, next) => {
    const k = key(req);
    const now = Date.now();
    let b = buckets.get(k);
    if (!b || b.reset < now) { b = { count: 0, reset: now + windowMs }; buckets.set(k, b); }
    b.count += 1;
    if (b.count > max) {
      const retry = Math.ceil((b.reset - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      audit(event, req, { key: k.split(':')[0], retryAfterSeconds: retry });
      return reject(res, 429, 'SEC-429', 'Demasiados intentos. Intente mas tarde.');
    }
    next();
  };
}

// ---------------------------------------------------------------- Cabeceras (A05)
// Equivalente a usar "helmet". Si lo prefieren: npm i helmet  y  app.use(helmet()).
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// ---------------------------------------------------------------- Errores (A05)
function notFound(req, res) {
  return reject(res, 404, 'SEC-404', 'Recurso no encontrado');
}

// El detalle (stack trace) se queda en la CONSOLA DEL SERVIDOR; al cliente solo le llega
// un mensaje generico con codigo corporativo SEC-xxx. Nunca versiones ni rutas internas.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') return reject(res, 400, 'SEC-400', 'Solicitud invalida');
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    return reject(res, 413, 'SEC-413', 'Contenido demasiado grande');
  }
  if (err.name === 'MulterError') return reject(res, 400, 'SEC-400', 'Solicitud invalida');
  console.error('[ERROR INTERNO]', err && err.stack);
  return reject(res, 500, 'SEC-500', 'Error interno del servidor');
}

module.exports = { authenticate, createToken, revokeUserTokens, rateLimit, securityHeaders, notFound, errorHandler };
