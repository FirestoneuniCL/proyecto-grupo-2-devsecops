const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authenticate } = require('../middleware');
const { reject, bad } = require('../validate');
const { audit } = require('../audit');

const router = express.Router();

// A08 + A04: los examenes se guardan FUERA de "public" (no se sirven por web), con nombre
// aleatorio (no el del usuario) y sin permiso de ejecucion.
const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'exams');
fs.mkdirSync(STORAGE_DIR, { recursive: true });

// LISTA BLANCA de tipos: extension + MIME + "firma" real (primeros bytes) del archivo.
// Un .exe renombrado a .pdf se rechaza porque sus primeros bytes no son "%PDF-".
const ALLOWED = {
  '.pdf': { mime: 'application/pdf', magic: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  '.png': { mime: 'image/png', magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  '.jpg': { mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
  '.jpeg': { mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff] },
};
const startsWith = (buf, magic) => magic.every((byte, i) => buf[i] === byte);

const upload = multer({
  storage: multer.memoryStorage(),          // se valida ANTES de escribir nada a disco
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 5 },
});

router.post('/upload-exam', authenticate, upload.single('examFile'), (req, res) => {
  if (!req.file) return bad(res, 'Archivo requerido');
  const ext = path.extname(req.file.originalname).toLowerCase();
  const rule = Object.prototype.hasOwnProperty.call(ALLOWED, ext) ? ALLOWED[ext] : null;

  if (!rule || req.file.mimetype !== rule.mime || !startsWith(req.file.buffer, rule.magic)) {
    audit('upload_rejected', req, { ext, mimetype: req.file.mimetype, size: req.file.size });
    return reject(res, 415, 'SEC-415', 'Tipo de archivo no permitido');
  }
  const fileId = crypto.randomUUID();
  fs.writeFileSync(path.join(STORAGE_DIR, fileId + ext), req.file.buffer, { mode: 0o640 });
  const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex'); // integridad
  audit('upload_ok', req, { fileId, size: req.file.size, sha256 });
  res.status(201).json({ message: 'Archivo recibido', fileId, size: req.file.size, sha256 });
});

module.exports = router;
