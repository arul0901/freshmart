const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini API with gemini-2.0-flash...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = "Say 'Hello, FreshMart is ready!'";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('✅ Gemini Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
  }
}

testGemini();
