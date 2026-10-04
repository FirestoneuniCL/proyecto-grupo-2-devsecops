const express = require('express');
const crypto = require('crypto');
const { prescriptions, canAccessPatient, sign } = require('../database');
const { authenticate } = require('../middleware');
const { RE, isValid, onlyKeys, reject, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();

function signatureValid(p) {
  const a = Buffer.from(p.signature, 'hex');
  const b = Buffer.from(sign(p), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// A01 + A02: solo ve la receta el paciente dueno o un doctor con ese paciente asignado.
// La firma es un HMAC-SHA256 real y el servidor solo responde por HTTPS (HTTP -> 301).
router.get('/prescription/:id', authenticate, (req, res) => {
  if (!isValid(req.params.id, RE.id)) return bad(res);
  const p = prescriptions.find((x) => x.id === Number(req.params.id));
  if (!p) return reject(res, 404, 'SEC-404', 'Recurso no encontrado');
  if (!canAccessPatient(req.user, p.patientId)) {
    audit('access_denied', req, { resource: 'prescription', prescriptionId: p.id });
    return reject(res, 403, 'SEC-403', 'Acceso denegado');
  }
  audit('prescription_read', req, { prescriptionId: p.id });
  res.json({ ...p, signatureValid: signatureValid(p) });
});

// A09 + A01: solo el DOCTOR QUE EMITIO la receta puede modificarla, se validan los campos
// con lista blanca y TODA modificacion queda en el log de auditoria (quien, cuando, IP,
// antes y despues). La receta se vuelve a firmar tras el cambio.
router.put('/prescription/:id', authenticate, (req, res) => {
  if (!isValid(req.params.id, RE.id)) return bad(res);
  const p = prescriptions.find((x) => x.id === Number(req.params.id));
  if (!p) return reject(res, 404, 'SEC-404', 'Recurso no encontrado');

  if (req.user.role !== 'doctor' || p.doctorId !== req.user.id) {
    audit('access_denied', req, { resource: 'prescription_update', prescriptionId: p.id });
    return reject(res, 403, 'SEC-403', 'Acceso denegado');
  }
  const fields = ['medication', 'dosage', 'duration'];
  const body = req.body || {};
  if (!onlyKeys(body, fields) || Object.keys(body).length === 0 ||
      !Object.keys(body).every((k) => isValid(body[k], RE[k]))) {
    audit('input_rejected', req, { route: 'PUT /api/prescription/:id', prescriptionId: p.id });
    return bad(res);
  }

  const before = {}; const after = {};
  for (const k of Object.keys(body)) { before[k] = p[k]; after[k] = body[k]; p[k] = body[k]; }
  p.signature = sign(p);

  audit('prescription_modified', req, { prescriptionId: p.id, patientId: p.patientId, before, after });
  res.json({ message: 'Receta modificada', prescription: { ...p, signatureValid: signatureValid(p) } });
});

module.exports = router;
