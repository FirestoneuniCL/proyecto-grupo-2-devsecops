# Bitácora de Justificación de Arquitectura de Seguridad (ASC-Seleccion)
**Proyecto:** MediCare Core - Grupo 2
**Asignatura:** DevSecOps

Esta bitácora documenta las decisiones de diseño seguro (Arquitectura de Seguridad y Controles - ASC) implementadas para mitigar las vulnerabilidades identificadas en la Fase 1, alineadas al estándar OWASP Top 10.

---

### 1. Control de Acceso (A01 - Broken Access Control)
*   **Vulnerabilidad Original:** La API permitía a cualquier usuario autenticado consultar expedientes médicos de otros pacientes alterando el ID en la URL (`/api/record/1`).
*   **Mitigación Implementada:** Se implementó una verificación estricta de propiedad en el backend. Ahora, el sistema valida que el ID solicitado coincida exactamente con el `patientId` asociado al token del usuario (`req.user.patientId !== parseInt(idSolicitado)`).
*   **Justificación DevSecOps:** Se aplicó el principio de "Privilegio Mínimo". No basta con estar autenticado; el usuario debe tener autorización explícita sobre el recurso específico solicitado.

### 2. Cifrado y Protección de Datos en Tránsito (A02 - Cryptographic Failures)
*   **Vulnerabilidad Original:** El servidor operaba exclusivamente por HTTP (puerto 3000), exponiendo recetas y datos de pacientes a intercepciones en texto claro.
*   **Mitigación Implementada:** Se generaron certificados SSL autofirmados y se configuró el módulo nativo `https` de Node.js para forzar todo el tráfico a través del puerto seguro 3443.
*   **Justificación DevSecOps:** Garantiza la confidencialidad de los datos médicos en tránsito, cumpliendo con los estándares básicos de protección de Información Personal de Salud (PHI).

### 3. Validación de Entrada (A03 - Injection & A08 - Software and Data Integrity Failures)
*   **Vulnerabilidad Original:** 
    *   (A03) La búsqueda de diagnósticos aceptaba comandos NoSQL (ej. `$ne`).
    *   (A08) El endpoint de subida de exámenes permitía cualquier formato, incluyendo ejecutables maliciosos (`.exe`).
*   **Mitigación Implementada:** Se implementó el principio de **Zero Trust Input** mediante "Listas Blancas" (Regex).
    *   En `/search`, se forzó el formato alfanumérico estricto (`/^[a-zA-Z0-9\s]{3,50}$/`).
    *   En Multer (subida de archivos), se restringió la extensión exclusivamente a formatos seguros (`/\.(pdf|jpg|jpeg|png)$/i`).
*   **Justificación DevSecOps:** Es una mala práctica intentar bloquear "lo malo" (Listas Negras), ya que los atacantes siempre encuentran nuevas formas de evadir filtros. La Lista Blanca asegura que solo lo explícitamente conocido y seguro sea procesado.

### 4. Resiliencia y Manejo de Errores (A05 - Security Misconfiguration)
*   **Vulnerabilidad Original:** El servidor exponía su Stack Trace completo (rutas de carpetas internas) ante peticiones malformadas y carecía de cabeceras de seguridad.
*   **Mitigación Implementada:** 
    *   Se integró la librería `helmet` para inyectar cabeceras de seguridad HTTP automáticamente.
    *   Se reemplazó el `errorHandler` por un interceptor global opaco que devuelve un código de error corporativo (`SEC-400`), ocultando los detalles técnicos.
*   **Justificación DevSecOps:** Ocultar la infraestructura interna previene la fase de "Reconocimiento" de un ataque. El atacante recibe una respuesta controlada y genérica, sin obtener pistas sobre la tecnología subyacente.

### 5. Trazabilidad Forense (A09 - Security Logging and Monitoring Failures)
*   **Vulnerabilidad Original:** Las modificaciones críticas (como alterar la dosis de una receta) ocurrían silenciosamente, sin dejar registro.
*   **Mitigación Implementada:** Se programó un módulo de bitácora local (`fs.appendFileSync`) que registra obligatoriamente el `timestamp`, la `IP` origen, el usuario y el detalle exacto de la modificación.
*   **Justificación DevSecOps:** La seguridad no solo es prevenir, sino también responder. Un registro inmutable permite reconstruir la línea de tiempo de un incidente, identificar cuentas comprometidas y cumplir con las normativas de auditoría médica.