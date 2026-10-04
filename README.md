# MediCare Core: Prototipo DevSecOps (Grupo 2)

Proyecto académico de **Desarrollo Seguro (CI3064)**, caso 2 *HealthTech*. Una API médica con las 10 vulnerabilidades del OWASP Top 10 se audita con pruebas automatizadas (`curl`), se refactoriza aplicando controles defensivos, y se vuelve a auditar con el **mismo script** para demostrar la mejora. La gobernanza sigue la norma **ISO/IEC 27034** (ONF → ASC → ASR).

> ⚠️ `src/vulnerable/` es **intencionalmente inseguro**. Ejecútalo solo en un laboratorio local, con datos ficticios. Nunca lo expongas a internet.

## 1. Resumen ejecutivo

| | Fase 1: vulnerable | Fase 2: segura |
|---|---|---|
| Código | `src/vulnerable/` | `src/seguro/` |
| Evidencias | `auditoria/fase1/` | `auditoria/fase2/` |
| Resultado | Los 10 ataques tienen éxito | Los 10 ataques son bloqueados o registrados |

| Riesgo | Ataque probado | Fase 1 | Fase 2 |
|---|---|---|---|
| A01 Control de acceso | Paciente pide la ficha de otro | 200 (la entrega) | **403** |
| A02 Cifrado | Receta por HTTP | 200 en texto claro | **301** a HTTPS y **200** con TLS |
| A03 Inyección NoSQL | `diagnosis[$ne]=null` | 200 (todos los datos) | **400** |
| A04 Diseño inseguro | Descarga directa de expediente | 200 | **404** |
| A05 Configuración | Raíz `/` y JSON mal formado | Datos del SO y stack trace (500) | Mínimo y **400** genérico |
| A06 Componentes | `npm audit` | 3 vulnerabilidades altas | **0** |
| A07 Autenticación | 5 intentos de recuperación | `401 401 401 401 200` | `401 401 401 429 429` |
| A08 Subida de archivos | Subir un `.exe` | 200 | **415** |
| A09 Registro | Modificar una receta | 200 sin registro | 200 **con línea en `audit.log`** |
| A10 SSRF | URL interna `127.0.0.1` | 200 | **400** |

## 2. Integrantes y roles

| Alumno | Rol | Actividades principales |
|---|---|---|
| **Hans Fagerstrom** | Desarrollador DevSecOps | Estructura del repositorio, API vulnerable, refactorización de `src/seguro` (autorización, listas blancas, HTTPS/TLS, auditoría), script `auditoria.sh` y documentos de gobernanza. |
| **Diego Zapata** | Auditor de seguridad / Pentester | Ejecución y verificación de scripts de auditoría automatizada (`auditoria.sh`), recolección de evidencias forenses OWASP Top 10 y redacción de reportes. |
| **Martín Ottermann** | Responsable de la aplicación / Gestor de Riesgos | Investigación normativa (ISO/IEC 27034), elaboración y control de versiones del ONF Corporativo, diseño del Manifiesto Ético y gobernanza Docs-as-Code. |

> El historial de commits del repositorio respalda la autoría de cada actividad.

## 3. Estructura del repositorio

```
gobierno-seguridad/   manifiesto_etico.md · ONF-Corporativo.md · ASC-Seleccion-Medicare.md
src/vulnerable/       API con las fallas (Fase 1)
src/seguro/           API refactorizada (Fase 2)
auditoria/            auditoria.sh (script único para ambas fases)
auditoria/fase1/      evidencia_A01.txt … evidencia_A10.txt
auditoria/fase2/      evidencia_A01.txt … evidencia_A10.txt · evidencia_A09_log.txt
```

## 4. Cómo ejecutarlo

Requisitos: Node.js (LTS), `curl` y `openssl`. En Windows, usar Git Bash. Ambas apps usan el puerto 3000, así que **detén una antes de levantar la otra** (`Ctrl + C`).

**Fase 1: versión vulnerable**
```bash
cd src/vulnerable
npm install
node index.js                      # http://localhost:3000
```
En otra terminal, desde la raíz del repo:
```bash
chmod +x auditoria/auditoria.sh    # solo la primera vez
./auditoria/auditoria.sh fase1 localhost
```

**Fase 2: versión segura**
```bash
cd src/seguro
npm install
npm run gen-cert                   # genera el certificado TLS de laboratorio (no se versiona)
node index.js                      # https://localhost:3443 (el puerto 3000 solo redirige)
```
En otra terminal, desde la raíz del repo:
```bash
./auditoria/auditoria.sh fase2 localhost 3000 3443
```

**Desde una máquina auditora separada:** reemplazar `localhost` por la IP del servidor, por ejemplo `./auditoria/auditoria.sh fase2 3.15.20.10 3000 3443`. El script guarda las evidencias en `auditoria/<fase>/`.

Usuarios de prueba (ficticios): `doctor_martinez`, `doctor_lopez` y `paciente_garcia`. El script hace el login automáticamente.

## 5. Endpoints auditados

| Riesgo | Endpoint | Archivo (`src/seguro/`) |
|---|---|---|
| A01 | `GET /api/record/:id` | `src/routes/records.js` |
| A02 | `GET /api/prescription/:id` (HTTP y HTTPS) | `src/routes/prescriptions.js`, `index.js` |
| A03 | `GET /api/diagnosis/search?diagnosis=` | `src/routes/diagnosis.js` |
| A04 | `GET /patients/juan-perez.json` | `index.js` (ya no se sirve contenido estático) |
| A05 | `GET /` y `POST /api/login` con JSON roto | `src/middleware.js` |
| A06 | `npm audit` | `package.json` |
| A07 | `POST /api/recover-password` | `src/routes/auth.js` |
| A08 | `POST /api/upload-exam` | `src/routes/files.js` |
| A09 | `PUT /api/prescription/:id` | `src/audit.js`, `prescriptions.js` |
| A10 | `GET /api/fetch-external-record?url=` | `src/routes/external.js` |

## 6. Gobernanza (ISO/IEC 27034)

- [`manifiesto_etico.md`](gobierno-seguridad/manifiesto_etico.md): responsabilidad del desarrollador ante la pérdida de datos.
- [`ONF-Corporativo.md`](gobierno-seguridad/ONF-Corporativo.md): 14 reglas organizacionales.
- [`ASC-Seleccion-Medicare.md`](gobierno-seguridad/ASC-Seleccion-Medicare.md): controles elegidos, el código que los implementa, su evidencia y el **riesgo residual** declarado.

## 7. Limitaciones

Es un prototipo de laboratorio: datos en memoria, credenciales de prueba en el código, certificado autofirmado y sin cifrado en reposo. El detalle está en la sección 4 del ASC.
