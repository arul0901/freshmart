const express = require('express');
const router = express.Router();
const { sendEmail, templates } = require('../services/emailService');

// --- Audit Trail Connector ---
// Allows the frontend to report Supabase Auth events for server-side logging
router.post('/log', (req, res) => {
  const { action, metadata } = req.body;
  if (!action) return res.status(400).json({ error: 'Action type required' });

  // We simply acknowledge; actual logging is handled by logger middleware on authenticated routes
  console.log(`[AUTH LOG] action=${action}`, metadata);
  res.json({ success: true });
});

// --- Signup Welcome Email ---
// Called from frontend after successful Supabase signup
router.post('/signup-notify', async (req, res) => {
  console.log('🔍 [AUTH DEBUG] Signup notify endpoint hit');
  console.log('🔍 [AUTH DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const { email, name } = req.body;

  console.log(`🔍 [AUTH DEBUG] Extracted - Email: ${email}, Name: ${name}`);
  
  if (!email) {
    console.log('🔍 [AUTH DEBUG] Email missing - returning 400');
    return res.status(400).json({ error: 'Email required' });
  }

  console.log('🔍 [AUTH DEBUG] Creating signup welcome template...');
  const tmpl = templates.signupWelcome({ name: name || 'Valued Customer', email });
  console.log(`🔍 [AUTH DEBUG] Template subject: ${tmpl.subject}`);
  
  console.log('🔍 [AUTH DEBUG] Sending email...');
  const sent = await sendEmail(email, tmpl.subject, tmpl.html);
  console.log(`🔍 [AUTH DEBUG] Email send result: ${sent}`);

  const response = { success: true, emailSent: sent };
  console.log('🔍 [AUTH DEBUG] Returning response:', JSON.stringify(response, null, 2));
  res.json(response);
});

// --- Login Success Security Alert Email ---
// Called from frontend after successful login
router.post('/login-notify', async (req, res) => {
  console.log('🔍 [AUTH DEBUG] Login notify endpoint hit');
  console.log('🔍 [AUTH DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const { email, name, method } = req.body;

  console.log(`🔍 [AUTH DEBUG] Extracted - Email: ${email}, Name: ${name}, Method: ${method}`);
  
  if (!email) {
    console.log('🔍 [AUTH DEBUG] Email missing - returning 400');
    return res.status(400).json({ error: 'Email required' });
  }

  console.log('🔍 [AUTH DEBUG] Creating login success template...');
  const tmpl = templates.loginSuccess({
    name: name || 'Valued Customer',
    email,
    method: method || 'Email & Password',
  });
  console.log(`🔍 [AUTH DEBUG] Template subject: ${tmpl.subject}`);
  
  console.log('🔍 [AUTH DEBUG] Sending email...');
  const sent = await sendEmail(email, tmpl.subject, tmpl.html);
  console.log(`🔍 [AUTH DEBUG] Email send result: ${sent}`);

  const response = { success: true, emailSent: sent };
  console.log('🔍 [AUTH DEBUG] Returning response:', JSON.stringify(response, null, 2));
  res.json(response);
});

module.exports = router;

