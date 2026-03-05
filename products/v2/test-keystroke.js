// Test: Use AA/K (Keystroke) actions on INPUT fields instead of AA/C (Calculate) on OUTPUT fields
// This bypasses the Calculate trigger entirely — proven broken in our environment

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');

// Approach: When user types in qty or rate, a Keystroke action on that field
// reads both values and writes the result to amount
const KEYSTROKE_JS = `
var q = this.getField("qty").value;
var r = this.getField("rate").value;
if (q && r && !isNaN(q) && !isNaN(r)) {
  this.getField("amount").value = (Number(q) * Number(r)).toFixed(2);
} else {
  this.getField("amount").value = "";
}
`;

async function testKeystroke() {
  console.log('Test: Keystroke (AA/K) actions on input fields...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: Keystroke Actions', { x: 50, y: 700, size: 16, font });
  page.drawText('Type numbers in Qty and Rate — Amount should auto-calc', { x: 50, y: 670, size: 10, font });
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

  // Put Keystroke action on BOTH input fields (qty and rate)
  const ksAction = doc.context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFString.of(KEYSTROKE_JS),
  });

  // AA/K = Keystroke action (fires on every keystroke in the field)
  qty.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ K: ksAction }));
  rate.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ K: ksAction }));

  // No CO array needed — we're not using Calculate events

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-keystroke.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

async function testValidate() {
  console.log('Test: Validate (AA/V) actions on input fields...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: Validate Actions', { x: 50, y: 700, size: 16, font });
  page.drawText('Type numbers in Qty and Rate, then click/tab out — Amount should auto-calc', { x: 50, y: 670, size: 10, font });
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

  // AA/V = Validate action (fires when field loses focus / value is committed)
  const valAction = doc.context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFString.of(KEYSTROKE_JS),
  });

  qty.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ V: valAction }));
  rate.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ V: valAction }));

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-validate.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

async function testBlur() {
  console.log('Test: OnBlur (AA/Bl) actions on input fields...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: OnBlur Actions', { x: 50, y: 700, size: 16, font });
  page.drawText('Type numbers in Qty and Rate, click away — Amount should auto-calc', { x: 50, y: 670, size: 10, font });
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

  // AA/Bl = OnBlur action (fires when field loses focus)
  const blurAction = doc.context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFString.of(KEYSTROKE_JS),
  });

  qty.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ Bl: blurAction }));
  rate.acroField.dict.set(PDFName.of('AA'), doc.context.obj({ Bl: blurAction }));

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-blur.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

async function testSetAction() {
  console.log('Test: OpenAction setAction approach...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: setAction via OpenAction', { x: 50, y: 700, size: 16, font });
  page.drawText('Type numbers in Qty and Rate — Amount should auto-calc', { x: 50, y: 670, size: 10, font });
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

  // Use OpenAction to call setAction on the amount field via Acrobat's own API
  // This lets Acrobat register the Calculate action through its own mechanism
  const calcBody = 'var q=this.getField(\\\"qty\\\").value;var r=this.getField(\\\"rate\\\").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=\\\"\\\"}';
  const setupJs = 'var calcJS = "' + calcBody + '"; this.getField("amount").setAction("Calculate", calcJS);';

  const openAction = doc.context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFString.of(setupJs),
  });
  doc.catalog.set(PDFName.of('OpenAction'), openAction);

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-setaction.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

(async () => {
  await testKeystroke();
  await testValidate();
  await testBlur();
  await testSetAction();
  console.log('\nDone! Open each in Adobe Acrobat and test:');
  console.log('  1. test-keystroke.pdf — fires on every key press');
  console.log('  2. test-validate.pdf — fires when value committed (tab/click out)');
  console.log('  3. test-blur.pdf — fires when field loses focus');
  console.log('  4. test-setaction.pdf — uses Acrobat setAction API via OpenAction');
})();
