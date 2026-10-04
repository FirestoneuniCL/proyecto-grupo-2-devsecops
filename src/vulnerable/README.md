
## Contexto

Aplicacion backend para que medicos y pacientes consulten recetas e historiales clinicos.

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

### A02 - Cryptographic Failures (Fallos Criptograficos)

Las recetas medicas digitales se firman y transmiten por HTTP sin cifrado. Las firmas digitales viajan en texto claro.

### A03 - Injection (Inyeccion NoSQL)

La busqueda de diagnosticos es vulnerable a inyeccion NoSQL mediante operadores `$ne`, `$regex`, etc.

### A04 - Insecure Design (Diseno Inseguro)

Los datos de pacientes se guardan en carpetas publicas accesibles via web sin autenticacion.

### A05 - Security Misconfiguration (Configuracion de Seguridad Insegura)

1. Cabeceras HTTP de seguridad ausentes.
2. Mensajes de error con stack traces.
3. Fuga de informacion del SO.

### A06 - Vulnerable and Outdated Components (Componentes Vulnerables y Desactualizados)

Dependencia del paquete NPM `cryptiles` (version 3.1.2), con vulnerabilidades conocidas (3 vulnerabilidades altas segun `npm audit`, en `cryptiles` y sus dependencias `boom` y `hoek`).

### A07 - Identification and Authentication Failures (Fallos de Identificacion y Autenticacion)

Recuperacion de contrasena mediante preguntas de seguridad triviales ("nombre de tu mascota") sin limite de intentos (fuerza bruta).

### A08 - Software and Data Integrity Failures (Fallos de Integridad de Software y Datos)

Carga de archivos de examenes medicos sin validacion de contenido. Se pueden subir archivos ejecutables.

### A09 - Security Logging and Monitoring Failures (Fallos de Registro y Monitoreo)

Las modificaciones de recetas por usuarios no generan registros de auditoria forense. No hay log de quien cambio que, ni cuando, ni los valores originales.

### A10 - Server-Side Request Forgery (SSRF)

La funcionalidad de descarga de historias clinicas externas permite al cliente proporcionar URLs arbitrarias que el servidor consulta.
