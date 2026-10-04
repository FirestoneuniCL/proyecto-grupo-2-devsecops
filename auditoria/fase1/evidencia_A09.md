# Evidencia evidencia_A09

```text
# Evidencia A09 - Modificación de receta sin auditoría
# Fecha: 2026-10-04 03:40:21   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s -X PUT http://localhost:3000/api/prescription/1 -H 'Authorization: <TOKEN_DOCTOR>' -H 'Content-Type: application/json' -d '{"dosage":"DOSIS-MODIFICADA-PARA-AUDITORIA"}'
# Esperado: HTTP 200: receta modificada, sin registro de auditoría real
# ----------------------------------------------------------
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 313
ETag: W/"139-lSFByJGXlUZL5UoLOJb+MTCF6O8"
Date: Sun, 04 Oct 2026 06:40:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Receta modificada (sin registro de auditoria)","prescription":{"id":1,"patientId":1,"doctorId":1,"medication":"Losartan 50mg","dosage":"DOSIS-MODIFICADA-PARA-AUDITORIA","duration":"30 dias","date":"2024-01-15","signed":true,"signature":"FAKE_SIGNATURE_NOT_ENCRYPTED","modifiedBy":["doctor_martinez"]}}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
