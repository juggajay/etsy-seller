const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

// ============================================================
// COLOR SCHEMES — 4 variants (same as invoice/quote)
// ============================================================
const COLOR_SCHEMES = {
  navy: {
    name: 'Navy',
    primary: rgb(0.106, 0.212, 0.365),
    accent: rgb(0.173, 0.322, 0.510),
    light: rgb(0.933, 0.945, 0.961),
    highlight: rgb(0.235, 0.471, 0.729),
    text: rgb(0.12, 0.13, 0.15),
    muted: rgb(0.44, 0.46, 0.52),
    white: rgb(1, 1, 1),
    fieldBg: rgb(0.955, 0.963, 0.975),
    tableBg: rgb(0.945, 0.953, 0.968),
    border: rgb(0.85, 0.87, 0.90),
  },
  forest: {
    name: 'Forest Green',
    primary: rgb(0.102, 0.278, 0.192),
    accent: rgb(0.153, 0.404, 0.286),
    light: rgb(0.945, 0.968, 0.953),
    highlight: rgb(0.204, 0.533, 0.373),
    text: rgb(0.12, 0.13, 0.12),
    muted: rgb(0.42, 0.47, 0.44),
    white: rgb(1, 1, 1),
    fieldBg: rgb(0.953, 0.973, 0.958),
    tableBg: rgb(0.940, 0.960, 0.948),
    border: rgb(0.83, 0.88, 0.85),
  },
  terracotta: {
    name: 'Terracotta',
    primary: rgb(0.612, 0.259, 0.129),
    accent: rgb(0.753, 0.337, 0.129),
    light: rgb(0.992, 0.970, 0.945),
    highlight: rgb(0.831, 0.424, 0.176),
    text: rgb(0.15, 0.12, 0.10),
    muted: rgb(0.52, 0.46, 0.42),
    white: rgb(1, 1, 1),
    fieldBg: rgb(0.985, 0.968, 0.952),
    tableBg: rgb(0.978, 0.960, 0.942),
    border: rgb(0.90, 0.85, 0.80),
  },
  charcoal: {
    name: 'Charcoal',
    primary: rgb(0.176, 0.216, 0.282),
    accent: rgb(0.290, 0.333, 0.412),
    light: rgb(0.955, 0.961, 0.969),
    highlight: rgb(0.380, 0.435, 0.529),
    text: rgb(0.12, 0.13, 0.15),
    muted: rgb(0.44, 0.45, 0.49),
    white: rgb(1, 1, 1),
    fieldBg: rgb(0.958, 0.963, 0.970),
    tableBg: rgb(0.948, 0.953, 0.961),
    border: rgb(0.85, 0.86, 0.88),
  },
};

const W = 612;
const H = 792;
const M = 48; // margin
const LINE_ROWS = 6;

// ============================================================
// DRAWING HELPERS
// ============================================================
function rect(page, x, y, w, h, color, opts = {}) {
  page.drawRectangle({
    x, y, width: w, height: h, color,
    borderColor: opts.borderColor,
    borderWidth: opts.borderWidth || 0,
    opacity: opts.opacity,
  });
}

function roundedRect(page, x, y, w, h, color) {
  const r = 3;
  rect(page, x + r, y, w - 2 * r, h, color);
  rect(page, x, y + r, w, h - 2 * r, color);
  rect(page, x, y, r, r, color);
  rect(page, x + w - r, y, r, r, color);
  rect(page, x, y + h - r, r, r, color);
  rect(page, x + w - r, y + h - r, r, r, color);
}

function txt(page, text, x, y, font, size, color, opts = {}) {
  page.drawText(String(text), {
    x, y, font, size,
    color,
    maxWidth: opts.maxWidth,
    lineHeight: opts.lineHeight,
    opacity: opts.opacity,
  });
}

function line(page, x1, y1, x2, y2, color, thickness = 0.5) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness, color,
  });
}

// ============================================================
// PAGE 1: HOW TO USE
// ============================================================
function buildHowToUsePage(page, c, fontR, fontM, fontB) {
  const cw = W - M * 2;

  rect(page, 0, 0, W, H, c.light);

  // Header band
  rect(page, 0, H - 110, W, 110, c.primary);
  rect(page, 0, H - 110, W * 0.65, 110, c.accent, { opacity: 0.3 });
  rect(page, W - 160, H - 110, 160, 35, c.highlight);

  txt(page, 'HOW TO USE', M + 4, H - 55, fontB, 26, c.white);
  txt(page, 'THIS TEMPLATE', M + 4, H - 80, fontB, 26, c.white);
  txt(page, 'Quick Start Guide', M + 4, H - 96, fontR, 10, c.white, { opacity: 0.7 });

  rect(page, 0, H - 114, W, 4, c.highlight);

  let y = H - 150;

  const instructions = [
    { title: 'This is a Fillable PDF', body: 'Click on any highlighted field to type directly into the template. All shaded areas are interactive form fields. Works in Adobe Acrobat Reader (free), Foxit Reader, or most modern PDF viewers.' },
    { title: 'Auto-Calculating Fields', body: 'Enter the Quantity and Unit Price for each line item — the Amount calculates automatically. Subtotal, Tax, and Total Paid update in real time. Enter the Amount Tendered and Change Due calculates instantly.' },
    { title: 'Add Your Logo', body: 'Open in Adobe Acrobat, click the logo placeholder, and use Edit > Add Image to insert your company logo. In the Canva version, simply drag and drop your logo.' },
    { title: 'Customise Your Details', body: 'Fill in your business name, address, and contact details. Save a master copy with your details pre-filled so you only need to update client info and payment details for each new receipt.' },
    { title: 'Save & Send', body: 'After filling out the receipt, go to File > Save As to keep your completed copy. Email it directly to your client as a professional PDF attachment or print a physical copy for their records.' },
    { title: 'Multiple Formats Included', body: 'This download includes: Fillable PDF (this file) for quick professional receipts, Google Sheets version with built-in formulas, and a Word template for full design customisation.' },
  ];

  for (let i = 0; i < instructions.length; i++) {
    const inst = instructions[i];

    roundedRect(page, M, y - 3, 28, 28, c.primary);
    txt(page, `${i + 1}`, M + (i < 9 ? 10 : 6), y + 4, fontB, 15, c.white);

    txt(page, inst.title, M + 40, y + 6, fontB, 12.5, c.primary);

    const maxW = cw - 48;
    const words = inst.body.split(' ');
    let currentLine = '';
    let textY = y - 12;

    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (test.length * 4.2 > maxW) {
        txt(page, currentLine, M + 40, textY, fontR, 9.5, c.text);
        textY -= 13;
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) {
      txt(page, currentLine, M + 40, textY, fontR, 9.5, c.text);
      textY -= 13;
    }

    y = textY - 12;
  }

  // Footer
  rect(page, 0, 0, W, 36, c.primary);
  rect(page, 0, 36, 100, 3, c.highlight);
  txt(page, 'Need help? Contact us through your Etsy order page.', M, 13, fontR, 8, c.white, { opacity: 0.7 });
}

// ============================================================
// PAGE 2: RECEIPT
// ============================================================
function buildReceiptPage(page, form, c, fontR, fontM, fontB, fontL) {
  const cw = W - M * 2;

  rect(page, 0, 0, W, H, rgb(0.995, 0.996, 0.998));

  // ---- HEADER ----
  rect(page, 0, H - 95, W, 95, c.primary);
  rect(page, 0, H - 95, W * 0.55, 95, c.accent, { opacity: 0.2 });
  rect(page, W - 170, H - 95, 170, 32, c.highlight);

  txt(page, 'RECEIPT', M, H - 58, fontB, 32, c.white);

  // Logo area
  const logoX = W - M - 105;
  const logoY = H - 86;
  rect(page, logoX, logoY, 105, 68, c.accent);
  rect(page, logoX + 2, logoY + 2, 101, 64, c.primary);
  txt(page, 'YOUR', logoX + 30, logoY + 40, fontM, 11, c.white, { opacity: 0.8 });
  txt(page, 'LOGO', logoX + 31, logoY + 24, fontM, 11, c.white, { opacity: 0.8 });

  rect(page, 0, H - 99, W, 4, c.highlight);

  // ---- META ROW ----
  const metaY = H - 126;
  roundedRect(page, M, metaY - 8, cw, 30, c.light);

  const metaItems = [
    { label: 'RECEIPT NO.', name: 'receipt_number', default: 'REC-001', x: M + 12 },
    { label: 'DATE OF PAYMENT', name: 'payment_date', default: '', x: M + 185 },
    { label: 'PAYMENT METHOD', name: 'payment_method', default: 'Cash', x: M + 355 },
  ];

  for (const meta of metaItems) {
    txt(page, meta.label, meta.x, metaY + 12, fontM, 7, c.muted);
    const field = form.createTextField(meta.name);
    field.addToPage(page, {
      x: meta.x, y: metaY - 6, width: 145, height: 16,
      borderWidth: 0, backgroundColor: rgb(1, 1, 1),
    });
    field.setFontSize(9);
    if (meta.default) field.setText(meta.default);
  }

  // ---- FROM / RECEIPT FOR ----
  const secY = metaY - 30;
  const colW = (cw - 20) / 2;

  // FROM
  roundedRect(page, M, secY - 2, 48, 16, c.primary);
  txt(page, 'FROM', M + 10, secY + 1, fontM, 8, c.white);

  const fromFields = [
    { name: 'from_company', label: 'Business Name', h: 16 },
    { name: 'from_address', label: 'Address', h: 26 },
    { name: 'from_email', label: 'Email', h: 16 },
    { name: 'from_phone', label: 'Phone', h: 16 },
  ];

  let fy = secY - 20;
  for (const f of fromFields) {
    txt(page, f.label, M + 2, fy + 4, fontR, 7, c.muted);
    const field = form.createTextField(f.name);
    field.addToPage(page, {
      x: M, y: fy - 12, width: colW, height: f.h,
      borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
    });
    field.setFontSize(9);
    fy -= f.h + 14;
  }

  // RECEIPT FOR
  const toX = M + colW + 20;
  roundedRect(page, toX, secY - 2, 92, 16, c.highlight);
  txt(page, 'RECEIPT FOR', toX + 10, secY + 1, fontM, 8, c.white);

  const toFields = [
    { name: 'to_company', label: 'Client / Company', h: 16 },
    { name: 'to_address', label: 'Address', h: 26 },
    { name: 'to_email', label: 'Email', h: 16 },
    { name: 'to_phone', label: 'Phone', h: 16 },
  ];

  let ty = secY - 20;
  for (const f of toFields) {
    txt(page, f.label, toX + 2, ty + 4, fontR, 7, c.muted);
    const field = form.createTextField(f.name);
    field.addToPage(page, {
      x: toX, y: ty - 12, width: colW, height: f.h,
      borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
    });
    field.setFontSize(9);
    ty -= f.h + 14;
  }

  // ---- TABLE ----
  const tblTop = Math.min(fy, ty) - 4;
  const descW = 215;
  const qtyW = 60;
  const rateW = 82;
  const amtW = cw - descW - qtyW - rateW;
  const rowH = 22;

  // Table header
  roundedRect(page, M, tblTop - 1, cw, 20, c.primary);

  const cols = [
    { text: 'DESCRIPTION', x: M + 10 },
    { text: 'QTY', x: M + descW + 16 },
    { text: 'UNIT PRICE ($)', x: M + descW + qtyW + 4 },
    { text: 'AMOUNT', x: M + descW + qtyW + rateW + 10 },
  ];

  for (const col of cols) {
    txt(page, col.text, col.x, tblTop + 4, fontM, 7.5, c.white);
  }

  // Data rows
  const calcFieldRefs = [];
  let ry = tblTop - rowH;

  for (let i = 1; i <= LINE_ROWS; i++) {
    if (i % 2 === 0) {
      rect(page, M, ry - 1, cw, rowH, c.tableBg);
    }
    line(page, M, ry - 1, M + cw, ry - 1, c.border, 0.3);

    // Description
    const df = form.createTextField(`desc_${i}`);
    df.addToPage(page, {
      x: M + 3, y: ry + 1, width: descW - 6, height: rowH - 4,
      borderWidth: 0, backgroundColor: rgb(1, 1, 1, 0),
    });
    df.setFontSize(9);

    // Qty
    const qf = form.createTextField(`qty_${i}`);
    qf.addToPage(page, {
      x: M + descW + 3, y: ry + 1, width: qtyW - 6, height: rowH - 4,
      borderWidth: 0, backgroundColor: rgb(1, 1, 1, 0),
    });
    qf.setAlignment(1);
    qf.setFontSize(9);

    // Unit Price
    const rf = form.createTextField(`rate_${i}`);
    rf.addToPage(page, {
      x: M + descW + qtyW + 3, y: ry + 1, width: rateW - 6, height: rowH - 4,
      borderWidth: 0, backgroundColor: rgb(1, 1, 1, 0),
    });
    rf.setAlignment(1);
    rf.setFontSize(9);

    // Amount (auto-calc, read-only)
    const af = form.createTextField(`amount_${i}`);
    af.addToPage(page, {
      x: M + descW + qtyW + rateW + 3, y: ry + 1, width: amtW - 6, height: rowH - 4,
      borderWidth: 0, backgroundColor: c.fieldBg,
    });
    af.setAlignment(2);
    af.setFontSize(9);
    af.enableReadOnly();
    calcFieldRefs.push({ name: `amount_${i}`, field: af });

    ry -= rowH;
  }

  // Table bottom accent
  rect(page, M, ry + rowH - 2, cw, 2.5, c.highlight);

  // ---- TOTALS ----
  const tLabelX = M + descW + qtyW;
  const tFieldX = M + descW + qtyW + rateW + 3;
  const tFieldW = amtW - 6;
  let tY = ry - 6;

  // Subtotal
  txt(page, 'Subtotal', tLabelX + 12, tY + 4, fontR, 9, c.text);
  const subF = form.createTextField('subtotal');
  subF.addToPage(page, {
    x: tFieldX, y: tY - 2, width: tFieldW, height: 18,
    borderWidth: 0, backgroundColor: c.fieldBg,
  });
  subF.setAlignment(2); subF.setFontSize(9); subF.enableReadOnly();
  calcFieldRefs.push({ name: 'subtotal', field: subF });

  tY -= 24;

  // Tax
  txt(page, 'Tax', tLabelX + 12, tY + 4, fontR, 9, c.text);
  const taxRF = form.createTextField('tax_rate');
  taxRF.addToPage(page, {
    x: tLabelX + 40, y: tY - 2, width: 34, height: 18,
    borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
  });
  taxRF.setAlignment(1); taxRF.setFontSize(8); taxRF.setText('0');

  txt(page, '%', tLabelX + 77, tY + 4, fontR, 8, c.muted);

  const taxAF = form.createTextField('tax_amount');
  taxAF.addToPage(page, {
    x: tFieldX, y: tY - 2, width: tFieldW, height: 18,
    borderWidth: 0, backgroundColor: c.fieldBg,
  });
  taxAF.setAlignment(2); taxAF.setFontSize(9); taxAF.enableReadOnly();
  calcFieldRefs.push({ name: 'tax_amount', field: taxAF });

  tY -= 28;

  // TOTAL PAID block
  const totalBlockW = rateW + amtW;
  roundedRect(page, tLabelX, tY - 5, totalBlockW, 28, c.primary);
  txt(page, 'TOTAL PAID', tLabelX + 12, tY + 4, fontB, 12, c.white);
  const totalPaidF = form.createTextField('total_paid');
  totalPaidF.addToPage(page, {
    x: tFieldX, y: tY - 1, width: tFieldW, height: 20,
    borderWidth: 0, backgroundColor: c.primary, textColor: c.white,
  });
  totalPaidF.setAlignment(2); totalPaidF.setFontSize(11); totalPaidF.enableReadOnly();
  calcFieldRefs.push({ name: 'total_paid', field: totalPaidF });

  tY -= 38;

  // Amount Tendered (editable)
  txt(page, 'Amount Tendered ($)', tLabelX + 12, tY + 4, fontR, 9, c.text);
  const tenderedF = form.createTextField('amount_tendered');
  tenderedF.addToPage(page, {
    x: tFieldX, y: tY - 2, width: tFieldW, height: 18,
    borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
  });
  tenderedF.setAlignment(2); tenderedF.setFontSize(9);

  tY -= 26;

  // Change Due block
  roundedRect(page, tLabelX, tY - 5, totalBlockW, 24, c.highlight);
  txt(page, 'CHANGE DUE', tLabelX + 12, tY + 2, fontM, 10, c.white);
  const changeDueF = form.createTextField('change_due');
  changeDueF.addToPage(page, {
    x: tFieldX, y: tY - 2, width: tFieldW, height: 18,
    borderWidth: 0, backgroundColor: c.highlight, textColor: c.white,
  });
  changeDueF.setAlignment(2); changeDueF.setFontSize(10); changeDueF.enableReadOnly();
  calcFieldRefs.push({ name: 'change_due', field: changeDueF });

  // ---- BOTTOM SECTION ----
  const bY = tY - 40;
  const halfW = (cw - 20) / 2;

  // Receipt terms
  rect(page, M, bY - 2, 4, 42, c.highlight);
  txt(page, 'RECEIPT TERMS', M + 14, bY + 28, fontM, 7, c.primary);
  const ptF = form.createTextField('payment_notes');
  ptF.addToPage(page, {
    x: M + 14, y: bY - 2, width: halfW - 14, height: 26,
    borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
  });
  ptF.setFontSize(8); ptF.setText('This receipt confirms payment in full for the items/services listed above.');

  // Notes
  const nX = M + halfW + 20;
  rect(page, nX, bY - 2, 4, 42, c.accent);
  txt(page, 'NOTES', nX + 14, bY + 28, fontM, 7, c.primary);
  const nF = form.createTextField('notes');
  nF.addToPage(page, {
    x: nX + 14, y: bY - 2, width: halfW - 14, height: 26,
    borderWidth: 0.5, borderColor: c.border, backgroundColor: rgb(1, 1, 1),
  });
  nF.setFontSize(8); nF.setText('Thank you for your payment!');

  // Bank details
  const bankY = bY - 42;
  roundedRect(page, M, bankY - 2, cw, 34, c.light);
  txt(page, 'PAYMENT DETAILS', M + 10, bankY + 20, fontM, 7, c.primary);
  const bankF = form.createTextField('bank_details');
  bankF.addToPage(page, {
    x: M + 10, y: bankY, width: cw - 20, height: 18,
    borderWidth: 0, backgroundColor: rgb(1, 1, 1),
  });
  bankF.setFontSize(8);
  bankF.setText('Bank: Example Bank  |  Account: 1234 5678  |  Routing: 987654321  |  PayPal: you@email.com');

  // Footer
  rect(page, 0, 0, W, 22, c.primary);
  rect(page, 0, 22, 90, 3, c.highlight);
  rect(page, W - 150, 22, 150, 3, c.accent);
  txt(page, 'Professional Receipt Template', M, 7, fontR, 7, c.white, { opacity: 0.6 });

  return calcFieldRefs;
}

// ============================================================
// PAGE 3: TERMS & CONDITIONS
// ============================================================
function buildTermsPage(page, c, fontR, fontM, fontB) {
  rect(page, 0, 0, W, H, c.light);

  rect(page, 0, H - 80, W, 80, c.primary);
  rect(page, 0, H - 80, W * 0.55, 80, c.accent, { opacity: 0.2 });
  rect(page, W - 160, H - 80, 160, 25, c.highlight);

  txt(page, 'TERMS & CONDITIONS', M, H - 50, fontB, 22, c.white);
  rect(page, 0, H - 84, W, 4, c.highlight);

  let y = H - 115;

  const terms = [
    { t: '1. Payment Confirmation', b: 'This receipt confirms that payment has been received in full for the goods or services described herein. This document serves as proof of payment and should be retained for your records.' },
    { t: '2. Scope of Products / Services', b: 'This receipt covers the items or services listed in the line items above. The descriptions, quantities, and prices reflect the transaction as completed at the time of payment.' },
    { t: '3. Refund Policy', b: 'Refunds are subject to our standard refund policy. Requests must be made within the applicable return period. Original receipt must be presented for all refund or exchange requests.' },
    { t: '4. Warranty & Guarantee', b: 'Products or services may be covered by manufacturer or service warranties as applicable. Please refer to individual product documentation or contact us for warranty details and claims procedures.' },
    { t: '5. Tax Information', b: 'Tax amounts shown on this receipt are calculated based on current applicable rates. This receipt may be used for tax record-keeping purposes. Consult your tax advisor for specific deductibility questions.' },
    { t: '6. Record Keeping', b: 'We recommend keeping this receipt for your personal or business records. A digital copy can be stored for easy reference. We may retain a copy of this transaction in our system for the legally required period.' },
    { t: '7. Disputes', b: 'If you believe there is an error on this receipt, please contact us within 30 days of the transaction date. We will review the matter promptly and issue a correction or credit if an error is confirmed.' },
    { t: '8. Limitation of Liability', b: 'Our total liability related to this transaction shall not exceed the amount shown on this receipt. Neither party shall be liable for indirect, incidental, or consequential damages arising from this transaction.' },
  ];

  const maxW = W - M * 2 - 16;

  for (const term of terms) {
    rect(page, M, y - 2, 5, 5, c.highlight);
    txt(page, term.t, M + 14, y, fontM, 10, c.primary);
    y -= 16;

    const words = term.b.split(' ');
    let ln = '';
    for (const word of words) {
      const test = ln ? `${ln} ${word}` : word;
      if (test.length * 4.3 > maxW) {
        txt(page, ln, M + 14, y, fontR, 9, c.text);
        y -= 12.5;
        ln = word;
      } else {
        ln = test;
      }
    }
    if (ln) { txt(page, ln, M + 14, y, fontR, 9, c.text); y -= 12.5; }
    y -= 8;
  }

  // Footer note
  roundedRect(page, M, 42, W - M * 2, 32, rgb(1, 1, 1));
  txt(page, 'Customise these terms to match your business. This is a starting template — consult a legal professional for your specific needs.', M + 12, 54, fontR, 8, c.muted, { maxWidth: W - M * 2 - 24 });
}

// ============================================================
// PAGE 4: THANK YOU
// ============================================================
function buildThankYouPage(page, c, fontR, fontM, fontB, fontL) {
  rect(page, 0, 0, W, H, c.light);

  rect(page, 0, H - 300, W, 300, c.primary);
  rect(page, 0, H - 300, W * 0.5, 300, c.accent, { opacity: 0.15 });

  rect(page, W - 200, H - 300, 200, 60, c.highlight);
  rect(page, 0, H - 300, 70, 35, c.accent);
  rect(page, W - 80, H - 240, 80, 80, c.accent, { opacity: 0.2 });

  txt(page, 'THANK', M + 24, H - 130, fontB, 56, c.white);
  txt(page, 'YOU', M + 24, H - 190, fontB, 56, c.white);
  txt(page, 'for your payment', M + 28, H - 222, fontL, 15, c.white, { opacity: 0.75 });

  const msgY = H - 355;
  txt(page, 'We appreciate your business and trust in our services.', M + 24, msgY, fontR, 14, c.text);
  txt(page, 'Please keep this receipt for your records. If you have', M + 24, msgY - 30, fontR, 11.5, c.muted);
  txt(page, 'any questions, please don\'t hesitate to reach out.', M + 24, msgY - 48, fontR, 11.5, c.muted);

  const divY = msgY - 80;
  rect(page, M + 24, divY, W - M * 2 - 48, 2, c.highlight);

  txt(page, 'GET IN TOUCH', M + 24, divY - 30, fontM, 12, c.primary);
  txt(page, 'Email: your@email.com', M + 24, divY - 52, fontR, 10.5, c.text);
  txt(page, 'Phone: (555) 123-4567', M + 24, divY - 70, fontR, 10.5, c.text);
  txt(page, 'Website: www.yourbusiness.com', M + 24, divY - 88, fontR, 10.5, c.text);

  rect(page, 0, 0, W, 44, c.primary);
  rect(page, 0, 44, 110, 4, c.highlight);
  rect(page, W - 180, 44, 180, 4, c.accent);
}

// ============================================================
// AUTO-CALCULATION JAVASCRIPT
// ============================================================
function addCalculationJS(pdfDoc, form, calcFieldRefs) {
  const context = pdfDoc.context;
  const acroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'));
  if (!acroForm) return;

  const calcOrder = [];

  // Line item amounts: qty × rate
  for (let i = 1; i <= LINE_ROWS; i++) {
    const entry = calcFieldRefs.find(f => f.name === `amount_${i}`);
    if (!entry) continue;
    const js = `var q=this.getField("qty_${i}").value;var r=this.getField("rate_${i}").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}`;
    addCalcAction(context, entry.field, js);
    calcOrder.push(entry.field.acroField.ref);
  }

  // Subtotal: sum of amounts
  const subE = calcFieldRefs.find(f => f.name === 'subtotal');
  if (subE) {
    let js = 'var t=0;';
    for (let i = 1; i <= LINE_ROWS; i++) {
      js += `var a${i}=this.getField("amount_${i}").value;if(a${i}&&!isNaN(a${i}))t+=Number(a${i});`;
    }
    js += 'event.value=t>0?t.toFixed(2):""';
    addCalcAction(context, subE.field, js);
    calcOrder.push(subE.field.acroField.ref);
  }

  // Tax amount: subtotal × tax_rate%
  const taxE = calcFieldRefs.find(f => f.name === 'tax_amount');
  if (taxE) {
    const js = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';
    addCalcAction(context, taxE.field, js);
    calcOrder.push(taxE.field.acroField.ref);
  }

  // Total Paid: subtotal + tax
  const totE = calcFieldRefs.find(f => f.name === 'total_paid');
  if (totE) {
    const js = 'var s=Number(this.getField("subtotal").value)||0;var t=Number(this.getField("tax_amount").value)||0;var total=s+t;event.value=total>0?"$"+total.toFixed(2):""';
    addCalcAction(context, totE.field, js);
    calcOrder.push(totE.field.acroField.ref);
  }

  // Change Due: amount_tendered - total_paid
  const changeE = calcFieldRefs.find(f => f.name === 'change_due');
  if (changeE) {
    const js = 'var a=String(this.getField("amount_tendered").value).replace(/[^0-9.]/g,"");var tendered=Number(a)||0;var tp=String(this.getField("total_paid").value).replace(/[^0-9.]/g,"");var total=Number(tp)||0;if(tendered>0){var change=tendered-total;event.value=change>=0?"$"+change.toFixed(2):""}else{event.value=""}';
    addCalcAction(context, changeE.field, js);
    calcOrder.push(changeE.field.acroField.ref);
  }

  if (calcOrder.length > 0) {
    acroForm.set(PDFName.of('CO'), context.obj(calcOrder));
  }
}

function addCalcAction(context, field, jsCode) {
  const jsAction = context.obj({
    Type: 'Action', S: 'JavaScript', JS: PDFString.of(jsCode),
  });
  field.acroField.dict.set(PDFName.of('AA'), context.obj({ C: jsAction }));
}

// ============================================================
// MAIN
// ============================================================
async function generateReceipt(schemeName) {
  const colors = COLOR_SCHEMES[schemeName];
  const fontsDir = path.join(__dirname, 'fonts', 'extras', 'ttf');
  const fontRData = fs.readFileSync(path.join(fontsDir, 'Inter-Regular.ttf'));
  const fontMData = fs.readFileSync(path.join(fontsDir, 'Inter-Medium.ttf'));
  const fontBData = fs.readFileSync(path.join(fontsDir, 'Inter-Bold.ttf'));
  const fontLData = fs.readFileSync(path.join(fontsDir, 'Inter-Light.ttf'));

  // ---- DOC A: Design pages (fontkit + Inter) ----
  const designDoc = await PDFDocument.create();
  designDoc.registerFontkit(fontkit);
  const dR = await designDoc.embedFont(fontRData);
  const dM = await designDoc.embedFont(fontMData);
  const dB = await designDoc.embedFont(fontBData);
  const dL = await designDoc.embedFont(fontLData);

  buildHowToUsePage(designDoc.addPage([W, H]), colors, dR, dM, dB);
  buildTermsPage(designDoc.addPage([W, H]), colors, dR, dM, dB);
  buildThankYouPage(designDoc.addPage([W, H]), colors, dR, dM, dB, dL);

  const designBytes = await designDoc.save();

  // ---- DOC B: Receipt page (NO fontkit — StandardFonts only for AcroForm) ----
  const mainDoc = await PDFDocument.create();

  const fontR = await mainDoc.embedFont(StandardFonts.Helvetica);
  const fontM = await mainDoc.embedFont(StandardFonts.HelveticaBold);
  const fontB = await mainDoc.embedFont(StandardFonts.HelveticaBold);
  const fontL = await mainDoc.embedFont(StandardFonts.Helvetica);

  mainDoc.setTitle(`Professional Receipt Template — ${colors.name}`);
  mainDoc.setAuthor('Small Business Templates');
  mainDoc.setSubject('Fillable Receipt Template with Auto-Calculating Fields');
  mainDoc.setKeywords(['receipt', 'payment', 'template', 'fillable', 'business', 'professional']);
  mainDoc.setCreator('Small Business Templates');

  const receiptPage = mainDoc.addPage([W, H]);
  const form = mainDoc.getForm();
  const calcRefs = buildReceiptPage(receiptPage, form, colors, fontR, fontM, fontB, fontL);

  form.updateFieldAppearances(fontR);
  addCalculationJS(mainDoc, form, calcRefs);

  const acroForm = mainDoc.catalog.lookup(PDFName.of('AcroForm'));
  if (acroForm) {
    acroForm.set(PDFName.of('NeedAppearances'), mainDoc.context.obj(true));
  }

  // ---- MERGE ----
  const loadedDesign = await PDFDocument.load(designBytes);
  const [howToUse, terms, thankYou] = await mainDoc.copyPages(loadedDesign, [0, 1, 2]);

  mainDoc.insertPage(0, howToUse);
  mainDoc.addPage(terms);
  mainDoc.addPage(thankYou);

  const pdfBytes = await mainDoc.save();
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `Receipt-Template-${colors.name.replace(/\s+/g, '-')}.pdf`;
  fs.writeFileSync(path.join(outputDir, filename), pdfBytes);
  console.log(`✓ ${filename} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('Generating Receipt templates with Inter font...\n');
  for (const scheme of ['navy', 'forest', 'terracotta', 'charcoal']) {
    await generateReceipt(scheme);
  }
  console.log('\nDone!');
}

main().catch(console.error);
