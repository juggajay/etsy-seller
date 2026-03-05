// =============================================================
// Colour Scheme Definitions — CSS variable format
// Converted from existing pdf-lib rgb(0-1) values to hex
// =============================================================

const COLOUR_SCHEMES = {
  navy: {
    name: 'Navy',
    css: {
      '--primary': '#1b365d',
      '--accent': '#2c5282',
      '--highlight': '#3c78ba',
      '--light': '#eef1f5',
      '--text': '#1f2126',
      '--muted': '#70757e',
      '--white': '#ffffff',
      '--field-bg': '#f4f6fa',
      '--table-bg': '#f1f3f7',
      '--border': '#d9dee6',
      '--primary-r': '27',
      '--primary-g': '54',
      '--primary-b': '93',
    },
    // pdf-lib rgb values for field overlay (0-1 scale)
    pdfLib: {
      primary:  [0.106, 0.212, 0.365],
      accent:   [0.173, 0.322, 0.510],
      highlight:[0.235, 0.471, 0.729],
      light:    [0.933, 0.945, 0.961],
      text:     [0.12, 0.13, 0.15],
      muted:    [0.44, 0.46, 0.52],
      white:    [1, 1, 1],
      fieldBg:  [0.955, 0.963, 0.975],
      tableBg:  [0.945, 0.953, 0.968],
      border:   [0.85, 0.87, 0.90],
    },
  },
  forest: {
    name: 'Forest Green',
    css: {
      '--primary': '#1a4731',
      '--accent': '#276749',
      '--highlight': '#34885f',
      '--light': '#f1f7f3',
      '--text': '#1f211f',
      '--muted': '#6b7870',
      '--white': '#ffffff',
      '--field-bg': '#f3f8f5',
      '--table-bg': '#f0f5f2',
      '--border': '#d4e0d9',
      '--primary-r': '26',
      '--primary-g': '71',
      '--primary-b': '49',
    },
    pdfLib: {
      primary:  [0.102, 0.278, 0.192],
      accent:   [0.153, 0.404, 0.286],
      highlight:[0.204, 0.533, 0.373],
      light:    [0.945, 0.968, 0.953],
      text:     [0.12, 0.13, 0.12],
      muted:    [0.42, 0.47, 0.44],
      white:    [1, 1, 1],
      fieldBg:  [0.953, 0.973, 0.958],
      tableBg:  [0.940, 0.960, 0.948],
      border:   [0.83, 0.88, 0.85],
    },
  },
  terracotta: {
    name: 'Terracotta',
    css: {
      '--primary': '#9c4221',
      '--accent': '#c05621',
      '--highlight': '#d46c2d',
      '--light': '#fdf8f1',
      '--text': '#261f1a',
      '--muted': '#85766b',
      '--white': '#ffffff',
      '--field-bg': '#fbf7f3',
      '--table-bg': '#f9f5f0',
      '--border': '#e6d9cc',
      '--primary-r': '156',
      '--primary-g': '66',
      '--primary-b': '33',
    },
    pdfLib: {
      primary:  [0.612, 0.259, 0.129],
      accent:   [0.753, 0.337, 0.129],
      highlight:[0.831, 0.424, 0.176],
      light:    [0.992, 0.970, 0.945],
      text:     [0.15, 0.12, 0.10],
      muted:    [0.52, 0.46, 0.42],
      white:    [1, 1, 1],
      fieldBg:  [0.985, 0.968, 0.952],
      tableBg:  [0.978, 0.960, 0.942],
      border:   [0.90, 0.85, 0.80],
    },
  },
  charcoal: {
    name: 'Charcoal',
    css: {
      '--primary': '#2d3748',
      '--accent': '#4a5569',
      '--highlight': '#616f87',
      '--light': '#f4f5f7',
      '--text': '#1f2126',
      '--muted': '#70737d',
      '--white': '#ffffff',
      '--field-bg': '#f5f6f8',
      '--table-bg': '#f2f3f5',
      '--border': '#d9dbdf',
      '--primary-r': '45',
      '--primary-g': '55',
      '--primary-b': '72',
    },
    pdfLib: {
      primary:  [0.176, 0.216, 0.282],
      accent:   [0.290, 0.333, 0.412],
      highlight:[0.380, 0.435, 0.529],
      light:    [0.955, 0.961, 0.969],
      text:     [0.12, 0.13, 0.15],
      muted:    [0.44, 0.45, 0.49],
      white:    [1, 1, 1],
      fieldBg:  [0.958, 0.963, 0.970],
      tableBg:  [0.948, 0.953, 0.961],
      border:   [0.85, 0.86, 0.88],
    },
  },
};

/**
 * Generate a CSS :root block with colour variables for a given scheme
 */
function toCssVars(schemeName) {
  const scheme = COLOUR_SCHEMES[schemeName];
  if (!scheme) throw new Error(`Unknown colour scheme: ${schemeName}`);
  const lines = Object.entries(scheme.css)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');
  return `:root {\n${lines}\n}`;
}

module.exports = { COLOUR_SCHEMES, toCssVars };
