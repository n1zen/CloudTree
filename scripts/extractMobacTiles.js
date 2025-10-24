// scripts/extractMobacTiles.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Install adm-zip first: npm install adm-zip
const MOBAC_ZIP_PATH = './mobacMapTiles.zip'; // Path to your MOBAC output
const OUTPUT_PATH = './src/assets/maps/philippines';

function extractTiles() {
  console.log('📦 Extracting tiles from MOBAC atlas...');
  
  try {
    const zip = new AdmZip(MOBAC_ZIP_PATH);
    const entries = zip.getEntries();
    
    // Create output directory
    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }
    
    entries.forEach(entry => {
      if (entry.entryName.endsWith('.png')) {
        // MOBAC format: zoom/x/y.png
        const parts = entry.entryName.split('/');
        if (parts.length === 3) {
          const zoom = parts[0];
          const x = parts[1];
          const y = parts[2].replace('.png', '');
          
          // Create directory structure
          const tileDir = path.join(OUTPUT_PATH, zoom, x);
          if (!fs.existsSync(tileDir)) {
            fs.mkdirSync(tileDir, { recursive: true });
          }
          
          // Extract tile
          const tilePath = path.join(tileDir, `${y}.png`);
          fs.writeFileSync(tilePath, entry.getData());
          
          console.log(`✅ Extracted: ${zoom}/${x}/${y}.png`);
        }
      }
    });
    
    console.log('🎉 Extraction completed!');
    console.log(`📁 Tiles saved to: ${OUTPUT_PATH}`);
    
  } catch (error) {
    console.error('❌ Error extracting tiles:', error);
  }
}

extractTiles();