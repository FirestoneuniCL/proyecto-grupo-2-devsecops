# Guion de la demostración (5 minutos): MediCare Core

> Reparto sugerido, ajústenlo a lo que cada uno hizo: **Persona A** abre el repo y explica la gobernanza, **Persona B** corre las auditorías y lee los resultados, **Persona C** maneja el servidor y explica los arreglos. Todos deben poder responder cualquier pregunta.

## 0. Antes de la demo (hazlo el día anterior y 10 minutos antes)

```bash
git pull
cd src/vulnerable && npm install && cd ../..
cd src/seguro && npm install && npm run gen-cert && cd ../..
chmod +x auditoria/auditoria.sh auditoria/verificar.sh
for p in 3000 3443; do lsof -ti :$p | xargs kill 2>/dev/null; done     # libera los puertos
```

Checklist:
- [ ] Dos terminales abiertas en la **raíz** del repo: **T-A** (servidor) y **T-B** (auditor).
- [ ] El repo abierto en el navegador y los archivos `.md` listos en VS Code.
- [ ] **Ensayo completo al menos una vez**, con cronómetro.
- [ ] Tienen internet (el paso A06 ejecuta `npm audit`).

## 1. Guion minuto a minuto

| Tiempo | Qué muestran | Qué dicen |
|---|---|---|
| **0:00–0:40** | GitHub: carpetas, README y la lista de commits de los tres | "MediCare Core es una API de fichas médicas. Auditamos una versión vulnerable, la refactorizamos y la volvimos a auditar con el mismo script. Todo está versionado como Docs-as-Code." |
| **0:40–1:30** | `gobierno-seguridad/`: manifiesto, ONF y la tabla del ASC | "Los datos de salud son sensibles: una filtración daña a personas. Con ISO 27034, el ONF define las 14 reglas; el ASC elige las que aplican a MediCare y apunta al archivo de código que las implementa." |
| **1:30–2:40** | **Fase 1** (comandos abajo) | "Levantamos la app vulnerable y lanzamos 10 ataques con `curl`. Todos tienen éxito." |
| **2:40–4:20** | **Fase 2** (comandos abajo) | "Levantamos la versión segura y lanzamos exactamente los mismos ataques. Ahora los bloquea o los registra." |
| **4:20–5:00** | `verificar.sh` y el riesgo residual del ASC | "10 de 10 verificados. Declaramos lo que no cubre: cifrado en reposo y la recuperación por pregunta de seguridad." |

## 2. Comandos de la demo

### Fase 1: aplicación vulnerable
```bash
# T-A
cd src/vulnerable && node index.js

# T-B (desde la raíz del repo)
./auditoria/auditoria.sh fase1 localhost
./auditoria/verificar.sh fase1
```
Mientras corre, señalen: "todo 200, los ataques pasan". Abran **dos evidencias** para mostrar cómo se lee una:
```bash
sed -n 1,25p auditoria/fase1/evidencia_A05.txt     # SO, Node y hostname expuestos
sed -n 1,30p auditoria/fase1/evidencia_A07.txt     # 5 intentos, el 5.º acierta
```

*(Opcional, en vivo con un solo comando: un paciente lee la ficha de otro)*
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/login -H 'Content-Type: application/json' -d '{"username":"paciente_garcia","password":"garcia456"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
curl -s http://localhost:3000/api/record/1 -H "Authorization: $TOKEN"
```

### Fase 2: aplicación segura
```bash
# T-A: Ctrl+C para detener la anterior (estabas en src/vulnerable) y luego
cd ../seguro
node index.js

# T-B
./auditoria/auditoria.sh fase2 localhost 3000 3443
grep prescription_modified src/seguro/logs/audit.log | tail -n 1 > auditoria/fase2/evidencia_A09_log.txt
./auditoria/verificar.sh fase2
```
Abran estas evidencias:
```bash
sed -n 1,20p auditoria/fase2/evidencia_A01.txt     # 403 Acceso denegado
sed -n 1,35p auditoria/fase2/evidencia_A07.txt     # 429 con Retry-After
cat auditoria/fase2/evidencia_A09_log.txt          # usuario, IP, antes y después, hash
```
*(El mismo ataque en vivo contra la versión segura: usen `-k` y `https://localhost:3443`; el paciente recibe 403.)*

> **Importante:** reinicien el servidor seguro justo antes de la demo (el paso de arriba ya lo hace). Así la primera modificación de la receta muestra un `before` distinto del `after`. Si corren el script varias veces sin reiniciar, el `before` y el `after` salen iguales.

### Variante con auditor en otra máquina
Si el profesor pide servidor y pentester separados: el servidor entrega su IP (`ipconfig getifaddr en0` en Mac) y el auditor, con el repo clonado y en la misma red, corre `./auditoria/auditoria.sh fase1 <IP>` y `./auditoria/auditoria.sh fase2 <IP> 3000 3443`. Pruébenlo antes: el firewall puede pedir permiso, y el log de A09 (`audit.log`) está en la máquina servidor, así que ese archivo lo copia quien tiene el servidor.

## 3. Cómo leer los resultados del script

Cada línea de la salida es `[riesgo] prueba -> código HTTP`. El código dice qué respondió la aplicación.

| Riesgo | Fase 1 (vulnerable) | Fase 2 (segura) | Qué demuestra el cambio |
|---|---|---|---|
| A01 | 200 | **403** | Ya no ve fichas ajenas |
| A02 | 200 por HTTP; HTTPS falla | **301** por HTTP; **200** por HTTPS | El tráfico va cifrado |
| A03 | 200 | **400** | La inyección se rechaza |
| A04 | 200 | **404** | El expediente ya no es público |
| A05 | 200 y **500** con stack | 200 mínimo y **400** genérico | Ya no filtra datos internos |
| A06 | 3 vulnerabilidades altas | **found 0 vulnerabilities** | Dependencias limpias |
| A07 | `401 401 401 401 200` | `401 401 401 429 429` | El límite de intentos funciona |
| A08 | 200 y 200 | **415** y **404** | El `.exe` se rechaza |
| A09 | 200 sin registro | 200 **y línea en `audit.log`** | Queda trazabilidad |
| A10 | 200 | **400** | El SSRF se bloquea |

**Cuatro reglas para saber si está bien:**
1. **En fase 1 queremos ver que el ataque funciona** (200 y datos filtrados): eso demuestra la falla.
2. **En fase 2 queremos ver el cambio de respuesta** (403, 400, 404, 429, 415). **No todo 200 es malo:** en A02 (HTTPS), A05 (raíz) y A09 el 200 es la respuesta legítima; lo que cambia es el contenido o el registro.
3. **Si ves `curl rc=7` o "sin respuesta"**, el servidor no está corriendo o es el puerto equivocado. Es normal solo en A02 por HTTPS en fase 1.
4. **Corre `verificar.sh`:** compara los códigos de cada evidencia con lo esperado y marca `[OK]` o `[XX]`. Debe terminar en *"10 de 10 evidencias correctas"*.

Para auditar una evidencia a mano, hágase las 4 preguntas: *¿qué comando se ejecutó? ¿qué código devolvió? ¿qué revelan las cabeceras? ¿qué muestra el cuerpo?*

## 4. Si algo falla

| Síntoma | Solución |
|---|---|
| `EADDRINUSE` (puerto ocupado) | `for p in 3000 3443; do lsof -ti :$p \| xargs kill; done` y levantar otra vez |
| "Falta el certificado TLS" | `cd src/seguro && npm run gen-cert` |
| `permission denied` al ejecutar un script | `chmod +x auditoria/auditoria.sh auditoria/verificar.sh` |
| El script marca 404 en todo | Está corriendo la app equivocada; detengan y levanten la de la fase correcta |
| `verificar.sh` marca `[XX]` en A06 | Falta internet, o falta `npm install` en la carpeta de esa fase |
| `verificar.sh` marca `[XX]` en A09 (fase 2) | Falta ejecutar la línea `grep prescription_modified ...` |
| Nada funciona en vivo | Abran las evidencias ya subidas a GitHub y corran `./auditoria/verificar.sh fase1` / `fase2` sobre ellas |

## 5. Preguntas probables y respuestas cortas

- **¿Qué es OWASP Top 10?** El listado de los 10 riesgos más críticos de seguridad en aplicaciones web.
- **¿Qué es ONF, ASC y ASR?** ONF: las reglas de toda la organización. ASC (*Application Security Controls*): las que elegimos para esta app. ASR: su traducción a requisitos de código.
- **¿Por qué 403 y no 401?** 401: no estás autenticado. 403: lo estás, pero no tienes permiso sobre ese recurso.
- **¿Por qué lista blanca y no lista negra?** La blanca define lo único permitido; la negra siempre falla ante variantes nuevas de ataque.
- **¿Cómo se evitó la inyección NoSQL?** Cuatro capas: el parser no crea objetos, solo se acepta el parámetro esperado, debe ser texto que cumpla una Regex, y la búsqueda no usa operadores.
- **¿Por qué scrypt?** Es un hash lento con sal, incluido en Node, que dificulta la fuerza bruta si roban la base de datos.
- **¿Qué es SSRF?** Hacer que el servidor consulte una URL que elige el atacante, por ejemplo servicios internos o los metadatos de la nube. Se evita con una lista blanca de destinos, bloqueo de IPs internas, sin redirecciones y con timeout.
- **¿Qué es el hash encadenado del log?** Cada línea incluye el hash de la anterior. Si alguien edita el archivo, la cadena se rompe. Detecta manipulación, pero no la impide.
- **¿Por qué certificado autofirmado?** Es de laboratorio. En producción se usa una autoridad certificadora.
- **¿Qué falta para producción?** Cifrado en reposo, una base de datos real, secretos fuera del código, recuperación de contraseña por token de correo o MFA, y el log en un sistema centralizado.
- **¿Usaron alguna herramienta de IA?** Sean honestos y expliquen qué entienden de cada control; lean todo el código antes de la demo.
