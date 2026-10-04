const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware');

const router = express.Router();

// A08: File upload with NO content validation.
// Accepts ANY file type including executables (.exe, .bat, .sh, .php).
// No MIME type check, no file extension whitelist, no size limit enforcement.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    // Keeps the original filename — no sanitization
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  // No file filter — all file types accepted
  // No size limit specified (uses multer default of infinity)
});

// Upload medical exam files
router.post('/upload-exam', authenticate, upload.single('examFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporciono ningun archivo' });
  }

  // No validation of file content, type, or extension
  res.json({
    message: 'Archivo subido exitosamente',
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `/uploads/${req.file.originalname}`,
    warning: 'No se realizo validacion de tipo de archivo',
  });
});

module.exports = router;
