import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const svgPath = path.join(publicDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  console.log('Generating PWA icons from SVG...');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 standard
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable with 12% safe-zone margin (inner icon resize + dark background)
  const innerIcon = await sharp(svgBuffer)
    .resize(400, 400)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 15, b: 12, alpha: 1 }
    }
  })
    .composite([{ input: innerIcon, top: 56, left: 56 }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 32x32 png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Icons successfully generated in public directory!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
