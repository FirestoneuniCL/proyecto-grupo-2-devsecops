const express = require('express');
const { patients } = require('../database');
const { authenticate } = require('../middleware');

const router = express.Router();

// A01: Broken Access Control — any authenticated user (doctor or patient)
// can view ANY patient's full medical record by simply changing the ID.
// No ownership check, no role-based authorization.
router.get('/record/:id', authenticate, (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Paciente no encontrado' });
  }

  // Returns the entire record including SSN with no authorization check
  res.json({
    id: patient.id,
    name: patient.name,
    ssn: patient.ssn,
    bloodType: patient.bloodType,
    allergies: patient.allergies,
    fullHistory: patient.history,
  });
});

// List all patients (also no access control — exposes all patient names and IDs)
router.get('/patients', authenticate, (req, res) => {
  res.json(patients.map((p) => ({ id: p.id, name: p.name })));
});

module.exports = router;
