// Diagnose: Read back the test PDFs and verify AA dictionaries are actually present
// Then try new approaches: stream-based JS, explicit PDFName construction

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString, PDFStream, PDFArray, PDFDict, PDFRef } = require('pdf-lib');
const fs = require('fs');

async function diagnose(label, filePath) {
  console.log(`\n=== DIAGNOSE: ${label} ===`);
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  for (const field of form.getFields()) {
    const name = field.getName();
    const dict = field.acroField.dict;

    // Check AA
    const aa = dict.get(PDFName.of('AA'));
    if (aa) {
      console.log(`  ${name}: AA present (${aa.constructor.name})`);
      // Try to look up the actual dict
      const aaResolved = dict.lookup(PDFName.of('AA'));
      if (aaResolved) {
        // List all keys in AA
        if (aaResolved.entries) {
          for (const [key, val] of aaResolved.entries()) {
            console.log(`    AA/${key}: ${val.constructor.name}`);
            const resolved = aaResolved.lookup(key);
            if (resolved && resolved.entries) {
              for (const [k2, v2] of resolved.entries()) {
                const v2resolved = resolved.lookup(k2);
                console.log(`      ${k2}: ${v2resolved ? v2resolved.constructor.name + ' = ' + (v2resolved.asString ? v2resolved.asString() : v2resolved.toString()).substring(0, 80) : 'null'}`);
              }
            }
          }
        }
      }
    } else {
      console.log(`  ${name}: NO AA dictionary!`);
    }

    // Check widget annotations too
    const widgets = field.acroField.getWidgets();
    for (let i = 0; i < widgets.length; i++) {
      const wDict = widgets[i].dict;
      const wAA = wDict.get(PDFName.of('AA'));
      if (wAA) {
        console.log(`    Widget[${i}] also has AA: ${wAA.constructor.name}`);
      }
    }
  }

  // Check CO array
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  if (acroForm) {
    const co = acroForm.get(PDFName.of('CO'));
    console.log(`  CO array: ${co ? 'present' : 'MISSING'}`);
    const na = acroForm.get(PDFName.of('NeedAppearances'));
    console.log(`  NeedAppearances: ${na ? 'present' : 'MISSING'}`);
  }
}

async function testStreamJS() {
  console.log('\n\n=== TEST: Stream-based JavaScript ===');
  // Some Acrobat versions require JS to be in a stream, not a string
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: Stream-based JS + explicit PDFNames', { x: 50, y: 700, size: 14, font });
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

  // Create JS as a stream object instead of a string
  const jsCode = 'var q=this.getField("qty").value;var r=this.getField("rate").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}';
  const jsBytes = new TextEncoder().encode(jsCode);

  // Create stream ref
  const jsStream = doc.context.stream(jsBytes);
  const jsStreamRef = doc.context.register(jsStream);

  // Build action dict with explicit PDFNames and stream
  const actionDict = doc.context.obj({});
  actionDict.set(PDFName.of('Type'), PDFName.of('Action'));
  actionDict.set(PDFName.of('S'), PDFName.of('JavaScript'));
  actionDict.set(PDFName.of('JS'), jsStreamRef);  // stream ref instead of string

  const actionRef = doc.context.register(actionDict);

  // Build AA dict with explicit PDFName for Calculate trigger
  const aaDict = doc.context.obj({});
  aaDict.set(PDFName.of('C'), actionRef);
  const aaRef = doc.context.register(aaDict);

  // Set on field
  amount.acroField.dict.set(PDFName.of('AA'), aaRef);

  // CO array
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-stream.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

async function testWidgetAA() {
  console.log('\n\n=== TEST: AA on Widget annotations (not field dict) ===');
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: AA on Widget + Keystroke on inputs', { x: 50, y: 700, size: 14, font });
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

  const calcJs = 'var q=this.getField("qty").value;var r=this.getField("rate").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}';
  const ksJs = 'var q=this.getField("qty").value;var r=this.getField("rate").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){this.getField("amount").value=(Number(q)*Number(r)).toFixed(2)}else{this.getField("amount").value=""}';

  // Put Calculate on amount's WIDGET (not field dict)
  const amountWidgets = amount.acroField.getWidgets();
  if (amountWidgets.length > 0) {
    const calcAction = doc.context.obj({});
    calcAction.set(PDFName.of('Type'), PDFName.of('Action'));
    calcAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
    calcAction.set(PDFName.of('JS'), PDFString.of(calcJs));
    const calcRef = doc.context.register(calcAction);

    const aaCalc = doc.context.obj({});
    aaCalc.set(PDFName.of('C'), calcRef);
    amountWidgets[0].dict.set(PDFName.of('AA'), doc.context.register(aaCalc));
    console.log('  Set AA/C on amount widget');
  }

  // Put Keystroke on qty and rate WIDGETS
  for (const inputField of [qty, rate]) {
    const widgets = inputField.acroField.getWidgets();
    if (widgets.length > 0) {
      const ksAction = doc.context.obj({});
      ksAction.set(PDFName.of('Type'), PDFName.of('Action'));
      ksAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
      ksAction.set(PDFName.of('JS'), PDFString.of(ksJs));
      const ksRef = doc.context.register(ksAction);

      const aaKs = doc.context.obj({});
      aaKs.set(PDFName.of('K'), ksRef);

      // Also add Fo (OnFocus) and Bl (OnBlur) for good measure
      const blAction = doc.context.obj({});
      blAction.set(PDFName.of('Type'), PDFName.of('Action'));
      blAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
      blAction.set(PDFName.of('JS'), PDFString.of(ksJs));
      const blRef = doc.context.register(blAction);
      aaKs.set(PDFName.of('Bl'), blRef);

      widgets[0].dict.set(PDFName.of('AA'), doc.context.register(aaKs));
    }
  }

  // CO array
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), doc.context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-widget-aa.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

async function testDocLevelRecalc() {
  console.log('\n\n=== TEST: Document-level JS with field change polling ===');
  // Put a document-level script in Names/JavaScript that uses setInterval
  // to periodically check field values and recalculate
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  page.drawText('Test: Doc-level JS with interval polling', { x: 50, y: 700, size: 14, font });
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

  // Document-level JavaScript via Names dictionary
  // This script runs on document open and polls for changes
  const docJs = `
var _prevQ = "", _prevR = "";
var _timer = app.setInterval("doCalc()", 500);
function doCalc() {
  var q = this.getField("qty").value;
  var r = this.getField("rate").value;
  if (q != _prevQ || r != _prevR) {
    _prevQ = q; _prevR = r;
    if (q && r && !isNaN(q) && !isNaN(r)) {
      this.getField("amount").value = (Number(q) * Number(r)).toFixed(2);
    } else {
      this.getField("amount").value = "";
    }
  }
}
`;

  // Build Names/JavaScript dictionary
  const jsAction = doc.context.obj({});
  jsAction.set(PDFName.of('Type'), PDFName.of('Action'));
  jsAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
  jsAction.set(PDFName.of('JS'), PDFString.of(docJs));
  const jsRef = doc.context.register(jsAction);

  // Names dict expects a name tree: [name1, ref1, name2, ref2, ...]
  const jsNameTree = doc.context.obj({});
  jsNameTree.set(PDFName.of('Names'), doc.context.obj([PDFString.of('AutoCalc'), jsRef]));
  const jsNameTreeRef = doc.context.register(jsNameTree);

  // Set Names/JavaScript on the catalog
  let names = doc.catalog.lookup(PDFName.of('Names'));
  if (!names) {
    names = doc.context.obj({});
    doc.catalog.set(PDFName.of('Names'), doc.context.register(names));
    names = doc.catalog.lookup(PDFName.of('Names'));
  }
  names.set(PDFName.of('JavaScript'), jsNameTreeRef);

  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));

  const outPath = 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/test-doclevel.pdf';
  fs.writeFileSync(outPath, await doc.save());
  console.log('  → ' + outPath);
}

(async () => {
  // First diagnose existing test files
  const testFiles = [
    ['Keystroke', 'output/test-keystroke.pdf'],
    ['Validate', 'output/test-validate.pdf'],
  ];
  for (const [label, fp] of testFiles) {
    try { await diagnose(label, fp); } catch (e) { console.log(`  Error: ${e.message}`); }
  }

  // New tests
  await testStreamJS();
  await testWidgetAA();
  await testDocLevelRecalc();

  console.log('\n\nDone! New tests to try:');
  console.log('  1. test-stream.pdf   — JS in stream object + Calculate on amount');
  console.log('  2. test-widget-aa.pdf — AA on widget annotations + K and Bl on inputs');
  console.log('  3. test-doclevel.pdf  — Document-level JS with setInterval polling');
})();
