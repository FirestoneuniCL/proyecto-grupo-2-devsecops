const express = require('express');
const { patients } = require('../database');
const { authenticate, canAccessPatient } = require('../middleware');

const router = express.Router();

router.get('/record/:id', authenticate, (req, res) => {
  const patientId = Number(req.params.id);
  if (!Number.isInteger(patientId) || !canAccessPatient(req.user, patientId)) return res.status(403).json({ error: 'No autorizado' });
  const patient = patients.find((candidate) => candidate.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
  res.json({ id: patient.id, name: patient.name, bloodType: patient.bloodType, allergies: patient.allergies, fullHistory: patient.history });
});

router.get('/patients', authenticate, (req, res) => {
  const visible = req.user.role === 'doctor' ? patients : patients.filter((patient) => patient.id === req.user.patientId);
  res.json(visible.map(({ id, name }) => ({ id, name })));
});

module.exports = router;
