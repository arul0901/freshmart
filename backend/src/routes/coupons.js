const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/validate', async (req, res) => {
  const { code, cartValue } = req.body;
  const { data: coupon, error } = await supabase.from('coupons').select('*').ilike('code', code).single();
  
  if (error || !coupon) return res.status(404).json({ message: 'Invalid coupon code' });
  if (!coupon.active || coupon.uses >= coupon.maxUses) return res.status(400).json({ message: 'Coupon expired or max uses reached' });
  if (cartValue < coupon.minOrder) return res.status(400).json({ message: `Minimum order value for this coupon is ₹${coupon.minOrder}` });

  res.json({ valid: true, discount: coupon.discount, type: coupon.type });
});

router.post('/', async (req, res) => {
  const newCoupon = { ...req.body, active: true, uses: 0 };
  const { data, error } = await supabase.from('coupons').insert([newCoupon]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('coupons').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
