const express = require('express');
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');
const { authenticate } = require('../middleware');
const { onlyKeys, reject, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();

// A10: LISTA BLANCA de servidores externos permitidos (configurable por variable de entorno).
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'hapi.fhir.org').split(',').map((h) => h.trim());

// Rechaza loopback, redes privadas, link-local (169.254.x.x = metadatos de AWS) y similares
function isPrivateIp(ip) {
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
         (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

router.get('/fetch-external-record', authenticate, async (req, res) => {
  if (!onlyKeys(req.query, ['url']) || typeof req.query.url !== 'string' || req.query.url.length > 300) {
    return bad(res);
  }
  let u;
  try { u = new URL(req.query.url); } catch (_) { return bad(res, 'URL invalida'); }

  // 1) solo https, sin credenciales embebidas, sin puertos raros
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) {
    audit('ssrf_blocked', req, { reason: 'esquema/puerto', host: u.hostname });
    return bad(res, 'Destino no permitido');
  }
  // 2) el host debe estar en la lista blanca
  if (!ALLOWED_HOSTS.includes(u.hostname)) {
    audit('ssrf_blocked', req, { reason: 'host fuera de lista blanca', host: u.hostname });
    return reject(res, 403, 'SEC-403', 'Destino no permitido');
  }
  // 3) aunque el host este permitido, su IP real no puede ser interna (anti DNS-rebinding)
  try {
    const addrs = await dns.lookup(u.hostname, { all: true });
    if (addrs.some((a) => isPrivateIp(a.address))) {
      audit('ssrf_blocked', req, { reason: 'ip interna', host: u.hostname });
      return reject(res, 403, 'SEC-403', 'Destino no permitido');
    }
    // 4) sin redirecciones, con timeout y tamano maximo; no se reenvian cabeceras al cliente
    const r = await axios.get(u.toString(), {
      maxRedirects: 0, timeout: 5000, maxContentLength: 1_000_000,
      validateStatus: (s) => s >= 200 && s < 300,
    });
    audit('external_fetch', req, { host: u.hostname, status: r.status });
    res.json({ source: u.hostname, status: r.status, data: r.data });
  } catch (_) {
    res.status(502).json({ error: 'No se pudo obtener el recurso externo', codigo: 'SEC-502' });
  }
});

module.exports = router;
