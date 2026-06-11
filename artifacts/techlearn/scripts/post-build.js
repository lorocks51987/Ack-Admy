const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html');

function run() {
  if (!fs.existsSync(indexPath)) {
    console.error(`Error: ${indexPath} does not exist. Run expo export first.`);
    process.exit(1);
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // Insert manifest link and png favicon link before </head>
  const manifestTag = '<link rel="manifest" href="/manifest.json" />';
  const faviconPngTag = '<link rel="icon" type="image/png" href="/favicon.png" />';
  
  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', `${manifestTag}${faviconPngTag}</head>`);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Successfully injected PWA manifest link and PNG favicon into dist/index.html!');
  } else {
    console.log('Manifest link already exists in dist/index.html');
  }
}

run();
