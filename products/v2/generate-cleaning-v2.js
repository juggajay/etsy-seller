// =============================================================
// generate-cleaning-v2.js — N2 Cleaning Business Invoice Generator
// 3-page PDF: Instructions + Invoice + Quote
// 4 colour variants: Navy, Sage Green, Blush Pink, Charcoal
// =============================================================

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { addFields } = require('./lib/add-fields');
const { CLEANING_COLOURS, toCssVars } = require('./lib/cleaning-colours');
const { CLEANING_FIELD_DEFS } = require('./lib/cleaning-field-definitions');
const { extractFieldCoordinates, PAGE_W, PAGE_H } = require('./lib/render-pdf');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'output', 'niche-invoices', 'N2-cleaning');

// Cleaning-specific CSS additions
const CLEANING_CSS = `
/* --- Cleaning-specific styles --- */

/* Project Details Row */
.project-details {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  align-items: flex-end;
}

.project-field-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.project-field-group:first-child {
  flex: 2;
}

.project-label {
  font-size: 6.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--muted);
}

.project-field {
  height: 20px;
}

.project-field-wide {
  height: 20px;
}

/* Section Labels (SERVICES / SUPPLIES) */
.section-label-row {
  margin-bottom: 0;
}

.section-label-text {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--primary);
  padding: 2px 0;
}

/* Compact table rows for cleaning */
.compact-table {
  margin-bottom: 0;
}

.compact-header {
  height: 26px;
}

.compact-row {
  height: 28px;
}

.compact-row .field-placeholder {
  height: 20px;
}

/* Compact total rows */
.compact-total-row {
  height: 22px;
}

.compact-total-row .total-field {
  height: 18px;
}

/* Bottom grid: schedule + totals side by side */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;
}

/* Service Schedule Box (reuses progress-claim styles) */
.progress-claim-box {
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 10px 12px;
}

.progress-claim-title {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 6px;
}

.claim-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  padding: 0 2px;
}

.claim-label {
  font-size: 8px;
  font-weight: 400;
  color: var(--text);
  white-space: nowrap;
}

.claim-field {
  width: 100px;
  height: 16px;
}
`;

/**
 * Read an HTML template file and extract the .page div innerHTML
 */
function readPageContent(filename) {
  const html = fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf-8');
  const match = html.match(/<div class="page[^"]*"[\s\S]*$/);
  if (!match) throw new Error(`No .page div found in ${filename}`);
  return match[0].replace(/<\/body>\s*<\/html>\s*$/, '').trim();
}

/**
 * Build the full HTML document for cleaning template
 * Pages: How to Use (1) + Invoice (2) + Quote (3)
 */
function buildDocument(colourScheme) {
  const cssContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'styles.css'), 'utf-8');

  const howToUse = readPageContent('cleaning-how-to-use.html');
  const invoice = readPageContent('cleaning-invoice.html');
  const quote = readPageContent('cleaning-quote.html');

  const colourCss = toCssVars(colourScheme);

  // Font-face with absolute paths
  const fontsDir = path.join(TEMPLATES_DIR, 'fonts').replace(/\\/g, '/');
  const fontFaceCss = `
    @font-face { font-family: 'Inter'; font-weight: 300; font-style: normal; src: url('file:///${fontsDir}/Inter-Light.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 400; font-style: normal; src: url('file:///${fontsDir}/Inter-Regular.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 500; font-style: normal; src: url('file:///${fontsDir}/Inter-Medium.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 600; font-style: normal; src: url('file:///${fontsDir}/Inter-Bold.ttf') format('truetype'); }
    @font-face { font-family: 'Inter'; font-weight: 700; font-style: normal; src: url('file:///${fontsDir}/Inter-Bold.ttf') format('truetype'); }
  `;

  const cssWithoutFonts = cssContent.replace(/@font-face\s*\{[^}]+\}/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${PAGE_W}">
  <style>${fontFaceCss}</style>
  <style>${cssWithoutFonts}</style>
  <style>${CLEANING_CSS}</style>
  <style>${colourCss}</style>
</head>
<body>
  ${howToUse}
  ${invoice}
  ${quote}
</body>
</html>`;
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Merge invoice + quote field defs and CO arrays
  const allFields = [
    ...CLEANING_FIELD_DEFS.invoice.fields,
    ...CLEANING_FIELD_DEFS.quote.fields,
  ];
  const allCO = [
    ...CLEANING_FIELD_DEFS.invoice.co,
    ...CLEANING_FIELD_DEFS.quote.co,
  ];

  const schemes = Object.keys(CLEANING_COLOURS);

  console.log(`\n  Cleaning Business Invoice Generator v2`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  3-page PDF: Instructions + Invoice + Quote`);
  console.log(`  Generating ${schemes.length} colour variants...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--font-render-hinting=none',
    ],
  });

  const outputs = [];

  try {
    for (const schemeName of schemes) {
      const scheme = CLEANING_COLOURS[schemeName];
      const label = scheme.name;
      process.stdout.write(`  [${label}] Rendering HTML → PDF...`);

      // Build HTML document
      const html = buildDocument(schemeName);

      // Render with Puppeteer
      const page = await browser.newPage();
      await page.setViewport({ width: PAGE_W, height: PAGE_H });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);

      // Extract field coordinates
      const fieldMap = await extractFieldCoordinates(page);

      // Render to PDF
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await page.close();

      process.stdout.write(' fields...');

      // Stage 2: Overlay form fields + JS
      const finalPdf = await addFields({
        pdfBuffer: Buffer.from(pdfBuffer),
        fieldMap,
        fieldDefs: allFields,
        coOrder: allCO,
        colours: scheme.pdfLib,
      });

      // Write output
      const filename = `Cleaning-Invoice-${label}.pdf`;
      const outPath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(outPath, finalPdf);

      const sizeMB = (finalPdf.length / 1024 / 1024).toFixed(2);
      const fieldCount = Object.keys(fieldMap).filter(k => allFields.some(f => f.name === k)).length;
      console.log(` done → ${filename} (${sizeMB} MB, ${fieldCount} fields)`);

      outputs.push({ filename, size: finalPdf.length });
    }
  } finally {
    await browser.close();
  }

  // Create ZIP bundle
  console.log(`\n  Creating ZIP bundle...`);
  const pdfFiles = outputs.map(o => path.join(OUTPUT_DIR, o.filename));
  const zipPath = path.join(OUTPUT_DIR, 'Cleaning-Invoice-Bundle.zip');

  // Use PowerShell for ZIP (MINGW doesn't have zip)
  const { execSync } = require('child_process');
  const psFiles = pdfFiles.map(f => `'${f.replace(/\\/g, '\\\\')}'`).join(',');
  try {
    // Remove old ZIP if exists
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execSync(
      `powershell -Command "Compress-Archive -Path ${psFiles} -DestinationPath '${zipPath.replace(/\\/g, '\\\\')}'"`,
    );
    const zipSize = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
    console.log(`  → ${path.basename(zipPath)} (${zipSize} MB)`);
  } catch (err) {
    console.error(`  ZIP creation failed: ${err.message}`);
    console.log(`  PDFs are saved individually — ZIP manually if needed.`);
  }

  console.log(`\n  All files saved to: ${OUTPUT_DIR}`);
  console.log(`  Total: ${outputs.length} PDFs + 1 ZIP\n`);
}

main().catch(err => {
  console.error('\n  ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
