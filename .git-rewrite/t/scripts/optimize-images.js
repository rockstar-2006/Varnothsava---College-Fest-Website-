const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/web/public/img';
const outputDir = 'd:/web/public/img'; // Overwriting originals but sharp handles this safely by writing to a buffer first

async function optimizeImages() {
    console.log('--- Starting Image Optimization ---');
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const stats = fs.statSync(filePath);

        // Only process files larger than 1MB
        if (stats.isFile() && stats.size > 1024 * 1024 && /\.(jpg|jpeg|png)$/i.test(file)) {
            console.log(`Optimizing: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

            try {
                const buffer = await sharp(filePath)
                    .rotate() // Preserve EXIF orientation
                    .resize(2000, 2000, { // Max width/height to prevent massive resolutions
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer();

                // Determine format
                const ext = path.extname(file).toLowerCase();
                let resultBuffer;

                if (ext === '.png') {
                    resultBuffer = await sharp(buffer).png({ quality: 80, compressionLevel: 9 }).toBuffer();
                } else {
                    resultBuffer = await sharp(buffer).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
                }

                // Save optimized version
                fs.writeFileSync(filePath, resultBuffer);
                const newStats = fs.statSync(filePath);
                console.log(`✅ Success: ${file} reduced to ${(newStats.size / 1024).toFixed(2)} KB`);
            } catch (err) {
                console.error(`❌ Failed to optimize ${file}:`, err.message);
            }
        }
    }
    console.log('--- Optimization Complete ---');
}

optimizeImages();
