const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

router.get('/', async (req, res) => {
  const { email } = req.query;
  let query = supabase.from('orders').select('*').order('date', { ascending: false });
  if (email) query = query.eq('email', email);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const newOrder = {
    id: `ODR-${Math.floor(10000 + Math.random() * 90000)}`,
    ...req.body,
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  };
  const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('orders').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
