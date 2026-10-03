const express = require('express');
const crypto = require('crypto');
const { users, hashPassword } = require('../database');
const { issueToken } = require('../middleware');

const router = express.Router();
const loginAttempts = new Map();
const recoveryAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function allowed(attempts, key) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

router.post('/login', (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!allowed(loginAttempts, req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Intente mas tarde.' });
  const user = users.find((candidate) => candidate.username === username);
  const suppliedHash = hashPassword(password);
  const valid = user && crypto.timingSafeEqual(Buffer.from(suppliedHash, 'hex'), Buffer.from(user.passwordHash, 'hex'));
  if (!valid) return res.status(401).json({ error: 'Credenciales invalidas' });
  loginAttempts.delete(req.ip);
  res.json({ token: issueToken(user.id), role: user.role, username: user.username });
});

router.post('/recover-password', (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  if (!allowed(recoveryAttempts, req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Intente mas tarde.' });
  res.status(202).json({ message: 'Si la cuenta existe, recibira instrucciones por un canal verificado.' });
});

module.exports = router;
