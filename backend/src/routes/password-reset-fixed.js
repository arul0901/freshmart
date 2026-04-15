const express = require('express');
const router = express.Router();
const { sendEmail, templates } = require('../services/emailService');
const { createClient } = require('@supabase/supabase-js');

// In-memory token storage (in production, use Redis or database)
const resetTokens = new Map();

// Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Request Password Reset ---
router.post('/request', async (req, res) => {
  console.log('PASSWORD RESET DEBUG: Password reset request received');
  console.log('PASSWORD RESET DEBUG: Request body:', JSON.stringify(req.body, null, 2));
  
  const { email } = req.body;

  if (!email) {
    console.log('PASSWORD RESET DEBUG: Email missing - returning 400');
    return res.status(400).json({ error: 'Email is required' });
  }

  console.log(`PASSWORD RESET DEBUG: Processing reset request for: ${email}`);

  try {
    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('PASSWORD RESET DEBUG: Failed to list users:', listError.message);
      return res.status(500).json({ error: 'Failed to verify user' });
    }

    const userExists = users.some(user => user.email === email);
    
    if (!userExists) {
      console.log('PASSWORD RESET DEBUG: User does not exist, but sending success for security');
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists, a reset link has been sent'
      });
    }

    // Generate custom reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    // Store token (in production, use database)
    resetTokens.set(resetToken, {
      email,
      expiry: expiryTime
    });
    
    console.log('PASSWORD RESET DEBUG: Generated token:', resetToken.substring(0, 8) + '...');
    console.log('PASSWORD RESET DEBUG: Token expires:', new Date(expiryTime).toISOString());

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    console.log('PASSWORD RESET DEBUG: Reset link:', resetLink);
    
    // Send email using NodeMailer
    console.log('PASSWORD RESET DEBUG: Sending reset email via NodeMailer...');
    const tmpl = templates.passwordResetRequest({
      email,
      resetLink
    });
    
    const emailSent = sendEmail(email, tmpl.subject, tmpl.html);
    console.log(`PASSWORD RESET DEBUG: Email sent via NodeMailer: ${emailSent}`);

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      emailSent
    });

  } catch (err) {
    console.error('PASSWORD RESET DEBUG: Unexpected error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// --- Reset Password ---
router.post('/reset', async (req, res) => {
  console.log('PASSWORD RESET DEBUG: Password reset confirmation received');
  console.log('PASSWORD RESET DEBUG: Request body:', JSON.stringify(req.body, null, 2));
  
  const { token, newPassword, email } = req.body;

  if (!token || !newPassword || !email) {
    console.log('PASSWORD RESET DEBUG: Missing required fields');
    return res.status(400).json({ error: 'Token, email, and new password are required' });
  }

  if (newPassword.length < 6) {
    console.log('PASSWORD RESET DEBUG: Password too short');
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Verify token
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      console.log('PASSWORD RESET DEBUG: Invalid token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (tokenData.email !== email) {
      console.log('PASSWORD RESET DEBUG: Email mismatch');
      return res.status(400).json({ error: 'Email does not match token' });
    }

    if (Date.now() > tokenData.expiry) {
      console.log('PASSWORD RESET DEBUG: Token expired');
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    console.log('PASSWORD RESET DEBUG: Token verified for email:', email);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('PASSWORD RESET DEBUG: Failed to list users:', listError.message);
      return res.status(500).json({ error: 'Failed to find user' });
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('PASSWORD RESET DEBUG: User not found');
      return res.status(400).json({ error: 'User not found' });
    }

    console.log('PASSWORD RESET DEBUG: Found user:', user.id);

    // Update user password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('PASSWORD RESET DEBUG: Failed to update password:', updateError.message);
      return res.status(400).json({ error: 'Failed to update password' });
    }

    console.log('PASSWORD RESET DEBUG: Password updated successfully');

    // Clean up token
    resetTokens.delete(token);

    // Send confirmation email via NodeMailer
    console.log('PASSWORD RESET DEBUG: Sending confirmation email via NodeMailer...');
    const tmpl = templates.passwordResetSuccess({
      email
    });
    
    const emailSent = sendEmail(email, tmpl.subject, tmpl.html);
    console.log(`PASSWORD RESET DEBUG: Confirmation email sent: ${emailSent}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
      emailSent
    });

  } catch (err) {
    console.error('PASSWORD RESET DEBUG: Unexpected error during reset:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Clean up expired tokens (run this periodically)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiry) {
      resetTokens.delete(token);
      console.log('PASSWORD RESET DEBUG: Cleaned up expired token');
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

module.exports = router;
