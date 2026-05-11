/**
 * Genera HTML estático para GitHub Pages desde los Markdown de presupuesto / CEO.
 * Salida en docs/presupuesto-empresas/ (rutas enlazadas desde index.html del repo).
 *
 *   node build-presupuesto-html.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToHtml } from "./md-presupuesto-shared.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGETS = [
  {
    md: "GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md",
    html: "gimadd-mentor-alcance-y-flujos-presupuesto.html",
    title: "Gimadd Mentor — Alcance y flujos (presupuesto)",
  },
  {
    md: "GIMADD-MENTOR-VISION-CEO.md",
    html: "gimadd-mentor-vision-ceo.html",
    title: "Gimadd Mentor — Visión para dirección (CEO)",
  },
];

/** Ruta al index de GitHub Pages (repo root), desde docs/presupuesto-empresas/*.html */
const HOME_HREF = "../../index.html";

function buildTopbar(currentFile) {
  const alc = "gimadd-mentor-alcance-y-flujos-presupuesto.html";
  const ceo = "gimadd-mentor-vision-ceo.html";
  const link = (href, label) =>
    currentFile === href
      ? `<span style="opacity:0.95;font-weight:700">${label}</span>`
      : `<a href="${href}">${label}</a>`;
  return `<header class="topbar">
    <a href="${HOME_HREF}">← Inicio · GitHub Pages</a>
    ${link(alc, "Alcance (presupuesto)")}
    <span class="topbar-sep" aria-hidden="true">·</span>
    ${link(ceo, "Visión CEO")}
  </header>`;
}

function buildWebDocument(docTitle, bodyInner, diagrams, currentHtmlFile) {
  const diagramJson = JSON.stringify(diagrams);
  const safeTitle = String(docTitle).replace(/</g, "");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.7.0/github-markdown.min.css" />
  <style>
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      padding: 0;
      background: #f6f8fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #0c4a6e;
      color: #fff;
      padding: 0.65rem 1rem;
      font-size: 0.9rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .topbar a { color: #e0f2fe; font-weight: 600; text-decoration: none; }
    .topbar a:hover { text-decoration: underline; color: #fff; }
    .topbar-sep { opacity: 0.65; }
    .topbar-muted { opacity: 0.9; font-size: 0.82rem; }
    .page-wrap {
      max-width: 980px;
      margin: 0 auto;
      padding: 1.25rem 1rem 3rem;
    }
    .page {
      box-sizing: border-box;
      background: #fff;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      padding: 1.5rem 1.35rem 2.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    @media (min-width: 768px) {
      .page { padding: 2rem 2.25rem 3rem; }
    }
    .markdown-body { font-size: 1rem; line-height: 1.55; }
    .markdown-body h1 { font-size: 1.75rem; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    .markdown-body h2 { font-size: 1.35rem; margin-top: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
    .markdown-body h3 { font-size: 1.12rem; margin-top: 1.15em; }
    .markdown-body table { display: table; width: 100%; overflow-x: auto; }
    .markdown-body table th, .markdown-body table td { padding: 8px 10px; }
    .markdown-body pre:not(.mermaid) {
      background: #f6f8fa;
      border-radius: 8px;
      font-size: 0.86rem;
      padding: 12px 14px;
      overflow-x: auto;
    }
    .markdown-body code { font-size: 0.9em; }
    .mermaid-figure {
      margin: 1.25rem 0;
      padding: 12px 10px;
      background: #fafbfc;
      border: 1px solid #e1e4e8;
      border-radius: 10px;
    }
    .mermaid { text-align: center; }
    .mermaid svg { max-width: 100% !important; height: auto !important; }
    .markdown-body blockquote { font-size: 0.95em; color: #57606a; }
  </style>
</head>
<body>
  ${buildTopbar(currentHtmlFile)}
  <div class="page-wrap">
    <article class="page markdown-body" id="doc">
${bodyInner}
    </article>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.3/dist/mermaid.min.js"></script>
  <script>
    (async function () {
      const diagrams = ${diagramJson};
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict",
        flowchart: { htmlLabels: true, useMaxWidth: true },
        sequence: { useMaxWidth: true },
        state: { useMaxWidth: true }
      });
      diagrams.forEach(function (text, i) {
        var el = document.getElementById("mmd-" + i);
        if (el) el.textContent = text;
      });
      try {
        await mermaid.run({ querySelector: ".mermaid" });
      } catch (e) {
        console.error(e);
      }
    })();
  </script>
</body>
</html>`;
}

function main() {
  for (const t of TARGETS) {
    const mdPath = join(ROOT, t.md);
    const outPath = join(ROOT, t.html);
    const md = readFileSync(mdPath, "utf8");
    const { bodyInner, diagrams } = markdownToHtml(md);
    const html = buildWebDocument(t.title, bodyInner, diagrams, t.html);
    writeFileSync(outPath, html, "utf8");
    console.log("HTML:", outPath);
  }
}

main();
