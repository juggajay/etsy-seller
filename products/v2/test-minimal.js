// Minimal test: 3 fields (qty, rate, amount) with auto-calc
// Test A: Pure pdf-lib (should work like v1)
// Test B: Puppeteer page + embedPage + fields (v2 approach)
// Test C: Puppeteer page + copyPages + fields

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require('pdf-lib');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const JS = 'var q=this.getField("qty").value;var r=this.getField("rate").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}';

async function testA() {
  console.log('Test A: Pure pdf-lib...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test A: Pure pdf-lib', { x: 50, y: 700, size: 16, font });
  page.drawText('Qty:', { x: 50, y: 600, size: 12, font });
  page.drawText('Rate:', { x: 200, y: 600, size: 12, font });
  page.drawText('Amount:', { x: 350, y: 600, size: 12, font });

  const qty = form.createTextField('qty');
  qty.addToPage(page, { x: 50, y: 560, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  qty.setFontSize(12);

  const rate = form.createTextField('rate');
  rate.addToPage(page, { x: 200, y: 560, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  rate.setFontSize(12);

  const amount = form.createTextField('amount');
  amount.addToPage(page, { x: 350, y: 560, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0), backgroundColor: rgb(0.95, 0.95, 0.95) });
  amount.setFontSize(12);
  amount.enableReadOnly();

  form.updateFieldAppearances(font);

  // Inject JS
  const jsAction = doc.context.obj({ Type: 'Action', S: 'JavaScript', JS: PDFString.of(JS) });
  amount.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ C: jsAction }));

  // CO array
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-A-pure.pdf', await doc.save());
  console.log('  → output/test-A-pure.pdf');
}

async function testB() {
  console.log('Test B: embedPage approach...');

  // Render a simple page with Puppeteer
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const bPage = await browser.newPage();
  await bPage.setViewport({ width: 816, height: 1056 });
  await bPage.setContent(`<html><body style="margin:0;padding:50px;font-family:sans-serif;">
    <h1 style="color:#1b365d;">Test B: embedPage</h1>
    <p>Qty, Rate, Amount fields with auto-calc JS</p>
    <div style="margin-top:200px;height:30px;width:100px;display:inline-block;" data-field="qty"></div>
    <div style="height:30px;width:100px;display:inline-block;" data-field="rate"></div>
    <div style="height:30px;width:100px;display:inline-block;" data-field="amount"></div>
  </body></html>`, { waitUntil: 'networkidle0' });
  const pdfBuf = await bPage.pdf({ format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();

  // Create fresh doc, embed Puppeteer page
  const visualDoc = await PDFDocument.load(pdfBuf);
  const doc = await PDFDocument.create();
  const embedded = await doc.embedPage(visualDoc.getPages()[0]);
  const page = doc.addPage([612, 792]);
  page.drawPage(embedded);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  const qty = form.createTextField('qty');
  qty.addToPage(page, { x: 50, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  qty.setFontSize(12);

  const rate = form.createTextField('rate');
  rate.addToPage(page, { x: 200, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  rate.setFontSize(12);

  const amount = form.createTextField('amount');
  amount.addToPage(page, { x: 350, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0), backgroundColor: rgb(0.95, 0.95, 0.95) });
  amount.setFontSize(12);
  amount.enableReadOnly();

  form.updateFieldAppearances(font);

  const jsAction = doc.context.obj({ Type: 'Action', S: 'JavaScript', JS: PDFString.of(JS) });
  amount.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ C: jsAction }));

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-B-embed.pdf', await doc.save());
  console.log('  → output/test-B-embed.pdf');
}

async function testC() {
  console.log('Test C: copyPages approach...');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const bPage = await browser.newPage();
  await bPage.setViewport({ width: 816, height: 1056 });
  await bPage.setContent(`<html><body style="margin:0;padding:50px;font-family:sans-serif;">
    <h1 style="color:#1b365d;">Test C: copyPages</h1>
    <p>Qty, Rate, Amount fields with auto-calc JS</p>
  </body></html>`, { waitUntil: 'networkidle0' });
  const pdfBuf = await bPage.pdf({ format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();

  const visualDoc = await PDFDocument.load(pdfBuf);
  const doc = await PDFDocument.create();
  const [copied] = await doc.copyPages(visualDoc, [0]);
  doc.addPage(copied);
  const page = doc.getPages()[0];

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  const qty = form.createTextField('qty');
  qty.addToPage(page, { x: 50, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  qty.setFontSize(12);

  const rate = form.createTextField('rate');
  rate.addToPage(page, { x: 200, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  rate.setFontSize(12);

  const amount = form.createTextField('amount');
  amount.addToPage(page, { x: 350, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0), backgroundColor: rgb(0.95, 0.95, 0.95) });
  amount.setFontSize(12);
  amount.enableReadOnly();

  form.updateFieldAppearances(font);

  const jsAction = doc.context.obj({ Type: 'Action', S: 'JavaScript', JS: PDFString.of(JS) });
  amount.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ C: jsAction }));

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-C-copy.pdf', await doc.save());
  console.log('  → output/test-C-copy.pdf');
}

async function testD() {
  console.log('Test D: Load Puppeteer PDF directly (no fresh doc)...');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const bPage = await browser.newPage();
  await bPage.setViewport({ width: 816, height: 1056 });
  await bPage.setContent(`<html><body style="margin:0;padding:50px;font-family:sans-serif;">
    <h1 style="color:#1b365d;">Test D: Direct load</h1>
    <p>Qty, Rate, Amount fields with auto-calc JS</p>
  </body></html>`, { waitUntil: 'networkidle0' });
  const pdfBuf = await bPage.pdf({ format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();

  // Load directly — no fresh doc
  const doc = await PDFDocument.load(pdfBuf);
  const page = doc.getPages()[0];

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  const qty = form.createTextField('qty');
  qty.addToPage(page, { x: 50, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  qty.setFontSize(12);

  const rate = form.createTextField('rate');
  rate.addToPage(page, { x: 200, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0) });
  rate.setFontSize(12);

  const amount = form.createTextField('amount');
  amount.addToPage(page, { x: 350, y: 400, width: 100, height: 25, borderWidth: 1, borderColor: rgb(0, 0, 0), backgroundColor: rgb(0.95, 0.95, 0.95) });
  amount.setFontSize(12);
  amount.enableReadOnly();

  form.updateFieldAppearances(font);

  const jsAction = doc.context.obj({ Type: 'Action', S: 'JavaScript', JS: PDFString.of(JS) });
  amount.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ C: jsAction }));

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-D-direct.pdf', await doc.save());
  console.log('  → output/test-D-direct.pdf');
}

(async () => {
  await testA();
  await testB();
  await testC();
  await testD();
  console.log('\nDone! Open each in Adobe Acrobat and test qty*rate=amount');
})();
