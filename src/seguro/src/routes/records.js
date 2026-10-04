const express = require('express');
const { patients, canAccessPatient } = require('../database');
const { authenticate } = require('../middleware');
const { RE, isValid, reject, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();
const maskSsn = (s) => s.replace(/^\d{3}-\d{2}/, '***-**'); // minimizacion de datos (A04)

// A01: control de acceso EN EL SERVIDOR, para cada recurso (ONF-01).
//  - paciente: solo su propia ficha
//  - doctor: solo pacientes que tiene asignados
router.get('/record/:id', authenticate, (req, res) => {
  if (!isValid(req.params.id, RE.id)) return bad(res);
  const patientId = Number(req.params.id);

  if (!canAccessPatient(req.user, patientId)) {
    audit('access_denied', req, { resource: 'record', patientId });
    return reject(res, 403, 'SEC-403', 'Acceso denegado');
  }
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return reject(res, 404, 'SEC-404', 'Recurso no encontrado');

  audit('record_read', req, { patientId });
  res.json({
    id: patient.id, name: patient.name, ssn: maskSsn(patient.ssn), bloodType: patient.bloodType,
    allergies: patient.allergies, fullHistory: patient.history,
  });
});

// Antes listaba a TODOS los pacientes a cualquier usuario autenticado.
router.get('/patients', authenticate, (req, res) => {
  if (req.user.role !== 'doctor') return reject(res, 403, 'SEC-403', 'Acceso denegado');
  res.json(patients.filter((p) => req.user.patients.includes(p.id)).map((p) => ({ id: p.id, name: p.name })));
});

module.exports = router;
