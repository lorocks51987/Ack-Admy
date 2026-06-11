const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const srcPath = 'c:/dev/Ack-Admy/artifacts/techlearn/assets/images/icon.png';
const outputDirImages = 'c:/dev/Ack-Admy/artifacts/techlearn/assets/images';
const outputDirPublic = 'c:/dev/Ack-Admy/artifacts/techlearn/public';

async function generateIcons() {
  console.log('Loading source image...');
  const img = await Jimp.read(srcPath);
  const width = img.width;
  const height = img.height;
  
  // 1. Determine background color from corners
  const bg = img.getPixelColor(0, 0);
  const bgR = (bg >> 24) & 0xff;
  const bgG = (bg >> 16) & 0xff;
  const bgB = (bg >> 8) & 0xff;
  console.log(`Detected background color: R=${bgR}, G=${bgG}, B=${bgB}`);
  
  // 2. Find logo bounding box (pixels significantly different from background)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let hasLogo = false;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = img.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;
      const a = color & 0xff;
      
      const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
      if (dist > 30 && a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasLogo = true;
      }
    }
  }
  
  if (!hasLogo) {
    throw new Error('Could not find any logo pixels distinct from the background.');
  }
  
  const logoWidth = maxX - minX + 1;
  const logoHeight = maxY - minY + 1;
  console.log(`Detected logo bounding box: X [${minX}, ${maxX}], Y [${minY}, ${maxY}] (${logoWidth}x${logoHeight})`);
  
  // 3. Extract logo and key out background smoothly to transparent
  // We'll crop the original image to the bounding box first
  const logoImg = img.clone().crop({ x: minX, y: minY, w: logoWidth, h: logoHeight });
  
  for (let y = 0; y < logoHeight; y++) {
    for (let x = 0; x < logoWidth; x++) {
      const color = logoImg.getPixelColor(x, y);
      const r = (color >> 24) & 0xff;
      const g = (color >> 16) & 0xff;
      const b = (color >> 8) & 0xff;
      const a = color & 0xff;
      
      const dist = Math.sqrt((r - bgR)**2 + (g - bgG)**2 + (b - bgB)**2);
      if (dist < 30) {
        logoImg.setPixelColor(0x00000000, x, y); // Fully transparent background
      } else if (dist < 50) {
        // Smooth transition edge
        const factor = (dist - 30) / (50 - 30);
        const newAlpha = Math.round(a * factor);
        const newColor = (r << 24) | (g << 16) | (b << 8) | newAlpha;
        logoImg.setPixelColor(newColor, x, y);
      }
    }
  }
  
  // Make sure target directories exist
  fs.mkdirSync(outputDirImages, { recursive: true });
  fs.mkdirSync(outputDirPublic, { recursive: true });
  
  const targetBgColor = 0x05050aff; // Dark background #05050A
  
  // Helper to create and save a square icon
  async function createSquareIcon(size, filename, isTransparent = false) {
    console.log(`Generating ${filename} (${size}x${size})...`);
    
    // Create new blank image
    const canvas = new Jimp({
      width: size,
      height: size,
      color: isTransparent ? 0x00000000 : targetBgColor
    });
    
    // Fit the logo in the center with a safe margin
    // Android adaptive icon has a 66% safe zone diameter, maskable has 80% safe zone diameter.
    // For wide horizontal logos (415x54), width is the constraint.
    // Let's set the logo width to 75% of the canvas width to fit safely.
    const targetLogoWidth = Math.round(size * 0.75);
    const targetLogoHeight = Math.round((logoHeight / logoWidth) * targetLogoWidth);
    
    const resizedLogo = logoImg.clone().resize({ w: targetLogoWidth, h: targetLogoHeight });
    
    const posX = Math.round((size - targetLogoWidth) / 2);
    const posY = Math.round((size - targetLogoHeight) / 2);
    
    canvas.composite(resizedLogo, posX, posY);
    
    const outputPath = filename.startsWith('public/')
      ? path.join(outputDirPublic, filename.replace('public/', ''))
      : path.join(outputDirImages, filename);
      
    await canvas.write(outputPath);
    console.log(`Saved: ${outputPath}`);
  }
  
  // Generate all requested icons
  // 1. icon.png - 1024x1024 (#05050A background)
  await createSquareIcon(1024, 'icon.png', false);
  
  // 2. adaptive-icon.png - 1024x1024 (transparent background, logo in the center)
  await createSquareIcon(1024, 'adaptive-icon.png', true);
  
  // 3. favicon.png - 64x64 (#05050A background)
  await createSquareIcon(64, 'favicon.png', false);
  
  // 4. public/pwa-192.png - 192x192 (#05050A background)
  await createSquareIcon(192, 'public/pwa-192.png', false);
  
  // 5. public/pwa-512.png - 512x512 (#05050A background)
  await createSquareIcon(512, 'public/pwa-512.png', false);
  
  // 6. public/favicon.png - 64x64 (#05050A background)
  await createSquareIcon(64, 'public/favicon.png', false);
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
