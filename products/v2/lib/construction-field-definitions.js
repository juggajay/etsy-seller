// =============================================================
// Construction Invoice — Field Definitions + Auto-Calc Formulas
// Labour (4 rows) + Materials (4 rows) + GST + Retention + Progress Claim
// =============================================================

const LABOUR_ROWS = 4;
const MATERIAL_ROWS = 4;

// --- Invoice page formulas ---

function labourAmountFormula(i) {
  return `var h=this.getField("l_hours_${i}").value;var r=this.getField("l_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function matAmountFormula(i) {
  return `var q=this.getField("m_qty_${i}").value;var c=this.getField("m_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

const labourSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    js += `var a=this.getField("l_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const matSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    js += `var a=this.getField("m_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const subtotalFormula = 'var l=Number(this.getField("labour_subtotal").value)||0;var m=Number(this.getField("materials_subtotal").value)||0;var t=l+m;event.value=t>0?t.toFixed(2):""';

const gstAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("gst_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const grossTotalFormula = 'var s=Number(this.getField("subtotal").value)||0;var g=Number(this.getField("gst_amount").value)||0;var t=s+g;event.value=t>0?t.toFixed(2):""';

const retentionAmountFormula = 'var g=Number(this.getField("gross_total").value)||0;var r=Number(this.getField("retention_rate").value)||0;var t=g*(r/100);event.value=t>0?t.toFixed(2):""';

const totalDueFormula = 'var g=Number(this.getField("gross_total").value)||0;var r=Number(this.getField("retention_amount").value)||0;var total=g-r;event.value=total>0?"$"+total.toFixed(2):""';

// Progress claim (informational tracking)
const valueToDateFormula = 'var c=Number(this.getField("contract_value").value)||0;var p=Number(this.getField("pct_complete").value)||0;var v=c*(p/100);event.value=v>0?v.toFixed(2):""';

const thisClaimFormula = 'var v=Number(this.getField("value_to_date").value)||0;var p=Number(this.getField("prev_claimed").value)||0;var t=v-p;event.value=t>0?t.toFixed(2):""';

// --- Quote page formulas (q_ prefixed) ---

function qLabourAmountFormula(i) {
  return `var h=this.getField("q_l_hours_${i}").value;var r=this.getField("q_l_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function qMatAmountFormula(i) {
  return `var q=this.getField("q_m_qty_${i}").value;var c=this.getField("q_m_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

const qLabourSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    js += `var a=this.getField("q_l_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qMatSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    js += `var a=this.getField("q_m_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qSubtotalFormula = 'var l=Number(this.getField("q_labour_subtotal").value)||0;var m=Number(this.getField("q_materials_subtotal").value)||0;var t=l+m;event.value=t>0?t.toFixed(2):""';

const qGstAmountFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var r=Number(this.getField("q_gst_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const qTotalFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var g=Number(this.getField("q_gst_amount").value)||0;var total=s+g;event.value=total>0?"$"+total.toFixed(2):""';

// --- Invoice field definitions ---

function invoiceLabourFields() {
  const fields = [];
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    fields.push(
      { name: `l_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `l_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `l_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `l_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: labourAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function invoiceMaterialFields() {
  const fields = [];
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    fields.push(
      { name: `m_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `m_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `m_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `m_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: matAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
  // Project
  { name: 'project_ref',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'job_site',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'abn_license',    readOnly: false, alignment: 0, fontSize: 8 },
  // From
  { name: 'from_company',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'from_address',   readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'from_email',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'from_phone',     readOnly: false, alignment: 0, fontSize: 8 },
  // Bill To
  { name: 'to_company',     readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'to_address',     readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'to_email',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'to_phone',       readOnly: false, alignment: 0, fontSize: 8 },
  // Labour
  ...invoiceLabourFields(),
  // Materials
  ...invoiceMaterialFields(),
  // Totals
  { name: 'labour_subtotal',    readOnly: true,  alignment: 2, fontSize: 8, calcJs: labourSubtotalFormula, style: 'calculated' },
  { name: 'materials_subtotal', readOnly: true,  alignment: 2, fontSize: 8, calcJs: matSubtotalFormula, style: 'calculated' },
  { name: 'subtotal',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'gst_rate',           readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'gst_amount',         readOnly: true,  alignment: 2, fontSize: 9, calcJs: gstAmountFormula, style: 'calculated' },
  { name: 'gross_total',        readOnly: true,  alignment: 2, fontSize: 9, calcJs: grossTotalFormula, style: 'calculated' },
  { name: 'retention_rate',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'retention_amount',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: retentionAmountFormula, style: 'calculated' },
  // Progress Claim
  { name: 'contract_value',  readOnly: false, alignment: 2, fontSize: 8 },
  { name: 'pct_complete',    readOnly: false, alignment: 1, fontSize: 8 },
  { name: 'value_to_date',   readOnly: true,  alignment: 2, fontSize: 8, calcJs: valueToDateFormula, style: 'calculated' },
  { name: 'prev_claimed',    readOnly: false, alignment: 2, fontSize: 8 },
  { name: 'this_claim',      readOnly: true,  alignment: 2, fontSize: 8, calcJs: thisClaimFormula, style: 'calculated' },
  // Total Due
  { name: 'total_due', readOnly: true, alignment: 2, fontSize: 11, calcJs: totalDueFormula, style: 'total' },
  // Footer
  { name: 'payment_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Payment due within 14 days of invoice date. Progress payments as per contract schedule.' },
  { name: 'notes',         readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for your business!' },
  { name: 'bank_details',  readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  BSB: 012-345  |  Account: 1234 5678  |  ABN: 12 345 678 901' },
];

// --- Quote field definitions (q_ prefix) ---

function quoteLabourFields() {
  const fields = [];
  for (let i = 1; i <= LABOUR_ROWS; i++) {
    fields.push(
      { name: `q_l_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_l_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_l_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_l_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qLabourAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function quoteMaterialFields() {
  const fields = [];
  for (let i = 1; i <= MATERIAL_ROWS; i++) {
    fields.push(
      { name: `q_m_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_m_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_m_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_m_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qMatAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // Project
  { name: 'q_project_ref',  readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_job_site',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_abn_license',  readOnly: false, alignment: 0, fontSize: 8 },
  // From
  { name: 'q_from_company', readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'q_from_address', readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'q_from_email',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_from_phone',   readOnly: false, alignment: 0, fontSize: 8 },
  // Quote For
  { name: 'q_to_company',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'q_to_address',   readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'q_to_email',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_to_phone',     readOnly: false, alignment: 0, fontSize: 8 },
  // Labour
  ...quoteLabourFields(),
  // Materials
  ...quoteMaterialFields(),
  // Totals
  { name: 'q_labour_subtotal',    readOnly: true,  alignment: 2, fontSize: 8, calcJs: qLabourSubtotalFormula, style: 'calculated' },
  { name: 'q_materials_subtotal', readOnly: true,  alignment: 2, fontSize: 8, calcJs: qMatSubtotalFormula, style: 'calculated' },
  { name: 'q_subtotal',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: qSubtotalFormula, style: 'calculated' },
  { name: 'q_gst_rate',           readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'q_gst_amount',         readOnly: true,  alignment: 2, fontSize: 9, calcJs: qGstAmountFormula, style: 'calculated' },
  { name: 'q_total',              readOnly: true,  alignment: 2, fontSize: 11, calcJs: qTotalFormula, style: 'total' },
  // Footer
  { name: 'q_validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'q_notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for considering our services!' },
  { name: 'q_scope',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Scope includes all labour and materials listed above. Variations subject to written approval.' },
];

// --- Calculation order ---

const INVOICE_CO = [
  // Labour amounts
  ...Array.from({ length: LABOUR_ROWS }, (_, i) => `l_amount_${i + 1}`),
  // Material amounts
  ...Array.from({ length: MATERIAL_ROWS }, (_, i) => `m_amount_${i + 1}`),
  // Subtotals
  'labour_subtotal',
  'materials_subtotal',
  'subtotal',
  'gst_amount',
  'gross_total',
  'retention_amount',
  // Progress claim
  'value_to_date',
  'this_claim',
  // Final
  'total_due',
];

const QUOTE_CO = [
  ...Array.from({ length: LABOUR_ROWS }, (_, i) => `q_l_amount_${i + 1}`),
  ...Array.from({ length: MATERIAL_ROWS }, (_, i) => `q_m_amount_${i + 1}`),
  'q_labour_subtotal',
  'q_materials_subtotal',
  'q_subtotal',
  'q_gst_amount',
  'q_total',
];

const CONSTRUCTION_FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
};

module.exports = { CONSTRUCTION_FIELD_DEFS, LABOUR_ROWS, MATERIAL_ROWS };
