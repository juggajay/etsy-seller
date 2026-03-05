// =============================================================
// Photography Invoice — Field Definitions + Auto-Calc Formulas
// Packages + Add-ons + Deposit/Balance tracking
// =============================================================

const ADDON_ROWS = 5;

// --- Invoice page formulas ---

// Add-on amount = qty × rate
function addonAmountFormula(i) {
  return `var q=this.getField("addon_qty_${i}").value;var r=this.getField("addon_rate_${i}").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}`;
}

// Subtotal = package_price + sum of addon amounts
const subtotalFormula = (() => {
  let js = 'var t=0;var p=this.getField("package_price").value;if(p&&!isNaN(p))t+=Number(p);';
  for (let i = 1; i <= ADDON_ROWS; i++) {
    js += `var a=this.getField("addon_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const taxAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const totalFormula = 'var s=Number(this.getField("subtotal").value)||0;var tax=Number(this.getField("tax_amount").value)||0;var total=s+tax;event.value=total>0?total.toFixed(2):""';

const balanceDueFormula = 'var total=Number(this.getField("total").value)||0;var dep=Number(this.getField("deposit_amount").value)||0;var bal=total-dep;event.value=bal>0?"$"+bal.toFixed(2):""';

// --- Quote page formulas (q_ prefixed) ---

function qAddonAmountFormula(i) {
  return `var q=this.getField("q_addon_qty_${i}").value;var r=this.getField("q_addon_rate_${i}").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}`;
}

const qSubtotalFormula = (() => {
  let js = 'var t=0;var p=this.getField("q_package_price").value;if(p&&!isNaN(p))t+=Number(p);';
  for (let i = 1; i <= ADDON_ROWS; i++) {
    js += `var a=this.getField("q_addon_amount_${i}").value;if(a&&!isNaN(a))t+=Number(a);`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const qTaxAmountFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var r=Number(this.getField("q_tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

const qTotalFormula = 'var s=Number(this.getField("q_subtotal").value)||0;var tax=Number(this.getField("q_tax_amount").value)||0;var total=s+tax;event.value=total>0?"$"+total.toFixed(2):""';

// --- Invoice field definitions ---

function invoiceAddonFields() {
  const fields = [];
  for (let i = 1; i <= ADDON_ROWS; i++) {
    fields.push(
      { name: `addon_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `addon_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `addon_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `addon_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: addonAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
  // Session details
  { name: 'session_type',     readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Wedding' },
  { name: 'session_date',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'session_location', readOnly: false, alignment: 0, fontSize: 8 },
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
  // Package
  { name: 'package_desc',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'package_photos',  readOnly: false, alignment: 1, fontSize: 8 },
  { name: 'package_price',   readOnly: false, alignment: 2, fontSize: 8 },
  // Add-ons
  ...invoiceAddonFields(),
  // Totals
  { name: 'subtotal',        readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',        readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'tax_amount',      readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'total',           readOnly: true,  alignment: 2, fontSize: 9, calcJs: totalFormula, style: 'calculated' },
  // Deposit & Balance
  { name: 'deposit_amount',  readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  { name: 'deposit_date',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'balance_due',     readOnly: true,  alignment: 2, fontSize: 11, calcJs: balanceDueFormula, style: 'total' },
  { name: 'balance_due_date', readOnly: false, alignment: 0, fontSize: 8 },
  // Usage Rights
  { name: 'usage_rights',    readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Personal use print release included. Commercial licensing available upon request.' },
  // Footer
  { name: 'delivery_timeline', readOnly: false, alignment: 0, fontSize: 8, defaultValue: '4-6 weeks' },
  { name: 'payment_info',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: '50% deposit to secure booking. Balance due 7 days before session date.' },
  { name: 'notes',           readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for choosing us to capture your special moments!' },
  { name: 'bank_details',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  BSB: 012-345  |  Account: 1234 5678  |  PayPal: you@email.com' },
];

// --- Quote field definitions (q_ prefix) ---

function quoteAddonFields() {
  const fields = [];
  for (let i = 1; i <= ADDON_ROWS; i++) {
    fields.push(
      { name: `q_addon_desc_${i}`,   readOnly: false, alignment: 0, fontSize: 8 },
      { name: `q_addon_qty_${i}`,    readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_addon_rate_${i}`,   readOnly: false, alignment: 1, fontSize: 8 },
      { name: `q_addon_amount_${i}`, readOnly: true,  alignment: 2, fontSize: 8, calcJs: qAddonAmountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // Session details
  { name: 'q_session_type',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_session_date',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_session_location', readOnly: false, alignment: 0, fontSize: 8 },
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
  // Package
  { name: 'q_package_desc',    readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'q_package_photos',  readOnly: false, alignment: 1, fontSize: 8 },
  { name: 'q_package_price',   readOnly: false, alignment: 2, fontSize: 8 },
  // Add-ons
  ...quoteAddonFields(),
  // Totals
  { name: 'q_subtotal',     readOnly: true,  alignment: 2, fontSize: 9, calcJs: qSubtotalFormula, style: 'calculated' },
  { name: 'q_tax_rate',     readOnly: false, alignment: 1, fontSize: 8, defaultValue: '10', style: 'editable' },
  { name: 'q_tax_amount',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: qTaxAmountFormula, style: 'calculated' },
  { name: 'q_total',        readOnly: true,  alignment: 2, fontSize: 11, calcJs: qTotalFormula, style: 'total' },
  // Footer
  { name: 'q_usage_rights',    readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Personal use print release included. Commercial licensing available upon request.' },
  { name: 'q_delivery_timeline', readOnly: false, alignment: 0, fontSize: 8, defaultValue: '4-6 weeks' },
  { name: 'q_validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'q_notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'We look forward to capturing your special moments!' },
];

// --- Calculation order ---

const INVOICE_CO = [
  ...Array.from({ length: ADDON_ROWS }, (_, i) => `addon_amount_${i + 1}`),
  'subtotal',
  'tax_amount',
  'total',
  'balance_due',
];

const QUOTE_CO = [
  ...Array.from({ length: ADDON_ROWS }, (_, i) => `q_addon_amount_${i + 1}`),
  'q_subtotal',
  'q_tax_amount',
  'q_total',
];

const PHOTOGRAPHY_FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
};

module.exports = { PHOTOGRAPHY_FIELD_DEFS, ADDON_ROWS };
