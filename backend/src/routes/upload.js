const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../supabase');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      // If bucket doesn't exist, this might fail
      if (error.message.includes('bucket not found')) {
         return res.status(500).json({ error: 'Supabase storage bucket "products" not found. Please create it.' });
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
