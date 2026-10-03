const express = require('express');
const { prescriptions } = require('../database');
const { authenticate } = require('../middleware');

const router = express.Router();

// A02: Prescriptions are returned with their digital signature in plain text.
// The API runs over HTTP (not HTTPS), so the signature and all prescription
// data travel in clear text over the network.
router.get('/prescription/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const prescription = prescriptions.find((p) => p.id === id);

  if (!prescription) {
    return res.status(404).json({ error: 'Receta no encontrada' });
  }

  res.json({
    ...prescription,
    // Signature transmitted in clear text — no encryption applied
    digitalSignature: prescription.signature,
    transportNote: 'Transmitido por HTTP sin cifrado',
  });
});

// A09: Modifying a prescription generates NO audit log.
// There is no forensic record of who changed what or when.
router.put('/prescription/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const prescription = prescriptions.find((p) => p.id === id);

  if (!prescription) {
    return res.status(404).json({ error: 'Receta no encontrada' });
  }

  const { medication, dosage, duration } = req.body;

  // Modifies the prescription with NO audit trail
  // No logging of: who modified it, what was changed, when, or original values
  if (medication) prescription.medication = medication;
  if (dosage) prescription.dosage = dosage;
  if (duration) prescription.duration = duration;

  // Only adds to an internal array — not a real audit log
  // No timestamp, no user ID, no before/after values, no tamper-proofing
  prescription.modifiedBy.push(req.user.username);

  res.json({
    message: 'Receta modificada (sin registro de auditoria)',
    prescription,
  });
});

module.exports = router;
