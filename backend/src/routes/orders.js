const express = require('express');
const supabase = require('../supabase');
const { sendEmail, templates } = require('../services/emailService');
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
  const { customer, email } = req.body;
  if (!customer || !email) {
    return res.status(400).json({ error: 'Customer name and email are required to place an order.' });
  }

  const newOrder = {
    id: `ODR-${Math.floor(10000 + Math.random() * 90000)}`,
    ...req.body,
    date: new Date().toISOString().split('T')[0],
    status: req.body.status || 'pending'
  };

  const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Trigger Confirmation Email (Async)
  const tmpl = templates.orderConfirmation(data);
  sendEmail(data.email, tmpl.subject, tmpl.html);

  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const oldOrder = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  
  const { data, error } = await supabase.from('orders').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Check for Status Transitions
  if (req.body.status && req.body.status !== oldOrder.data?.status) {
    let tmpl;
    if (req.body.status === 'processing') {
      tmpl = templates.statusUpdate(data);
    } else if (req.body.status === 'accepted' || req.body.status === 'delivered') {
      tmpl = templates.feedbackRequest(data);
    }

    if (tmpl) {
      sendEmail(data.email, tmpl.subject, tmpl.html);
    }
  }

  res.json(data);
});

module.exports = router;
