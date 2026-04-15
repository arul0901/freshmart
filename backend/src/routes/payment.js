const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../supabase');

// Initialize Razorpay with keys from environment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order and stores a pending payment record in Supabase
 */
router.post('/create-order', async (req, res) => {
  const { amount, userId, currency = 'INR', receipt } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    // Razorpay expects amount in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `fm_${Date.now()}`,
      notes: {
        user_id: userId || user.id,
      },
    });

    // Store pending payment record in Supabase
    const { data: payment, error: dbErr } = await supabase
      .from('payments')
      .insert({
        user_id: userId || user.id,
        order_id: receipt || razorpayOrder.receipt,
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        status: 'created',
      })
      .select('id')
      .single();

    if (dbErr) {
      console.error('Payment DB insert error:', dbErr.message);
      // Non-fatal: still return order to frontend
    }

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err.message);
    res.status(500).json({ error: 'Failed to create payment order: ' + err.message });
  }
});

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and marks payment as paid
 */
router.post('/verify', async (req, res) => {
  console.log('🔍 [PAYMENT DEBUG] Payment verification endpoint hit');
  console.log('🔍 [PAYMENT DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    orderId,
  } = req.body;

  console.log(`🔍 [PAYMENT DEBUG] Extracted - Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}, User ID: ${userId}, Order ID: ${orderId}`);

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.log('🔍 [PAYMENT DEBUG] Missing required verification fields');
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  try {
    // Verify signature: HMAC-SHA256 of "order_id|payment_id" using key_secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return res.status(400).json({ success: false, error: 'Payment signature mismatch. Possible fraud.' });
    }

    // Signature valid — update payment record
    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateErr) console.error('Payment update error:', updateErr.message);

    // Also update the order's razorpay_payment_id if orderId is provided
    if (orderId) {
      console.log(`🔍 [PAYMENT DEBUG] Updating order ${orderId} with payment ID ${razorpay_payment_id}`);
      const { error: orderUpdateErr } = await supabase
        .from('orders')
        .update({ razorpay_payment_id })
        .eq('id', orderId);
      
      if (orderUpdateErr) {
        console.error('🔍 [PAYMENT DEBUG] Order update error:', orderUpdateErr);
      } else {
        console.log('🔍 [PAYMENT DEBUG] Order updated successfully');
      }
    } else {
      console.log('🔍 [PAYMENT DEBUG] No order ID provided for update');
    }

    const response = {
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    };
    console.log('🔍 [PAYMENT DEBUG] Returning response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error('Payment verification error:', err.message);
    res.status(500).json({ error: 'Payment verification failed: ' + err.message });
  }
});

module.exports = router;
