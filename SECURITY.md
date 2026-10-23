# Seguridad · GimaddMentor (GitHub Pages)

Revisión de octubre 2026 tras el aviso crítico de PHP (CVE-2026-109618 / CVE-2026-109619).

## Alcance de este repo

- Sitio **estático** en GitHub Pages (`gimaddmentor.github.io/GimaddMentor/`).
- **No ejecuta PHP** en nuestros servidores: el CVE de runtime PHP **no aplica** a este hosting.
- Demos HTML/CSS/JS, documentación y tablero `feedback.html`.

## Controles aplicados

- Meta `referrer` estricto en páginas clave.
- `robots.txt` y `.well-known/security.txt` para contacto de incidencias.
- `feedback.html`: refresco de sync cada 5 minutos (evita pérdida de datos en formularios).
- Validación de URLs de vídeo (solo `https://litter.catbox.moe/…`).
- `.gitignore` bloquea `.env` / secretos locales.

## Limitaciones (estático)

- GitHub Pages **no permite** cabeceras HTTP custom (`CSP` completa, `X-Frame-Options`, etc.). Las metas HTML mitigan en parte.
- `feedback.html` usa MantleDB con clave de cliente embebida (necesario en front estático). Si hay sospecha de abuso: rotar clave/namespace en MantleDB y actualizar el HTML.
- Subida de vídeo pasa por API de terceros (Catbox); no controlamos su runtime PHP.

## Contacto

Reportar incidencias a: `miguelangelsamperp@gmail.com`
