const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail SMTP Transporter (uses App Password — NOT regular password)
// Setup: Google Account → Security → 2-Step Verification → App Passwords
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // false for STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection on startup (non-fatal)
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email service not connected:', error.message);
  } else {
    console.log('✅ Email service ready (Gmail SMTP)');
  }
});

const BRAND = {
  name: 'FreshMart',
  color: '#0EB48F',
  accent: '#E5AA70',
  muted: '#8d6e63',
  bg: '#fdfbf7',
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FreshMart</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:${BRAND.color};padding:28px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
        🌿 FreshMart
      </h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;font-weight:500;">
        Farm to Door Freshness Guaranteed
      </p>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:#f9f9f9;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
      <p style="color:${BRAND.muted};font-size:12px;margin:0;">
        © 2025 FreshMart. All rights reserved.<br/>
        <a href="#" style="color:${BRAND.color};text-decoration:none;">Unsubscribe</a> · 
        <a href="#" style="color:${BRAND.color};text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to, subject, html) => {
  console.log(`🔍 [EMAIL DEBUG] Starting send to ${to}`);
  console.log(`🔍 [EMAIL DEBUG] SMTP_USER exists: ${!!process.env.SMTP_USER}`);
  console.log(`🔍 [EMAIL DEBUG] SMTP_PASS exists: ${!!process.env.SMTP_PASS}`);
  console.log(`🔍 [EMAIL DEBUG] SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`🔍 [EMAIL DEBUG] SMTP_PORT: ${process.env.SMTP_PORT || '587'}`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email skipped: SMTP credentials not configured.');
    console.log(`🔍 [EMAIL DEBUG] Missing credentials - USER: ${process.env.SMTP_USER ? 'SET' : 'MISSING'}, PASS: ${process.env.SMTP_PASS ? 'SET' : 'MISSING'}`);
    return false;
  }
  
  try {
    console.log(`🔍 [EMAIL DEBUG] Attempting to send email...`);
    const mailOptions = {
      from: process.env.SMTP_FROM || `"FreshMart" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };
    console.log(`🔍 [EMAIL DEBUG] Mail options:`, JSON.stringify(mailOptions, null, 2));
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    console.log(`🔍 [EMAIL DEBUG] Response:`, JSON.stringify(info, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Email error to ${to}: ${error.message}`);
    console.error(`🔍 [EMAIL DEBUG] Full error:`, error);
    console.error(`🔍 [EMAIL DEBUG] Error stack:`, error.stack);
    return false;
  }
};

const templates = {
  // Login Success Security Alert
  loginSuccess: (user) => ({
    subject: `🔐 New Login to Your FreshMart Account`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        New Login Detected
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong>${user.name || 'there'}</strong>, we noticed a successful login to your FreshMart account.
        If this was you, no action is needed.
      </p>

      <div style="background:${BRAND.bg};border:1px solid #e8e0d5;border-radius:12px;padding:24px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Account</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Time</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Method</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">${user.method || 'Email & Password'}</td>
          </tr>
        </table>
      </div>

      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#856404;font-size:14px;font-weight:700;margin:0;">
          ⚠️ <strong>Didn't sign in?</strong> If you didn't initiate this login, please change your password immediately to secure your account.
        </p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings"
           style="background:${BRAND.color};color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;margin-right:12px;">
          My Account →
        </a>
      </div>
    `)
  }),

  // Order Confirmation Email

  orderConfirmation: (order) => ({
    subject: `✅ Order Confirmed — #${order.id} | FreshMart`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        Order Confirmed! 🎉
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong>${order.customer}</strong>, your fresh groceries are being prepared 
        and will arrive at your doorstep soon!
      </p>

      <!-- Order Summary Box -->
      <div style="background:${BRAND.bg};border:1px solid #e8e0d5;border-radius:12px;padding:24px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Order ID</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:800;text-align:right;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Total Amount</td>
            <td style="padding:8px 0;color:${BRAND.color};font-weight:900;font-size:18px;text-align:right;">₹${order.total}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Payment</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">${order.payment_mode || 'Online'}</td>
          </tr>
          ${order.address ? `
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Delivery To</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">${order.address}, ${order.city || ''}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;">Estimated Delivery</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:700;text-align:right;">45 – 60 Minutes</td>
          </tr>
        </table>
      </div>

      <p style="color:#555;font-size:14px;margin:0 0 24px;line-height:1.7;">
        We'll send you another notification when your order is out for delivery. 
        You can also track your order in the FreshMart app under <strong>My Orders</strong>.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
           style="background:${BRAND.color};color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">
          Track My Order →
        </a>
      </div>
    `)
  }),

  // Welcome / Signup Email
  signupWelcome: (user) => ({
    subject: `Welcome to FreshMart, ${user.name}! 🌿`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        Welcome aboard, ${user.name}! 👋
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Your FreshMart account is ready. We're thrilled to have you join thousands 
        of happy customers enjoying farm-fresh groceries delivered in under an hour.
      </p>

      <div style="background:${BRAND.bg};border:1px solid #e8e0d5;border-radius:12px;padding:24px;margin-bottom:28px;">
        <p style="margin:0 0 12px;font-weight:800;color:#1a1a1a;">Your account details:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Name</td>
            <td style="padding:6px 0;color:#1a1a1a;font-weight:700;text-align:right;">${user.name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Email</td>
            <td style="padding:6px 0;color:#1a1a1a;font-weight:700;text-align:right;">${user.email}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
           style="background:${BRAND.color};color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">
          Start Shopping →
        </a>
      </div>
    `)
  }),

  // Order Status Update
  statusUpdate: (order) => ({
    subject: `📦 Order #${order.id} is now ${order.status.toUpperCase()} | FreshMart`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        Order Status Update
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong>${order.customer}</strong>, your order <strong>#${order.id}</strong> status 
        has been updated to <strong style="color:${BRAND.color};">${order.status}</strong>.
      </p>
      <p style="color:#555;font-size:14px;line-height:1.7;">
        Our team is ensuring everything meets our freshness standards before it reaches you.
      </p>
    `)
  }),

  // Password Reset Request
  passwordResetRequest: (data) => ({
    subject: `🔐 Password Reset Request | FreshMart`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        Password Reset Request
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong>${data.email}</strong>, we received a request to reset your FreshMart account password.
      </p>

      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#856404;font-size:14px;font-weight:700;margin:0;">
          ⚠️ <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${data.resetLink}" 
           style="background:${BRAND.color};color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">
          Reset My Password →
        </a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        This link will expire in 24 hours for security reasons. If you need a new reset link, just request again.
      </p>
    `)
  }),

  // Password Reset Success
  passwordResetSuccess: (data) => ({
    subject: `✅ Password Reset Successful | FreshMart`,
    html: baseTemplate(`
      <h2 style="color:#1a1a1a;font-size:24px;font-weight:900;margin:0 0 8px;">
        Password Reset Successful!
      </h2>
      <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong>${data.email}</strong>, your FreshMart account password has been successfully reset.
      </p>

      <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#155724;font-size:14px;font-weight:700;margin:0;">
          ✅ <strong>Password Updated</strong> Your account is now secured with the new password.
        </p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
           style="background:${BRAND.color};color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block;">
          Login to My Account →
        </a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        If you didn't reset your password, please contact support immediately.
      </p>
    `)
  }),
};

module.exports = { sendEmail, templates };
