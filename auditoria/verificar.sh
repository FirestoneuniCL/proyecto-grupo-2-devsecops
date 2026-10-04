#!/bin/bash
# =============================================================================
# verificar.sh - Comprueba si las evidencias de una fase son las ESPERADAS.
# Uso:  ./verificar.sh fase1     (o)     ./verificar.sh fase2
# No ataca nada: solo lee los archivos auditoria/<fase>/evidencia_AXX.txt
# que dejo auditoria.sh y compara los codigos HTTP con lo que debe ocurrir.
# =============================================================================
FASE=$1
case "$FASE" in fase1|fase2) ;; *) echo "Uso: $0 <fase1|fase2>"; exit 1 ;; esac
cd "$(dirname "$0")" || exit 1
DIR="$PWD/$FASE"

OK=0; TOTAL=0
codes() { grep '^HTTP/' "$1" 2>/dev/null | tr -d '\r' | awk '{print $2}' | tr '\n' ' ' | sed 's/ $//'; }

# chk ID "descripcion" "esperado" "obtenido"
chk() {
  TOTAL=$((TOTAL+1))
  if [ "$3" = "$4" ]; then OK=$((OK+1)); printf "  [OK]  %-4s %-40s esperado: %-22s obtenido: %s\n" "$1" "$2" "$3" "$4"
  else printf "  [XX]  %-4s %-40s esperado: %-22s obtenido: %s\n" "$1" "$2" "$3" "${4:-(vacio)}"; fi
}
# texto_en ARCHIVO PATRON -> "si"/"no" (ignora las lineas de comentario '#')
texto_en() { grep -v '^#' "$1" 2>/dev/null | grep -qE "$2" && echo "si" || echo "no"; }

echo "=== Verificacion de evidencias: $FASE ==="
if [ "$FASE" = "fase1" ]; then
  chk A01 "Ficha ajena entregada"                 "200"                "$(codes $DIR/evidencia_A01.txt)"
  chk A02 "Receta por HTTP en texto claro"        "200"                "$(codes $DIR/evidencia_A02.txt)"
  chk A03 "Inyeccion NoSQL devuelve todo"         "200"                "$(codes $DIR/evidencia_A03.txt)"
  chk A04 "Expediente publico descargable"        "200"                "$(codes $DIR/evidencia_A04.txt)"
  chk A05 "Raiz con datos del SO + stack trace"   "200 500"            "$(codes $DIR/evidencia_A05.txt)"
  chk A06 "npm audit con vulnerabilidades altas"  "si"                 "$(texto_en $DIR/evidencia_A06.txt 'high severity')"
  chk A07 "Fuerza bruta: el 5to intento acierta"  "401 401 401 401 200" "$(codes $DIR/evidencia_A07.txt)"
  chk A08 ".exe aceptado y descargable"           "200 200"            "$(codes $DIR/evidencia_A08.txt)"
  chk A09 "Receta modificada sin registro"        "200"                "$(codes $DIR/evidencia_A09.txt)"
  chk A10 "SSRF: consulta a 127.0.0.1"            "200"                "$(codes $DIR/evidencia_A10.txt)"
else
  chk A01 "Ficha ajena denegada"                  "403"                "$(codes $DIR/evidencia_A01.txt)"
  chk A02 "HTTP redirige (301) y HTTPS responde"  "301 200"            "$(codes $DIR/evidencia_A02.txt)"
  chk A03 "Inyeccion NoSQL rechazada"             "400"                "$(codes $DIR/evidencia_A03.txt)"
  chk A04 "Expediente ya no es publico"           "404"                "$(codes $DIR/evidencia_A04.txt)"
  chk A05 "Raiz minima + error generico"          "200 400"            "$(codes $DIR/evidencia_A05.txt)"
  chk A06 "npm audit sin vulnerabilidades"        "si"                 "$(texto_en $DIR/evidencia_A06.txt 'found 0 vulnerabilities')"
  chk A07 "Intentos bloqueados con 429"           "401 401 401 429 429" "$(codes $DIR/evidencia_A07.txt)"
  chk A08 ".exe rechazado y no existe"            "415 404"            "$(codes $DIR/evidencia_A08.txt)"
  chk A09 "Modificacion OK + log de auditoria"    "200 si"             "$(codes $DIR/evidencia_A09.txt) $(texto_en $DIR/evidencia_A09_log.txt 'prescription_modified')"
  chk A10 "SSRF bloqueado"                        "400"                "$(codes $DIR/evidencia_A10.txt)"
fi
echo "-----------------------------------------------------------------------"
echo "  Resultado: $OK de $TOTAL evidencias correctas"
[ "$OK" -eq "$TOTAL" ] && echo "  TODO EN ORDEN" || echo "  HAY EVIDENCIAS POR REVISAR: vuelve a correr auditoria.sh con la app correcta levantada"
