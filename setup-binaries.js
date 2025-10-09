#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration - Revive binaries from GitHub releases
const BINARY_URLS = {
  'linux-x64': {
    'revive-dev-node': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/revive-dev-node-linux-x64',
    'eth-rpc': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/eth-rpc-linux-x64'
  },
  'darwin-x64': {
    'revive-dev-node': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/revive-dev-node-darwin-x64',
    'eth-rpc': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/eth-rpc-darwin-x64'
  },
  'darwin-arm64': {
    'revive-dev-node': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/revive-dev-node-darwin-arm64',
    'eth-rpc': 'https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-18323842311/eth-rpc-darwin-arm64'
  }
};

function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'linux' && arch === 'x64') return 'linux-x64';
  if (platform === 'darwin' && arch === 'x64') return 'darwin-x64';
  if (platform === 'darwin' && arch === 'arm64') return 'darwin-arm64';
  
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${path.basename(destination)}...`);
    
    const file = fs.createWriteStream(destination);
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects (common with GitHub releases)
        file.close();
        fs.unlinkSync(destination); // Clean up partial file
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destination); // Clean up partial file
        reject(new Error(`Download failed: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          // Make binary executable
          fs.chmodSync(destination, '755');
          console.log(`✓ Downloaded ${path.basename(destination)}`);
          resolve();
        });
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination); // Clean up partial file
      }
      reject(err);
    });
    
    file.on('error', (err) => {
      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination); // Clean up partial file
      }
      reject(err);
    });
    
    // Ensure request is ended
    request.end();
  });
}

async function main() {
  try {
    const platform = getPlatform();
    console.log(`Detected platform: ${platform}`);
    
    // Find the project root (where package.json is)
    const projectRoot = process.cwd();
    const binDir = path.join(projectRoot, 'packages', 'asset-hub-pvm', 'bin');
    
    // Create bin directory if it doesn't exist
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    const urls = BINARY_URLS[platform];
    
    // Download each binary sequentially for cleaner output
    for (const [name, url] of Object.entries(urls)) {
      const destination = path.join(binDir, name);
      await downloadFile(url, destination);
    }
    console.log('✓ All binaries downloaded successfully!');
    console.log(`Binaries are available in: ${binDir}`);
    
    // Force exit to prevent hanging
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
