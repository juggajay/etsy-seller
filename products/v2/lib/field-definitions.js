// =============================================================
// Field Definitions — configs, defaults, and auto-calc formulas
// Exact same field names and formulas as v1 generators
// =============================================================

const LINE_ROWS = 6;

// --- Auto-calc JavaScript formulas (injected into PDF AA/C actions) ---

function amountFormula(i) {
  return `var q=this.getField("qty_${i}").value;var r=this.getField("rate_${i}").value;if(q&&r&&!isNaN(q)&&!isNaN(r)){event.value=(Number(q)*Number(r)).toFixed(2)}else{event.value=""}`;
}

const subtotalFormula = (() => {
  let js = 'var t=0;';
  for (let i = 1; i <= LINE_ROWS; i++) {
    js += `var a${i}=this.getField("amount_${i}").value;if(a${i}&&!isNaN(a${i}))t+=Number(a${i});`;
  }
  js += 'event.value=t>0?t.toFixed(2):""';
  return js;
})();

const taxAmountFormula = 'var s=Number(this.getField("subtotal").value)||0;var r=Number(this.getField("tax_rate").value)||0;var t=s*(r/100);event.value=t>0?t.toFixed(2):""';

// Invoice/Quote: total = subtotal + tax - discount
const totalFormula = 'var s=Number(this.getField("subtotal").value)||0;var t=Number(this.getField("tax_amount").value)||0;var d=Number(this.getField("discount").value)||0;var total=s+t-d;event.value=total>0?"$"+total.toFixed(2):""';

// Receipt: total_paid = subtotal + tax (no discount)
const totalPaidFormula = 'var s=Number(this.getField("subtotal").value)||0;var t=Number(this.getField("tax_amount").value)||0;var total=s+t;event.value=total>0?"$"+total.toFixed(2):""';

// Receipt: change_due = amount_tendered - total_paid
const changeDueFormula = 'var a=String(this.getField("amount_tendered").value).replace(/[^0-9.]/g,"");var tendered=Number(a)||0;var tp=String(this.getField("total_paid").value).replace(/[^0-9.]/g,"");var total=Number(tp)||0;if(tendered>0){var change=tendered-total;event.value=change>=0?"$"+change.toFixed(2):""}else{event.value=""}';

// --- Field definitions per template type ---

// Shared line item fields (same across all 3 templates)
function lineItemFields() {
  const fields = [];
  for (let i = 1; i <= LINE_ROWS; i++) {
    fields.push(
      { name: `desc_${i}`,   readOnly: false, alignment: 0, fontSize: 9 },
      { name: `qty_${i}`,    readOnly: false, alignment: 1, fontSize: 9 },
      { name: `rate_${i}`,   readOnly: false, alignment: 1, fontSize: 9 },
      { name: `amount_${i}`, readOnly: true,  alignment: 2, fontSize: 9, calcJs: amountFormula(i), style: 'calculated' },
    );
  }
  return fields;
}

const INVOICE_FIELDS = [
  // Meta
  { name: 'invoice_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'INV-001' },
  { name: 'invoice_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'due_date',       readOnly: false, alignment: 0, fontSize: 9 },
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
  // Line items
  ...lineItemFields(),
  // Totals
  { name: 'subtotal',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',   readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  { name: 'tax_amount', readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'discount',   readOnly: false, alignment: 2, fontSize: 9, defaultValue: '0.00', style: 'editable' },
  { name: 'total',      readOnly: true,  alignment: 2, fontSize: 11, calcJs: totalFormula, style: 'total' },
  // Bottom
  { name: 'payment_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Payment due within 30 days of invoice date.' },
  { name: 'notes',         readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for your business!' },
  { name: 'bank_details',  readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  Account: 1234 5678  |  Routing: 987654321  |  PayPal: you@email.com' },
];

const QUOTE_FIELDS = [
  // Meta
  { name: 'quote_number', readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'QTE-001' },
  { name: 'quote_date',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'valid_until',  readOnly: false, alignment: 0, fontSize: 9 },
  // From
  { name: 'from_company', readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'from_address', readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'from_email',   readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'from_phone',   readOnly: false, alignment: 0, fontSize: 8 },
  // Quote For
  { name: 'to_company',   readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'to_address',   readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'to_email',     readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'to_phone',     readOnly: false, alignment: 0, fontSize: 8 },
  // Line items
  ...lineItemFields(),
  // Totals
  { name: 'subtotal',   readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',   readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  { name: 'tax_amount', readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'discount',   readOnly: false, alignment: 2, fontSize: 9, defaultValue: '0.00', style: 'editable' },
  { name: 'total',      readOnly: true,  alignment: 2, fontSize: 11, calcJs: totalFormula, style: 'total' },
  // Bottom
  { name: 'validity_terms', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This quote is valid for 30 days from the date issued.' },
  { name: 'notes',          readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for considering our services!' },
  { name: 'bank_details',   readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  Account: 1234 5678  |  Routing: 987654321  |  PayPal: you@email.com' },
];

const RECEIPT_FIELDS = [
  // Meta
  { name: 'receipt_number',  readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'REC-001' },
  { name: 'payment_date',    readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'payment_method',  readOnly: false, alignment: 0, fontSize: 9, defaultValue: 'Cash' },
  // From
  { name: 'from_company',    readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'from_address',    readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'from_email',      readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'from_phone',      readOnly: false, alignment: 0, fontSize: 8 },
  // Receipt For
  { name: 'to_company',      readOnly: false, alignment: 0, fontSize: 9 },
  { name: 'to_address',      readOnly: false, alignment: 0, fontSize: 8, multiline: true },
  { name: 'to_email',        readOnly: false, alignment: 0, fontSize: 8 },
  { name: 'to_phone',        readOnly: false, alignment: 0, fontSize: 8 },
  // Line items
  ...lineItemFields(),
  // Totals
  { name: 'subtotal',         readOnly: true,  alignment: 2, fontSize: 9, calcJs: subtotalFormula, style: 'calculated' },
  { name: 'tax_rate',         readOnly: false, alignment: 1, fontSize: 8, defaultValue: '0', style: 'editable' },
  { name: 'tax_amount',       readOnly: true,  alignment: 2, fontSize: 9, calcJs: taxAmountFormula, style: 'calculated' },
  { name: 'total_paid',       readOnly: true,  alignment: 2, fontSize: 11, calcJs: totalPaidFormula, style: 'total' },
  { name: 'amount_tendered',  readOnly: false, alignment: 2, fontSize: 9, style: 'editable' },
  { name: 'change_due',       readOnly: true,  alignment: 2, fontSize: 9, calcJs: changeDueFormula, style: 'calculated' },
  // Bottom
  { name: 'payment_notes', readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'This receipt confirms payment in full for the items/services listed above.' },
  { name: 'notes',         readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Thank you for your payment!' },
  { name: 'bank_details',  readOnly: false, alignment: 0, fontSize: 8, defaultValue: 'Bank: Example Bank  |  Account: 1234 5678  |  Routing: 987654321  |  PayPal: you@email.com' },
];

// --- Calculation Order arrays ---

const INVOICE_CO = [
  ...Array.from({ length: LINE_ROWS }, (_, i) => `amount_${i + 1}`),
  'subtotal',
  'tax_amount',
  'total',
];

const QUOTE_CO = [...INVOICE_CO]; // Same as invoice

const RECEIPT_CO = [
  ...Array.from({ length: LINE_ROWS }, (_, i) => `amount_${i + 1}`),
  'subtotal',
  'tax_amount',
  'total_paid',
  'change_due',
];

// --- Exports ---

const FIELD_DEFS = {
  invoice: { fields: INVOICE_FIELDS, co: INVOICE_CO },
  quote:   { fields: QUOTE_FIELDS,   co: QUOTE_CO },
  receipt: { fields: RECEIPT_FIELDS,  co: RECEIPT_CO },
};

module.exports = { FIELD_DEFS, LINE_ROWS };
