// =============================================================
// generate-invoice-v2.js — Invoice PDF Generator (v2 pipeline)
// HTML/CSS → Puppeteer → pdf-lib two-stage pipeline
// =============================================================

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { renderPdf } = require('./lib/render-pdf');
const { addFields } = require('./lib/add-fields');
const { COLOUR_SCHEMES } = require('./lib/colours');
const { FIELD_DEFS } = require('./lib/field-definitions');

const OUTPUT_DIR = path.join(__dirname, 'output');

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const { fields, co } = FIELD_DEFS.invoice;
  const schemes = Object.keys(COLOUR_SCHEMES);

  console.log(`\n  Invoice Template Generator v2`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Generating ${schemes.length} colour variants...\n`);

  // Launch browser once, reuse for all variants
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--font-render-hinting=none',
    ],
  });

  try {
    for (const schemeName of schemes) {
      const scheme = COLOUR_SCHEMES[schemeName];
      const label = scheme.name;
      process.stdout.write(`  [${label}] Rendering HTML → PDF...`);

      // Stage 1: Render HTML to visual PDF + extract coordinates
      const { pdfBuffer, fieldMap } = await renderPdf({
        templateFile: 'invoice.html',
        colourScheme: schemeName,
        docType: 'Invoice',
        docTypeLC: 'invoice',
        browser,
      });

      process.stdout.write(' fields...');

      // Stage 2: Overlay form fields + JS + CO array
      const finalPdf = await addFields({
        pdfBuffer,
        fieldMap,
        fieldDefs: fields,
        coOrder: co,
        colours: scheme.pdfLib,
      });

      // Write output
      const filename = `Invoice-Template-${label.replace(/\s+/g, '-')}.pdf`;
      const outPath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(outPath, finalPdf);

      const sizeMB = (finalPdf.length / 1024 / 1024).toFixed(2);
      const fieldCount = Object.keys(fieldMap).filter(k => fields.some(f => f.name === k)).length;
      console.log(` done → ${filename} (${sizeMB} MB, ${fieldCount} fields)`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n  All invoice PDFs saved to: ${OUTPUT_DIR}\n`);
}

main().catch(err => {
  console.error('\n  ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
