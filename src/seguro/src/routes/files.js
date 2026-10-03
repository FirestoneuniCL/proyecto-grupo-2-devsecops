const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware');

const router = express.Router();
const privateUploadDirectory = path.join(__dirname, '../../private/uploads');
fs.mkdirSync(privateUploadDirectory, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

function allowedFile(buffer, mimetype) {
  if (mimetype === 'application/pdf') return buffer.subarray(0, 4).toString() === '%PDF';
  if (mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === 'image/jpeg') return buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  return false;
}

router.post('/upload-exam', authenticate, upload.single('examFile'), (req, res) => {
  if (!req.file || !allowedFile(req.file.buffer, req.file.mimetype)) return res.status(400).json({ error: 'Tipo o contenido de archivo no permitido' });
  const storedName = `${req.user.id}-${crypto.randomUUID()}`;
  fs.writeFileSync(path.join(privateUploadDirectory, storedName), req.file.buffer, { flag: 'wx', mode: 0o600 });
  res.status(201).json({ message: 'Archivo recibido de forma segura', fileId: storedName });
});

module.exports = router;
