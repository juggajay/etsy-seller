// =============================================================
// Freelancer Invoice Colour Schemes
// Navy, Sage Green, Blush Pink, Charcoal
// =============================================================

const FREELANCER_COLOURS = {
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
  sage: {
    name: 'Sage-Green',
    css: {
      '--primary': '#4a6741',
      '--accent': '#5c7d52',
      '--highlight': '#7da36f',
      '--light': '#f2f5f0',
      '--text': '#1f211f',
      '--muted': '#6b7868',
      '--white': '#ffffff',
      '--field-bg': '#f4f7f2',
      '--table-bg': '#f1f4ef',
      '--border': '#d4ddd0',
      '--primary-r': '74',
      '--primary-g': '103',
      '--primary-b': '65',
    },
    pdfLib: {
      primary:  [0.290, 0.404, 0.255],
      accent:   [0.361, 0.490, 0.322],
      highlight:[0.490, 0.639, 0.435],
      light:    [0.949, 0.961, 0.941],
      text:     [0.12, 0.13, 0.12],
      muted:    [0.42, 0.47, 0.41],
      white:    [1, 1, 1],
      fieldBg:  [0.957, 0.969, 0.949],
      tableBg:  [0.945, 0.957, 0.937],
      border:   [0.831, 0.867, 0.816],
    },
  },
  blush: {
    name: 'Blush-Pink',
    css: {
      '--primary': '#8b4a5e',
      '--accent': '#a65d73',
      '--highlight': '#c47a90',
      '--light': '#faf5f7',
      '--text': '#251f22',
      '--muted': '#857075',
      '--white': '#ffffff',
      '--field-bg': '#faf6f8',
      '--table-bg': '#f8f3f5',
      '--border': '#e6d4da',
      '--primary-r': '139',
      '--primary-g': '74',
      '--primary-b': '94',
    },
    pdfLib: {
      primary:  [0.545, 0.290, 0.369],
      accent:   [0.651, 0.365, 0.451],
      highlight:[0.769, 0.478, 0.565],
      light:    [0.980, 0.961, 0.969],
      text:     [0.145, 0.122, 0.133],
      muted:    [0.522, 0.439, 0.459],
      white:    [1, 1, 1],
      fieldBg:  [0.980, 0.965, 0.973],
      tableBg:  [0.973, 0.953, 0.961],
      border:   [0.902, 0.831, 0.855],
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

function toCssVars(schemeName) {
  const scheme = FREELANCER_COLOURS[schemeName];
  if (!scheme) throw new Error(`Unknown colour scheme: ${schemeName}`);
  const lines = Object.entries(scheme.css)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join('\n');
  return `:root {\n${lines}\n}`;
}

module.exports = { FREELANCER_COLOURS, toCssVars };
