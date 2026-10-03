const express = require('express');
const dns = require('dns').promises;
const net = require('net');
const axios = require('axios');
const { authenticate } = require('../middleware');

const router = express.Router();
const allowedHosts = new Set((process.env.ALLOWED_EXTERNAL_HOSTS || '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean));

function isPrivateIp(address) {
  if (net.isIPv4(address)) return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(address);
  return address === '::1' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:');
}

router.get('/fetch-external-record', authenticate, async (req, res) => {
  try {
    const target = new URL(typeof req.query.url === 'string' ? req.query.url : '');
    if (target.protocol !== 'https:' || !allowedHosts.has(target.hostname.toLowerCase())) return res.status(400).json({ error: 'Destino externo no permitido' });
    const addresses = await dns.lookup(target.hostname, { all: true });
    if (addresses.some(({ address }) => isPrivateIp(address))) return res.status(400).json({ error: 'Destino externo no permitido' });
    const response = await axios.get(target.toString(), { maxRedirects: 0, timeout: 5000, maxContentLength: 2 * 1024 * 1024, responseType: 'text' });
    res.json({ status: response.status, data: response.data });
  } catch (error) {
    console.error('External record request failed', error);
    res.status(502).json({ error: 'No se pudo obtener el recurso externo' });
  }
});

module.exports = router;
