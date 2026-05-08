#!/bin/sh
# Genera PDF a partir de especificacion-desarrolladores.html (requiere Google Chrome).
DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="file://${DIR}/especificacion-desarrolladores.html"
OUT="${DIR}/especificacion-desarrolladores-gimadd-mentor.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$CHROME" ]; then
  echo "No se encontró Chrome en ${CHROME}" >&2
  exit 1
fi
"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$OUT" \
  "$HTML"
echo "PDF: $OUT"
