const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all flash deals (with product details)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('flash_deals')
      .select('*, product:products(*)')
      .eq('active', true);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all flash deals (admin raw list)
router.get('/admin', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('flash_deals')
      .select('*, product:products(name, image, price)');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new flash deal
router.post('/', async (req, res) => {
  try {
    const { product_id, discount, total } = req.body;
    const { data, error } = await supabase
      .from('flash_deals')
      .insert([{ product_id, discount, total, sold: 0 }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update flash deal
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { discount, total, sold, active } = req.body;
    const { data, error } = await supabase
      .from('flash_deals')
      .update({ discount, total, sold, active })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE flash deal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('flash_deals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
