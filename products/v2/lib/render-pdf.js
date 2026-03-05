// =============================================================
// render-pdf.js — Puppeteer HTML → PDF + coordinate extraction
// Stage 1 of the two-stage pipeline
// =============================================================

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { toCssVars } = require('./colours');

// US Letter at 96 DPI (CSS pixels)
const PAGE_W = 816;
const PAGE_H = 1056;

// Conversion: CSS px → PDF points
const SCALE = 72 / 96; // 0.75
const PDF_W = 612;
const PDF_H = 792;

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Read an HTML template file and extract the .page div innerHTML
 * @param {string} filename - HTML file in templates/
 * @returns {string} HTML content of the .page div
 */
function readPageContent(filename) {
  const html = fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf-8');
  // Extract content inside <div class="page ...">...</div>
  // We grab the entire .page div including its class for proper styling
  const match = html.match(/<div class="page[^"]*"[\s\S]*$/);
  if (!match) throw new Error(`No .page div found in ${filename}`);
  // Remove the closing </body></html> tags
  let content = match[0].replace(/<\/body>\s*<\/html>\s*$/, '').trim();
  return content;
}

/**
 * Build the full HTML document from page fragments
 * @param {object} opts
 * @param {string} opts.templateFile - Main template HTML (e.g., 'invoice.html')
 * @param {string} opts.colourScheme - Colour scheme name (navy/forest/terracotta/charcoal)
 * @param {string} opts.docType - Document type display name (e.g., 'Invoice')
 * @param {string} opts.docTypeLC - Lowercase doc type (e.g., 'invoice')
 * @returns {string} Complete HTML document
 */
function buildDocument(opts) {
  const { templateFile, colourScheme, docType, docTypeLC } = opts;

  // Read the CSS file
  const cssContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'styles.css'), 'utf-8');

  // Read page fragments
  let howToUse = readPageContent('how-to-use.html');
  let terms = readPageContent('terms.html');
  let thankYou = readPageContent('thank-you.html');
  const template = readPageContent(templateFile);

  // Inject docType placeholders
  const replacePlaceholders = (html) => html
    .replace(/\{\{docType\}\}/g, docType)
    .replace(/\{\{docTypeLC\}\}/g, docTypeLC);

  howToUse = replacePlaceholders(howToUse);
  terms = replacePlaceholders(terms);
  thankYou = replacePlaceholders(thankYou);

  // Generate colour overrides
  const colourCss = toCssVars(colourScheme);

  // Build font-face with absolute paths for reliable loading
  const fontsDir = path.join(TEMPLATES_DIR, 'fonts').replace(/\\/g, '/');
  const fontFaceCss = `
    @font-face { font-family: 'Inter'; font-weight: 300; font-style: normal; src: url('file:///${fontsDir}/Inter-Light.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 400; font-style: normal; src: url('file:///${fontsDir}/Inter-Regular.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 500; font-style: normal; src: url('file:///${fontsDir}/Inter-Medium.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 600; font-style: normal; src: url('file:///${fontsDir}/Inter-Bold.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 700; font-style: normal; src: url('file:///${fontsDir}/Inter-Bold.ttf') format('truetype'); }
  `;

  // Strip @font-face from the CSS file (we're replacing with absolute paths)
  const cssWithoutFonts = cssContent.replace(/@font-face\s*\{[^}]+\}/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${PAGE_W}">
  <style>${fontFaceCss}</style>
  <style>${cssWithoutFonts}</style>
  <style>${colourCss}</style>
</head>
<body>
  ${howToUse}
  ${template}
  ${terms}
  ${thankYou}
</body>
</html>`;
}

/**
 * Extract field coordinates from the rendered page
 * Converts CSS pixel positions to PDF point positions
 * @param {import('puppeteer').Page} page
 * @returns {Promise<Object>} fieldMap: { fieldName: { x, y, width, height, pageIndex } }
 */
async function extractFieldCoordinates(page) {
  const fields = await page.evaluate((pageHeight) => {
    const elements = document.querySelectorAll('[data-field]');
    const results = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      results.push({
        name: el.getAttribute('data-field'),
        fieldType: el.getAttribute('data-field-type') || 'text',
        cssX: rect.x,
        cssY: rect.y,
        cssW: rect.width,
        cssH: rect.height,
      });
    }
    return results;
  }, PAGE_H);

  const fieldMap = {};
  for (const f of fields) {
    // Determine which page this field is on (0-indexed)
    const pageIndex = Math.floor(f.cssY / PAGE_H);
    // Y position within the page (CSS pixels from top of this page)
    const yInPage = f.cssY - (pageIndex * PAGE_H);

    // Convert to PDF coordinates (points, origin at bottom-left)
    const pdfX = f.cssX * SCALE;
    const pdfY = PDF_H - (yInPage + f.cssH) * SCALE;
    const pdfW = f.cssW * SCALE;
    const pdfH = f.cssH * SCALE;

    fieldMap[f.name] = {
      x: Math.round(pdfX * 100) / 100,
      y: Math.round(pdfY * 100) / 100,
      width: Math.round(pdfW * 100) / 100,
      height: Math.round(pdfH * 100) / 100,
      pageIndex,
      fieldType: f.fieldType,
    };
  }

  return fieldMap;
}

/**
 * Render HTML templates to PDF and extract field coordinates
 * @param {object} opts
 * @param {string} opts.templateFile - Main template HTML filename
 * @param {string} opts.colourScheme - Colour scheme key
 * @param {string} opts.docType - Display name ('Invoice', 'Quote', 'Receipt')
 * @param {string} opts.docTypeLC - Lowercase ('invoice', 'quote', 'receipt')
 * @param {import('puppeteer').Browser} [opts.browser] - Reuse existing browser instance
 * @returns {Promise<{ pdfBuffer: Buffer, fieldMap: Object }>}
 */
async function renderPdf(opts) {
  const { templateFile, colourScheme, docType, docTypeLC } = opts;
  const ownBrowser = !opts.browser;
  const browser = opts.browser || await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--font-render-hinting=none',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: PAGE_W, height: PAGE_H });

    // Build the full HTML document
    const html = buildDocument({ templateFile, colourScheme, docType, docTypeLC });

    // Load content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Extract field coordinates before rendering to PDF
    const fieldMap = await extractFieldCoordinates(page);

    // Render to PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.close();

    return { pdfBuffer: Buffer.from(pdfBuffer), fieldMap };
  } finally {
    if (ownBrowser) await browser.close();
  }
}

module.exports = { renderPdf, buildDocument, extractFieldCoordinates, PAGE_W, PAGE_H, PDF_W, PDF_H, SCALE };
