const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'placeholder@freshmart.com',
    pass: process.env.SMTP_PASS || 'placeholder_password',
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"FreshMart" <${process.env.SMTP_FROM || 'no-reply@freshmart.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    // Non-blocking fallback for development
    return false;
  }
};

const templates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmed - #${order.id}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #3e2723;">
        <h1 style="color: #E5AA70;">Order Confirmed!</h1>
        <p>Hi ${order.customer},</p>
        <p>Thank you for choosing FreshMart! Your premium harvest is being prepared.</p>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Address:</strong> ${order.address}, ${order.city}</p>
        </div>
        <p>We'll notify you when your order is out for delivery.</p>
        <hr/>
        <p style="font-size: 12px; color: #8d6e63;">FreshMart - Farm to Door Freshness Guaranteed</p>
      </div>
    `
  }),

  statusUpdate: (order) => ({
    subject: `Order Update - #${order.id} is ${order.status.toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #3e2723;">
        <h1 style="color: #E5AA70;">Order Status Support</h1>
        <p>Hi ${order.customer},</p>
        <p>Your order <strong>#${order.id}</strong> is now <strong>${order.status}</strong>.</p>
        <p>Our team is ensuring everything meets our quality standards before it reaches you.</p>
        <hr/>
        <p style="font-size: 12px; color: #8d6e63;">FreshMart - Delivery Happiness</p>
      </div>
    `
  }),

  feedbackRequest: (order) => ({
    subject: `Tell us how we did! - #${order.id}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #3e2723;">
        <h1 style="color: #E5AA70;">We value your feedback</h1>
        <p>Hi ${order.customer},</p>
        <p>We hope you enjoyed your fresh items from order <strong>#${order.id}</strong>.</p>
        <p>Could you take a moment to share your experience with us?</p>
        <div style="margin: 30px 0;">
          <a href="http://localhost:5173/feedback/${order.id}" style="background: #E5AA70; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Rate Your Delivery</a>
        </div>
        <hr/>
        <p style="font-size: 12px; color: #8d6e63;">FreshMart - Always improving for you</p>
      </div>
    `
  })
};

module.exports = { sendEmail, templates };
