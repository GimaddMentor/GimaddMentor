/**
 * Quita comentarios CSS y JS de Gimadd_Mentor_APP.html (aspecto producción).
 * Ejecutar: "/path/to/node" tools/strip-html-prod-comments.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "Gimadd_Mentor_APP.html");

const JSON_SCRIPT_IDS = [
  "gimadd-store-meta",
  "gimadd-objetivos-seed",
  "gimadd-diario-meta",
  "gimadd-partidos-seed",
  "gimadd-clases-seed",
  "gimadd-presencial-bookings-seed",
  "gimadd-messages-seed",
  "gimadd-crm-meta",
  "gimadd-crm-seed",
  "gimadd-coach-servicios-seed",
];

function maskJsonScriptBlocks(html) {
  const placeholders = [];
  let safe = html;
  JSON_SCRIPT_IDS.forEach(function (id) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      "^\\s*<script type=\"application/json\" id=\"" +
        esc +
        "\">[\\s\\S]*?<\\/script>",
      "m",
    );
    safe = safe.replace(re, function (block) {
      placeholders.push(block);
      return "\0JSON_" + (placeholders.length - 1) + "\0";
    });
  });
  return { safe, placeholders };
}

function stripCSSComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function endsWithRegexKeyword(tail) {
  return /(?:^|[\s;,:{}()])(return|case|throw|typeof|void|delete|in|instanceof|of|as|yield|await)\s*$/i.test(
    tail,
  );
}

function canRegexStart(out) {
  let j = out.length - 1;
  while (j >= 0 && /\s/.test(out[j])) j--;
  if (j < 0) return true;
  const slice = out.slice(Math.max(0, j - 48), j + 1);
  if (endsWithRegexKeyword(slice)) return true;
  const ch = out[j];
  if ('([{:,;=!?&|+-*%/^~<>'.includes(ch)) return true;
  if (/[)\]a-zA-Z0-9_$]/.test(ch)) return false;
  return true;
}

function appendRegexLiteral(src, i, out) {
  let j = i + 1;
  while (j < src.length) {
    const rc = src[j];
    if (rc === "\\") {
      j += 2;
      continue;
    }
    if (rc === "[") {
      j++;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === "]") {
          j++;
          break;
        }
        j++;
      }
      continue;
    }
    if (rc === "/") {
      j++;
      while (j < src.length && /[gimsuy]/i.test(src[j])) j++;
      out.push(src.slice(i, j));
      return j;
    }
    j++;
  }
  out.push(src.slice(i));
  return src.length;
}

/**
 * @param {string} src
 */
function stripJavaScriptComments(src) {
  /** @type {Array<'CODE'|'TMPL'|{k:'EXPR',d:number}|{k:'STR',q:string}>} */
  const stack = ["CODE"];
  const out = [];
  let i = 0;
  const n = src.length;

  const top = () => stack[stack.length - 1];
  const outStr = () => out.join("");

  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    const t = top();

    const handleCodeCommentsAndStrings = () => {
      if (c === "/" && c2 === "/") {
        i += 2;
        while (i < n && src[i] !== "\n") i++;
        return true;
      }
      if (c === "/" && c2 === "*") {
        i += 2;
        while (i < n - 1 && !(src[i] === "*" && src[i + 1] === "/")) i++;
        i += 2;
        return true;
      }
      if (c === "'" || c === '"') {
        stack.push({ k: "STR", q: c });
        out.push(c);
        i++;
        return true;
      }
      if (c === "`") {
        stack.push("TMPL");
        out.push(c);
        i++;
        return true;
      }
      if (c === "/" && canRegexStart(outStr())) {
        i = appendRegexLiteral(src, i, out);
        return true;
      }
      return false;
    };

    if (t === "CODE") {
      if (handleCodeCommentsAndStrings()) continue;
      out.push(c);
      i++;
      continue;
    }

    if (t === "TMPL") {
      out.push(c);
      if (c === "\\") {
        if (i + 1 < n) out.push(src[++i]);
        i++;
        continue;
      }
      if (c === "`") {
        stack.pop();
        i++;
        continue;
      }
      if (c === "$" && c2 === "{") {
        out.push("{");
        i += 2;
        stack.push({ k: "EXPR", d: 1 });
        continue;
      }
      i++;
      continue;
    }

    if (typeof t === "object" && t.k === "STR") {
      out.push(c);
      if (c === "\\") {
        if (i + 1 < n) out.push(src[++i]);
        i++;
        continue;
      }
      if (c === t.q) {
        stack.pop();
        i++;
        continue;
      }
      i++;
      continue;
    }

    if (typeof t === "object" && t.k === "EXPR") {
      if (handleCodeCommentsAndStrings()) continue;
      if (c === "{") {
        t.d++;
        out.push(c);
        i++;
        continue;
      }
      if (c === "}") {
        t.d--;
        out.push(c);
        i++;
        if (t.d === 0) stack.pop();
        continue;
      }
      out.push(c);
      i++;
      continue;
    }
  }

  return outStr();
}

function transformHtml(html) {
  const masked = maskJsonScriptBlocks(html);
  let safe = masked.safe;
  const placeholders = masked.placeholders;

  safe = safe.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (full, css) =>
    full.replace(css, stripCSSComments(css)),
  );

  const scriptMainRe = /<script\b(?![^>]*\bsrc=)(?![^>]*type\s*=\s*["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi;
  safe = safe.replace(scriptMainRe, (full, js) => {
    const trimmed = stripJavaScriptComments(js);
    const gt = full.indexOf(">");
    const close = full.lastIndexOf("</script>");
    if (gt === -1 || close === -1 || close <= gt) return full;
    return full.slice(0, gt + 1) + trimmed + full.slice(close);
  });

  placeholders.forEach((ph, idx) => {
    safe = safe.split(`\0JSON_${idx}\0`).join(ph);
  });

  return safe;
}

const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const raw = fs.readFileSync(APP, "utf8");
  const next = transformHtml(raw);
  fs.writeFileSync(APP, next, "utf8");
  console.log("Updated", APP);
}
