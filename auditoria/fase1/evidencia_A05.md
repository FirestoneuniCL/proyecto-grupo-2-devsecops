# Evidencia evidencia_A05

```text
# Evidencia A05 - Fuga de información (raíz /)
# Fecha: 2026-10-04 03:40:20   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s http://localhost:3000/
# Esperado: HTTP 200 con SO, versión de Node, hostname; cabeceras de seguridad ausentes
# ----------------------------------------------------------
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 278
ETag: W/"116-tu0mhzDI789HrBHq0J/2UIWSzmc"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"app":"API de Recetas e Historiales Clinicos","version":"1.0.0","environment":"development","serverInfo":{"os":"darwin","arch":"arm64","nodeVersion":"v24.21.0","hostname":"MacBook-Pro-de-Hans.local","osRelease":"27.0.0","totalMemory":8589934592,"freeMemory":88457216,"cpus":8}}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

# Evidencia A05 - Stack trace (JSON mal formado)
# Fecha: 2026-10-04 03:40:20   Fase: fase1   Objetivo: localhost
# Comando: curl -i -s -X POST http://localhost:3000/api/login -H 'Content-Type: application/json' -d '{"mal":'
# Esperado: HTTP 500 con stack trace y rutas internas
# ----------------------------------------------------------
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 1298
ETag: W/"512-iKrQHfwsce27RzQj2cNc2F7JbPw"
Date: Sun, 04 Oct 2026 06:40:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Unexpected end of JSON input","stack":"SyntaxError: Unexpected end of JSON input\n    at JSON.parse (<anonymous>)\n    at parse (/Users/fagerstrom/Documents/proyecto-grupo-2-devsecops/src/vulnerable/node_modules/body-parser/lib/types/json.js:96:19)\n    at /Users/fagerstrom/Documents/proyecto-grupo-2-devsecops/src/vulnerable/node_modules/body-parser/lib/read.js:128:18\n    at AsyncResource.runInAsyncScope (node:async_hooks:227:14)\n    at invokeCallback (/Users/fagerstrom/Documents/proyecto-grupo-2-devsecops/src/vulnerable/node_modules/raw-body/index.js:238:16)\n    at done (/Users/fagerstrom/Documents/proyecto-grupo-2-devsecops/src/vulnerable/node_modules/raw-body/index.js:227:7)\n    at IncomingMessage.onEnd (/Users/fagerstrom/Documents/proyecto-grupo-2-devsecops/src/vulnerable/node_modules/raw-body/index.js:287:7)\n    at IncomingMessage.emit (node:events:514:28)\n    at endReadableNT (node:internal/streams/readable:1764:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)","server":{"os":"darwin","osVersion":"v24.21.0","nodeVersion":"24.21.0","arch":"arm64","hostname":"MacBook-Pro-de-Hans.local","uptime":12.004809375,"memoryUsage":{"rss":65896448,"heapTotal":21790720,"heapUsed":12756512,"external":4061169,"arrayBuffers":147213}}}

# [curl exit code: 0 (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]

```
