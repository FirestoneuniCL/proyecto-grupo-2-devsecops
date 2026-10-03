// Authentication middleware
// Uses a simple in-memory token store. Tokens are generated on login.

const { users } = require('./database');

const activeTokens = {};

function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !activeTokens[token]) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const userId = activeTokens[token];
  req.user = users.find((u) => u.id === userId);
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no valido' });
  }
  next();
}

// A05: Error handler that exposes full stack traces and server OS information.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  res.status(500).json({
    error: err.message || 'Error interno del servidor',
    stack: err.stack,
    server: {
      os: process.platform,
      osVersion: process.version,
      nodeVersion: process.versions.node,
      arch: process.arch,
      hostname: require('os').hostname(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
}

module.exports = { authenticate, activeTokens, errorHandler };
