// Isolate: does embedPage break the polling JS?
// Test E: Pure pdf-lib + polling (same as test-doclevel that worked)
// Test F: embedPage + polling (simulates the invoice pipeline)
// Test G: Direct load + polling (no embedPage, just load and add fields)

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');

const POLL_JS = `
function _recalc() {
  try {
    var event = {value: ""};
    var q=this.getField("qty").value;var r=this.getField("rate").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""};
    var _f = this.getField("amount");
    if (_f && _f.value != event.value) _f.value = event.value;
  } catch(e) {}
}
_recalc();
app.setInterval("_recalc()", 400);
`;

function addPollingJs(doc, js) {
  const jsAction = doc.context.obj({});
  jsAction.set(PDFName.of('Type'), PDFName.of('Action'));
  jsAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
  jsAction.set(PDFName.of('JS'), PDFString.of(js));
  const jsRef = doc.context.register(jsAction);

  const jsNameTree = doc.context.obj({});
  jsNameTree.set(PDFName.of('Names'), doc.context.obj([PDFString.of('AutoCalc'), jsRef]));
  const jsNameTreeRef = doc.context.register(jsNameTree);

  let names = doc.catalog.lookup(PDFName.of('Names'));
  if (!names) {
    names = doc.context.obj({});
    doc.catalog.set(PDFName.of('Names'), doc.context.register(names));
    names = doc.catalog.lookup(PDFName.of('Names'));
  }
  names.set(PDFName.of('JavaScript'), jsNameTreeRef);
}

function addFieldsToPage(form, page, font) {
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
}

async function testE() {
  console.log('Test E: Pure pdf-lib + polling (should work like test-doclevel)...');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  page.drawText('Test E: Pure pdf-lib + polling', { x: 50, y: 700, size: 14, font });
  page.drawText('Qty:', { x: 50, y: 600, size: 12, font });
  page.drawText('Rate:', { x: 200, y: 600, size: 12, font });
  page.drawText('Amount:', { x: 350, y: 600, size: 12, font });

  addFieldsToPage(doc.getForm(), page, font);
  addPollingJs(doc, POLL_JS);

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-E-pure-poll.pdf', await doc.save());
  console.log('  → output/test-E-pure-poll.pdf');
}

async function testF() {
  console.log('Test F: embedPage + polling (simulates invoice pipeline)...');

  // Step 1: Create a "visual" PDF (simulating Puppeteer output)
  const srcDoc = await PDFDocument.create();
  const srcPage = srcDoc.addPage([612, 792]);
  const srcFont = await srcDoc.embedFont(StandardFonts.Helvetica);
  srcPage.drawText('Test F: embedPage + polling', { x: 50, y: 700, size: 14, font: srcFont });
  srcPage.drawText('Qty:', { x: 50, y: 600, size: 12, font: srcFont });
  srcPage.drawText('Rate:', { x: 200, y: 600, size: 12, font: srcFont });
  srcPage.drawText('Amount:', { x: 350, y: 600, size: 12, font: srcFont });
  const srcBytes = await srcDoc.save();

  // Step 2: Load and embedPage onto fresh doc (same as add-fields.js)
  const visualDoc = await PDFDocument.load(srcBytes);
  const doc = await PDFDocument.create();
  const embedded = await doc.embedPage(visualDoc.getPages()[0]);
  const page = doc.addPage([612, 792]);
  page.drawPage(embedded);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  addFieldsToPage(doc.getForm(), page, font);
  addPollingJs(doc, POLL_JS);

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-F-embed-poll.pdf', await doc.save());
  console.log('  → output/test-F-embed-poll.pdf');
}

async function testG() {
  console.log('Test G: Direct load + polling (no embedPage)...');

  // Step 1: Create a "visual" PDF
  const srcDoc = await PDFDocument.create();
  const srcPage = srcDoc.addPage([612, 792]);
  const srcFont = await srcDoc.embedFont(StandardFonts.Helvetica);
  srcPage.drawText('Test G: Direct load + polling', { x: 50, y: 700, size: 14, font: srcFont });
  srcPage.drawText('Qty:', { x: 50, y: 600, size: 12, font: srcFont });
  srcPage.drawText('Rate:', { x: 200, y: 600, size: 12, font: srcFont });
  srcPage.drawText('Amount:', { x: 350, y: 600, size: 12, font: srcFont });
  const srcBytes = await srcDoc.save();

  // Step 2: Load directly (no embedPage, no fresh doc)
  const doc = await PDFDocument.load(srcBytes);
  const page = doc.getPages()[0];

  const font = await doc.embedFont(StandardFonts.Helvetica);
  addFieldsToPage(doc.getForm(), page, font);
  addPollingJs(doc, POLL_JS);

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  fs.writeFileSync('output/test-G-direct-poll.pdf', await doc.save());
  console.log('  → output/test-G-direct-poll.pdf');
}

(async () => {
  await testE();
  await testF();
  await testG();
  console.log('\nDone! Open each and test qty*rate=amount:');
  console.log('  E = pure pdf-lib (control — should work)');
  console.log('  F = embedPage pipeline (does this break it?)');
  console.log('  G = direct load (alternative to embedPage)');
})();
