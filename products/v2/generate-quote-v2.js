// =============================================================
// generate-quote-v2.js — Quote PDF Generator (v2 pipeline)
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
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const { fields, co } = FIELD_DEFS.quote;
  const schemes = Object.keys(COLOUR_SCHEMES);

  console.log(`\n  Quote Template Generator v2`);
  console.log(`  ───────────────────────────`);
  console.log(`  Generating ${schemes.length} colour variants...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none'],
  });

  try {
    for (const schemeName of schemes) {
      const scheme = COLOUR_SCHEMES[schemeName];
      const label = scheme.name;
      process.stdout.write(`  [${label}] Rendering HTML → PDF...`);

      const { pdfBuffer, fieldMap } = await renderPdf({
        templateFile: 'quote.html',
        colourScheme: schemeName,
        docType: 'Quote',
        docTypeLC: 'quote',
        browser,
      });

      process.stdout.write(' fields...');

      const finalPdf = await addFields({
        pdfBuffer, fieldMap, fieldDefs: fields, coOrder: co, colours: scheme.pdfLib,
      });

      const filename = `Quote-Template-${label.replace(/\s+/g, '-')}.pdf`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), finalPdf);

      const sizeMB = (finalPdf.length / 1024 / 1024).toFixed(2);
      const fieldCount = Object.keys(fieldMap).filter(k => fields.some(f => f.name === k)).length;
      console.log(` done → ${filename} (${sizeMB} MB, ${fieldCount} fields)`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n  All quote PDFs saved to: ${OUTPUT_DIR}\n`);
}

main().catch(err => { console.error('\n  ERROR:', err.message); console.error(err.stack); process.exit(1); });
