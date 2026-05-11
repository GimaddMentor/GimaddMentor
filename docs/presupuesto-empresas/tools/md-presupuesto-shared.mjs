/**
 * Markdown (GFM) + bloques Mermaid → HTML interno (fragmentos + lista de diagramas).
 * Compartido entre generación de PDF y de HTML para GitHub Pages.
 */
import { marked } from "marked";

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

export function markdownToHtml(md) {
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
