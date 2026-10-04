# ONF: Marco Normativo Organizacional

**Organización:** HealthTech (equipo MediCare Core, Grupo 2)
**Norma de referencia:** ISO/IEC 27034, Seguridad de las Aplicaciones
**Versión:** 1.1 | **Fecha:** 04.OCT.2026

---

## 1. Propósito

El ONF (*Organization Normative Framework*) es el repositorio central de políticas, reglas y directrices de seguridad que toda aplicación de la organización debe cumplir. De este marco se seleccionan, para cada aplicación, los controles específicos (ASC, ver `ASC-Seleccion-MediCare.md`), que luego se traducen en requisitos técnicos de código (ASR).

```
ONF (reglas globales) → ASC (las que aplican a MediCare) → ASR (requisitos en código) → Auditoría
```

## 2. Alcance

Aplica a todo el ciclo de vida (ALC) de las aplicaciones que traten datos de salud: adquisición y definición, diseño y desarrollo, pruebas y auditoría, operación y retiro.

## 3. Roles

| Rol | Responsabilidad |
|---|---|
| Desarrollador | Implementar las reglas del ONF seleccionadas en el ASC |
| Auditor de seguridad | Verificar cumplimiento y registrar evidencias |
| Responsable de la aplicación | Aprobar el paso a producción (*gate*) |

## 4. Reglas del ONF

| ID | Regla | Justificación | OWASP |
|---|---|---|---|
| **ONF-01** | Todo recurso se protege con **autorización en el servidor** bajo principio de mínimo privilegio. Un usuario solo accede a los datos que le pertenecen o para los que tiene asignación explícita. | Evita ver o modificar fichas ajenas. | A01 |
| **ONF-02** | Toda comunicación que transporte datos sensibles usa **HTTPS con TLS 1.2 o superior** (preferir 1.3). Prohibido el tráfico en texto claro. | Evita la interceptación de recetas y fichas. | A02 |
| **ONF-03** | Los datos sensibles se protegen **en reposo**. Las credenciales se almacenan solo con hash robusto (**bcrypt o Argon2**). Prohibido usar algoritmos débiles o paquetes criptográficos descontinuados. | Un robo de base de datos no debe exponer información legible. | A02 |
| **ONF-04** | **Zero Trust Input:** toda entrada externa se valida en el servidor mediante **lista blanca** y expresiones regulares. La validación del cliente es solo de usabilidad. | Una lista negra siempre falla ante nuevas variantes. | A03, A08 |
| **ONF-05** | Prohibido construir consultas a partir de entradas sin validar. Las entradas deben tener tipo esperado (ej. texto) y se rechazan objetos y operadores de consulta (`$ne`, `$gt`, etc.). | Previene inyección SQL/NoSQL. | A03 |
| **ONF-06** | **Seguridad y privacidad desde el diseño:** toda aplicación cuenta con modelado de amenazas antes de programar, aplica minimización de datos y **nunca** almacena datos de pacientes en rutas públicas. | Un diseño inseguro no se arregla con parches. | A04 |
| **ONF-07** | Configuración segura por defecto: cabeceras HTTP de seguridad activas, sin cuentas ni valores de prueba, y **mensajes de error genéricos**. Prohibido exponer stack traces, versiones o rutas internas. | Reduce la información útil para un atacante. | A05 |
| **ONF-08** | Las dependencias se revisan con `npm audit` antes de cada entrega. Prohibido usar componentes descontinuados o con vulnerabilidades críticas conocidas. | Evita explotación de fallos ya parcheados. | A06 |
| **ONF-09** | Autenticación y recuperación de cuenta robustas: contraseñas con política mínima, **límite de intentos** (rate limiting), bloqueo temporal y recuperación mediante token de un solo uso con expiración. Prohibidas las preguntas de seguridad triviales. | Evita fuerza bruta y toma de cuentas. | A07 |
| **ONF-10** | Los archivos subidos se validan por extensión, tipo real (MIME) y tamaño; se renombran y se guardan fuera de rutas públicas y sin permiso de ejecución. | Impide la carga de archivos ejecutables. | A08 |
| **ONF-11** | Las acciones críticas (consulta, creación o modificación de recetas y fichas) generan **registros de auditoría** con usuario, acción, fecha, IP y valores antes/después, sin incluir datos sensibles en el log. | Permite análisis forense y responsabilidad. | A09 |
| **ONF-12** | Toda funcionalidad que consuma URLs externas aplica **lista blanca de destinos**, bloquea direcciones internas o locales, y limita redirecciones y tiempo de espera. | Previene SSRF. | A10 |
| **ONF-13** | Ninguna aplicación pasa a producción sin **auditoría previa** (pruebas de penetración, evidencias en archivo y reporte) que certifique el cumplimiento de los controles. | Punto de control (*gate*) de ISO 27034. | A09 |
| **ONF-14** | Gobernanza, código y evidencias se versionan en un repositorio (**Docs-as-Code**), con commits descriptivos que permitan trazabilidad. | Transparencia y control de cambios. | A09 |

## 5. Verificación del cumplimiento

- Cada regla seleccionada en el ASC debe tener **evidencia**: prueba con `curl`, salida guardada en `auditoria/` y referencia al archivo de código que la implementa.
- El incumplimiento de una regla crítica bloquea el paso a producción.

## 6. Control de versiones del documento

## 6. Control de versiones del documento

| Versión | Fecha        | Autor        | Cambio |
|---|--------------|--------------|---|
| 1.0 | 01.OCT.2026 | Fagerstrom | Versión inicial (Borrador de políticas ONF) |
| 1.1 | 04.OCT.2026 | Fagerstrom | Revisión final y alineación con controles ASC de la Fase 2 |
