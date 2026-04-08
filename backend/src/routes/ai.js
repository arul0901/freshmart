const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../supabase');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY');

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // 1. Fetch live product data for context
    const { data: products } = await supabase.from('products').select('name, price, cat, stock');
    const productContext = products.map(p => `- ${p.name}: ₹${p.price} (${p.cat}, ${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`).join('\n');

    const systemPrompt = `You are "FreshBot", the friendly AI assistant for FreshMart, a premium grocery store.
Your goal is to help users find products, check prices, and answer questions about the store.

Current Inventory:
${productContext}

Store Info:
- Delivery: 30-45 mins.
- Hours: 6 AM - 11 PM.
- Location: Chennai, TN.
- Features: Premium quality, farm-fresh, sustainable packaging.

Instructions:
- Be concise, professional, and helpful.
- **IMPORTANT**: If a user asks to add or remove items, use the add_to_cart and remove_from_cart tools. Use multiple tools in one response if the user makes multiple requests.
- **IMPORTANT**: Do not use Markdown formatting like bolding (**), italics, or headers. Write in clean, plain text sentences.
- If a product is out of stock, suggest a similar available item.
- If you don't know the answer, politely ask them to contact support at +91 98765 43210.
- Always be polite and treat the customer with respect.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
      tools: [
        {
          functionDeclarations: [
            {
              name: "add_to_cart",
              description: "Adds a specific quantity of a product to the shopping cart.",
              parameters: {
                type: "OBJECT",
                properties: {
                  product_name: { type: "STRING", description: "The name of the product to add." },
                  quantity: { type: "NUMBER", description: "The quantity to add (default 1)." }
                },
                required: ["product_name"]
              }
            },
            {
              name: "remove_from_cart",
              description: "Removes a specific quantity (or all) of a product from the shopping cart.",
              parameters: {
                type: "OBJECT",
                properties: {
                  product_name: { type: "STRING", description: "The name of the product to remove." },
                  quantity: { type: "NUMBER", description: "The quantity to remove. If not specified, remove the item entirely or reduce by 1." }
                },
                required: ["product_name"]
              }
            }
          ]
        }
      ]
    });

    const chat = model.startChat({
      history: (history || []).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Check for multiple function calls
    const calls = response.candidates[0].content.parts.filter(p => p.functionCall);
    const actions = [];
    let assistantMessage = "";

    if (calls.length > 0) {
      for (const call of calls) {
        const { product_name, quantity } = call.functionCall.args;
        const qty = quantity || 1;

        // Find the product
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${product_name}%`)
          .limit(1)
          .single();

        if (product) {
          if (call.functionCall.name === 'add_to_cart') {
            actions.push({ type: 'ADD_TO_CART', product, quantity: qty });
            assistantMessage += `Added ${qty} ${product.name}. `;
          } else if (call.functionCall.name === 'remove_from_cart') {
            actions.push({ type: 'REMOVE_FROM_CART', product, quantity: qty });
            assistantMessage += `Removed ${qty} ${product.name}. `;
          }
        } else {
          assistantMessage += `I couldn't find "${product_name}". `;
        }
      }
      
      return res.json({ 
        message: assistantMessage.trim() || "I've updated your cart as requested.",
        actions 
      });
    }

    const text = response.text();
    res.json({ message: text });
  } catch (err) {
    console.error('AI Error:', err);
    const msg = err.message.includes('Quota exceeded') 
      ? 'AI Quota Exceeded. Please check your Gemini API plan or wait for a reset.'
      : 'AI Assistant is currently resting. (' + err.message + ')';
    res.status(500).json({ error: msg });
  }
});

const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');

let customModel = null;
let labelsMap = null;

// Load the local custom model trained from scratch
async function loadLocalModel() {
  if (customModel) return;
  try {
    const modelPath = path.join(__dirname, '../../models/freshmart_model/model.json');
    if (fs.existsSync(modelPath)) {
       customModel = await tf.loadLayersModel(`file://${modelPath}`);
       const labelsPath = path.join(__dirname, '../../dataset/labels.json');
       labelsMap = JSON.parse(fs.readFileSync(labelsPath));
       console.log("✅ Successfully loaded Custom Local AI Model for Image Recognition");
    }
  } catch (err) {
    console.warn("Could not load local model. Ensure you have run train_model.js first.");
  }
}
loadLocalModel();

router.post('/recognize-image', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) return res.status(400).json({ error: 'Image data missing' });

    if (!customModel || !labelsMap) {
      return res.status(503).json({ error: 'Custom AI Model not loaded yet on the server.' });
    }

    // Convert base64 back to buffer
    const imgBuffer = Buffer.from(image, 'base64');
    
    // Process image into tensor [1, 64, 64, 3] matching the training
    let tensor = tf.node.decodeImage(imgBuffer, 3);
    tensor = tf.image.resizeBilinear(tensor, [64, 64]);
    tensor = tensor.cast('float32').div(255).expandDims(0);

    // Run inference via our local custom CNN
    const prediction = customModel.predict(tensor);
    const classIdTensor = prediction.argMax(1);
    const classId = classIdTensor.dataSync()[0];
    
    const confidenceTensor = prediction.max(1);
    const confidence = confidenceTensor.dataSync()[0];

    tf.dispose([tensor, prediction, classIdTensor, confidenceTensor]);

    if (confidence < 0.3) {
      return res.json({ product: 'No match' });
    }

    const recognizedProduct = labelsMap[classId.toString()].name;
    console.log(`AI Prediction: ${recognizedProduct} (Confidence: ${(confidence*100).toFixed(1)}%)`);

    res.json({ product: recognizedProduct });
  } catch (err) {
    console.error('AI Image Error:', err);
    res.status(500).json({ error: 'Failed to process image locally' });
  }
});

module.exports = router;
