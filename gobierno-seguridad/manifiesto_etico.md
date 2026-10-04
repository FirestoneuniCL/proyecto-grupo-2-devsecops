# Manifiesto Ético del Desarrollador: MediCare Core

**Proyecto:** MediCare Core, Sistema de Gestión de Fichas Médicas (HealthTech)
**Grupo:** 2 | **Asignatura:** Desarrollo Seguro (CI3064)
**Integrantes:** Fagerstrom, Zapata, Otterman
**Fecha:** 04.OCT.2026

---

## 1. Propósito

MediCare Core permite que médicos y pacientes consulten recetas e historiales clínicos. Esto significa que nuestro código custodia información de salud, uno de los tipos de datos más sensibles que existen. Este manifiesto declara cómo entendemos nuestra responsabilidad como ingenieros de software y qué nos comprometemos a hacer.

## 2. Impacto humano de una pérdida de datos

Una brecha en un sistema de salud no es solo un incidente técnico. Puede significar:

- **Daño a las personas:** exposición de diagnósticos, tratamientos o condiciones que el paciente no quiso compartir.
- **Discriminación:** uso de esa información para negar empleo, seguros o créditos.
- **Daño emocional y social:** estigma, pérdida de confianza en el sistema de salud.
- **Riesgo clínico:** si una receta o ficha es alterada sin registro, un paciente puede recibir un tratamiento equivocado.
- **Irreversibilidad:** a diferencia de una contraseña, un diagnóstico filtrado no se puede "cambiar".

Cada vulnerabilidad de MediCare Core (acceso a fichas ajenas, tráfico sin cifrar, recetas modificables sin auditoría) tiene a una persona real detrás.

## 3. Marco legal aplicable (Chile)

- **Ley 19.628**, sobre protección de la vida privada y datos personales.
- **Nueva ley de protección de datos personales (Ley 21.719)**: refuerza derechos de las personas y deberes de quien trata sus datos.
- **Ley 20.584**, derechos y deberes de los pacientes: establece el carácter **reservado de la ficha clínica**.
- **Ley 21.459**, sobre delitos informáticos: acceso ilícito, interceptación y daño a sistemas.
- **Ley 21.563**, Ley Marco de Ciberseguridad.

## 4. Responsabilidad del desarrollador

Sostenemos que **la seguridad no es responsabilidad exclusiva de terceros** (el cliente, el área de infraestructura o el auditor). Quien diseña y escribe el código decide si un dato queda protegido o expuesto.

- **Responsabilidad civil:** podemos responder por los perjuicios causados por negligencia en el diseño o la implementación.
- **Responsabilidad penal:** corresponde cuando hay conductas dolosas, o cuando se facilita un acceso indebido por incumplimiento grave de deberes.
- **Responsabilidad profesional:** el deber de diligencia no se transfiere. "Funcionaba" no equivale a "era seguro".

## 5. Trabajo de buena fe y límites éticos

- Todas las pruebas de penetración de este proyecto se realizan **solo en un entorno de laboratorio propio y autorizado**, con **datos ficticios**.
- No usaremos técnicas de ataque contra sistemas o datos de terceros.
- Documentamos las vulnerabilidades para corregirlas, no para explotarlas.

## 6. Nuestros compromisos

1. **Mínimo privilegio:** cada persona accede solo a lo que necesita.
2. **Privacidad desde el diseño:** recolectamos y guardamos solo los datos imprescindibles.
3. **No confiar en la entrada del usuario (Zero Trust Input):** validamos todo en el servidor.
4. **Cifrar** los datos en tránsito y en reposo.
5. **Dejar trazabilidad:** registrar quién hizo qué, cuándo y desde dónde.
6. **No ocultar errores:** si detectamos una vulnerabilidad, la reportamos y la corregimos.
7. **Ante una brecha**, actuar con transparencia: avisar a los afectados y a la autoridad correspondiente, y contener el daño.
8. **Mejora continua:** actualizar dependencias y auditar periódicamente.

## 7. Conclusión

Proteger una ficha clínica es proteger la dignidad y la seguridad de quien confió en el sistema. Como equipo asumimos que cada decisión de diseño es también una decisión ética.

**Firmas del equipo:** Fagerstrom · Zapata · Otterman