import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Read product config
const configPath = process.argv[2] || join(ROOT, "products", "006-budget-planner.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));
const themeName = process.argv[3] || "navy";

console.log(`Rendering: ${config.productName} (${themeName} theme)`);
console.log("Bundling...");

const bundled = await bundle({
  entryPoint: join(ROOT, "src", "index.ts"),
  webpackOverride: (config) => config,
});

console.log("Bundle complete. Selecting composition...");

const inputProps = {
  productName: config.productName,
  tagline: config.tagline,
  colorTheme: config.colorTheme || themeName,
  screenshots: config.screenshots.map((_s, i) => `screenshot-${String(i + 1).padStart(2, "0")}.jpg`),
  features: config.features,
};

// If colorTheme is a string key, resolve it
if (typeof inputProps.colorTheme === "string") {
  const { THEMES } = await import("../src/lib/themes.ts");
  inputProps.colorTheme = THEMES[inputProps.colorTheme] || THEMES.navy;
}

const composition = await selectComposition({
  serveUrl: bundled,
  id: "ProductVideo",
  inputProps,
});

mkdirSync(join(ROOT, "output"), { recursive: true });
const outputPath = join(ROOT, "output", `${config.outputFilename || "video"}-${themeName}.mp4`);

console.log(`Rendering to: ${outputPath}`);

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: outputPath,
  inputProps,
  browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 10 === 0) {
      process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
    }
  },
});

console.log(`\nRender complete! Output: ${outputPath}`);
