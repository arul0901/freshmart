const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

router.get('/', async (req, res) => {
  const { cat, search } = req.query;
  let query = supabase.from('products').select('*');
  if (cat) query = query.eq('cat', cat);
  if (search) query = query.ilike('name', `%${search}%`);
  
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const newProduct = req.body;
  const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
