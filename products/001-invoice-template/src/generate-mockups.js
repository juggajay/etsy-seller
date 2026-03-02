const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateMockups() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to mockup size
  await page.setViewportSize({ width: 2000, height: 1500 });

  const htmlPath = path.join(__dirname, 'mockups', 'listing-images.html');
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  const outputDir = path.join(__dirname, 'output', 'mockups');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const mockups = [
    { id: 'hero', filename: '01-hero-main-listing.png' },
    { id: 'colors', filename: '02-four-color-options.png' },
    { id: 'formats', filename: '03-four-formats-included.png' },
    { id: 'autocalc', filename: '04-auto-calculating-fields.png' },
  ];

  for (const mockup of mockups) {
    const element = await page.$(`#${mockup.id}`);
    if (element) {
      const filepath = path.join(outputDir, mockup.filename);
      await element.screenshot({ path: filepath, type: 'png' });
      const stats = fs.statSync(filepath);
      console.log(`✓ ${mockup.filename} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
    } else {
      console.log(`✗ Could not find #${mockup.id}`);
    }
  }

  await browser.close();
  console.log(`\nDone! Mockups saved to ./output/mockups/`);
}

generateMockups().catch(console.error);
