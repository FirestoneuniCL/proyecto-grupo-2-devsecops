## Contrato de API (Endpoints de Prueba)
Puerto base: `http://localhost:3000`

| Riesgo | Archivo Responsable | Endpoint Vulnerable |
|---|---|---|
| **A01** | `records.js` | `GET /api/records/:id` (Ve fichas sin validar usuario) |
| **A02** | `prescriptions.js` | `POST /api/prescriptions` (Viaja por HTTP) |
| **A03** | `diagnosis.js` | `POST /api/diagnosis/search` (Inyección NoSQL) |
| **A04** | `public/patients/` | `GET /patients/juan-perez.json` (Carpeta pública) |
| **A05** | `middleware.js` | `GET /api/error` (Expone Stack Trace del SO) |
| **A06** | `package.json` | Dependencias obsoletas (ej. multer, cryptiles) |
| **A07** | `auth.js` | `POST /api/auth/login` (Sin límite de intentos) |
| **A08** | `files.js` | `POST /api/files/upload` (Permite subir `.exe`) |
| **A09** | `prescriptions.js` | `PUT /api/prescriptions/:id` (No registra logs) |
| **A10** | `external.js` | `GET /api/external?url=` (SSRF hacia red interna) |