const crypto = require('crypto');
const { users } = require('./database');

const activeTokens = new Map();

function authenticate(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const userId = token && activeTokens.get(token);
  const user = userId && users.find((candidate) => candidate.id === userId);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  req.user = user;
  next();
}

function issueToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, userId);
  return token;
}

function canAccessPatient(user, patientId) {
  return user.role === 'doctor' || (user.role === 'paciente' && user.patientId === patientId);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error('Unhandled request error', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { authenticate, issueToken, canAccessPatient, errorHandler };
