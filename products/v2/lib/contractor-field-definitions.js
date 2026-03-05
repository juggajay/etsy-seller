// =============================================================
// Contractor Invoice — Field Definitions + Auto-Calc Formulas
// Labour (4 rows) + Materials (4 rows) + Markup + Call-out fee
// =============================================================

const LABOUR_ROWS = 4;
const MATERIAL_ROWS = 4;

// --- Invoice page formulas ---

function labourAmountFormula(i) {
  return `var h=this.getField("labour_hours_${i}").value;var r=this.getField("labour_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function materialAmountFormula(i) {
  return `var q=this.getField("mat_qty_${i}").value;var c=this.getField("mat_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

// Labour subtotal
const labourSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    js += `var a=this.getField("labour_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

// Materials subtotal (before markup)
const materialsSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    js += `var a=this.getField("mat_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

// Materials markup amount
const markupAmountFormula = 'var ms=Number(this.getField("materials_subtotal").value)||0;var mp=Number(this.getField("markup_percent").value)||0;var m=ms*(mp/100);event.value=m>0?m.toFixed(2):""';

// Grand subtotal = labour + materials + markup + callout
const subtotalFormula = 'var l=Number(this.getField("labour_subtotal").value)||0;var ms=Number(this.getField("materials_subtotal").value)||0;var mu=Number(this.getField("markup_amount").value)||0;var co=Number(this.getField("callout_fee").value)||0;var t=l+ms+mu+co;event.value=t>0?t.toFixed(2):""';

const taxAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const totalFormula = 'var s=Number(this.getField("subtotal").value)||0;var tax=Number(this.getField("tax_amount").value)||0;var total=s+tax;event.value=total>0?total.toFixed(2):""';

const balanceDueFormula = 'var total=Number(this.getField("total").value)||0;var dep=Number(this.getField("deposit_amount").value)||0;var bal=total-dep;event.value=bal>0?"$"+bal.toFixed(2):""';

// --- Quote page formulas (q_ prefixed) ---

function qLabourAmountFormula(i) {
  return `var h=this.getField("q_labour_hours_${i}").value;var r=this.getField("q_labour_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function qMaterialAmountFormula(i) {
  return `var q=this.getField("q_mat_qty_${i}").value;var c=this.getField("q_mat_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

const qLabourSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    js += `var a=this.getField("q_labour_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qMaterialsSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    js += `var a=this.getField("q_mat_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qMarkupAmountFormula = 'var ms=Number(this.getField("q_materials_subtotal").value)||0;var mp=Number(this.getField("q_markup_percent").value)||0;var m=ms*(mp/100);event.value=m>0?m.toFixed(2):""';

const qSubtotalFormula = 'var l=Number(this.getField("q_labour_subtotal").value)||0;var ms=Number(this.getField("q_materials_subtotal").value)||0;var mu=Number(this.getField("q_markup_amount").value)||0;var co=Number(this.getField("q_callout_fee").value)||0;var t=l+ms+mu+co;event.value=t>0?t.toFixed(2):""';

const qTaxAmountFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var r=Number(this.getField("q_tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const qTotalFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var tax=Number(this.getField("q_tax_amount").value)||0;var total=s+tax;event.value=total>0?"$"+total.toFixed(2):""';

// --- Invoice field definitions ---

function invoiceLabourFields() {
  const fields = [];
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    fields.push(
      { name: `labour_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `labour_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `labour_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `labour_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: labourAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function invoiceMaterialFields() {
  const fields = [];
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    fields.push(
      { name: `mat_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `mat_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `mat_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `mat_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: materialAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
  // Job details
  { name: 'work_order',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'job_date',         readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'completion_date',  readOnly: false, alignment: 0, fontSize: 8 },
  // From
  { name: 'from_company',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'from_address',   readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'from_email',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'from_phone',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'license_number', readOnly: false, alignment: 0, fontSize: 8 },
  // Bill To
  { name: 'to_company',     readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'to_address',     readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'to_email',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'to_phone',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'job_site',       readOnly: false, alignment: 0, fontSize: 8 },
  // Labour
  ...invoiceLabourFields(),
  { name: 'labour_subtotal', readOnly: true, alignment: 2, fontSize: 8, calcJs: labourSubtotalFormula, style: 'calculated' },
  // Materials
  ...invoiceMaterialFields(),
  { name: 'materials_subtotal', readOnly: true, alignment: 2, fontSize: 8, calcJs: materialsSubtotalFormula, style: 'calculated' },
  // Markup & fees
  { name: 'markup_percent',  readOnly: false, alignment: 1, fontSize: 8, defaultValue: '15', style: 'editable' },
  { name: 'markup_amount',   readOnly: true,  alignment: 2, fontSize: 8, calcJs: markupAmountFormula, style: 'calculated' },
  { name: 'callout_fee',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  // Totals
  { name: 'subtotal',        readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',        readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'tax_amount',      readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'total',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: totalFormula, style: 'calculated' },
  { name: 'deposit_amount',  readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  // Balance Due
  { name: 'balance_due', readOnly: true, alignment: 2, fontSize: 11, calcJs: balanceDueFormula, style: 'total' },
  // Warranty & Footer
  { name: 'warranty',        readOnly: false, alignment: 0, fontSize: 8, defaultValue: '12 months labour warranty. Manufacturer warranty on all parts and materials.' },
  { name: 'payment_info',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Payment due within 14 days of invoice date. Late fees of 1.5% per month apply.' },
  { name: 'notes',           readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for your business!' },
  { name: 'bank_details',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  BSB: 012-345  |  Account: 1234 5678  |  PayPal: you@email.com' },
];

// --- Quote field definitions (q_ prefix) ---

function quoteLabourFields() {
  const fields = [];
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    fields.push(
      { name: `q_labour_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_labour_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_labour_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_labour_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qLabourAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function quoteMaterialFields() {
  const fields = [];
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    fields.push(
      { name: `q_mat_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_mat_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_mat_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_mat_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qMaterialAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // Job details
  { name: 'q_work_order',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_job_date',         readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_job_site',         readOnly: false, alignment: 0, fontSize: 8 },
  // From
  { name: 'q_from_company', readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'q_from_address', readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'q_from_email',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_from_phone',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_license_number', readOnly: false, alignment: 0, fontSize: 8 },
  // Quote For
  { name: 'q_to_company',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'q_to_address',   readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'q_to_email',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_to_phone',     readOnly: false, alignment: 0, fontSize: 8 },
  // Labour
  ...quoteLabourFields(),
  { name: 'q_labour_subtotal', readOnly: true, alignment: 2, fontSize: 8, calcJs: qLabourSubtotalFormula, style: 'calculated' },
  // Materials
  ...quoteMaterialFields(),
  { name: 'q_materials_subtotal', readOnly: true, alignment: 2, fontSize: 8, calcJs: qMaterialsSubtotalFormula, style: 'calculated' },
  // Markup & fees
  { name: 'q_markup_percent',  readOnly: false, alignment: 1, fontSize: 8, defaultValue: '15', style: 'editable' },
  { name: 'q_markup_amount',   readOnly: true,  alignment: 2, fontSize: 8, calcJs: qMarkupAmountFormula, style: 'calculated' },
  { name: 'q_callout_fee',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  // Totals
  { name: 'q_subtotal',     readOnly: true,  alignment: 2, fontSize: 9, calcJs: qSubtotalFormula, style: 'calculated' },
  { name: 'q_tax_rate',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'q_tax_amount',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: qTaxAmountFormula, style: 'calculated' },
  { name: 'q_total',        readOnly: true,  alignment: 2, fontSize: 11, calcJs: qTotalFormula, style: 'total' },
  // Footer
  { name: 'q_warranty',        readOnly: false, alignment: 0, fontSize: 8, defaultValue: '12 months labour warranty. Manufacturer warranty on all parts and materials.' },
  { name: 'q_validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'q_notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for considering our services!' },
];

// --- Calculation order ---

const INVOICE_CO = [
  ...Array.from({ length: LABOUR_ROWS }, (_, i) => `labour_amount_${i + 1}`),
  'labour_subtotal',
  ...Array.from({ length: MATERIAL_ROWS }, (_, i) => `mat_amount_${i + 1}`),
  'materials_subtotal',
  'markup_amount',
  'subtotal',
  'tax_amount',
  'total',
  'balance_due',
];

const QUOTE_CO = [
  ...Array.from({ length: LABOUR_ROWS }, (_, i) => `q_labour_amount_${i + 1}`),
  'q_labour_subtotal',
  ...Array.from({ length: MATERIAL_ROWS }, (_, i) => `q_mat_amount_${i + 1}`),
  'q_materials_subtotal',
  'q_markup_amount',
  'q_subtotal',
  'q_tax_amount',
  'q_total',
];

const CONTRACTOR_FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
};

module.exports = { CONTRACTOR_FIELD_DEFS, LABOUR_ROWS, MATERIAL_ROWS };
