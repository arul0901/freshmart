const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        const flash15 = json.models.find(m => m.name.includes('gemini-1.5-flash'));
        if (flash15) {
          console.log('✅ Found:', flash15.name);
        } else {
          console.log('❌ gemini-1.5-flash NOT found. Available models:', json.models.map(m => m.name).join(', '));
        }
      }
    } catch (e) {
      console.log('❌ Parsing error');
    }
  });
});
