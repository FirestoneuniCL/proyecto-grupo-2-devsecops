# MediCare Core - DevSecOps (Grupo 2)

## Contrato de API (Endpoints de Prueba)
Puerto base: `http://localhost:3000`

| Riesgo | Responsable | Endpoint Vulnerable |
|---|---|---|
| **A01** | Hans | `GET /api/record/:id` |
| **A02** | Hans | `POST /api/recetas` (HTTP) |
| **A03** | Hans | `POST /api/diagnosticos/buscar` |
| **A04** | Hans | `GET /public/pacientes/` |
| **A05** | Comp 1 | `GET /api/error` (Stack trace expuesto) |
| **A06** | Comp 1 | `POST /api/recetas/firmar` |
| **A07** | Comp 1 | `POST /api/recuperar-password` |
| **A08** | Comp 2 | `POST /api/examenes/subir` |
| **A09** | Comp 2 | `PUT /api/recetas/:id` (Sin logs) |
| **A10** | Comp 2 | `GET /api/historia-externa?url=` |