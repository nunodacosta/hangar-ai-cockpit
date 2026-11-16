#!/usr/bin/env node
/**
 * Compila a documentação da aplicação num único HTML, pronto a imprimir em PDF.
 *
 * Uso:
 *   node tools/build-docs-pdf.js
 *   node tools/build-docs-pdf.js --out C:\temp\doc.html
 *
 * O HTML é escrito na pasta temporária e as imagens são embutidas em base64,
 * para que o ficheiro possa ser impresso sem depender de caminhos relativos.
 * A impressão é feita por tools/print-docs-pdf.js (Electron):
 *
 *   npm run docs:pdf
 *
 * Fontes: README.md, PRIVACY.md, NOTICE.md, ALTERNATIVO.md, LICENSE e os
 * documentos de docs/ (Store, ficha da loja e winget). O texto é lido tal como
 * está no repositório, sem reescrever o conteúdo.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

const DOCS = [
  { file: 'README.md', label: 'Apresentação e instalação' },
  { file: 'PRIVACY.md', label: 'Privacidade' },
  { file: 'NOTICE.md', label: 'Atribuição e licenças' },
  { file: 'docs/microsoft-store.md', label: 'Publicação na Microsoft Store' },
  { file: 'docs/loja-ficha.md', label: 'Ficha da loja' },
  { file: 'docs/winget.md', label: 'Publicação no winget' },
  { file: 'ALTERNATIVO.md', label: 'Canal alternativo' },
];

const TITLE = 'Hangar AI Cockpit';
const SUBTITLE = 'Documentação da aplicação';
const STAMP = new Intl.DateTimeFormat('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date());

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const outFile = path.resolve(
  arg('out', path.join(os.tmpdir(), 'hangar-docs', 'documentacao.html')),
);
const repoUrl = 'https://github.com/nunodacosta/hangar-ai-cockpit';

/* ------------------------------------------------------------------ inline */

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainText(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function slugify(value) {
  return plainText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'seccao';
}

function imageDataUri(baseDir, src) {
  if (/^https?:\/\//.test(src)) return src;
  const file = path.resolve(baseDir, decodeURI(src));
  if (!fs.existsSync(file)) {
    console.warn(`  aviso: imagem não encontrada: ${src}`);
    return src;
  }
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function makeInline({ links, baseDir }) {
  return function inline(text) {
    const codes = [];
    let value = text.replace(/`([^`]+)`/g, (_match, code) => {
      codes.push(code);
      return `\u0000${codes.length - 1}\u0000`;
    });

    value = escapeHtml(value);

    value = value.replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_match, alt, src) =>
        `<img src="${imageDataUri(baseDir, src)}" alt="${escapeHtml(plainText(alt))}">`,
    );

    value = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
      const key = href.replace(/^\.\//, '');
      const target = links.get(key);
      const url = target ? `#${target}` : href;
      return `<a href="${url}">${label}</a>`;
    });

    value = value.replace(
      /&lt;((?:https?:\/\/|ms-windows-store:)[^&\s]+)&gt;/g,
      (_match, url) => `<a href="${url}">${url}</a>`,
    );

    value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    value = value.replace(
      /(^|[\s(>])\*([^*\n<>]+)\*/g,
      (_match, lead, inner) => `${lead}<em>${inner}</em>`,
    );

    value = value.replace(/\u0000(\d+)\u0000/g, (_match, index) => {
      return `<code>${escapeHtml(codes[Number(index)])}</code>`;
    });

    return value;
  };
}

/* ---------------------------------------------------------------- blocos */

function leadingSpaces(line) {
  return line.length - line.trimStart().length;
}

const FENCE = /^\s*`{3,}\s*([\w+-]*)\s*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
const RULE = /^\s*(\*{3,}|-{3,}|_{3,})\s*$/;
const TABLE_SEP = /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/;

function isTableStart(lines, i) {
  return (
    lines[i].includes('|') &&
    i + 1 < lines.length &&
    TABLE_SEP.test(lines[i + 1]) &&
    lines[i + 1].includes('-')
  );
}

function isBlockStart(lines, i) {
  const line = lines[i];
  if (!line.trim()) return true;
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    LIST_ITEM.test(line) ||
    /^\s*>/.test(line) ||
    isTableStart(lines, i)
  );
}

function splitRow(line) {
  let value = line.trim();
  if (value.startsWith('|')) value = value.slice(1);
  if (value.endsWith('|')) value = value.slice(0, -1);
  return value.split('|').map((cell) => cell.trim());
}

function parseBlocks(lines, state) {
  const blocks = [];

  for (let i = 0; i < lines.length; ) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^\s*`{3,}\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', lang: fence[1] || '', text: body.join('\n') });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      let id = slugify(text);
      let n = 2;
      while (state.ids.has(id)) id = `${slugify(text)}-${n++}`;
      state.ids.add(id);
      if (level === 1) state.h1 += 1;
      blocks.push({ type: 'heading', level, text, id, first: level === 1 && state.h1 === 1 });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (isTableStart(lines, i)) {
      const header = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((cell) => {
        const left = cell.startsWith(':');
        const right = cell.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        return 'left';
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', header, aligns, rows });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoted = [];
      while (i < lines.length) {
        if (/^\s*>/.test(lines[i])) {
          quoted.push(lines[i].replace(/^\s*>\s?/, ''));
          i += 1;
        } else if (!lines[i].trim() && i + 1 < lines.length && /^\s*>/.test(lines[i + 1])) {
          quoted.push('');
          i += 1;
        } else {
          break;
        }
      }
      blocks.push({ type: 'quote', blocks: parseBlocks(quoted, state) });
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const parsed = parseList(lines, i, leadingSpaces(line), state);
      blocks.push(parsed.block);
      i = parsed.next;
      continue;
    }

    const paragraph = [];
    while (i < lines.length && !isBlockStart(lines, i)) {
      paragraph.push(lines[i].trim());
      i += 1;
    }

    if (paragraph.length === 1) {
      const image = paragraph[0].match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (image) {
        blocks.push({ type: 'figure', alt: image[1], src: image[2] });
        continue;
      }
    }

    blocks.push({ type: 'paragraph', lines: paragraph });
  }

  return blocks;
}

function parseList(lines, start, baseIndent, state) {
  const first = lines[start].match(LIST_ITEM);
  const ordered = /\d+\./.test(first[2]);
  const startNumber = ordered ? Number.parseInt(first[2], 10) : 1;
  const items = [];
  let i = start;

  while (i < lines.length) {
    const match = lines[i].match(LIST_ITEM);
    if (!match) break;
    if (match[1].length !== baseIndent) break;
    if (/\d+\./.test(match[2]) !== ordered) break;

    const content = [match[3]];
    i += 1;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        let next = i;
        while (next < lines.length && !lines[next].trim()) next += 1;
        if (next >= lines.length) {
          i = next;
          break;
        }
        const indent = leadingSpaces(lines[next]);
        const nextIsItem = LIST_ITEM.test(lines[next]);
        if (indent > baseIndent) {
          content.push('');
          i += 1;
          continue;
        }
        if (nextIsItem && indent === baseIndent) {
          i = next;
        }
        break;
      }

      const indent = leadingSpaces(line);
      if (indent <= baseIndent) break;
      content.push(line.slice(Math.min(indent, baseIndent + 2)));
      i += 1;
    }

    items.push(parseBlocks(content, state));
  }

  return { block: { type: 'list', ordered, start: startNumber, items }, next: i };
}

/* --------------------------------------------------------------- render */

function renderBlocks(blocks, ctx) {
  return blocks.map((block) => renderBlock(block, ctx)).join('\n');
}

function renderParagraph(block, ctx) {
  const lines = block.lines;
  const meta = lines.length > 1 && lines.every((line) => /^\*\*[^*]+:\*\*/.test(line));
  if (meta) return `<p>${lines.map((line) => ctx.inline(line)).join('<br>')}</p>`;
  return `<p>${ctx.inline(lines.join(' '))}</p>`;
}

function renderBlock(block, ctx) {
  switch (block.type) {
    case 'heading': {
      const level = block.level;
      const classes = [block.first ? 'lead' : ''].filter(Boolean).join(' ');
      return `<h${level} id="${block.id}"${classes ? ` class="${classes}"` : ''}>${ctx.inline(block.text)}</h${level}>`;
    }
    case 'paragraph':
      return renderParagraph(block, ctx);
    case 'hr':
      return '<hr>';
    case 'figure': {
      const alt = plainText(block.alt);
      return `<figure><img src="${imageDataUri(ctx.baseDir, block.src)}" alt="${escapeHtml(alt)}"><figcaption>${ctx.inline(block.alt)}</figcaption></figure>`;
    }
    case 'code': {
      const lang = block.lang ? ` data-lang="${escapeHtml(block.lang)}"` : '';
      return `<pre${lang}><code>${escapeHtml(block.text)}</code></pre>`;
    }
    case 'table': {
      const head = block.header
        .map((cell, index) => `<th class="ta-${block.aligns[index] || 'left'}">${ctx.inline(cell)}</th>`)
        .join('');
      const body = block.rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell, index) =>
                  `<td class="ta-${block.aligns[index] || 'left'}">${ctx.inline(cell)}</td>`,
              )
              .join('')}</tr>`,
        )
        .join('');
      return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }
    case 'quote':
      return `<blockquote>${renderBlocks(block.blocks, ctx)}</blockquote>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const start = block.ordered && block.start !== 1 ? ` start="${block.start}"` : '';
      const items = block.items
        .map((item) => {
          if (item.length === 1 && item[0].type === 'paragraph') {
            return `<li>${ctx.inline(item[0].lines.join(' '))}</li>`;
          }
          return `<li>${renderBlocks(item, ctx)}</li>`;
        })
        .join('');
      return `<${tag}${start}>${items}</${tag}>`;
    }
    default:
      throw new Error(`bloco desconhecido: ${block.type}`);
  }
}

function collectHeadings(blocks, into) {
  for (const block of blocks) {
    if (block.type === 'heading') into.push(block);
    if (block.type === 'quote') collectHeadings(block.blocks, into);
  }
  return into;
}

/* -------------------------------------------------------------- documento */

const ids = new Set();
const parsed = DOCS.map((doc) => {
  const rel = doc.file;
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) throw new Error(`documento em falta: ${rel}`);
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  // Cada documento tem o seu proprio contador de h1: o primeiro titulo de cada
  // ficheiro e o titulo do capitulo, os seguintes abrem pagina nova.
  const blocks = parseBlocks(source.split('\n'), { ids, h1: 0 });
  return { ...doc, rel, file, baseDir: path.dirname(file), blocks };
});

const links = new Map();
for (const doc of parsed) {
  const headings = collectHeadings(doc.blocks, []);
  const main = headings.find((heading) => heading.level === 1) || headings[0];
  if (!main) continue;
  links.set(doc.rel.replace(/\\/g, '/'), main.id);
  links.set(path.basename(doc.rel), main.id);
}
links.set('LICENSE', 'licenca-mit');

function renderDoc(doc, index) {
  const ctx = {
    links,
    baseDir: doc.baseDir,
    inline: makeInline({ links, baseDir: doc.baseDir }),
  };
  const body = renderBlocks(doc.blocks, ctx);

  return `<section class="doc" id="doc-${index + 1}">
  <div class="chapter-tag">
    <span>${index + 1}. ${escapeHtml(doc.label)}</span>
    <span class="chapter-path">${escapeHtml(doc.rel)}</span>
  </div>
  ${body}
</section>`;
}

function buildToc() {
  const rows = [];
  let chapter = 0;
  for (const doc of parsed) {
    const headings = collectHeadings(doc.blocks, []);
    let isFirst = true;
    for (const heading of headings) {
      if (heading.level === 1) {
        const number = isFirst ? `${++chapter}.` : '';
        rows.push(
          `<div class="toc-row lvl1"><span class="toc-num">${number}</span><a href="#${heading.id}">${makeInline({ links, baseDir: doc.baseDir })(heading.text)}</a></div>`,
        );
        isFirst = false;
      } else if (heading.level === 2) {
        rows.push(
          `<div class="toc-row lvl2"><a href="#${heading.id}">${makeInline({ links, baseDir: doc.baseDir })(heading.text)}</a></div>`,
        );
      }
    }
  }
  rows.push(
    '<div class="toc-row lvl1"><span class="toc-num">A.</span><a href="#licenca-mit">Licença MIT</a></div>',
  );
  return rows.join('\n');
}

function cover() {
  const logo = imageDataUri(root, 'public/icon-512.png');
  return `<section class="cover">
  <div class="cover-top">
    <div class="cover-brand">ALDACO</div>
    <img class="cover-logo" src="${logo}" alt="Ícone do Hangar AI Cockpit">
    <div class="cover-title">Hangar <span>AI Cockpit</span></div>
    <p class="cover-subtitle">${SUBTITLE}</p>
    <p class="cover-lead">Apresentação, funcionalidades, privacidade, licenciamento, publicação na Microsoft Store, ficha da loja e winget.</p>
  </div>
  <div class="cover-meta">
    <div><span class="meta-label">Versão</span><span class="meta-value">${pkg.version}</span></div>
    <div><span class="meta-label">Data</span><span class="meta-value">${STAMP}</span></div>
    <div><span class="meta-label">Idioma</span><span class="meta-value">pt-PT</span></div>
  </div>
  <div class="cover-foot">
    <p>ALDACO &mdash; Alexandre da Costa</p>
    <p>Código sob licença MIT &middot; sem conta, sem telemetria</p>
    <p class="cover-url">${repoUrl}</p>
  </div>
</section>`;
}

const licenseFile = path.join(root, 'LICENSE');
const license = fs.existsSync(licenseFile)
  ? fs.readFileSync(licenseFile, 'utf8').replace(/\r\n?/g, '\n').trim()
  : '';

const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<title>${TITLE} &mdash; ${SUBTITLE} ${pkg.version}</title>
<meta name="author" content="ALDACO - Alexandre da Costa">
<meta name="description" content="${SUBTITLE} do Hangar AI Cockpit ${pkg.version}">
<style>${styles()}</style>
</head>
<body>
${cover()}
<section class="toc">
  <div class="toc-title">Conteúdo</div>
  <div class="toc-list">
${buildToc()}
  </div>
  <div class="colophon">
    <p><strong>Sobre esta compilação.</strong> Os capítulos seguintes são os documentos oficiais do projeto, lidos diretamente do repositório e reunidos sem alterar o texto. As ligações entre documentos apontam para as secções correspondentes neste PDF.</p>
    <p>Para regenerar o ficheiro: <code>npm run docs:pdf</code>. Os valores de versão, identidade de pacote e hashes acompanham o estado do repositório na data indicada na capa.</p>
  </div>
</section>
${parsed.map(renderDoc).join('\n')}
<section class="doc appendix" id="apendice-licenca">
  <div class="chapter-tag">
    <span>Apêndice. Licença MIT</span>
    <span class="chapter-path">LICENSE</span>
  </div>
  <h1 id="licenca-mit" class="lead">Licença MIT</h1>
  <pre class="license"><code>${escapeHtml(license)}</code></pre>
</section>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');

const images = (html.match(/data:image\//g) || []).length;
console.log(`HTML:   ${outFile}`);
console.log(`Tamanho: ${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Capítulos: ${parsed.length + 1} (inclui apêndice) | imagens embutidas: ${images}`);

function styles() {
  return `
:root {
  --ink: #1d2330;
  --muted: #5f6779;
  --faint: #8b93a5;
  --line: #e3e6ec;
  --panel: #f5f6f8;
  --accent: #4f7cff;
  --navy: #111c30;
  --danger: #e5484d;
}
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  font-family: "Segoe UI", "Segoe UI Variable Text", system-ui, sans-serif;
  font-size: 10.2pt;
  line-height: 1.55;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
p { margin: 0 0 7pt; }
strong { font-weight: 600; }
a { color: #2a5bd7; text-decoration: none; }
code, pre, kbd {
  font-family: "Cascadia Mono", "Cascadia Code", Consolas, "Courier New", monospace;
}
code {
  font-size: 0.87em;
  background: #eef1f7;
  border-radius: 3px;
  padding: 0.6pt 3pt;
  overflow-wrap: anywhere;
}
pre {
  margin: 7pt 0 10pt;
  padding: 8pt 10pt;
  background: #14171d;
  color: #e6e9f0;
  border-radius: 5px;
  font-size: 8.1pt;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  break-inside: avoid;
}
pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
pre[data-lang]::before {
  content: attr(data-lang);
  display: block;
  font-family: "Segoe UI", sans-serif;
  font-size: 7pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7f8aa3;
  margin-bottom: 4pt;
}
h1, h2, h3, h4 {
  font-weight: 600;
  line-height: 1.25;
  break-after: avoid;
}
h1 {
  font-size: 21pt;
  letter-spacing: -0.01em;
  margin: 2pt 0 10pt;
}
h2 {
  font-size: 13.2pt;
  margin: 17pt 0 7pt;
  padding-bottom: 3pt;
  border-bottom: 1px solid var(--line);
}
h3 {
  font-size: 11pt;
  margin: 13pt 0 5pt;
  color: #2b3347;
}
h4 { font-size: 10.2pt; margin: 11pt 0 4pt; }
ul, ol { margin: 2pt 0 9pt; padding-left: 17pt; }
li { margin: 0 0 2.5pt; }
li > p { margin: 0 0 4pt; }
li > ul, li > ol { margin-top: 3pt; }
li::marker { color: var(--muted); }
blockquote {
  margin: 8pt 0 10pt;
  padding: 7pt 11pt 1pt;
  border-left: 3px solid var(--accent);
  background: var(--panel);
  border-radius: 0 4px 4px 0;
}
blockquote p:last-child { margin-bottom: 6pt; }
blockquote h4 { margin-top: 2pt; }
hr { border: 0; border-top: 1px solid var(--line); margin: 14pt 0; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 6pt 0 11pt;
  font-size: 8.8pt;
  line-height: 1.4;
  break-inside: avoid;
}
thead { display: table-header-group; }
th {
  text-align: left;
  background: var(--panel);
  border-bottom: 1.2pt solid #ccd2de;
  padding: 4pt 6pt;
  font-weight: 600;
}
td { padding: 4pt 6pt; border-bottom: 1px solid var(--line); vertical-align: top; }
tbody tr:nth-child(even) td { background: #fbfcfd; }
.ta-center { text-align: center; }
.ta-right { text-align: right; }
figure {
  margin: 8pt 0 12pt;
  break-inside: avoid;
}
figure img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: 5px;
}
figcaption {
  margin-top: 4pt;
  font-size: 8.4pt;
  color: var(--faint);
}
/* capa */
.cover {
  break-after: page;
  height: 251mm;
  padding: 20mm 16mm 16mm;
  border-radius: 10px;
  background: linear-gradient(160deg, #16233a 0%, #111c30 45%, #0b1220 100%);
  color: #f4f6fb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.cover-brand {
  font-size: 8.6pt;
  letter-spacing: 0.24em;
  color: #93a3c0;
  text-transform: uppercase;
  margin-bottom: 18mm;
}
.cover-logo {
  width: 27mm;
  height: 27mm;
  border-radius: 7mm;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  margin-bottom: 11mm;
}
.cover-title {
  font-size: 37pt;
  font-weight: 600;
  line-height: 1.02;
  margin: 0 0 4mm;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.cover-title span { color: #8fb0ff; }
.cover-subtitle {
  font-size: 15pt;
  color: #c4cee2;
  margin: 0 0 8mm;
}
.cover-lead {
  font-size: 10.4pt;
  line-height: 1.6;
  color: #9aa8c2;
  max-width: 118mm;
  margin: 0;
}
.cover-meta {
  display: flex;
  gap: 12mm;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  padding: 7mm 0;
  margin-top: 12mm;
}
.cover-meta div { display: flex; flex-direction: column; gap: 1.5mm; }
.meta-label {
  font-size: 7.4pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7f90ad;
}
.meta-value { font-size: 12.5pt; color: #ffffff; }
.cover-foot p { margin: 0 0 1.5mm; font-size: 9.2pt; color: #9aa8c2; }
.cover-foot p:first-child { color: #e8edf7; font-size: 10.4pt; }
.cover-url { font-family: "Cascadia Mono", Consolas, monospace; font-size: 8.2pt; color: #8fb0ff; }
/* indice */
.toc { break-after: page; }
.toc-title {
  font-size: 21pt;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin: 2pt 0 12pt;
}
.toc-list { column-count: 2; column-gap: 12mm; }
.toc-row { break-inside: avoid; margin: 0 0 2.4pt; font-size: 9.4pt; }
.toc-row a { color: var(--ink); }
.toc-row.lvl1 {
  margin-top: 8pt;
  font-size: 10.2pt;
  font-weight: 600;
  display: flex;
  gap: 5pt;
}
.toc-row.lvl1:first-child { margin-top: 0; }
.toc-num { min-width: 12pt; color: var(--accent); }
.toc-row.lvl2 { padding-left: 17pt; color: var(--muted); }
.toc-row.lvl2 a { color: var(--muted); }
.colophon {
  margin-top: 14pt;
  padding-top: 10pt;
  border-top: 1px solid var(--line);
  font-size: 8.8pt;
  color: var(--muted);
  break-inside: avoid;
}
.colophon p { margin-bottom: 5pt; }
/* capitulos */
.doc { break-before: page; }
.chapter-tag {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 8pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  border-bottom: 1.4pt solid var(--accent);
  padding-bottom: 3pt;
  margin-bottom: 10pt;
  break-after: avoid;
}
.chapter-path {
  font-family: "Cascadia Mono", Consolas, monospace;
  letter-spacing: 0;
  text-transform: none;
  color: var(--faint);
}
.doc h1 { margin-top: 4pt; }
.doc h1:not(.lead) { break-before: page; }
.appendix pre.license { font-size: 8.6pt; line-height: 1.5; }
`;
}
