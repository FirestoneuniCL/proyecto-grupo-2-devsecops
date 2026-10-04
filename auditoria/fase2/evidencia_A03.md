# Evidencia evidencia_A03

```text
# Evidencia A03 - Inyección NoSQL ($ne)
# Fecha: 2026-10-04 15:56:39   Fase: fase2   Objetivo: localhost
# Comando: curl -i -s -k 'https://localhost:3443/api/diagnosis/search?diagnosis[$ne]=null' -H 'Authorization: <TOKEN_DOCTOR>'
# Esperado: HTTP 400: operadores $ no permitidos
# ----------------------------------------------------------
HTTP/1.1 400 Bad Request
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
Cache-Control: no-store
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
Content-Length: 61
ETag: W/"3d-+EnBilpz+TvOcF53LhKX9NRGTho"
Date: Sun, 04 Oct 2026 18:56:39 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Parametro de busqueda invalido","codigo":"SEC-400"}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
