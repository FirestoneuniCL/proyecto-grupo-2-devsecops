# Evidencia evidencia_A08

```text
# Evidencia A08 - Subida de archivo ejecutable
# Fecha: 2026-10-04 15:56:40   Fase: fase2   Objetivo: localhost
# Comando: curl -i -s -k -X POST https://localhost:3443/api/upload-exam -H 'Authorization: <TOKEN_DOCTOR>' -F examFile=@/var/folders/2j/73m04jnn7m1f73h9n0zlsxmc0000gn/T/tmp.hQBsgihVL3/examen_malicioso.exe
# Esperado: HTTP 400/415: tipo de archivo no permitido
# ----------------------------------------------------------
HTTP/1.1 415 Unsupported Media Type
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-oB57ZpfxQNdkOsyvajZxft2Ukfw"
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Tipo de archivo no permitido","codigo":"SEC-415"}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

# Evidencia A08 - Descarga del archivo subido
# Fecha: 2026-10-04 15:56:40   Fase: fase2   Objetivo: localhost
# Comando: curl -i -s -k https://localhost:3443/uploads/examen_malicioso.exe
# Esperado: HTTP 404: el archivo nunca se guardó
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
Date: Sun, 04 Oct 2026 18:56:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Recurso no encontrado","codigo":"SEC-404"}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
