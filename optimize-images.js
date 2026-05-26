const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = __dirname;

async function optimizeImage(input, output, opts) {
  const inputPath  = path.join(dir, input);
  const outputPath = path.join(dir, output);
  if (!fs.existsSync(inputPath)) { console.log('SKIP (not found):', input); return; }

  const before = fs.statSync(inputPath).size;
  let img = sharp(inputPath);

  if (opts.width || opts.height) {
    img = img.resize(opts.width || null, opts.height || null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  if (opts.format === 'webp') {
    img = img.webp({ quality: opts.quality || 82 });
  } else if (opts.format === 'jpeg') {
    img = img.jpeg({ quality: opts.quality || 82, mozjpeg: true });
  } else if (opts.format === 'png') {
    img = img.png({ compressionLevel: 9, palette: false });
  }

  await img.toFile(outputPath);
  const after = fs.statSync(outputPath).size;
  console.log(`✓ ${input} → ${output}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (${Math.round((1-after/before)*100)}% smaller)`);
}

(async () => {
  console.log('Optimizing images...\n');

  // car png.png — 5873×3873px displayed at max ~1920px → resize to 1920px wide, convert to WebP
  await optimizeImage('car png.png', 'car.webp', { width: 1920, format: 'webp', quality: 85 });

  // STORY -19.png — 4500×8000px displayed at max ~900px wide → resize to 1800px (2x retina)
  await optimizeImage('STORY -19.png', 'story-19.webp', { width: 1800, format: 'webp', quality: 85 });

  // hero.jpg — already JPEG, just compress more
  await optimizeImage('hero.jpg', 'hero-opt.webp', { width: 1920, format: 'webp', quality: 82 });

  // wood-texture.jpg — displayed at ~600px wide
  await optimizeImage('wood-texture.jpg', 'wood-texture-opt.webp', { width: 1200, format: 'webp', quality: 80 });

  // logo-banner.png — nav logo displayed at ~160px tall
  await optimizeImage('logo-banner.png', 'logo-banner-opt.webp', { height: 320, format: 'webp', quality: 90 });

  console.log('\nDone!');
})();
