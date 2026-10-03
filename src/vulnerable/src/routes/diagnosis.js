const express = require('express');
const { queryDiagnoses } = require('../database');
const { authenticate } = require('../middleware');

const router = express.Router();

// A03: NoSQL Injection — the diagnosis search endpoint accepts arbitrary
// query parameters and passes MongoDB-style operators ($ne, $gt, $regex, etc.)
// directly to the query engine without sanitization.
//
// Example attack: GET /api/diagnosis/search?diagnosis[$ne]=null
//   Returns ALL diagnoses because $ne !== null matches everything.
//
// Example: GET /api/diagnosis/search?diagnosis[$regex]=.*
//   Returns all diagnoses via regex injection.
router.get('/search', authenticate, (req, res) => {
  // User-supplied query params are passed directly to the query function.
  // Express parses "diagnosis[$ne]=null" into { diagnosis: { '$ne': 'null' } }
  const query = req.query;

  if (Object.keys(query).length === 0) {
    return res.status(400).json({ error: 'Proporcione al menos un criterio de busqueda' });
  }

  const results = queryDiagnoses(query);
  res.json({ count: results.length, results });
});

module.exports = router;
