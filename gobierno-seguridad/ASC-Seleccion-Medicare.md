# Perfil de Seguridad (ASC) - MediCare Core

**Proyecto:** FinApp - API de Registro (MediCare Core)
**Nivel de Criticidad del Sistema:** ALTO (Procesa PII - Datos Médicos e Identificación Personal).
**Superficie de Exposición:** Pública (Expuesto a Internet vía HTTP).

## Controles ASC Seleccionados y Justificación
Tras revisar el ONF corporativo, este proyecto adopta los siguientes controles obligatorios:

1. **[ASC-01] Control de Acceso (Regla ONF-01):** 
   - *¿Por qué aplica?* El endpoint `/api/record/:id` recibe IDs. Sin validar que el usuario que consulta es dueño de ese ID, un atacante puede robar fichas médicas.
2. **[ASC-02] Validación Estricta de Entradas (Regla ONF-04 y ONF-10):**
   - *¿Por qué aplica?* Se reciben archivos de exámenes médicos. Si no se valida estrictamente el tipo real de archivo (MIME), podrían inyectar y ejecutar malware en el servidor.
3. **[ASC-03] Manejo Seguro de Errores (Regla ONF-07):**
   - *¿Por qué aplica?* Al ser una API pública, no debe revelar bajo ninguna circunstancia rutas de archivos internos ni versiones de Node.js en caso de una falla en las consultas.
4. **[ASC-04] Monitoreo y Trazabilidad (Regla ONF-11):**
   - *¿Por qué aplica?* Si se modifican recetas, debe existir un log de auditoría inmutable para fines forenses y responsabilidad médica.