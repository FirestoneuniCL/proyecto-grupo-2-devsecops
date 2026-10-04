// A09 (ONF-11): registro de auditoria forense. Una linea JSON por evento, encadenada
// con hash SHA-256 (cada linea incluye el hash de la anterior => si alguien edita el
// archivo, la cadena se rompe). NUNCA se registran contraseñas, tokens ni datos de
// identidad (nombre, RUT/SSN): solo IDs y los campos de la receta que cambiaron.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.join(__dirname, '..', 'logs');
const FILE = path.join(DIR, 'audit.log');
fs.mkdirSync(DIR, { recursive: true });

let prevHash = 'GENESIS';
if (fs.existsSync(FILE)) {
  const lines = fs.readFileSync(FILE, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length) {
    try { prevHash = JSON.parse(lines[lines.length - 1]).hash; } catch (_) { /* ignora */ }
  }
}

function audit(event, req, details = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    user: req && req.user ? req.user.username : (details.username || 'anonimo'),
    ip: req && req.socket ? req.socket.remoteAddress : 'n/a',
    details,
    prev: prevHash,
  };
  entry.hash = crypto.createHash('sha256').update(prevHash + JSON.stringify(entry)).digest('hex');
  prevHash = entry.hash;
  fs.appendFileSync(FILE, JSON.stringify(entry) + '\n', { mode: 0o640 });
}

module.exports = { audit };
