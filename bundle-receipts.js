const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputDir = path.join(__dirname, 'output');
const zipName = 'Receipt-Templates-Bundle.zip';
const zipPath = path.join(outputDir, zipName);

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Collect all receipt files
const files = fs.readdirSync(outputDir)
  .filter(f => f.startsWith('Receipt-Template-') && (f.endsWith('.pdf') || f.endsWith('.docx') || f.endsWith('.xlsx')))
  .sort();

console.log(`Bundling ${files.length} files into ${zipName}...\n`);
files.forEach(f => {
  const stats = fs.statSync(path.join(outputDir, f));
  console.log(`  ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
});

// Use PowerShell to create ZIP (available on Windows)
const fileList = files.map(f => `"${path.join(outputDir, f)}"`).join(',');
const psCmd = `Compress-Archive -Path ${fileList} -DestinationPath "${zipPath}" -Force`;
execSync(`powershell -Command "${psCmd}"`, { stdio: 'inherit' });

const zipStats = fs.statSync(zipPath);
console.log(`\n✓ ${zipName} created (${(zipStats.size / 1024).toFixed(1)} KB)`);
console.log(`  Location: ${zipPath}`);
