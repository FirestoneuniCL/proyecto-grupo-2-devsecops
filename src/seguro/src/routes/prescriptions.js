const express = require('express');
const crypto = require('crypto');
const { prescriptions, auditLog } = require('../database');
const { authenticate, canAccessPatient } = require('../middleware');

const router = express.Router();

function signPrescription(prescription) {
  return crypto.createHash('sha256').update(JSON.stringify({ id: prescription.id, patientId: prescription.patientId, medication: prescription.medication, dosage: prescription.dosage, duration: prescription.duration, date: prescription.date })).digest('hex');
}

router.get('/prescription/:id', authenticate, (req, res) => {
  const prescription = prescriptions.find((candidate) => candidate.id === Number(req.params.id));
  if (!prescription) return res.status(404).json({ error: 'Receta no encontrada' });
  if (!canAccessPatient(req.user, prescription.patientId)) return res.status(403).json({ error: 'No autorizado' });
  res.json({ id: prescription.id, patientId: prescription.patientId, medication: prescription.medication, dosage: prescription.dosage, duration: prescription.duration, date: prescription.date, signature: signPrescription(prescription) });
});

router.put('/prescription/:id', authenticate, (req, res) => {
  const prescription = prescriptions.find((candidate) => candidate.id === Number(req.params.id));
  if (!prescription) return res.status(404).json({ error: 'Receta no encontrada' });
  if (req.user.role !== 'doctor' || prescription.doctorId !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
  const updates = {};
  for (const field of ['medication', 'dosage', 'duration']) {
    if (typeof req.body?.[field] === 'string' && req.body[field].length <= 200) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No hay cambios validos' });
  const before = { ...prescription };
  Object.assign(prescription, updates);
  auditLog.push({ event: 'prescription.updated', prescriptionId: prescription.id, actorId: req.user.id, occurredAt: new Date().toISOString(), before, after: { ...prescription } });
  res.json({ message: 'Receta actualizada', prescription: { id: prescription.id, patientId: prescription.patientId, ...updates } });
});

module.exports = router;
