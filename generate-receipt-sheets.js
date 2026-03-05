const ExcelJS = require('exceljs');
const path = require('path');

const SCHEMES = {
  navy: { primary: '1B365D', accent: '2C5282', light: 'EDF2F7', highlight: '3C78BA', white: 'FFFFFF', text: '1A1A1A', muted: '718096' },
  forest: { primary: '1A4731', accent: '276749', light: 'F0FFF4', highlight: '34885F', white: 'FFFFFF', text: '1A1A1A', muted: '6B7C72' },
  terracotta: { primary: '9C4221', accent: 'C05621', light: 'FFFAF0', highlight: 'D46C2D', white: 'FFFFFF', text: '261A14', muted: '806E66' },
  charcoal: { primary: '2D3748', accent: '4A5568', light: 'F7FAFC', highlight: '616F87', white: 'FFFFFF', text: '1A1A1A', muted: '71717A' },
};

const LINE_ROWS = 10;

async function generateReceiptSheet(schemeName) {
  const c = SCHEMES[schemeName];
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Small Business Templates';
  wb.created = new Date();

  const ws = wb.addWorksheet('Receipt', {
    properties: { defaultColWidth: 14 },
    pageSetup: { paperSize: 1, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1 },
    headerFooter: { oddFooter: 'Professional Receipt Template' },
  });

  ws.columns = [
    { width: 2 },   // A - spacer
    { width: 28 },  // B
    { width: 22 },  // C
    { width: 10 },  // D - Qty
    { width: 14 },  // E - Unit Price
    { width: 16 },  // F - Amount
    { width: 2 },   // G - spacer
  ];

  function fillRange(startRow, startCol, endRow, endCol, bgColor, fontColor, bold, size) {
    for (let r = startRow; r <= endRow; r++) {
      for (let c2 = startCol; c2 <= endCol; c2++) {
        const cell = ws.getCell(r, c2);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        if (fontColor) cell.font = { color: { argb: fontColor }, bold: bold || false, size: size || 10 };
      }
    }
  }

  // ===== HEADER BAND (rows 1-3) =====
  fillRange(1, 1, 3, 7, c.primary, c.white, true, 10);
  fillRange(1, 5, 1, 7, c.accent, c.white, false, 10);

  ws.getRow(2).height = 36;
  const titleCell = ws.getCell('B2');
  titleCell.value = 'RECEIPT';
  titleCell.font = { size: 24, bold: true, color: { argb: c.white } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.primary } };

  const logoCell = ws.getCell('F2');
  logoCell.value = 'YOUR LOGO';
  logoCell.font = { size: 11, bold: true, color: { argb: c.white } };
  logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.accent } };
  logoCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Accent stripe (row 4)
  fillRange(4, 1, 4, 7, c.highlight, null, false, 8);
  ws.getRow(4).height = 4;

  // ===== META ROW (row 5-6) =====
  fillRange(5, 1, 6, 7, c.light, null, false, 10);

  ws.getCell('B5').value = 'Receipt #';
  ws.getCell('B5').font = { size: 8, bold: true, color: { argb: c.muted } };
  ws.getCell('B6').value = 'REC-001';
  ws.getCell('B6').font = { size: 10, color: { argb: c.text } };
  ws.getCell('B6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.white } };
  ws.getCell('B6').border = { bottom: { style: 'thin', color: { argb: c.accent } } };

  ws.getCell('D5').value = 'Date of Payment';
  ws.getCell('D5').font = { size: 8, bold: true, color: { argb: c.muted } };
  ws.mergeCells('D6:E6');
  ws.getCell('D6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.white } };
  ws.getCell('D6').border = { bottom: { style: 'thin', color: { argb: c.accent } } };
  ws.getCell('D6').numFmt = 'MM/DD/YYYY';

  ws.getCell('F5').value = 'Payment Method';
  ws.getCell('F5').font = { size: 8, bold: true, color: { argb: c.muted } };
  ws.getCell('F6').value = 'Cash';
  ws.getCell('F6').font = { size: 10, color: { argb: c.text } };
  ws.getCell('F6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.white } };
  ws.getCell('F6').border = { bottom: { style: 'thin', color: { argb: c.accent } } };

  ws.getRow(7).height = 10;

  // ===== FROM / RECEIPT FOR (rows 8-14) =====
  ws.getCell('B8').value = ' FROM';
  ws.getCell('B8').font = { size: 9, bold: true, color: { argb: c.white } };
  ws.getCell('B8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.primary } };

  ws.mergeCells('E8:F8');
  ws.getCell('E8').value = ' RECEIPT FOR';
  ws.getCell('E8').font = { size: 9, bold: true, color: { argb: c.white } };
  ws.getCell('E8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.highlight } };

  const fromLabels = ['Business Name', 'Address Line 1', 'Address Line 2', 'Email', 'Phone'];
  const toLabels = ['Client / Company', 'Address Line 1', 'Address Line 2', 'Email', 'Phone'];

  for (let i = 0; i < fromLabels.length; i++) {
    const row = 9 + i;

    ws.getCell(row, 2).value = fromLabels[i];
    ws.getCell(row, 2).font = { size: 8, italic: true, color: { argb: c.muted } };
    ws.getCell(row, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
    ws.getCell(row, 3).border = { bottom: { style: 'thin', color: { argb: c.accent } } };

    ws.getCell(row, 5).value = toLabels[i];
    ws.getCell(row, 5).font = { size: 8, italic: true, color: { argb: c.muted } };
    ws.getCell(row, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
    ws.getCell(row, 6).border = { bottom: { style: 'thin', color: { argb: c.accent } } };
  }

  ws.getRow(14).height = 10;

  // ===== ITEMIZED TABLE (rows 15 onwards) =====
  const tableHeaderRow = 15;

  const thCells = [
    { col: 2, label: 'DESCRIPTION', span: 2 },
    { col: 4, label: 'QTY' },
    { col: 5, label: 'UNIT PRICE ($)' },
    { col: 6, label: 'AMOUNT' },
  ];

  ws.mergeCells(`B${tableHeaderRow}:C${tableHeaderRow}`);

  for (const th of thCells) {
    const cell = ws.getCell(tableHeaderRow, th.col);
    cell.value = th.label;
    cell.font = { size: 9, bold: true, color: { argb: c.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.primary } };
    cell.alignment = { horizontal: th.col >= 4 ? 'center' : 'left', vertical: 'middle' };
  }

  const firstDataRow = tableHeaderRow + 1;
  for (let i = 0; i < LINE_ROWS; i++) {
    const row = firstDataRow + i;
    ws.mergeCells(`B${row}:C${row}`);

    const bgColor = i % 2 === 1 ? c.light : c.white;

    const descCell = ws.getCell(row, 2);
    descCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    descCell.border = { bottom: { style: 'hair', color: { argb: c.accent } } };

    const qtyCell = ws.getCell(row, 4);
    qtyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    qtyCell.alignment = { horizontal: 'center' };
    qtyCell.border = { bottom: { style: 'hair', color: { argb: c.accent } } };

    const rateCell = ws.getCell(row, 5);
    rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    rateCell.numFmt = '$#,##0.00';
    rateCell.alignment = { horizontal: 'center' };
    rateCell.border = { bottom: { style: 'hair', color: { argb: c.accent } } };

    const amtCell = ws.getCell(row, 6);
    amtCell.value = { formula: `IF(AND(D${row}<>"",E${row}<>""),D${row}*E${row},"")` };
    amtCell.numFmt = '$#,##0.00';
    amtCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
    amtCell.alignment = { horizontal: 'right' };
    amtCell.font = { bold: true, color: { argb: c.text } };
    amtCell.border = { bottom: { style: 'hair', color: { argb: c.accent } } };
  }

  const lastDataRow = firstDataRow + LINE_ROWS - 1;

  const accentRow = lastDataRow + 1;
  fillRange(accentRow, 2, accentRow, 6, c.highlight, null, false, 8);
  ws.getRow(accentRow).height = 3;

  // ===== TOTALS SECTION =====
  const totalsStart = accentRow + 1;

  // Subtotal
  ws.getCell(totalsStart, 5).value = 'Subtotal';
  ws.getCell(totalsStart, 5).font = { size: 10, color: { argb: c.text } };
  ws.getCell(totalsStart, 5).alignment = { horizontal: 'right' };
  ws.getCell(totalsStart, 6).value = { formula: `SUM(F${firstDataRow}:F${lastDataRow})` };
  ws.getCell(totalsStart, 6).numFmt = '$#,##0.00';
  ws.getCell(totalsStart, 6).font = { size: 10, color: { argb: c.text } };
  ws.getCell(totalsStart, 6).alignment = { horizontal: 'right' };
  ws.getCell(totalsStart, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };

  // Tax
  ws.getCell(totalsStart + 1, 4).value = 'Tax Rate:';
  ws.getCell(totalsStart + 1, 4).font = { size: 8, color: { argb: c.muted } };
  ws.getCell(totalsStart + 1, 4).alignment = { horizontal: 'right' };

  ws.getCell(totalsStart + 1, 5).value = 0;
  ws.getCell(totalsStart + 1, 5).numFmt = '0.0%';
  ws.getCell(totalsStart + 1, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.white } };
  ws.getCell(totalsStart + 1, 5).border = { bottom: { style: 'thin', color: { argb: c.accent } } };
  ws.getCell(totalsStart + 1, 5).alignment = { horizontal: 'center' };
  ws.getCell(totalsStart + 1, 5).font = { size: 10, color: { argb: c.text } };

  ws.getCell(totalsStart + 1, 6).value = { formula: `F${totalsStart}*E${totalsStart + 1}` };
  ws.getCell(totalsStart + 1, 6).numFmt = '$#,##0.00';
  ws.getCell(totalsStart + 1, 6).font = { size: 10, color: { argb: c.text } };
  ws.getCell(totalsStart + 1, 6).alignment = { horizontal: 'right' };
  ws.getCell(totalsStart + 1, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };

  // Total Paid
  const totalPaidRow = totalsStart + 2;
  ws.getCell(totalPaidRow, 5).value = 'TOTAL PAID';
  ws.getCell(totalPaidRow, 5).font = { size: 12, bold: true, color: { argb: c.white } };
  ws.getCell(totalPaidRow, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.primary } };
  ws.getCell(totalPaidRow, 5).alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getCell(totalPaidRow, 6).value = { formula: `F${totalsStart}+F${totalsStart + 1}` };
  ws.getCell(totalPaidRow, 6).numFmt = '$#,##0.00';
  ws.getCell(totalPaidRow, 6).font = { size: 12, bold: true, color: { argb: c.white } };
  ws.getCell(totalPaidRow, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.primary } };
  ws.getCell(totalPaidRow, 6).alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getRow(totalPaidRow).height = 28;

  // Amount Tendered (editable)
  const tenderedRow = totalPaidRow + 1;
  ws.getCell(tenderedRow, 5).value = 'Amount Tendered';
  ws.getCell(tenderedRow, 5).font = { size: 10, color: { argb: c.text } };
  ws.getCell(tenderedRow, 5).alignment = { horizontal: 'right' };
  ws.getCell(tenderedRow, 6).value = 0;
  ws.getCell(tenderedRow, 6).numFmt = '$#,##0.00';
  ws.getCell(tenderedRow, 6).font = { size: 10, color: { argb: c.text } };
  ws.getCell(tenderedRow, 6).alignment = { horizontal: 'right' };
  ws.getCell(tenderedRow, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.white } };
  ws.getCell(tenderedRow, 6).border = { bottom: { style: 'thin', color: { argb: c.accent } } };

  // Change Due (auto-calc)
  const changeRow = tenderedRow + 1;
  ws.getCell(changeRow, 5).value = 'CHANGE DUE';
  ws.getCell(changeRow, 5).font = { size: 11, bold: true, color: { argb: c.white } };
  ws.getCell(changeRow, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.highlight } };
  ws.getCell(changeRow, 5).alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getCell(changeRow, 6).value = { formula: `IF(F${tenderedRow}>0,F${tenderedRow}-F${totalPaidRow},"")` };
  ws.getCell(changeRow, 6).numFmt = '$#,##0.00';
  ws.getCell(changeRow, 6).font = { size: 11, bold: true, color: { argb: c.white } };
  ws.getCell(changeRow, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.highlight } };
  ws.getCell(changeRow, 6).alignment = { horizontal: 'right', vertical: 'middle' };
  ws.getRow(changeRow).height = 24;

  // ===== RECEIPT TERMS & NOTES =====
  const footerStart = changeRow + 2;

  ws.getCell(footerStart, 2).value = 'RECEIPT TERMS';
  ws.getCell(footerStart, 2).font = { size: 8, bold: true, color: { argb: c.primary } };

  ws.mergeCells(`B${footerStart + 1}:C${footerStart + 2}`);
  ws.getCell(footerStart + 1, 2).value = 'This receipt confirms payment in full for the items/services listed above.';
  ws.getCell(footerStart + 1, 2).font = { size: 9, color: { argb: c.text } };
  ws.getCell(footerStart + 1, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
  ws.getCell(footerStart + 1, 2).alignment = { wrapText: true, vertical: 'top' };
  ws.getCell(footerStart + 1, 2).border = { left: { style: 'medium', color: { argb: c.highlight } } };

  ws.getCell(footerStart, 5).value = 'NOTES';
  ws.getCell(footerStart, 5).font = { size: 8, bold: true, color: { argb: c.primary } };

  ws.mergeCells(`E${footerStart + 1}:F${footerStart + 2}`);
  ws.getCell(footerStart + 1, 5).value = 'Thank you for your payment!';
  ws.getCell(footerStart + 1, 5).font = { size: 9, color: { argb: c.text } };
  ws.getCell(footerStart + 1, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
  ws.getCell(footerStart + 1, 5).alignment = { wrapText: true, vertical: 'top' };
  ws.getCell(footerStart + 1, 5).border = { left: { style: 'medium', color: { argb: c.accent } } };

  const bankRow = footerStart + 4;
  ws.getCell(bankRow, 2).value = 'PAYMENT DETAILS';
  ws.getCell(bankRow, 2).font = { size: 8, bold: true, color: { argb: c.primary } };

  ws.mergeCells(`B${bankRow + 1}:F${bankRow + 1}`);
  ws.getCell(bankRow + 1, 2).value = 'Bank: Example Bank  |  Account: 1234 5678  |  Routing: 987654321  |  PayPal: you@email.com';
  ws.getCell(bankRow + 1, 2).font = { size: 9, color: { argb: c.text } };
  ws.getCell(bankRow + 1, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };

  const footerBarRow = bankRow + 3;
  fillRange(footerBarRow, 1, footerBarRow, 7, c.primary, c.white, false, 7);
  ws.getCell(footerBarRow, 2).value = 'Professional Receipt Template';
  ws.getCell(footerBarRow, 2).font = { size: 7, color: { argb: c.white } };
  ws.getRow(footerBarRow).height = 18;

  ws.pageSetup.printArea = `A1:G${footerBarRow}`;

  ws.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: true,
  });

  const editableCells = ['B6', 'D6', 'F6'];

  for (let i = 9; i <= 13; i++) {
    editableCells.push(`C${i}`, `F${i}`);
  }

  for (let i = firstDataRow; i <= lastDataRow; i++) {
    editableCells.push(`B${i}`, `D${i}`, `E${i}`);
  }

  editableCells.push(
    `E${totalsStart + 1}`,        // Tax rate
    `F${tenderedRow}`,             // Amount tendered
    `B${footerStart + 1}`,        // Receipt terms
    `E${footerStart + 1}`,        // Notes
    `B${bankRow + 1}`,            // Bank details
  );

  for (const ref of editableCells) {
    ws.getCell(ref).protection = { locked: false };
  }

  const schemeLabel = schemeName.charAt(0).toUpperCase() + schemeName.slice(1);
  const filename = `Receipt-Template-${schemeLabel === 'Forest' ? 'Forest-Green' : schemeLabel}.xlsx`;
  const filepath = path.join(__dirname, 'output', filename);
  await wb.xlsx.writeFile(filepath);

  const stats = require('fs').statSync(filepath);
  console.log(`✓ Generated: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
  return filepath;
}

async function main() {
  console.log('Generating Receipt Spreadsheets...\n');

  for (const scheme of ['navy', 'forest', 'terracotta', 'charcoal']) {
    await generateReceiptSheet(scheme);
  }

  console.log('\nDone! Receipt spreadsheets generated in ./output/');
}

main().catch(console.error);
