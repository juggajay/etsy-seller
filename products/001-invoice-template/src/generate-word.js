const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ShadingType, VerticalAlign, TableLayoutType, convertInchesToTwip,
  PageOrientation,
} = require('docx');
const fs = require('fs');
const path = require('path');

const COLOR_SCHEMES = {
  navy: {
    name: 'Navy',
    primary: '1B365D',
    accent: '2C5282',
    light: 'EDF2F7',
    highlight: '3C78BA',
    text: '1F2023',
    muted: '718096',
  },
  forest: {
    name: 'Forest Green',
    primary: '1A4731',
    accent: '276749',
    light: 'F0FFF4',
    highlight: '34885F',
    text: '1F2020',
    muted: '6B7C72',
  },
  terracotta: {
    name: 'Terracotta',
    primary: '9C4221',
    accent: 'C05621',
    light: 'FFFAF0',
    highlight: 'D46C2D',
    text: '261A14',
    muted: '806E66',
  },
  charcoal: {
    name: 'Charcoal',
    primary: '2D3748',
    accent: '4A5568',
    light: 'F7FAFC',
    highlight: '616F87',
    text: '1F2023',
    muted: '71717A',
  },
};

const LINE_ROWS = 8;

const noBorder = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const thinBorder = (color) => ({
  top: { style: BorderStyle.SINGLE, size: 1, color },
  bottom: { style: BorderStyle.SINGLE, size: 1, color },
  left: { style: BorderStyle.SINGLE, size: 1, color },
  right: { style: BorderStyle.SINGLE, size: 1, color },
});

function headerCell(text, c, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })],
      spacing: { before: 40, after: 40 },
      indent: { left: 80 },
    })],
    shading: { type: ShadingType.SOLID, color: c.primary },
    verticalAlign: VerticalAlign.CENTER,
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: noBorder,
  });
}

function dataCell(text, widthPct, align, c, shaded) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: text || '', size: 18, color: c.text, font: 'Calibri' })],
      alignment: align || AlignmentType.LEFT,
      spacing: { before: 30, after: 30 },
      indent: { left: 80 },
    })],
    shading: shaded ? { type: ShadingType.SOLID, color: c.light } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
  });
}

function emptyCell(widthPct, c, shaded) {
  return dataCell('', widthPct, AlignmentType.LEFT, c, shaded);
}

function generateInvoiceDoc(schemeName) {
  const c = COLOR_SCHEMES[schemeName];

  // ---- HEADER ----
  const headerTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'INVOICE', bold: true, color: 'FFFFFF', size: 52, font: 'Calibri' })],
              spacing: { before: 120, after: 120 },
              indent: { left: 200 },
            })],
            shading: { type: ShadingType.SOLID, color: c.primary },
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: noBorder,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'YOUR', bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 140 },
              }),
              new Paragraph({
                children: [new TextRun({ text: 'LOGO', bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
              }),
            ],
            shading: { type: ShadingType.SOLID, color: c.accent },
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: noBorder,
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
      // Accent stripe
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
            shading: { type: ShadingType.SOLID, color: c.highlight },
            columnSpan: 2,
            borders: noBorder,
          }),
        ],
        height: { value: 80, rule: 'exact' },
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ---- META ROW ----
  const metaTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'INVOICE NO.', bold: true, color: c.muted, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: 'INV-001', size: 18, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            shading: { type: ShadingType.SOLID, color: c.light },
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            indent: { left: 200 },
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'DATE', bold: true, color: c.muted, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: '_______________', size: 18, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            shading: { type: ShadingType.SOLID, color: c.light },
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'DUE DATE', bold: true, color: c.muted, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: '_______________', size: 18, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            shading: { type: ShadingType.SOLID, color: c.light },
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ---- FROM / BILL TO ----
  const fromToFields = ['Company / Name', 'Address', 'Email', 'Phone'];

  function contactSection(label, bgColor) {
    const rows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: ` ${label}`, bold: true, color: 'FFFFFF', size: 16, font: 'Calibri' })],
              spacing: { before: 30, after: 30 },
            })],
            shading: { type: ShadingType.SOLID, color: bgColor },
            borders: noBorder,
          }),
        ],
      }),
    ];

    for (const field of fromToFields) {
      rows.push(new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: field, italics: true, color: c.muted, size: 14, font: 'Calibri' })], spacing: { before: 20 } }),
              new Paragraph({ children: [new TextRun({ text: '_________________________________', color: 'D0D0D0', size: 18, font: 'Calibri' })], spacing: { after: 20 } }),
            ],
            borders: noBorder,
          }),
        ],
      }));
    }

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    });
  }

  const fromToTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [contactSection('FROM', c.primary)],
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
          new TableCell({
            children: [new Paragraph('')],
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
          new TableCell({
            children: [contactSection('BILL TO', c.highlight)],
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ---- LINE ITEMS TABLE ----
  const tableRows = [
    new TableRow({
      children: [
        headerCell('DESCRIPTION', c, 42),
        headerCell('QTY', c, 14),
        headerCell('RATE ($)', c, 22),
        headerCell('AMOUNT', c, 22),
      ],
    }),
  ];

  for (let i = 0; i < LINE_ROWS; i++) {
    const shaded = i % 2 === 1;
    tableRows.push(new TableRow({
      children: [
        emptyCell(42, c, shaded),
        emptyCell(14, c, shaded),
        emptyCell(22, c, shaded),
        emptyCell(22, c, shaded),
      ],
    }));
  }

  const lineItemsTable = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ---- TOTALS ----
  function totalRow(label, value, isFinal) {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('')],
          width: { size: 56, type: WidthType.PERCENTAGE },
          borders: noBorder,
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: label,
              bold: isFinal,
              color: isFinal ? 'FFFFFF' : c.text,
              size: isFinal ? 22 : 18,
              font: 'Calibri',
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: isFinal ? 60 : 30, after: isFinal ? 60 : 30 },
          })],
          shading: isFinal ? { type: ShadingType.SOLID, color: c.primary } : undefined,
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: noBorder,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: value,
              bold: isFinal,
              color: isFinal ? 'FFFFFF' : c.text,
              size: isFinal ? 22 : 18,
              font: 'Calibri',
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: isFinal ? 60 : 30, after: isFinal ? 60 : 30 },
            indent: { right: 80 },
          })],
          shading: isFinal ? { type: ShadingType.SOLID, color: c.primary } : { type: ShadingType.SOLID, color: c.light },
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: noBorder,
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });
  }

  const totalsTable = new Table({
    rows: [
      totalRow('Subtotal', '$________', false),
      totalRow('Tax (___%)', '$________', false),
      totalRow('Discount', '$________', false),
      totalRow('TOTAL', '$________', true),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ---- FOOTER SECTIONS ----
  const footerTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'PAYMENT TERMS', bold: true, color: c.primary, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: 'Payment due within 30 days of invoice date.', size: 16, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: { ...noBorder, left: { style: BorderStyle.SINGLE, size: 6, color: c.highlight } },
          }),
          new TableCell({
            children: [new Paragraph('')],
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'NOTES', bold: true, color: c.primary, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: 'Thank you for your business!', size: 16, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: { ...noBorder, left: { style: BorderStyle.SINGLE, size: 6, color: c.accent } },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // Bank details
  const bankTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'BANK / PAYMENT DETAILS', bold: true, color: c.primary, size: 14, font: 'Calibri' })], spacing: { before: 60 } }),
              new Paragraph({ children: [new TextRun({ text: 'Bank: ________  |  Account: ________  |  Routing: ________  |  PayPal: ________', size: 16, color: c.text, font: 'Calibri' })], spacing: { after: 60 } }),
            ],
            shading: { type: ShadingType.SOLID, color: c.light },
            borders: noBorder,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // Footer bar
  const footerBar = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Professional Invoice Template', color: 'FFFFFF', size: 14, font: 'Calibri' })],
              spacing: { before: 30, after: 30 },
              indent: { left: 200 },
            })],
            shading: { type: ShadingType.SOLID, color: c.primary },
            borders: noBorder,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  const sp = (pts) => new Paragraph({ spacing: { before: pts, after: 0 } });

  const doc = new Document({
    creator: 'Small Business Templates',
    title: `Professional Invoice Template — ${c.name}`,
    description: 'Editable Invoice Template for Small Business',
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(0.4), bottom: convertInchesToTwip(0.4), left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
          size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11), orientation: PageOrientation.PORTRAIT },
        },
      },
      children: [
        headerTable,
        sp(160),
        metaTable,
        sp(160),
        fromToTable,
        sp(200),
        lineItemsTable,
        sp(100),
        totalsTable,
        sp(200),
        footerTable,
        sp(160),
        bankTable,
        sp(200),
        footerBar,
      ],
    }],
  });

  return doc;
}

async function main() {
  console.log('Generating Word Invoice Templates...\n');

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const scheme of ['navy', 'forest', 'terracotta', 'charcoal']) {
    const c = COLOR_SCHEMES[scheme];
    const doc = generateInvoiceDoc(scheme);
    const buffer = await Packer.toBuffer(doc);
    const filename = `Invoice-Template-${c.name.replace(/\s+/g, '-')}.docx`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    const stats = fs.statSync(filepath);
    console.log(`✓ ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  console.log('\nDone! Word templates saved to ./output/');
}

main().catch(console.error);
