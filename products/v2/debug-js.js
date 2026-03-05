const { PDFDocument, PDFName } = require('pdf-lib');
const fs = require('fs');

async function dumpJS(label, filePath) {
  const doc = await PDFDocument.load(fs.readFileSync(filePath));
  const fields = doc.getForm().getFields();

  console.log('=== ' + label + ' ===');
  for (const f of fields) {
    const aa = f.acroField.dict.lookup(PDFName.of('AA'));
    if (!aa) continue;
    const c = aa.lookup(PDFName.of('C'));
    if (!c) continue;
    const js = c.lookup(PDFName.of('JS'));
    const s = c.lookup(PDFName.of('S'));
    const typ = c.lookup(PDFName.of('Type'));
    console.log(f.getName() + ':');
    console.log('  Type:', typ ? typ.toString() : 'MISSING');
    console.log('  S:', s ? s.toString() : 'MISSING');
    console.log('  JS class:', js ? js.constructor.name : 'MISSING');

    // Try different ways to read the JS value
    let jsVal = 'unknown';
    if (js && js.asString) jsVal = js.asString();
    else if (js && js.value) jsVal = js.value;
    else if (js) jsVal = js.toString().substring(0, 120);
    console.log('  JS:', JSON.stringify(jsVal).substring(0, 120));
    console.log();
  }
}

(async () => {
  await dumpJS('V1 (working)', 'C:/Users/jayso/businesses/etsy-templates/output/Invoice-Template-Navy.pdf');
  console.log('\n' + '='.repeat(60) + '\n');
  await dumpJS('V2 (broken)', 'C:/Users/jayso/businesses/etsy-templates/products/v2/output/Invoice-Template-Navy.pdf');
})();
