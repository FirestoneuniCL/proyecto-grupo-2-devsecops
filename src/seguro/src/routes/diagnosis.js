const express = require('express');
const { queryDiagnoses } = require('../database');
const { authenticate } = require('../middleware');

const router = express.Router();

router.get('/search', authenticate, (req, res) => {
  const diagnosis = typeof req.query.diagnosis === 'string' ? req.query.diagnosis.trim() : undefined;
  const severity = typeof req.query.severity === 'string' ? req.query.severity.trim().toLowerCase() : undefined;
  if (diagnosis === undefined && severity === undefined) return res.status(400).json({ error: 'Proporcione un criterio valido de busqueda' });
  if (diagnosis !== undefined && (diagnosis.length === 0 || diagnosis.length > 100)) return res.status(400).json({ error: 'Criterio de diagnostico invalido' });
  if (severity !== undefined && !['leve', 'moderada', 'grave'].includes(severity)) return res.status(400).json({ error: 'Severidad invalida' });
  const results = queryDiagnoses({ diagnosis, severity }).map(({ id, patientId, diagnosis: value, date, severity: level }) => ({ id, patientId, diagnosis: value, date, severity: level }));
  res.json({ count: results.length, results });
});

module.exports = router;
