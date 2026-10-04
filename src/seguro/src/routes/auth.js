const express = require('express');
const { users, hashSecret, verifySecret } = require('../database');
const { createToken, revokeUserTokens, rateLimit } = require('../middleware');
const { RE, isValid, onlyKeys, reject, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();
const DUMMY_HASH = hashSecret('relleno-para-tiempo-constante');
const MIN15 = 15 * 60 * 1000;

// ---------------------------------------------------------------- Login (A07)
const loginLimiter = rateLimit({
  windowMs: MIN15, max: 20, event: 'login_rate_limited',
  key: (req) => `login:${req.socket.remoteAddress}`,
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!onlyKeys(req.body, ['username', 'password']) || !isValid(username, RE.username) ||
      typeof password !== 'string' || password.length < 1 || password.length > 100) {
    return bad(res);
  }
  const user = users.find((u) => u.username === username);
  // Se hace el calculo del hash aunque el usuario no exista (evita enumerar usuarios por tiempo)
  const ok = user ? verifySecret(password, user.passwordHash) : (verifySecret(password, DUMMY_HASH), false);
  if (!ok) {
    audit('login_fail', req, { username });
    return reject(res, 401, 'SEC-401', 'Credenciales invalidas');
  }
  audit('login_ok', req, { username });
  res.json({ token: createToken(user), role: user.role, username: user.username, expiresInSeconds: 1800 });
});

// ---------------------------------------------------------------- Recuperacion (A07)
// Antes: sin limite de intentos, revelaba la pregunta ("hint"), el numero de intentos y
// devolvia la contrasena nueva en la respuesta. Ahora: maximo 3 intentos por usuario+IP
// cada 15 minutos (luego HTTP 429), respuestas genericas y respuesta guardada con hash.
// NOTA: en un sistema real se reemplaza la pregunta por un enlace/codigo de un solo uso
// enviado por correo o MFA; las preguntas de seguridad son un metodo debil.
const recoverLimiter = rateLimit({
  windowMs: MIN15, max: 3, event: 'recovery_rate_limited',
  key: (req) => `rec:${req.socket.remoteAddress}:${String((req.body && req.body.username) || '').slice(0, 30)}`,
});

router.post('/recover-password', recoverLimiter, (req, res) => {
  const { username, securityAnswer, newPassword } = req.body || {};
  if (!onlyKeys(req.body, ['username', 'securityAnswer', 'newPassword']) ||
      !isValid(username, RE.username) || !isValid(securityAnswer, RE.answer) ||
      typeof newPassword !== 'string') {
    return bad(res);
  }
  const user = users.find((u) => u.username === username);
  const ok = user ? verifySecret(securityAnswer.toLowerCase(), user.answerHash) : (verifySecret('x', DUMMY_HASH), false);
  if (!ok) {
    audit('recovery_fail', req, { username });
    return reject(res, 401, 'SEC-401', 'Datos de recuperacion invalidos'); // mismo mensaje exista o no el usuario
  }
  if (!RE.password.test(newPassword)) {
    return bad(res, 'La nueva contrasena debe tener entre 10 y 100 caracteres, con letras y numeros');
  }
  user.passwordHash = hashSecret(newPassword);
  revokeUserTokens(user.id); // cierra todas las sesiones abiertas de ese usuario
  audit('recovery_ok', req, { username });
  res.json({ message: 'Contrasena actualizada' }); // ya no se devuelve la contrasena
});

module.exports = router;
