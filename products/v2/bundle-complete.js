const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputDir = path.join(__dirname, 'output');
const zipName = 'Complete-Business-Docs-Bundle.zip';
const zipPath = path.join(outputDir, zipName);
const stagingDir = path.join(outputDir, '_bundle-staging');

// Product subfolders
const products = [
  { prefix: 'Invoice-Template-', folder: 'Invoice-Templates' },
  { prefix: 'Quote-Template-', folder: 'Quote-Templates' },
  { prefix: 'Receipt-Template-', folder: 'Receipt-Templates' },
];

// Clean up old zip and staging
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true });

// Create staging directories
for (const p of products) {
  fs.mkdirSync(path.join(stagingDir, p.folder), { recursive: true });
}

// Copy PDFs into subfolders
let totalFiles = 0;
for (const p of products) {
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(p.prefix) && f.endsWith('.pdf'))
    .sort();

  console.log(`\n${p.folder}/ (${files.length} files)`);
  for (const f of files) {
    const src = path.join(outputDir, f);
    const dest = path.join(stagingDir, p.folder, f);
    fs.copyFileSync(src, dest);
    const stats = fs.statSync(src);
    console.log(`  ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
    totalFiles++;
  }
}

console.log(`\nTotal: ${totalFiles} files`);

if (totalFiles !== 12) {
  console.error(`\nERROR: Expected 12 files (3 products x 4 colours), got ${totalFiles}`);
  fs.rmSync(stagingDir, { recursive: true });
  process.exit(1);
}

// Create ZIP from staging directory using PowerShell
const psCmd = `Compress-Archive -Path '${path.join(stagingDir, '*')}' -DestinationPath '${zipPath}' -Force`;
execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });

// Clean up staging
fs.rmSync(stagingDir, { recursive: true });

const zipStats = fs.statSync(zipPath);
console.log(`\n✓ ${zipName} created (${(zipStats.size / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`  Location: ${zipPath}`);
console.log(`  Files: ${totalFiles} (3 products × 4 colours, PDF only)`);
