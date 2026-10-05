ASR: Requisitos de Seguridad de la Aplicación (Application Security Requirements)
Proyecto: MediCare Core, Grupo 2 | Norma: ISO/IEC 27034 | Versión: 1.0 | Fecha: 05.OCT.2026
1. Propósito
Este documento establece los Requisitos de Seguridad de la Aplicación (ASR) para MediCare Core (Fase 2). Traduce los Controles de Seguridad de la Aplicación (ASC) seleccionados en especificaciones técnicas concretas que el equipo de desarrollo debe implementar en el código. Este documento sirve como criterio de aceptación binario (cumple o no cumple) para las pruebas de seguridad.   
PDF
2. Requisitos Técnicos de Seguridad (ASR)
Los siguientes requisitos deben ser implementados de forma obligatoria en la rama segura (src/seguro/):
ASR-01: Control de Acceso Estricto (Mitiga A01)
Regla ONF: ONF-01
Requisito Técnico: Todas las rutas de la API, excepto /login y /recover-password, deben estar protegidas por el middleware authenticate.
Requisito Técnico: En el endpoint GET /api/record/:id, el servidor debe validar mediante la función canAccessPatient() que el id solicitado coincida con los permisos del usuario autenticado (el paciente solo ve su ficha; el doctor solo ve a sus pacientes asignados).
Requisito Técnico: Cualquier intento de acceso no autorizado debe registrarse en la auditoría y devolver un código HTTP 403 Forbidden.
ASR-02: Cifrado en Tránsito (Mitiga A02)
Regla ONF: ONF-02
Requisito Técnico: El servidor debe operar exclusivamente bajo el protocolo HTTPS (https.createServer()) utilizando TLS 1.2 o superior, en el puerto 3443.
Requisito Técnico: Todas las peticiones HTTP recibidas en el puerto 3000 deben ser redirigidas automáticamente (301 Moved Permanently) al puerto 3443.
Requisito Técnico: Se debe incluir la cabecera Strict-Transport-Security (HSTS) en las respuestas seguras.
ASR-03: Zero Trust Input y Sanitización (Mitiga A03)
Regla ONF: ONF-04, ONF-05
Requisito Técnico: El servidor de Express debe configurarse con app.set('query parser', 'simple') para prevenir la interpretación de parámetros de consulta como objetos complejos (mitigación de inyecciones NoSQL como [$ne]).
Requisito Técnico: Todas las entradas de usuario (body, params, query) deben validarse utilizando un enfoque de "Lista Blanca" mediante expresiones regulares (Regex) definidas en src/validate.js.
Requisito Técnico: Las solicitudes con parámetros no esperados deben ser rechazadas.
ASR-04: Privacidad desde el Diseño (Mitiga A04)
Regla ONF: ONF-06
Requisito Técnico: El servidor no debe utilizar express.static para servir carpetas con información de pacientes (public/patients).
Requisito Técnico: Datos sensibles, como el número de seguro social (SSN) o RUT, deben enmascararse en las respuestas de la API (ej. ***-**).
ASR-05: Manejo Seguro de Errores y Cabeceras (Mitiga A05)
Regla ONF: ONF-07
Requisito Técnico: Se debe utilizar el middleware securityHeaders para inyectar cabeceras de seguridad HTTP esenciales (CSP, X-Content-Type-Options, X-Frame-Options).
Requisito Técnico: La cabecera X-Powered-By debe ser desactivada explícitamente (app.disable('x-powered-by')).
Requisito Técnico: Los errores internos (HTTP 500) no deben exponer detalles técnicos ni stack traces al usuario final. Se debe devolver un mensaje de error genérico.
ASR-06: Gestión de Dependencias (Mitiga A06)
Regla ONF: ONF-08
Requisito Técnico: El proyecto no debe contener vulnerabilidades críticas o altas reportadas por npm audit.
Requisito Técnico: El paquete obsoleto cryptiles debe ser eliminado. Las comparaciones criptográficas deben realizarse utilizando crypto.timingSafeEqual() nativo de Node.js.
ASR-07: Resiliencia de Autenticación (Mitiga A07)
Regla ONF: ONF-09
Requisito Técnico: Se debe implementar un mecanismo de limitación de tasa (rate limiting) en los endpoints de /login y /recover-password.
Requisito Técnico: La validación de contraseñas debe realizarse en un tiempo constante, independientemente de si el usuario existe o no, para prevenir la enumeración de usuarios (ataques de timing).
Requisito Técnico: Las contraseñas deben almacenarse y verificarse utilizando un hash criptográfico con sal, nunca en texto plano.
ASR-08: Validación en la Carga de Archivos (Mitiga A08)
Regla ONF: ONF-10
Requisito Técnico: La carga de archivos debe restringirse a tipos MIME específicos y extensiones permitidas (Lista Blanca: .pdf, .png, .jpg, .jpeg).
Requisito Técnico: El servidor debe verificar los "números mágicos" (Magic Numbers, los primeros bytes del archivo) para asegurar que el contenido real coincide con la extensión declarada, rechazando archivos ejecutables (.exe) encubiertos.
Requisito Técnico: Los archivos cargados deben almacenarse fuera del directorio público (storage/exams/), con nombres generados aleatoriamente (UUID) y sin permisos de ejecución.
ASR-09: Trazabilidad Forense (Mitiga A09)
Regla ONF: ONF-11
Requisito Técnico: Todas las modificaciones a registros críticos (como PUT /api/prescription/:id) deben registrarse obligatoriamente utilizando la función audit() en logs/audit.log.
Requisito Técnico: El registro de auditoría debe incluir la marca de tiempo, dirección IP, usuario responsable y el detalle de los valores antes y después de la modificación (before, after).
ASR-10: Prevención de SSRF (Mitiga A10)
Regla ONF: ONF-12
Requisito Técnico: El endpoint GET /api/fetch-external-record debe validar las URLs de destino contra una lista blanca de dominios permitidos (ALLOWED_HOSTS).
Requisito Técnico: El servidor debe resolver el DNS del destino y rechazar la conexión si la dirección IP pertenece a rangos privados, de loopback (ej. 127.0.0.1) o enlace local (isPrivateIp()).
