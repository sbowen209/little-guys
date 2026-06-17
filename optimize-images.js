import sharp from 'sharp';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

async function optimizeImages() {
  console.log('Scanning for images...');
  // Find all png, jpg, and jpeg files inside public/images
  const files = await glob('public/images/**/*.{png,jpg,jpeg}');
  
  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${files.length} images. Starting conversion...`);

  for (const file of files) {
    const ext = path.extname(file);
    const webpPath = file.replace(ext, '.webp');

    try {
      await sharp(file)
        .webp({ quality: 80, effort: 6 }) // 80 is a great balance of size and quality
        .toFile(webpPath);
      
      console.log(`✅ Converted: ${webpPath}`);
      
      // Delete the original file to clean up the codebase
      await fs.unlink(file);
    } catch (error) {
      console.error(`❌ Failed to convert ${file}:`, error);
    }
  }

  console.log('🎉 Optimization complete! All images are now .webp');
}

optimizeImages();