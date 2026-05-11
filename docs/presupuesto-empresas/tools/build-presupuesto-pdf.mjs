/**
 * Genera PDF del documento de alcance: Markdown (GFM) + diagramas Mermaid.
 * Salida: ../GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.pdf
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MD_PATH = join(ROOT, "GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.md");
const OUT_PDF = join(ROOT, "GIMADD-MENTOR-ALCANCE-Y-FLUJOS-PRESUPUESTO.pdf");

marked.use({ gfm: true, breaks: false });

function splitMarkdownAndMermaid(md) {
  const re = /^```mermaid\n([\s\S]*?)```/gm;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) {
      parts.push({ type: "md", content: md.slice(last, m.index) });
    }
    parts.push({ type: "mermaid", content: m[1].replace(/\r\n/g, "\n").trimEnd() });
    last = m.index + m[0].length;
  }
  if (last < md.length) {
    parts.push({ type: "md", content: md.slice(last) });
  }
  return parts;
}

function markdownToHtml(md) {
  const diagrams = [];
  const chunks = [];
  for (const part of splitMarkdownAndMermaid(md)) {
    if (part.type === "md") {
      chunks.push(marked.parse(part.content));
    } else {
      const idx = diagrams.length;
      diagrams.push(part.content);
      chunks.push(
        `<figure class="mermaid-figure"><div id="mmd-${idx}" class="mermaid"></div></figure>`
      );
    }
  }
  return { bodyInner: chunks.join("\n"), diagrams };
}

function buildDocument(bodyInner, diagrams) {
  const diagramJson = JSON.stringify(diagrams);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gimadd Mentor — Alcance y flujos</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.7.0/github-markdown.min.css" />
  <style>
    @page { size: A4; margin: 14mm 12mm 16mm 12mm; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      padding: 0;
      background: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    .page {
      box-sizing: border-box;
      max-width: 210mm;
      margin: 0 auto;
      padding: 12mm 14mm 18mm;
    }
    .markdown-body { font-size: 10.5pt; line-height: 1.45; }
    .markdown-body h1 { font-size: 1.65rem; border-bottom: 1px solid #d0d7de; padding-bottom: 0.25em; }
    .markdown-body h2 { font-size: 1.28rem; margin-top: 1.35em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
    .markdown-body h3 { font-size: 1.08rem; margin-top: 1.1em; }
    .markdown-body table { font-size: 9pt; display: table; width: 100%; }
    .markdown-body table th, .markdown-body table td { padding: 6px 8px; }
    .markdown-body pre:not(.mermaid) {
      background: #f6f8fa;
      border-radius: 6px;
      font-size: 8.5pt;
      padding: 10px 12px;
      overflow: hidden;
    }
    .markdown-body code { font-size: 0.9em; }
    .mermaid-figure {
      margin: 1rem 0;
      padding: 10px 8px;
      background: #fafbfc;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .mermaid { text-align: center; }
    .mermaid svg { max-width: 100% !important; height: auto !important; }
    .markdown-body blockquote { font-size: 0.95em; color: #57606a; }
    hr { page-break-after: avoid; }
  </style>
</head>
<body>
  <div class="page markdown-body" id="doc">
${bodyInner}
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
      window.__PDF_READY__ = true;
    })();
  </script>
</body>
</html>`;
}

async function main() {
  const md = readFileSync(MD_PATH, "utf8");
  const { bodyInner, diagrams } = markdownToHtml(md);
  const html = buildDocument(bodyInner, diagrams);

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 120000 });
    await page.waitForFunction(() => window.__PDF_READY__ === true, { timeout: 120000 });
    await page.emulateMediaType("print");
    await page.pdf({
      path: OUT_PDF,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "14mm", left: "10mm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#666;text-align:center;padding:0 12mm;font-family:system-ui,sans-serif"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
  } finally {
    await browser.close();
  }

  console.log("PDF generado:", OUT_PDF);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
