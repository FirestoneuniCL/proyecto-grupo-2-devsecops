# ASC: Controles de Seguridad de la Aplicación (Application Security Controls)

**Proyecto:** MediCare Core, Grupo 2 | **Norma:** ISO/IEC 27034 | **Versión:** 2.0 | **Fecha:** 04.OCT.2026
**Nivel de criticidad de la aplicación:** ALTO (maneja fichas clínicas y recetas, datos de salud)

---

## 1. Propósito y relación con el ONF

Según ISO/IEC 27034, el **ONF** (`ONF-Corporativo.md`) contiene todas las reglas de la organización. Este documento, el **ASC**, selecciona las que aplican a MediCare Core según su nivel de riesgo, y las vincula con el **código que las implementa (ASR)** y con la **evidencia** que demuestra que funcionan.

```
ONF (regla) → ASC (control elegido) → ASR (archivo de código) → Evidencia (auditoria/fase1 y fase2)
```

## 2. Resumen de controles seleccionados

| ASC | Control | Reglas ONF | Riesgo OWASP | Implementación (`src/seguro/`) |
|---|---|---|---|---|
| ASC-01 | Zero Trust Input: listas blancas y Regex | ONF-04, 05 | A03, A08 | `src/validate.js` y todas las rutas |
| ASC-02 | Autenticación, sesiones y límite de intentos | ONF-09 | A07 | `src/middleware.js`, `src/routes/auth.js` |
| ASC-03 | Autorización por paciente y por rol | ONF-01 | A01 | `src/database.js`, `src/routes/records.js`, `prescriptions.js` |
| ASC-04 | Cifrado en tránsito y firma de recetas | ONF-02 | A02 | `index.js`, `src/database.js` |
| ASC-05 | Protección de credenciales (hash con sal) | ONF-03 | A02, A07 | `src/database.js` |
| ASC-06 | Privacidad desde el diseño | ONF-06 | A04 | `index.js`, `src/routes/files.js`, `records.js` |
| ASC-07 | Configuración segura y manejo de errores | ONF-07 | A05 | `src/middleware.js`, `index.js` |
| ASC-08 | Gestión de dependencias | ONF-08 | A06 | `package.json`, `npm audit` |
| ASC-09 | Carga segura de archivos | ONF-10 | A08 | `src/routes/files.js` |
| ASC-10 | Auditoría y trazabilidad | ONF-11 | A09 | `src/audit.js`, `prescriptions.js` |
| ASC-11 | Prevención de SSRF | ONF-12 | A10 | `src/routes/external.js` |

## 3. Detalle por riesgo

### A01: Control de acceso roto (ASC-03)
- **Vulnerabilidad original:** `GET /api/record/:id` entregaba la ficha de cualquier paciente a cualquier usuario autenticado.
- **Mitigación:** la función `canAccessPatient(user, patientId)` se aplica en el servidor en cada recurso. Un **paciente** solo ve su propia ficha. Un **doctor** solo ve a los pacientes que tiene asignados. Una receta solo puede ser modificada por el doctor que la emitió. Los intentos denegados responden **403** y quedan en el log de auditoría.
- **Justificación:** principio de mínimo privilegio; estar autenticado no basta, se necesita autorización sobre el recurso específico.
- **Evidencia:** `evidencia_A01.txt`. Fase 1: 200 (ficha ajena). Fase 2: **403**.

### A02: Fallos criptográficos (ASC-04, ASC-05)
- **Vulnerabilidad original:** el servidor operaba solo por HTTP; la receta viajaba con su firma en texto claro; las contraseñas estaban en texto plano.
- **Mitigación:** servidor HTTPS con TLS 1.2 o superior (certificado autofirmado de laboratorio, generado con `npm run gen-cert` y **no versionado**). El puerto 3000 ya no entrega datos: responde **301** hacia HTTPS. Se envía la cabecera HSTS. La firma de las recetas es un **HMAC-SHA256** real, que se recalcula al modificar la receta. Las contraseñas y respuestas de recuperación se guardan con **scrypt + sal** (módulo nativo `crypto`).
- **Evidencia:** `evidencia_A02.txt`. Fase 1: 200 por HTTP, sin TLS. Fase 2: **301** por HTTP y **200** por HTTPS.

### A03: Inyección (ASC-01)
- **Vulnerabilidad original:** `GET /api/diagnosis/search?diagnosis[$ne]=null` devolvía los 5 diagnósticos, porque el operador `$ne` llegaba a la consulta.
- **Mitigación en capas:** (1) `query parser = simple`, así `diagnosis[$ne]` no se convierte en objeto; (2) solo se acepta el parámetro `diagnosis` (lista blanca de campos); (3) debe ser un **string** que cumpla la Regex `^[\p{L}0-9 ]{3,50}$` (admite tildes, rechaza `$ { } < > ;`); (4) la búsqueda es una comparación de texto, sin operadores. Además, cada usuario solo busca entre sus pacientes.
- **Evidencia:** `evidencia_A03.txt`. Fase 1: 200 con todos los diagnósticos. Fase 2: **400**.

### A04: Diseño inseguro (ASC-06)
- **Vulnerabilidad original:** los expedientes estaban en `public/patients/` y se descargaban sin login.
- **Mitigación:** se eliminó `express.static`; ninguna carpeta se sirve por web. Los datos viven detrás de rutas autenticadas, se aplica minimización (el SSN se enmascara) y los exámenes subidos se guardan en `storage/`, fuera de cualquier ruta pública.
- **Evidencia:** `evidencia_A04.txt`. Fase 1: 200. Fase 2: **404**.

### A05: Errores de configuración (ASC-07)
- **Vulnerabilidad original:** la raíz `/` mostraba SO, versión de Node, hostname y memoria; un JSON mal formado devolvía un stack trace con rutas internas (500); no había cabeceras de seguridad.
- **Mitigación:** cabeceras de seguridad (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS, `Referrer-Policy`, `Cache-Control: no-store`); se desactiva `X-Powered-By`; la raíz responde solo `status: ok`; un manejador global devuelve mensajes genéricos con código corporativo (`SEC-400`, `SEC-404`, `SEC-500`) y deja el detalle solo en la consola del servidor.
- **Evidencia:** `evidencia_A05.txt`. Fase 1: 200 con datos del SO y 500 con stack. Fase 2: respuesta mínima y **400** genérico.

### A06: Componentes vulnerables (ASC-08)
- **Vulnerabilidad original:** el paquete `cryptiles` arrastraba `boom` y `hoek` (3 vulnerabilidades altas).
- **Mitigación:** se eliminó `cryptiles`; la comparación en tiempo constante se hace con `crypto.timingSafeEqual` nativo. Se actualizó `multer` a la serie 2.x. Cada entrega se verifica con `npm audit`.
- **Evidencia:** `evidencia_A06.txt`. Fase 1: 3 vulnerabilidades altas. Fase 2: **0 vulnerabilidades**.

### A07: Fallos de identificación y autenticación (ASC-02)
- **Vulnerabilidad original:** `POST /api/recover-password` no tenía límite de intentos, revelaba la pregunta y el contador de intentos, y devolvía la nueva contraseña en la respuesta. Los tokens eran predecibles.
- **Mitigación:** tokens de sesión aleatorios (32 bytes) que expiran a los 30 minutos; límite de **3 intentos de recuperación por usuario e IP cada 15 minutos** (luego **429** con `Retry-After`) y 20 intentos de login por IP; mensajes genéricos que no revelan si el usuario existe; verificación en tiempo constante; política de contraseña (10 o más caracteres, letras y números); las sesiones se cierran al cambiar la contraseña; ya no se devuelve la contraseña.
- **Evidencia:** `evidencia_A07.txt`. Fase 1: `401 401 401 401 200` (el quinto intento acierta). Fase 2: `401 401 401 429 429`.

### A08: Fallos de integridad del software y los datos (ASC-09, ASC-01)
- **Vulnerabilidad original:** `POST /api/upload-exam` aceptaba un `.exe`, que quedaba descargable desde `/uploads/`.
- **Mitigación:** lista blanca de tipos (`pdf`, `png`, `jpg`, `jpeg`) verificando **extensión, MIME declarado y los primeros bytes reales** del archivo (un `.exe` renombrado se rechaza); máximo 1 archivo de 2 MB; el archivo se valida en memoria antes de escribirse; se guarda con nombre aleatorio (UUID) en `storage/exams/`, sin permiso de ejecución y sin ser servido por web; se calcula su SHA-256 como huella de integridad.
- **Evidencia:** `evidencia_A08.txt`. Fase 1: 200 y descarga 200. Fase 2: **415** y descarga **404**.

### A09: Fallos de registro y monitoreo (ASC-10)
- **Vulnerabilidad original:** modificar una receta no dejaba ningún registro.
- **Mitigación:** `src/audit.js` escribe una línea JSON por evento en `logs/audit.log` (usuario, acción, fecha, IP, valores **antes y después**). Cada línea incluye el hash de la anterior (**cadena SHA-256**), por lo que editar el archivo rompe la cadena y se detecta. Se registran también logins fallidos, accesos denegados, entradas rechazadas, subidas y bloqueos de SSRF. No se guardan contraseñas ni tokens.
- **Evidencia:** `evidencia_A09.txt` y `evidencia_A09_log.txt` (línea `prescription_modified` con `before` y `after`).

### A10: SSRF (ASC-11)
- **Vulnerabilidad original:** `GET /api/fetch-external-record?url=` consultaba cualquier URL, incluida `127.0.0.1` o los metadatos de AWS.
- **Mitigación:** solo `https`, sin credenciales ni puertos distintos al 443; el host debe estar en una **lista blanca** (`hapi.fhir.org`, configurable con `ALLOWED_HOSTS`); se resuelve el DNS y se rechazan IPs de loopback, redes privadas y link-local (`169.254.x.x`); sin redirecciones, con timeout de 5 s y tamaño máximo de respuesta.
- **Evidencia:** `evidencia_A10.txt`. Fase 1: 200 (consulta `127.0.0.1`). Fase 2: **400**.

## 4. Riesgo residual y limitaciones declaradas

Este es un prototipo de laboratorio. Declaramos lo que **no** cubre:

1. **Cifrado en reposo no implementado.** Los datos viven en memoria y los exámenes en disco sin cifrar. En producción se requiere cifrado de base de datos o de disco (ONF-03).
2. **Recuperación de contraseña por pregunta de seguridad.** Está mitigada (respuesta con hash, límite de intentos, mensajes genéricos), pero sigue siendo un método débil. **Es una desviación de ONF-09**: en producción debe reemplazarse por un token de un solo uso enviado por correo, o por MFA.
3. **Credenciales y datos de semilla ficticios dentro del código.** En producción vendrían de una base de datos y de un gestor de secretos.
4. **Límite de intentos y sesiones en memoria.** Se pierden al reiniciar y no funcionan con varias instancias. En producción se usa un almacén compartido (por ejemplo Redis).
5. **El log encadenado detecta manipulación, pero no es inmutable.** En producción se envía a un sistema centralizado (SIEM) de solo escritura.
6. **Certificado autofirmado.** Solo para laboratorio; en producción se usa una autoridad certificadora.

## 5. Declaración de seguridad (Fase 4 de ISO 27034)

La versión `src/seguro/` se considera apta para el punto de control (*gate*) cuando las 10 evidencias de `auditoria/fase2/` muestran respuestas defensivas, frente a los mismos ataques ejecutados en `auditoria/fase1/` por el mismo script (`auditoria/auditoria.sh`). Resultado de la última ejecución: **10 de 10 riesgos mitigados**, con las limitaciones de la sección 4.
