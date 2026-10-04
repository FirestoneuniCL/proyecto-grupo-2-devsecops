# Reporte de Auditoría: Fase 1 (aplicación vulnerable)

**Proyecto:** MediCare Core, Grupo 2 | **Asignatura:** Desarrollo Seguro (CI3064)
**Fecha de ejecución:** 04.OCT.2026 | **Objetivo:** `src/vulnerable` en `http://localhost:3000`
**Herramienta:** `curl` automatizado con `auditoria/auditoria.sh fase1 localhost`
**Alcance:** laboratorio propio, datos ficticios. Una evidencia en bruto por riesgo en esta misma carpeta.

## 1. Resultado general

Los **10 riesgos del OWASP Top 10 fueron explotados con éxito**, sin resistencia de la aplicación.

| Riesgo | Prueba realizada | Resultado | Evidencia |
|---|---|---|---|
| A01 Control de acceso roto | Un paciente pide `GET /api/record/1` con su propio token | **200**: recibe la ficha de otro paciente, incluido el SSN | `evidencia_A01.txt` |
| A02 Fallos criptográficos | `GET /api/prescription/1` por HTTP; luego por HTTPS | **200** en texto claro; no existe TLS (curl no conecta por HTTPS) | `evidencia_A02.txt` |
| A03 Inyección NoSQL | `GET /api/diagnosis/search?diagnosis[$ne]=null` | **200** con todos los diagnósticos | `evidencia_A03.txt` |
| A04 Diseño inseguro | `GET /patients/juan-perez.json` sin login | **200**: el expediente es público | `evidencia_A04.txt` |
| A05 Errores de configuración | `GET /` y `POST /api/login` con JSON mal formado | **200** con SO, versión de Node y hostname; **500** con stack trace y rutas internas | `evidencia_A05.txt` |
| A06 Componentes vulnerables | `npm audit` en `src/vulnerable` | **3 vulnerabilidades altas** (`hoek`, `boom`, `cryptiles`) | `evidencia_A06.txt` |
| A07 Autenticación | 5 intentos en `POST /api/recover-password` | `401 401 401 401 200`: sin límite; el 5.º acierta y la API devuelve la nueva contraseña | `evidencia_A07.txt` |
| A08 Integridad / subida | Subir un `.exe` a `POST /api/upload-exam` | **200**; el archivo queda descargable desde `/uploads/` | `evidencia_A08.txt` |
| A09 Registro y monitoreo | `PUT /api/prescription/1` modificando la dosis | **200** sin ningún registro de auditoría | `evidencia_A09.txt` |
| A10 SSRF | `GET /api/fetch-external-record?url=http://127.0.0.1:3000/` | **200**: el servidor consulta su propio endpoint interno | `evidencia_A10.txt` |

## 2. Hallazgos destacados

1. **Exposición de datos de salud (A01, A04):** cualquier usuario, e incluso un visitante anónimo, puede leer expedientes. Es el hallazgo de mayor impacto humano y legal (ficha clínica reservada, Ley 20.584).
2. **Toma de cuentas (A07):** la respuesta de recuperación es un nombre de mascota; sin límite de intentos se adivina en pocos intentos. La API además revela la pregunta (`hint`), el contador y devuelve la contraseña en claro.
3. **Fuga de información técnica (A05):** el stack trace muestra rutas internas del proyecto y librerías; la raíz entrega SO, versión de Node, hostname y memoria. Facilita el reconocimiento del atacante.
4. **Integridad de las recetas (A09, A02):** una receta puede alterarse sin dejar rastro y su firma digital viaja en texto claro. Hay riesgo clínico directo.

## 3. Conclusión

La aplicación **no cumple** ninguno de los controles del ONF. Cada hallazgo se corrige en la Fase 2 (`src/seguro`) y se vuelve a probar con el mismo script. Ver `auditoria/fase2/reporte_auditoria_fase2.md`.
