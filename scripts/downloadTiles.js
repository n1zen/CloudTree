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
const MAX_ZOOM = 8;
const ASSETS_PATH = './src/assets/maps/philippines';

// Multiple tile sources to avoid blocking
const TILE_SOURCES = [
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
];

let currentSourceIndex = 0;

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
  let failedTiles = 0;

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

      const tileFile = path.join(tilePath, `${tile.y}.png`);
      
      // Skip if tile already exists
      if (fs.existsSync(tileFile)) {
        downloadedTiles++;
        continue;
      }
      
      try {
        await downloadTileWithRetry(zoom, tile.x, tile.y, tileFile);
        downloadedTiles++;
        const progress = Math.round((downloadedTiles / totalTiles) * 100);
        process.stdout.write(`\r📈 Progress: ${progress}% (${downloadedTiles}/${totalTiles})`);
        
        // Add delay to be respectful to servers
        await sleep(100); // 100ms delay between requests
        
      } catch (error) {
        failedTiles++;
        console.error(`\n❌ Failed to download ${zoom}/${tile.x}/${tile.y}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Download completed!');
  console.log(`✅ Successfully downloaded: ${downloadedTiles} tiles`);
  console.log(`❌ Failed downloads: ${failedTiles} tiles`);
  console.log(`📁 Tiles saved to: ${ASSETS_PATH}`);
}

async function downloadTileWithRetry(zoom, x, y, filePath, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const tileUrl = TILE_SOURCES[currentSourceIndex]
        .replace('{z}', zoom)
        .replace('{x}', x)
        .replace('{y}', y);
      
      await downloadTile(tileUrl, filePath);
      return; // Success
    } catch (error) {
      if (attempt === retries - 1) {
        throw error; // Last attempt failed
      }
      
      // Switch to next tile source
      currentSourceIndex = (currentSourceIndex + 1) % TILE_SOURCES.length;
      console.log(`\n🔄 Switching to tile source ${currentSourceIndex + 1}`);
      
      // Wait before retry
      await sleep(1000);
    }
  }
}

function getTilesForZoom(zoom) {
  const tiles = [];
  
  const minTileX = Math.floor((PHILIPPINES_BOUNDS.west + 180) / 360 * Math.pow(2, zoom));
  const maxTileX = Math.floor((PHILIPPINES_BOUNDS.east + 180) / 360 * Math.pow(2, zoom));
  
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the download
downloadTiles().catch(console.error);