const express = require('express');
const supabase = require('../supabase');
const logger = require('../services/loggerService');
const { sendEmail, templates } = require('../services/emailService');
const router = express.Router();

/**
 * GET /api/orders
 * Fetches order history. Admin: all orders. User: filtered by email.
 */
router.get('/', async (req, res) => {
  const { email } = req.query;

  let query = supabase
    .from('orders')
    .select(`
      id, customer_id, address_id, total_amount, payment_mode, status, date, razorpay_payment_id,
      addresses (id, address_line, city, pincode),
      order_items (id, order_id, product_id, quantity, price_at_purchase, products (*))
    `)
    .order('date', { ascending: false });

  if (email) {
    const { data: profile } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();
    if (profile) query = query.eq('customer_id', profile.id);
    else return res.json([]);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/**
 * POST /api/orders
 * Atomic: Sync Profile → Save Address → Create Order → Insert Items → Send Email
 */
router.post('/', async (req, res) => {
  console.log('🔍 [ORDER DEBUG] Order placement endpoint hit');
  console.log('🔍 [ORDER DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const {
    userId, customer, email, phone,
    address, city, pincode,
    items, total, payment_mode,
    razorpay_payment_id,
  } = req.body;

  console.log(`🔍 [ORDER DEBUG] Extracted - Email: ${email}, Customer: ${customer}, Total: ${total}, Payment: ${payment_mode}`);
  console.log(`🔍 [ORDER DEBUG] Items count: ${items?.length || 0}`);
  console.log(`🔍 [ORDER DEBUG] Razorpay payment ID: ${razorpay_payment_id}`);

  // Validation
  if (!email || !items || items.length === 0) {
    console.log('🔍 [ORDER DEBUG] Validation failed - missing email or items');
    return res.status(400).json({ error: 'Order validation failed: Missing details or empty cart.' });
  }

  try {
    // A. Sync Customer Profile
    console.log('🔍 [ORDER DEBUG] Syncing customer profile...');
    console.log(`🔍 [ORDER DEBUG] Profile data:`, { userId, customer, email, phone });
    
    const { data: profile, error: profErr } = await supabase
      .from('customers')
      .upsert({
        id: userId,
        name: customer,
        email: email,
        phone: phone,
      }, { onConflict: 'email' })
      .select('id, name, email')
      .single();

    console.log('🔍 [ORDER DEBUG] Profile result:', JSON.stringify(profile, null, 2));
    console.log('🔍 [ORDER DEBUG] Profile error:', profErr?.message);
    
    if (profErr) throw new Error(`Profile Error: ${profErr.message}`);

    // B. Record Shipping Address
    if (!address || !city) throw new Error('A valid shipping address is required.');

    console.log('🔍 [ORDER DEBUG] Creating shipping address...');
    console.log(`🔍 [ORDER DEBUG] Address data:`, { userId: profile.id, address, city, pincode });
    
    const { data: addr, error: addrErr } = await supabase
      .from('addresses')
      .insert({
        user_id: profile.id,
        address_line: address,
        city: city,
        pincode: pincode,
      })
      .select('id')
      .single();

    console.log('🔍 [ORDER DEBUG] Address result:', JSON.stringify(addr, null, 2));
    console.log('🔍 [ORDER DEBUG] Address error:', addrErr?.message);
    
    if (addrErr) throw new Error(`Address Error: ${addrErr.message}`);

    // C. Create Order Record
    const orderId = `FM-${Math.floor(10000 + Math.random() * 90000)}`;
    console.log('🔍 [ORDER DEBUG] Creating order record...');
    console.log(`🔍 [ORDER DEBUG] Order data:`, { orderId, customer_id: profile.id, address_id: addr.id, total, payment_mode, razorpay_payment_id });
    
    const { data: order, error: ordErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id: profile.id,
        address_id: addr.id,
        total_amount: total,
        payment_mode: payment_mode,
        status: 'pending',
        razorpay_payment_id: razorpay_payment_id || null,
      })
      .select('id, status, total_amount')
      .single();

    console.log('🔍 [ORDER DEBUG] Order result:', JSON.stringify(order, null, 2));
    console.log('🔍 [ORDER DEBUG] Order error:', ordErr?.message);
    
    if (ordErr) throw new Error(`Order Error: ${ordErr.message}`);

    // Log order placement
    logger.logAction(req, {
      action: 'ORDER_PLACED',
      entity_type: 'ORDER',
      entity_id: order.id,
      metadata: { total, itemCount: items.length, payment_mode },
    });

    // D. Insert Order Items
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.qty,
      price_at_purchase: item.price,
    }));

    const { error: itemErr } = await supabase.from('order_items').insert(orderItems);
    if (itemErr) throw new Error(`Order Items Error: ${itemErr.message}`);

    // E. Send Confirmation Email (non-blocking)
    console.log('🔍 [ORDER DEBUG] Creating order confirmation email...');
    const tmpl = templates.orderConfirmation({
      id: order.id,
      customer: profile.name,
      total: order.total_amount,
      payment_mode,
      address,
      city,
    });
    console.log(`🔍 [ORDER DEBUG] Email template subject: ${tmpl.subject}`);
    console.log(`🔍 [ORDER DEBUG] Sending email to: ${profile.email}`);
    
    const emailSent = sendEmail(profile.email, tmpl.subject, tmpl.html);
    console.log(`🔍 [ORDER DEBUG] Email send result: ${emailSent}`);

    const response = {
      message: 'Order placed successfully',
      orderId: orderId,
    };
    console.log('🔍 [ORDER DEBUG] Returning response:', JSON.stringify(response, null, 2));
    res.status(201).json(response);

  } catch (err) {
    logger.logAction(req, {
      action: 'CHECKOUT_FAILED',
      entity_type: 'ORDER',
      status: 'FAILED',
      error_message: err.message,
      metadata: { payload: req.body },
    });
    console.error('❌ Checkout Failed:', err.message);
    res.status(500).json({ error: err.message, fatal: true });
  }
});

/**
 * PUT /api/orders/:id
 * Update order status (admin use)
 */
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
