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
        console.log('Available Models (Total ' + json.models.length + '):');
        json.models.forEach(m => {
          if (m.name.includes('flash') || m.name.includes('pro')) {
            console.log(` - ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
          }
        });
      }
    } catch (e) {
      console.log('❌ Parsing error');
    }
  });
});
