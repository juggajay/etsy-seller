import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Get all product JSON files
const productsDir = join(ROOT, "products");
const configs = readdirSync(productsDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

console.log(`Found ${configs.length} product configs to render:\n`);
configs.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
console.log();

// Bundle once, reuse for all renders
console.log("Bundling Remotion project (one-time)...");
const bundled = await bundle({
  entryPoint: join(ROOT, "src", "index.ts"),
  webpackOverride: (config) => config,
});
console.log("Bundle complete!\n");

// Import themes
const { THEMES } = await import("../src/lib/themes.ts");

mkdirSync(join(ROOT, "output"), { recursive: true });

const results = [];
const startTime = Date.now();

for (let i = 0; i < configs.length; i++) {
  const configFile = configs[i];
  const configPath = join(productsDir, configFile);
  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  const themeName = config.colorTheme || "navy";

  console.log(`\n[${ i + 1}/${configs.length}] Rendering: ${config.productName.replace("\n", " ")} (${themeName})`);

  // Prepare screenshots for this product
  const { execSync } = await import("child_process");
  try {
    execSync(`node scripts/prepare-assets.mjs "${configPath}"`, {
      cwd: ROOT,
      stdio: "pipe",
    });
    console.log("  Assets prepared.");
  } catch (e) {
    console.error(`  Warning: Asset preparation had issues: ${e.message}`);
  }

  const inputProps = {
    productName: config.productName,
    tagline: config.tagline,
    colorTheme: THEMES[themeName] || THEMES.navy,
    screenshots: config.screenshots.map((_s, idx) => `screenshot-${String(idx + 1).padStart(2, "0")}.jpg`),
    features: config.features,
  };

  try {
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "ProductVideo",
      inputProps,
    });

    const outputPath = join(ROOT, "output", `${config.outputFilename}-${themeName}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100);
        if (pct % 25 === 0) process.stdout.write(`\r  Progress: ${pct}%`);
      },
    });

    const stats = readFileSync(outputPath);
    const sizeMB = (stats.length / 1024 / 1024).toFixed(1);
    console.log(`\n  Done! ${outputPath} (${sizeMB} MB)`);
    results.push({ name: configFile, status: "OK", size: sizeMB });
  } catch (err) {
    console.error(`\n  FAILED: ${err.message}`);
    results.push({ name: configFile, status: "FAILED", error: err.message });
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

console.log("\n\n=== BATCH RENDER COMPLETE ===");
console.log(`Total time: ${elapsed}s\n`);
console.log("Results:");
results.forEach((r) => {
  if (r.status === "OK") {
    console.log(`  ✓ ${r.name} — ${r.size} MB`);
  } else {
    console.log(`  ✗ ${r.name} — ${r.error}`);
  }
});
