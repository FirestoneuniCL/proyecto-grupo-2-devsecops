const express = require('express');
const { searchDiagnoses } = require('../database');
const { authenticate } = require('../middleware');
const { RE, isValid, onlyKeys, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();

// A03: MISMA ruta y metodo que la version vulnerable (GET /api/diagnosis/search), para que
// el mismo script de auditoria sirva en ambas fases. Defensas en capas:
//  1) index.js usa "query parser = simple": "diagnosis[$ne]=null" ya no se convierte en objeto
//  2) onlyKeys: solo se acepta el parametro "diagnosis" (lista blanca de campos)
//  3) isValid: debe ser un STRING que cumpla la Regex de lista blanca (sin $ { } etc.)
//  4) la busqueda es una comparacion de texto; ya no existen operadores $ne/$regex
router.get('/search', authenticate, (req, res) => {
  if (!onlyKeys(req.query, ['diagnosis']) || !isValid(req.query.diagnosis, RE.diagnosis)) {
    audit('input_rejected', req, { route: '/api/diagnosis/search' });
    return bad(res, 'Parametro de busqueda invalido');
  }
  const results = searchDiagnoses(req.query.diagnosis, req.user);
  res.json({ count: results.length, results });
});

module.exports = router;
