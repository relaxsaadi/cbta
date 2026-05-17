// Generate all logo PNG variants from the KOST GROUP master SVG.
// Run: node scripts/generate-logo-variants.mjs
import sharp from "/Users/mac/Documents/kost-funnel/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = "/Users/mac/Documents/kost-funnel";
const src = join(root, "public/kost-group-logo.svg");
const pubDir = join(root, "public");

// Read SVG buffer
const svgBuffer = readFileSync(src);

// Step 1 — Rasterize the SVG to a high-resolution PNG for further processing
// SVG viewBox: 2400×1344
await sharp(svgBuffer, { density: 300 })
  .resize(2400, 1344, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(join(pubDir, "_raster-master.png"));

const masterBuf = readFileSync(join(pubDir, "_raster-master.png"));
const meta = await sharp(masterBuf).metadata();
console.log(`Rasterized master: ${meta.width}×${meta.height}, alpha=${meta.hasAlpha}`);

// Wing icon area: top-center of the logo (proportionally similar to PNG version)
// Logo aspect 2400×1344, wing is approx cols ~700-1700, rows ~300-700
const wingCrop = {
  left: 700,
  top: 300,
  width: 1000,
  height: 600,
};

// 1. ICON 512×512 — wing only, transparent background
await sharp(masterBuf)
  .extract(wingCrop)
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(join(pubDir, "kost-group-icon.png"));
console.log("✓ kost-group-icon.png (512×512)");

// 2. FAVICON 32×32
await sharp(masterBuf)
  .extract(wingCrop)
  .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(join(pubDir, "favicon-32.png"));
console.log("✓ favicon-32.png");

// 3. FAVICON 16×16
await sharp(masterBuf)
  .extract(wingCrop)
  .resize(16, 16, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(join(pubDir, "favicon-16.png"));
console.log("✓ favicon-16.png");

// 4. APPLE TOUCH ICON 180×180 — wing on white background, slight padding
await sharp(masterBuf)
  .extract(wingCrop)
  .resize(160, 160, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .extend({
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(join(pubDir, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png (180×180)");

// 5. OG IMAGE 1200×630 — full logo centered on white background
await sharp(masterBuf)
  .resize(1000, null, { fit: "inside" })
  .extend({
    top: 70,
    bottom: 70,
    left: 100,
    right: 100,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .resize(1200, 630, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .jpeg({ quality: 90 })
  .toFile(join(pubDir, "og-image.jpg"));
console.log("✓ og-image.jpg (1200×630)");

// 6. PNG LOGO 800px wide — fallback for code that doesn't render SVG well
await sharp(masterBuf)
  .resize(800, null, { fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(join(pubDir, "kost-group-logo-800.png"));
console.log("✓ kost-group-logo-800.png");

// Cleanup intermediate
import { unlinkSync } from "node:fs";
unlinkSync(join(pubDir, "_raster-master.png"));

console.log("\n✅ All variants generated from SVG");
