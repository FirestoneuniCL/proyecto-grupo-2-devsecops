# API segura de recetas e historiales clinicos

API educativa con controles defensivos para una plataforma de medicos y pacientes.

## Ejecucion

```bash
npm install
npm start
```

El servidor usa el puerto `3000` por defecto. En produccion debe ejecutarse detras de HTTPS. La descarga de registros externos solo funciona para hosts HTTPS incluidos en `ALLOWED_EXTERNAL_HOSTS`.

## Usuarios de prueba

- `doctor_martinez` / `martinez123`
- `doctor_lopez` / `lopez2024`
- `paciente_garcia` / `garcia456`

## Controles implementados

- Las historias solo son visibles para el paciente propietario o para un medico.
- La busqueda de diagnosticos acepta solo texto y severidades permitidas; no procesa operadores NoSQL.
- Los errores devuelven mensajes genericos y los detalles quedan en los registros del servidor.
- Se desactivaron los archivos estaticos publicos y los datos clinicos no se sirven por URL.
- Las subidas se guardan fuera de la carpeta publica, con nombre aleatorio, limite de 5 MB y validacion de firma de PDF, PNG o JPEG.
- Las URLs externas requieren HTTPS, un host permitido, DNS publico y no pueden redirigir.
- Las recetas solo pueden ser modificadas por el medico asignado y cada cambio conserva una auditoria.
- Se retiraron las preguntas de seguridad; la recuperacion responde de forma neutral y aplica limite de intentos.
- Se eliminaron `cryptiles` y la ruta de verificacion obsoleta.
- Helmet, limites de solicitudes, limites de cuerpo y cookies/cabeceras de seguridad protegen la API.

## Persistencia

La demostracion conserva los datos en memoria. Para una entrega corporativa, las colecciones clinicas, usuarios, auditoria y archivos deben migrarse a almacenamiento persistente con controles de acceso equivalentes y cifrado en reposo.
