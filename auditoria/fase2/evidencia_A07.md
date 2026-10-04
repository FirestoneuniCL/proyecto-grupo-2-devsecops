# Evidencia evidencia_A07

```text
# Evidencia A07 - Recuperación de contraseña sin límite de intentos
# Fecha: 2026-10-04 15:56:40   Fase: fase2   Objetivo: localhost
# Comando: curl -i -s -X POST https://localhost:3443/api/recover-password (5 intentos con lista de respuestas)
# Esperado: Bloqueo temporal HTTP 429 tras pocos intentos; nunca llega a acertar
# (newPassword = la misma contraseña original, para no alterar el laboratorio)
# ----------------------------------------------------------
>>> intento con respuesta 'rex'
HTTP/1.1 401 Unauthorized
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 62
ETag: W/"3e-h476purmzPOEhIkXpqyUXKPXwRs"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Datos de recuperacion invalidos","codigo":"SEC-401"}

>>> intento con respuesta 'max'
HTTP/1.1 401 Unauthorized
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 62
ETag: W/"3e-h476purmzPOEhIkXpqyUXKPXwRs"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Datos de recuperacion invalidos","codigo":"SEC-401"}

>>> intento con respuesta 'toby'
HTTP/1.1 401 Unauthorized
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 62
ETag: W/"3e-h476purmzPOEhIkXpqyUXKPXwRs"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Datos de recuperacion invalidos","codigo":"SEC-401"}

>>> intento con respuesta 'luna'
HTTP/1.1 429 Too Many Requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Retry-After: 900
Content-Type: application/json; charset=utf-8
Content-Length: 70
ETag: W/"46-QWP58UMzIvKnrHo9iTMmFUM/FPs"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Demasiados intentos. Intente mas tarde.","codigo":"SEC-429"}

>>> intento con respuesta 'firulais'
HTTP/1.1 429 Too Many Requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Retry-After: 900
Content-Type: application/json; charset=utf-8
Content-Length: 70
ETag: W/"46-QWP58UMzIvKnrHo9iTMmFUM/FPs"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Demasiados intentos. Intente mas tarde.","codigo":"SEC-429"}

```
