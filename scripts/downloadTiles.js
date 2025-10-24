const fs = require('fs');
const path = require('path');
const https = require('https');

// Philippines bounds
const PHILIPPINES_BOUNDS = {
  north: 21.1,
  south: 4.6,
  east: 126.6,
  west: 116.9
};

// Keep zoom levels reasonable for bundle size
const MAX_ZOOM = 8; // This will give you ~20-50MB total
const ASSETS_PATH = './src/assets/maps/philippines';

async function downloadTiles() {
  console.log('🚀 Starting Philippines tile download...');
  console.log(`📁 Saving to: ${ASSETS_PATH}`);
  console.log(`🗺️  Zoom levels: 0 to ${MAX_ZOOM}`);
  
  // Create base directory
  if (!fs.existsSync(ASSETS_PATH)) {
    fs.mkdirSync(ASSETS_PATH, { recursive: true });
    console.log('✅ Created assets directory');
  }

  let totalTiles = 0;
  let downloadedTiles = 0;

  // Calculate total tiles first
  for (let zoom = 0; zoom <= MAX_ZOOM; zoom++) {
    totalTiles += getTilesForZoom(zoom).length;
  }
  
  console.log(`📊 Total tiles to download: ${totalTiles}`);

  // Download tiles for each zoom level
  for (let zoom = 0; zoom <= MAX_ZOOM; zoom++) {
    const tiles = getTilesForZoom(zoom);
    console.log(`\n📥 Downloading zoom level ${zoom}: ${tiles.length} tiles`);
    
    const zoomPath = path.join(ASSETS_PATH, zoom.toString());
    if (!fs.existsSync(zoomPath)) {
      fs.mkdirSync(zoomPath, { recursive: true });
    }

    for (const tile of tiles) {
      const tilePath = path.join(zoomPath, tile.x.toString());
      if (!fs.existsSync(tilePath)) {
        fs.mkdirSync(tilePath, { recursive: true });
      }

      const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`;
      const tileFile = path.join(tilePath, `${tile.y}.png`);
      
      try {
        await downloadTile(tileUrl, tileFile);
        downloadedTiles++;
        const progress = Math.round((downloadedTiles / totalTiles) * 100);
        process.stdout.write(`\r📈 Progress: ${progress}% (${downloadedTiles}/${totalTiles})`);
      } catch (error) {
        console.error(`\n❌ Failed to download ${zoom}/${tile.x}/${tile.y}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Download completed!');
  console.log(`📁 Tiles saved to: ${ASSETS_PATH}`);
}

function getTilesForZoom(zoom) {
  const tiles = [];
  
  // Convert lat/lng bounds to tile coordinates
  const minTileX = Math.floor((PHILIPPINES_BOUNDS.west + 180) / 360 * Math.pow(2, zoom));
  const maxTileX = Math.floor((PHILIPPINES_BOUNDS.east + 180) / 360 * Math.pow(2, zoom));
  
  // Convert latitude to tile Y coordinate (Mercator projection)
  const minTileY = Math.floor(
    (1 - Math.log(Math.tan(PHILIPPINES_BOUNDS.north * Math.PI / 180) + 
      1 / Math.cos(PHILIPPINES_BOUNDS.north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  const maxTileY = Math.floor(
    (1 - Math.log(Math.tan(PHILIPPINES_BOUNDS.south * Math.PI / 180) + 
      1 / Math.cos(PHILIPPINES_BOUNDS.south * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  
  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      tiles.push({ x, y });
    }
  }
  
  return tiles;
}

function downloadTile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Run the download
downloadTiles().catch(console.error);