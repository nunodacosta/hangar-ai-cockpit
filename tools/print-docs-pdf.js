#!/usr/bin/env node
/**
 * Imprime o HTML compilado por tools/build-docs-pdf.js num PDF A4, com
 * cabeçalho, rodapé numerado e marcadores (outline) gerados a partir dos
 * títulos.
 *
 * Correr com Electron (não com node):
 *   npm run docs:pdf
 *   electron tools/print-docs-pdf.js --html <ficheiro> --out <pdf>
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');
const { PDFDocument, PDFName, PDFDict, PDFHexString } = require('pdf-lib');

const root = path.resolve(__dirname, '..');

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const htmlFile = path.resolve(arg('html', path.join(os.tmpdir(), 'hangar-docs', 'documentacao.html')));
const pdfFile = path.resolve(arg('out', path.join(root, 'docs', 'Hangar_AI_Cockpit_Documentacao.pdf')));
const pkg = require(path.join(root, 'package.json'));

/**
 * O Chromium repete o texto dos títulos que abrem página nos marcadores do PDF
 * (bug do outline em PDF marcado). Aqui o título é normalizado e os metadados
 * do documento são preenchidos; se algo falhar, o PDF original é mantido.
 */
async function tidyPdf(bytes) {
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    const outlines = doc.catalog.get(PDFName.of('Outlines'));
    let fixed = 0;

    const titleOf = (node) => {
      const value = node.get(PDFName.of('Title'));
      if (!value) return null;
      const text = doc.context.lookup(value);
      return text && typeof text.decodeText === 'function' ? text.decodeText() : null;
    };

    const walk = (ref) => {
      let current = ref;
      while (current) {
        const node = doc.context.lookup(current, PDFDict);
        if (!node) break;
        const title = titleOf(node);
        if (title && title.length >= 2 && title.length % 2 === 0) {
          const half = title.slice(0, title.length / 2);
          if (half === title.slice(title.length / 2)) {
            node.set(PDFName.of('Title'), PDFHexString.fromText(half));
            fixed += 1;
          }
        }
        const first = node.get(PDFName.of('First'));
        if (first) walk(first);
        current = node.get(PDFName.of('Next'));
      }
    };

    if (outlines) {
      const root = doc.context.lookup(outlines, PDFDict);
      const first = root && root.get(PDFName.of('First'));
      if (first) walk(first);
    }

    doc.setTitle(`${pkg.build.productName} — Documentação ${pkg.version}`);
    doc.setAuthor('ALDACO — Alexandre da Costa');
    doc.setSubject(`Documentação da aplicação Hangar AI Cockpit ${pkg.version}`);
    doc.setKeywords(['Hangar AI Cockpit', 'ALDACO', 'documentação', 'Microsoft Store', 'winget']);
    doc.setCreator('tools/build-docs-pdf.js');
    doc.setProducer('Electron printToPDF');
    doc.setLanguage('pt-PT');

    return { bytes: Buffer.from(await doc.save()), fixed, pages: doc.getPageCount() };
  } catch (error) {
    console.warn(`Aviso: metadados/marcadores nao atualizados (${error.message})`);
    const pages = (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    return { bytes, fixed: 0, pages };
  }
}

const header = `<div style="width:100%;padding:0 18mm;font-family:'Segoe UI',sans-serif;font-size:8px;color:#8b93a5;display:flex;justify-content:space-between;letter-spacing:0.04em;">
  <span>Hangar AI Cockpit &middot; Documenta&ccedil;&atilde;o</span>
  <span>v${pkg.version}</span>
</div>`;

const footer = `<div style="width:100%;padding:0 18mm;font-family:'Segoe UI',sans-serif;font-size:8px;color:#8b93a5;display:flex;justify-content:space-between;letter-spacing:0.04em;">
  <span>ALDACO &mdash; Alexandre da Costa &middot; MIT</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  if (!fs.existsSync(htmlFile)) {
    console.error(`HTML não encontrado: ${htmlFile}`);
    console.error('Gerar primeiro com: node tools/build-docs-pdf.js');
    app.exit(1);
    return;
  }

  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 1600,
    webPreferences: { sandbox: true, contextIsolation: true, javascript: true },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  try {
    await win.loadFile(htmlFile);
    await win.webContents.executeJavaScript(`
      Promise.all([
        document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
        Promise.all(Array.from(document.images).map((image) =>
          image.complete ? Promise.resolve() : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
        )),
      ]).then(() => true);
    `);

    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      landscape: false,
      displayHeaderFooter: true,
      headerTemplate: header,
      footerTemplate: footer,
      margins: { top: 0.72, bottom: 0.72, left: 0.62, right: 0.62 },
      generateDocumentOutline: true,
      generateTaggedPDF: true,
      preferCSSPageSize: false,
    });

    const final = await tidyPdf(pdf);

    fs.mkdirSync(path.dirname(pdfFile), { recursive: true });
    fs.writeFileSync(pdfFile, final.bytes);

    const pages = final.pages;
    console.log(`PDF:     ${pdfFile}`);
    console.log(`Tamanho: ${(final.bytes.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Páginas: ${pages}`);
    if (final.fixed) console.log(`Marcadores normalizados: ${final.fixed}`);
    app.exit(0);
  } catch (error) {
    console.error(`Falha ao imprimir: ${error && error.message ? error.message : error}`);
    app.exit(1);
  }
});
