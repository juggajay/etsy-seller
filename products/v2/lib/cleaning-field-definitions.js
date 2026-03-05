// =============================================================
// Cleaning Business Invoice — Field Definitions + Auto-Calc Formulas
// Services (4 rows) + Supplies (4 rows) + Tax + Discount
// =============================================================

const SERVICE_ROWS = 4;
const SUPPLY_ROWS = 4;

// --- Invoice page formulas ---

function serviceAmountFormula(i) {
  return `var h=this.getField("r_hours_${i}").value;var r=this.getField("r_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function supplyAmountFormula(i) {
  return `var q=this.getField("s_qty_${i}").value;var c=this.getField("s_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

const serviceSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= SERVICE_ROWS; i++) {
    js += `var a=this.getField("r_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const supplySubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= SUPPLY_ROWS; i++) {
    js += `var a=this.getField("s_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const subtotalFormula = 'var l=Number(this.getField("service_subtotal").value)||0;var m=Number(this.getField("supplies_subtotal").value)||0;var t=l+m;event.value=t>0?t.toFixed(2):""';

const taxAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const discountAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("discount_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const totalDueFormula = 'var s=Number(this.getField("subtotal").value)||0;var tax=Number(this.getField("tax_amount").value)||0;var disc=Number(this.getField("discount_amount").value)||0;var total=s+tax-disc;event.value=total>0?"$"+total.toFixed(2):""';

// --- Quote page formulas (q_ prefixed) ---

function qServiceAmountFormula(i) {
  return `var h=this.getField("q_r_hours_${i}").value;var r=this.getField("q_r_rate_${i}").value;if(h&&r&&!isNaN(h)&&!isNaN(r)){event.value=(Number(h)*Number(r)).toFixed(2)}else{event.value=""}`;
}

function qSupplyAmountFormula(i) {
  return `var q=this.getField("q_s_qty_${i}").value;var c=this.getField("q_s_cost_${i}").value;if(q&&c&&!isNaN(q)&&!isNaN(c)){event.value=(Number(q)*Number(c)).toFixed(2)}else{event.value=""}`;
}

const qServiceSubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= SERVICE_ROWS; i++) {
    js += `var a=this.getField("q_r_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qSupplySubtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= SUPPLY_ROWS; i++) {
    js += `var a=this.getField("q_s_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qSubtotalFormula = 'var l=Number(this.getField("q_service_subtotal").value)||0;var m=Number(this.getField("q_supplies_subtotal").value)||0;var t=l+m;event.value=t>0?t.toFixed(2):""';

const qTaxAmountFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var r=Number(this.getField("q_tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const qTotalFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var tax=Number(this.getField("q_tax_amount").value)||0;var total=s+tax;event.value=total>0?"$"+total.toFixed(2):""';

// --- Invoice field definitions ---

function invoiceServiceFields() {
  const fields = [];
  for (let i = 1; i <= SERVICE_ROWS; i++) {
    fields.push(
      { name: `r_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `r_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `r_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `r_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: serviceAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function invoiceSupplyFields() {
  const fields = [];
  for (let i = 1; i <= SUPPLY_ROWS; i++) {
    fields.push(
      { name: `s_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `s_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `s_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `s_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: supplyAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
  // Service details
  { name: 'service_address',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'date_of_service',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'service_type',      readOnly: false, alignment: 0, fontSize: 8 },
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
  // Services (room/area)
  ...invoiceServiceFields(),
  // Supplies
  ...invoiceSupplyFields(),
  // Totals
  { name: 'service_subtotal',   readOnly: true,  alignment: 2, fontSize: 8, calcJs: serviceSubtotalFormula, style: 'calculated' },
  { name: 'supplies_subtotal',  readOnly: true,  alignment: 2, fontSize: 8, calcJs: supplySubtotalFormula, style: 'calculated' },
  { name: 'subtotal',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',           readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'tax_amount',         readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'discount_rate',      readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  { name: 'discount_amount',    readOnly: true,  alignment: 2, fontSize: 9, calcJs: discountAmountFormula, style: 'calculated' },
  // Service schedule
  { name: 'recurring_schedule', readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'next_service_date',  readOnly: false, alignment: 0, fontSize: 8 },
  // Total Due
  { name: 'total_due', readOnly: true, alignment: 2, fontSize: 11, calcJs: totalDueFormula, style: 'total' },
  // Footer
  { name: 'payment_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Payment due within 7 days of invoice date.' },
  { name: 'notes',         readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for choosing our cleaning services!' },
  { name: 'bank_details',  readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  BSB: 012-345  |  Account: 1234 5678  |  ABN: 12 345 678 901' },
];

// --- Quote field definitions (q_ prefix) ---

function quoteServiceFields() {
  const fields = [];
  for (let i = 1; i <= SERVICE_ROWS; i++) {
    fields.push(
      { name: `q_r_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_r_hours_${i}`,  readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_r_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_r_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qServiceAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

function quoteSupplyFields() {
  const fields = [];
  for (let i = 1; i <= SUPPLY_ROWS; i++) {
    fields.push(
      { name: `q_s_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_s_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_s_cost_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_s_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qSupplyAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // Service details
  { name: 'q_service_address', readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_service_type',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_recurring',       readOnly: false, alignment: 0, fontSize: 8 },
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
  // Services
  ...quoteServiceFields(),
  // Supplies
  ...quoteSupplyFields(),
  // Totals
  { name: 'q_service_subtotal',  readOnly: true,  alignment: 2, fontSize: 8, calcJs: qServiceSubtotalFormula, style: 'calculated' },
  { name: 'q_supplies_subtotal', readOnly: true,  alignment: 2, fontSize: 8, calcJs: qSupplySubtotalFormula, style: 'calculated' },
  { name: 'q_subtotal',          readOnly: true,  alignment: 2, fontSize: 9, calcJs: qSubtotalFormula, style: 'calculated' },
  { name: 'q_tax_rate',          readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'q_tax_amount',        readOnly: true,  alignment: 2, fontSize: 9, calcJs: qTaxAmountFormula, style: 'calculated' },
  { name: 'q_total',             readOnly: true,  alignment: 2, fontSize: 11, calcJs: qTotalFormula, style: 'total' },
  // Footer
  { name: 'q_validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'q_notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for considering our cleaning services!' },
  { name: 'q_scope',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Scope includes all rooms/areas and supplies listed above. Additional services subject to separate quote.' },
];

// --- Calculation order ---

const INVOICE_CO = [
  // Service amounts
  ...Array.from({ length: SERVICE_ROWS }, (_, i) => `r_amount_${i + 1}`),
  // Supply amounts
  ...Array.from({ length: SUPPLY_ROWS }, (_, i) => `s_amount_${i + 1}`),
  // Subtotals
  'service_subtotal',
  'supplies_subtotal',
  'subtotal',
  'tax_amount',
  'discount_amount',
  // Final
  'total_due',
];

const QUOTE_CO = [
  ...Array.from({ length: SERVICE_ROWS }, (_, i) => `q_r_amount_${i + 1}`),
  ...Array.from({ length: SUPPLY_ROWS }, (_, i) => `q_s_amount_${i + 1}`),
  'q_service_subtotal',
  'q_supplies_subtotal',
  'q_subtotal',
  'q_tax_amount',
  'q_total',
];

const CLEANING_FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
};

module.exports = { CLEANING_FIELD_DEFS, SERVICE_ROWS, SUPPLY_ROWS };
