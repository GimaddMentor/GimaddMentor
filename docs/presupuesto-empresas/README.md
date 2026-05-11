# Documentación para presupuesto — Gimadd Mentor

Esta carpeta contiene material orientado a **empresas de desarrollo** que deban estimar alcance, esfuerzo, infraestructura y seguridad.


| Documento                                                                                          | Descripción                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md](./GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md)   | Documento principal (v1.1+): flujos, diagramas Mermaid, desglose por servicio, CRM detallado, hubs jugador/entrenador, Stripe/Calendar en secuencia, videoanálisis, permisos, seguridad, escalabilidad y plataformas (Android, iOS, escritorio entrenador). |
| [GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.pdf](./GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.pdf) | Misma versión que el `.md`, en PDF (tablas, **negritas**, diagramas Mermaid renderizados).                                                                                                                                                                  |
| [GIMADD-MENTOR-VISION-CEO.md](./GIMADD-MENTOR-VISION-CEO.md)                                       | Versión **no técnica** para dirección: valor, flujos y alcance en lenguaje de negocio.                                                                                                                                                                      |
| [GIMADD-MENTOR-VISION-CEO.pdf](./GIMADD-MENTOR-VISION-CEO.pdf)                                     | PDF de la visión CEO (generado con `npm run pdf:ceo` en `tools/`).                                                                                                                                                                                          |


### Regenerar el PDF (local)

Requiere [Node.js](https://nodejs.org/) (en macOS: `brew install node`).

```bash
cd docs/presupuesto-empresas/tools && npm install && npm run pdf
```

Se escribe `GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.pdf` en la carpeta `docs/presupuesto-empresas/`.

**PDF visión CEO (sin detalle técnico):**

```bash
cd docs/presupuesto-empresas/tools && npm install && npm run pdf:ceo
```

Genera `GIMADD-MENTOR-VISION-CEO.pdf` en la misma carpeta.

**HTML para GitHub Pages** (después de editar los `.md`, regenerar y subir al repo):

```bash
cd docs/presupuesto-empresas/tools && npm run html
```

Crea `gimadd-mentor-alcance-y-flujos-presupuesto.html` y `gimadd-mentor-vision-ceo.html` junto a los Markdown. En el sitio público quedan como:

- `https://gimaddmentor.github.io/GimaddMentor/docs/presupuesto-empresas/gimadd-mentor-alcance-y-flujos-presupuesto.html`
- `https://gimaddmentor.github.io/GimaddMentor/docs/presupuesto-empresas/gimadd-mentor-vision-ceo.html`

**Nota:** El repositorio incluye además `CONTEXTO-GIMADD-PARA-CHATGPT.md`, `dev-handoff/` y otros artefactos; el documento de esta carpeta está pensado como **brief único** para comerciales y equipos técnicos externos.