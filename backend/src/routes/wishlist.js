const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const logger = require('../services/loggerService');

// 1. GET ALL (Strict User Isolated)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  if (!user || user.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    const formatted = (data || []).map(item => item.products);
    res.json(formatted);
  } catch (err) {
    console.error('Wishlist Fetch Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. ADD ITEM
router.post('/add', async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'Login required' });
  if (isNaN(Number(productId))) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    const { data, error } = await supabase
      .from('wishlist')
      .upsert({
        user_id: user.id,
        product_id: productId
      }, { onConflict: 'user_id, product_id' })
      .select()
      .single();

    if (error) throw error;

    logger.logAction(req, {
      action: 'WISHLIST_ADD',
      entity_type: 'WISHLIST',
      entity_id: data.id,
      metadata: { productId }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. REMOVE ITEM
router.delete('/remove', async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'Login required' });

  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;

    logger.logAction(req, {
      action: 'WISHLIST_REMOVE',
      entity_type: 'WISHLIST',
      metadata: { productId }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
