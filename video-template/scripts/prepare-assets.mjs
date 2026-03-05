import sharp from "sharp";
import { readFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PARENT = join(ROOT, "..");

// Read product config from CLI arg or default
const configPath = process.argv[2] || join(ROOT, "products", "006-budget-planner.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));

console.log(`Preparing assets for: ${config.productName}`);

// Ensure output dirs exist
mkdirSync(join(ROOT, "public", "screenshots"), { recursive: true });
mkdirSync(join(ROOT, "public", "branding"), { recursive: true });
mkdirSync(join(ROOT, "public", "fonts"), { recursive: true });

// Copy fonts if not already there
const fontDir = join(PARENT, "fonts", "extras", "ttf");
for (const font of ["Inter-Regular.ttf", "Inter-Bold.ttf", "Inter-Medium.ttf"]) {
  const dest = join(ROOT, "public", "fonts", font);
  if (!existsSync(dest)) {
    const src = join(fontDir, font);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`  Copied font: ${font}`);
    } else {
      console.warn(`  Warning: Font not found: ${src}`);
    }
  }
}

// Resize shop icon to 400x400
const iconSrc = join(PARENT, "output", "branding", "shop-icon.png");
const iconDest = join(ROOT, "public", "branding", "shop-icon.png");
if (existsSync(iconSrc)) {
  await sharp(iconSrc).resize(400, 400, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(iconDest);
  console.log("  Resized shop-icon.png → 400x400");
} else {
  console.warn(`  Warning: Shop icon not found: ${iconSrc}`);
}

// Resize screenshots to 1920x1080 JPEG
for (let i = 0; i < config.screenshots.length; i++) {
  const src = config.screenshots[i];
  // Resolve relative to parent dir
  const absPath = src.startsWith("/") || src.includes(":") ? src : join(PARENT, src);
  const dest = join(ROOT, "public", "screenshots", `screenshot-${String(i + 1).padStart(2, "0")}.jpg`);

  if (!existsSync(absPath)) {
    console.warn(`  Warning: Screenshot not found: ${absPath}`);
    continue;
  }

  await sharp(absPath)
    .resize(1920, 1080, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toFile(dest);

  console.log(`  Resized screenshot ${i + 1}: ${src}`);
}

console.log("Asset preparation complete!");
