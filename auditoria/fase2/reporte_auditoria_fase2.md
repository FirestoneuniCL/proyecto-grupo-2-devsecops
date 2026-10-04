# Reporte de Auditoría: Fase 2 (aplicación refactorizada)

**Proyecto:** MediCare Core, Grupo 2 | **Asignatura:** Desarrollo Seguro (CI3064)
**Fecha de ejecución:** 04.OCT.2026 | **Objetivo:** `src/seguro` en `https://localhost:3443` (HTTP `:3000` solo redirige)
**Herramienta:** el **mismo** script de la Fase 1: `auditoria/auditoria.sh fase2 localhost 3000 3443`
**Alcance:** laboratorio propio, datos ficticios. Evidencias en bruto en esta carpeta.

## 1. Resultado general

Los **10 ataques de la Fase 1 fueron bloqueados o dejaron registro**, con respuestas defensivas controladas.

| Riesgo | Fase 1 (vulnerable) | Fase 2 (segura) | Control (ASC) | Evidencia |
|---|---|---|---|---|
| A01 | 200, ficha ajena entregada | **403** Acceso denegado | ASC-03 | `evidencia_A01.txt` |
| A02 | 200 por HTTP en claro; sin TLS | **301** a HTTPS; **200** sobre TLS con HSTS | ASC-04, 05 | `evidencia_A02.txt` |
| A03 | 200, todos los diagnósticos | **400** Parámetro inválido | ASC-01 | `evidencia_A03.txt` |
| A04 | 200, expediente público | **404** | ASC-06 | `evidencia_A04.txt` |
| A05 | SO y stack trace (500) | Raíz mínima y **400** genérico (`SEC-400`) | ASC-07 | `evidencia_A05.txt` |
| A06 | 3 vulnerabilidades altas | **0 vulnerabilidades** | ASC-08 | `evidencia_A06.txt` |
| A07 | `401 401 401 401 200` | `401 401 401 429 429` | ASC-02 | `evidencia_A07.txt` |
| A08 | `.exe` aceptado (200) y descargable | **415** y descarga **404** | ASC-09 | `evidencia_A08.txt` |
| A09 | 200 sin registro | 200 **y línea `prescription_modified` en el log** | ASC-10 | `evidencia_A09.txt`, `evidencia_A09_log.txt` |
| A10 | 200, consulta a `127.0.0.1` | **400** Destino no permitido | ASC-11 | `evidencia_A10.txt` |

## 2. Cómo interpretar los códigos

- **403** = el usuario está autenticado pero **no tiene permiso**. **401** = no está autenticado o los datos son inválidos.
- **429** = demasiados intentos; trae la cabecera `Retry-After`.
- **No todo 200 es un fallo.** En A02 (HTTPS), A05 (raíz) y A09 el 200 es la respuesta legítima; lo que cambió es el contenido. La raíz ya no filtra datos del servidor y la modificación de A09 queda registrada.
- En A09, el log (`evidencia_A09_log.txt`) muestra usuario, IP, valores antes y después, y el hash encadenado de cada línea.

## 3. Riesgo residual

Declarado en la sección 4 del ASC: cifrado en reposo no implementado, recuperación por pregunta de seguridad (mitigada, pero débil), credenciales de semilla en el código, límite de intentos y sesiones en memoria, y un log detectable pero no inmutable.

## 4. Conclusión

Con las limitaciones declaradas, `src/seguro` **cumple el punto de control (*gate*)** definido en el ASC: las 10 evidencias muestran respuestas defensivas ante los mismos ataques que tuvieron éxito en la Fase 1.
