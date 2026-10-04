# Evidencia evidencia_A04

```text
# Evidencia A04 - Datos de pacientes en carpeta pública
# Fecha: 2026-10-04 15:56:39   Fase: fase2   Objetivo: localhost
# Comando: curl -i -s -k https://localhost:3443/patients/juan-perez.json
# Esperado: HTTP 404/401: ya no es accesible públicamente
# ----------------------------------------------------------
HTTP/1.1 404 Not Found
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 52
ETag: W/"34-QljBk0wIY0iZsYVIoQW+V70YM/I"
Date: Sun, 04 Oct 2026 18:56:39 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Recurso no encontrado","codigo":"SEC-404"}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
