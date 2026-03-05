// =============================================================
// Freelancer Invoice — Field Definitions + Auto-Calc Formulas
// Tasks (6 rows) + Deposit tracking + Late fee
// =============================================================

const TASK_ROWS = 6;

// --- Invoice page formulas ---

function taskAmountFormula(i) {
  return `var h=this.getField("t_hours_${i}").value;var r=this.getField("t_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

const subtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= TASK_ROWS; i++) {
    js += `var a=this.getField("t_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const taxAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const totalFormula = 'var s=Number(this.getField("subtotal").value)||0;var tax=Number(this.getField("tax_amount").value)||0;var total=s+tax;event.value=total>0?total.toFixed(2):""';

const balanceDueFormula = 'var total=Number(this.getField("total").value)||0;var dep=Number(this.getField("deposit_amount").value)||0;var bal=total-dep;event.value=bal>0?"$"+bal.toFixed(2):""';

// --- Quote page formulas (q_ prefixed) ---

function qTaskAmountFormula(i) {
  return `var h=this.getField("q_t_hours_${i}").value;var r=this.getField("q_t_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

const qSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= TASK_ROWS; i++) {
    js += `var a=this.getField("q_t_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qTaxAmountFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var r=Number(this.getField("q_tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const qTotalFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var tax=Number(this.getField("q_tax_amount").value)||0;var total=s+tax;event.value=total>0?"$"+total.toFixed(2):""';

// --- Invoice field definitions ---

function invoiceTaskFields() {
  const fields = [];
  for (let i = 1; i <= TASK_ROWS; i++) {
    fields.push(
      { name: `t_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `t_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `t_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `t_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: taskAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
  // Project details
  { name: 'project_name',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'client_po',       readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'payment_terms',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Net 30' },
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
  // Tasks
  ...invoiceTaskFields(),
  // Totals
  { name: 'subtotal',        readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',        readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'tax_amount',      readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'total',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: totalFormula, style: 'calculated' },
  { name: 'late_fee_rate',   readOnly: false, alignment: 1, fontSize: 8, defaultValue: '1.5', style: 'editable' },
  { name: 'deposit_amount',  readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  // Balance Due
  { name: 'balance_due', readOnly: true, alignment: 2, fontSize: 11, calcJs: balanceDueFormula, style: 'total' },
  // Footer
  { name: 'payment_info',  readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Payment due within terms specified. Late fees of 1.5% per month apply after due date.' },
  { name: 'notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for your business!' },
  { name: 'bank_details',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  BSB: 012-345  |  Account: 1234 5678  |  PayPal: you@email.com' },
];

// --- Quote field definitions (q_ prefix) ---

function quoteTaskFields() {
  const fields = [];
  for (let i = 1; i <= TASK_ROWS; i++) {
    fields.push(
      { name: `q_t_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_t_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_t_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_t_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qTaskAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // Project details
  { name: 'q_project_name',  readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_client_po',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_timeline',      readOnly: false, alignment: 0, fontSize: 8 },
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
  // Tasks
  ...quoteTaskFields(),
  // Totals
  { name: 'q_subtotal',     readOnly: true,  alignment: 2, fontSize: 9, calcJs: qSubtotalFormula, style: 'calculated' },
  { name: 'q_tax_rate',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'q_tax_amount',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: qTaxAmountFormula, style: 'calculated' },
  { name: 'q_total',        readOnly: true,  alignment: 2, fontSize: 11, calcJs: qTotalFormula, style: 'total' },
  // Footer
  { name: 'q_validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'q_notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for considering my services!' },
  { name: 'q_scope',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Scope includes all tasks listed above. Additional work or revisions beyond scope subject to separate quote.' },
];

// --- Calculation order ---

const INVOICE_CO = [
  ...Array.from({ length: TASK_ROWS }, (_, i) => `t_amount_${i + 1}`),
  'subtotal',
  'tax_amount',
  'total',
  'balance_due',
];

const QUOTE_CO = [
  ...Array.from({ length: TASK_ROWS }, (_, i) => `q_t_amount_${i + 1}`),
  'q_subtotal',
  'q_tax_amount',
  'q_total',
];

const FREELANCER_FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
};

module.exports = { FREELANCER_FIELD_DEFS, TASK_ROWS };
