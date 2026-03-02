const { PDFDocument, StandardFonts, rgb, PDFName, PDFHexString } = require('pdf-lib');
const fs = require('fs');

async function test() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([612, 792]);
  const form = pdfDoc.getForm();
  const context = pdfDoc.context;

  page.drawText('Auto-Calc Test', { x: 50, y: 700, font, size: 18 });
  page.drawText('Qty:', { x: 50, y: 650, font, size: 12 });
  page.drawText('Rate:', { x: 200, y: 650, font, size: 12 });
  page.drawText('Amount (auto):', { x: 350, y: 650, font, size: 12 });

  const qty = form.createTextField('qty_1');
  qty.addToPage(page, { x: 50, y: 615, width: 100, height: 25 });
  qty.setFontSize(12);

  const rate = form.createTextField('rate_1');
  rate.addToPage(page, { x: 200, y: 615, width: 100, height: 25 });
  rate.setFontSize(12);

  const amount = form.createTextField('amount_1');
  amount.addToPage(page, { x: 350, y: 615, width: 100, height: 25 });
  amount.setFontSize(12);
  amount.enableReadOnly();

  form.updateFieldAppearances(font);

  // Use PDFHexString.fromText() — PDFString.of() breaks on unbalanced parentheses in JS
  const js = 'var q=this.getField("qty_1").value;var r=this.getField("rate_1").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2);}else{event.value="";}';

  const jsAction = context.obj({
    Type: 'Action',
    S: 'JavaScript',
    JS: PDFHexString.fromText(js),
  });
  amount.acroField.dict.set(PDFName.of('AA'), context.obj({ C: jsAction }));

  const acroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'));
  acroForm.set(PDFName.of('CO'), context.obj([amount.acroField.ref]));
  acroForm.set(PDFName.of('NeedAppearances'), context.obj(true));

  const bytes = await pdfDoc.save();
  fs.writeFileSync('./output/test-calc.pdf', bytes);
  console.log('Saved test-calc.pdf — PDFHexString fix');
}

test().catch(console.error);
