# MediCare Core - Prototipo DevSecOps (Grupo 2)

Proyecto académico de la asignatura Desarrollo Seguro. Este repositorio contiene el proceso de refactorización de una API médica vulnerable, aplicando controles de seguridad para mitigar el OWASP Top 10.

## 1. Integrantes, Roles y Cronograma (RRHH)

| Alumno | Rol Asignado | Actividades Principales | Horas Invertidas |
|---|---|---|---|
| **Hans Fagerstrom** | Desarrollador DevSecOps | Refactorización de código seguro (src/seguro), Listas Blancas (Regex), implementación HTTPS/TLS y mitigación global de vulnerabilidades. | 12 hrs |
| **[Nombre Compañero 1]** | Pentester / Auditor | Ejecución de script de auditoría automatizada (`auditoria.sh`), recolección de evidencias (.txt y logs), y redacción de reporte forense de Fase 2. | 8 hrs |
| **[Nombre Compañero 2]** | Gestor de Riesgos | Investigación de normativa chilena, elaboración del ONF Corporativo, diseño del Manifiesto Ético y estructuración del repositorio Docs-as-Code. | 8 hrs |

## 2. Instrucciones de Ejecución

Para iniciar el entorno seguro blindado:
1. Navegar al directorio seguro: `cd src/seguro`
2. Instalar dependencias: `npm install`
3. Levantar el servidor: `node index.js` (Correrá en `https://localhost:3443`)

Para ejecutar la auditoría automatizada:
1. En una nueva terminal, ir a la carpeta de auditoría: `cd auditoria`
2. Ejecutar el robot: `./auditoria.sh fase2 localhost 3000 3443`

## 3. Contrato de API (Endpoints Vulnerables de la Fase 1)
Puerto base original: `http://localhost:3000`

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