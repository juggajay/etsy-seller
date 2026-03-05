// =============================================================
// add-fields.js — pdf-lib form field overlay + auto-calc JS
// Stage 2 of the two-stage pipeline
// Loads the Puppeteer-rendered visual PDF and overlays
// interactive form fields with auto-calc JavaScript
//
// Auto-calc uses document-level JS with app.setInterval() polling.
// AA/C (Calculate) events don't fire reliably in Adobe Acrobat,
// so we poll for field changes and recalculate via Names/JavaScript.
// =============================================================

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require('pdf-lib');

/**
 * Build document-level JavaScript that polls for field changes
 * and recalculates all computed fields in CO order.
 *
 * Each calcJs formula uses `event.value = ...` (the standard Calculate pattern).
 * We wrap each one: create a fake event, run the formula, write the result.
 *
 * @param {Array} calcFields - [{ name, js }] in calculation order
 * @returns {string} Complete document-level JavaScript
 */
function buildPollingJs(calcFields, whiteTextFields) {
  let js = '';

  // Set white text color on dark-background fields on load
  if (whiteTextFields.length > 0) {
    js += 'try {\n';
    for (const fname of whiteTextFields) {
      js += '  this.getField("' + fname + '").textColor = ["RGB", 1, 1, 1];\n';
    }
    js += '} catch(e) {}\n';
  }

  // Build the recalc function
  js += 'function _recalc() {\n';
  for (const { name, js: formula } of calcFields) {
    // Wrap each formula: fake event object → run formula → write to field
    js += '  try {\n';
    js += '    var event = {value: ""};\n';
    js += '    ' + formula + ';\n';
    js += '    var _f = this.getField("' + name + '");\n';
    js += '    if (_f && _f.value != event.value) _f.value = event.value;\n';
    js += '  } catch(e) {}\n';
  }
  js += '}\n';

  // Run once immediately, then poll every 400ms
  js += '_recalc();\n';
  js += 'app.setInterval("_recalc()", 400);\n';

  return js;
}

/**
 * Add form fields and auto-calc JS to a visual PDF
 * @param {object} opts
 * @param {Buffer} opts.pdfBuffer - Visual PDF from Puppeteer
 * @param {Object} opts.fieldMap - Coordinate map: { fieldName: { x, y, width, height, pageIndex } }
 * @param {Array} opts.fieldDefs - Field definitions from field-definitions.js
 * @param {Array} opts.coOrder - Calculation order array (field names)
 * @param {Object} opts.colours - pdfLib colour values from colours.js
 * @returns {Promise<Uint8Array>} Final PDF bytes
 */
async function addFields(opts) {
  const { pdfBuffer, fieldMap, fieldDefs, coOrder, colours } = opts;

  // Embed Puppeteer pages as XObjects on fresh pdf-lib pages.
  const visualDoc = await PDFDocument.load(pdfBuffer);
  const doc = await PDFDocument.create();

  for (const srcPage of visualDoc.getPages()) {
    const embedded = await doc.embedPage(srcPage);
    const { width, height } = srcPage.getSize();
    const newPage = doc.addPage([width, height]);
    newPage.drawPage(embedded);
  }

  const form = doc.getForm();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  const c = {
    primary:  rgb(...colours.primary),
    accent:   rgb(...colours.accent),
    highlight:rgb(...colours.highlight),
    light:    rgb(...colours.light),
    text:     rgb(...colours.text),
    muted:    rgb(...colours.muted),
    white:    rgb(1, 1, 1),
    fieldBg:  rgb(...colours.fieldBg),
    tableBg:  rgb(...colours.tableBg),
    border:   rgb(...colours.border),
  };

  // Track calculated fields for document-level JS
  const calcFields = [];

  // --- Create text fields from fieldDefs ---
  // (Button fields like logo are visual-only placeholders — no form field needed)
  for (const def of fieldDefs) {
    const coords = fieldMap[def.name];
    if (!coords) {
      console.warn(`Field "${def.name}" not found in coordinate map — skipping`);
      continue;
    }
    // Skip button fields (handled above)
    if (coords.fieldType === 'button') continue;

    const page = pages[coords.pageIndex];
    if (!page) {
      console.warn(`Page index ${coords.pageIndex} not found for field "${def.name}" — skipping`);
      continue;
    }

    const field = form.createTextField(def.name);

    // Determine field appearance based on style
    let backgroundColor, borderColor, borderWidth, textColor;

    switch (def.style) {
      case 'total':
        // White field on dark HTML row — black text stays readable in all viewers
        backgroundColor = rgb(1, 1, 1);
        textColor = undefined;
        borderWidth = 0;
        borderColor = undefined;
        break;
      case 'calculated':
        backgroundColor = undefined;
        textColor = undefined;
        borderWidth = 0;
        borderColor = undefined;
        break;
      case 'editable':
        backgroundColor = undefined;
        textColor = undefined;
        borderWidth = 0;
        borderColor = undefined;
        break;
      default:
        backgroundColor = undefined;
        textColor = undefined;
        borderWidth = 0;
        borderColor = undefined;
        break;
    }

    // Line item fields (desc, qty, rate) — transparent style
    if (/^(desc|qty|rate)_\d+$/.test(def.name)) {
      backgroundColor = undefined;
      borderWidth = 0;
      borderColor = undefined;
    }

    const fieldOpts = {
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
      borderWidth: borderWidth,
    };
    if (backgroundColor) fieldOpts.backgroundColor = backgroundColor;
    if (borderColor) fieldOpts.borderColor = borderColor;
    if (textColor) fieldOpts.textColor = textColor;

    field.addToPage(page, fieldOpts);
    field.setAlignment(def.alignment);
    field.setFontSize(def.fontSize);

    if (def.defaultValue) {
      field.setText(def.defaultValue);
    }
    if (def.multiline) {
      field.enableMultiline();
    }
    if (def.readOnly) {
      field.enableReadOnly();
    }

    // Track calculated fields
    if (def.calcJs) {
      calcFields.push({ name: def.name, js: def.calcJs });
    }
  }

  form.updateFieldAppearances(helvetica);

  // Remove baked appearance streams from all fields so they render
  // transparently. NeedAppearances=true tells the viewer to regenerate
  // on the fly without the white background pdf-lib bakes in.
  for (const field of form.getFields()) {
    const widgets = field.acroField.getWidgets();
    for (const w of widgets) {
      w.dict.delete(PDFName.of('AP'));
    }
  }

  // --- Document-level auto-calc JavaScript via Names/JavaScript ---
  // Uses app.setInterval() polling instead of AA/C Calculate events
  // (AA/C doesn't fire reliably in Adobe Acrobat)
  if (calcFields.length > 0) {
    // Order by CO array
    const ordered = [];
    for (const fieldName of coOrder) {
      const cf = calcFields.find(f => f.name === fieldName);
      if (cf) ordered.push(cf);
    }

    const pollingJs = buildPollingJs(ordered, []);

    // Create JavaScript action for Names dictionary
    const jsAction = doc.context.obj({});
    jsAction.set(PDFName.of('Type'), PDFName.of('Action'));
    jsAction.set(PDFName.of('S'), PDFName.of('JavaScript'));
    jsAction.set(PDFName.of('JS'), PDFString.of(pollingJs));
    const jsRef = doc.context.register(jsAction);

    // Build Names/JavaScript name tree
    const jsNameTree = doc.context.obj({});
    jsNameTree.set(PDFName.of('Names'), doc.context.obj([PDFString.of('AutoCalc'), jsRef]));
    const jsNameTreeRef = doc.context.register(jsNameTree);

    // Attach to catalog
    let names = doc.catalog.lookup(PDFName.of('Names'));
    if (!names) {
      names = doc.context.obj({});
      doc.catalog.set(PDFName.of('Names'), doc.context.register(names));
      names = doc.catalog.lookup(PDFName.of('Names'));
    }
    names.set(PDFName.of('JavaScript'), jsNameTreeRef);
  }

  // NeedAppearances for Adobe to regenerate field displays
  const acroForm = doc.catalog.lookup(PDFName.of('AcroForm'));
  if (acroForm) {
    acroForm.set(PDFName.of('NeedAppearances'), doc.context.obj(true));
  }

  return doc.save();
}

module.exports = { addFields };
