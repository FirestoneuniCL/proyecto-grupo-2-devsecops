const express = require('express');
const { users } = require('../database');
const { activeTokens } = require('../middleware');

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  const token = `token-${user.id}-${Date.now()}`;
  activeTokens[token] = user.id;
  res.json({ token, role: user.role, username: user.username });
});

// A07: Password recovery via trivial security questions without rate limiting.
// No attempt counter, no lockout, no delay — brute force is trivial.
const recoveryAttempts = {}; // intentionally unbounded

router.post('/recover-password', (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // No rate limiting applied — unlimited attempts allowed
  // No lockout after N failed attempts
  if (user.securityAnswer !== securityAnswer) {
    return res.status(401).json({
      error: 'Respuesta de seguridad incorrecta',
      hint: 'La pregunta de seguridad es: ' + user.securityQuestion,
      attempts: (recoveryAttempts[username] = (recoveryAttempts[username] || 0) + 1),
    });
  }

  user.password = newPassword;
  delete recoveryAttempts[username];
  res.json({ message: 'Contrasena actualizada exitosamente', newPassword });
});

module.exports = router;
