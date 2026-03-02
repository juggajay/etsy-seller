const { PDFDocument, PDFName } = require('pdf-lib');
const fs = require('fs');

async function diagnose() {
  const bytes = fs.readFileSync('./output/Invoice-Template-Navy.pdf');
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  const catalog = doc.catalog;
  const acroForm = catalog.lookup(PDFName.of('AcroForm'));
  console.log('AcroForm exists:', !!acroForm);

  // Check CO
  if (acroForm) {
    const co = acroForm.get(PDFName.of('CO'));
    console.log('CO (Calculation Order) exists:', !!co);
    if (co) {
      const coLookup = acroForm.lookup(PDFName.of('CO'));
      if (coLookup && coLookup.size) {
        console.log('CO entries count:', coLookup.size());
      }
    }
  }

  // Check fields for AA (Additional Actions)
  const fields = form.getFields();
  const checkFields = ['amount_1', 'amount_2', 'subtotal', 'tax_amount', 'total'];

  for (const field of fields) {
    const name = field.getName();
    if (checkFields.includes(name)) {
      const dict = field.acroField.dict;
      const aa = dict.get(PDFName.of('AA'));
      const hasAA = !!aa;

      let jsContent = 'none';
      if (aa) {
        const aaDict = dict.lookup(PDFName.of('AA'));
        if (aaDict) {
          const cAction = aaDict.lookup(PDFName.of('C'));
          if (cAction) {
            const jsVal = cAction.get(PDFName.of('JS'));
            if (jsVal) {
              jsContent = jsVal.toString().substring(0, 100);
            }
          }
        }
      }

      console.log(`${name}: AA=${hasAA}, JS=${jsContent}`);
    }
  }
}

diagnose().catch(console.error);
