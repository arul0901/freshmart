const fs = require('fs');
const path = require('path');
const https = require('https');
const supabase = require('../src/supabase');
const google = require('googlethis');

const datasetPath = path.join(__dirname, '../dataset');

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    
    // Ignore data urls or very ugly complex urls
    if (url.startsWith('data:')) return resolve(false);

    const protocol = url.startsWith('https') ? require('https') : require('http');
    
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }}, (res) => {
      if (res.statusCode !== 200) {
         resolve(false);
         return;
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(true); });
    }).on('error', err => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
  });
}

function clearDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(f => fs.unlinkSync(path.join(dirPath, f)));
  }
}

async function start() {
  console.log('Fetching products from database to generate local dataset...');
  const { data: products } = await supabase.from('products').select('*');
  
  if (!products || products.length === 0) {
     console.log('No products found.');
     process.exit();
  }

  const labelsMap = {};

  for (let i = 0; i < products.length; i++) {
    let p = products[i];
    labelsMap[i] = { id: p.id, name: p.name };
    let catDir = path.join(datasetPath, 'train', i.toString());
    
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
    clearDirectory(catDir); // clean old synthetic data
    
    // 1. Download database primary image
    await downloadImage(p.image, path.join(catDir, '0.jpg'));
    
    // 2. Query Google Images for varied angles and different shots of the product
    console.log(`Searching 15 varied images for class ${i}: ${p.name}`);
    try {
      const images = await google.image(p.name + " grocery product photo clear", { safe: false });
      
      let successfulDownloads = 1; // already have 0.jpg
      for (let j = 0; j < images.length && successfulDownloads < 20; j++) {
        const success = await downloadImage(images[j].url, path.join(catDir, `${successfulDownloads}.jpg`));
        if (success) successfulDownloads++;
      }
      console.log(` -> Downloaded ${successfulDownloads} distinct images for ${p.name}.`);
    } catch(err) {
      console.log(` -> Could not fetch varied images for ${p.name}`);
    }
  }

  fs.writeFileSync(path.join(datasetPath, 'labels.json'), JSON.stringify(labelsMap, null, 2));
  console.log(`✅ Collected diverse dataset for ${products.length} product classes! Please recreate your model now.`);
}

start();
