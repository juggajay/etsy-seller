# Etsy Digital Store

Digital template products sold on Etsy (shop: TeelightfullTees).

## Structure

```
products/           # Each product is self-contained
  001-invoice-template/
    src/            # Generation scripts + dependencies
    output/         # Built files (gitignored)
    listing.md      # Etsy listing copy, tags, pricing
store/              # Store-level strategy & docs
research/           # Market research & demand signals
```

## Products

| # | Product | Status | Price |
|---|---------|--------|-------|
| 001 | Auto-Calculate Invoice Template (4 colours, PDF + Word + XLSX) | Built, listing ready | $3.49 |

## Building Products

Each product has generation scripts in `src/`. To rebuild:

```bash
cd products/001-invoice-template/src
npm install
node generate-invoice.js    # PDFs
node generate-word.js       # Word .docx files
node generate-sheets.js     # XLSX files
node generate-mockups.js    # Listing mockup PNGs
```

Output files land in `output/` (gitignored — source scripts are the source of truth).
