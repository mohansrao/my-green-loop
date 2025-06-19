import nodemailer from 'nodemailer';

/**
 * Email notification service for order confirmations
 * Provides reliable backup when SMS delivery fails
 */

const config = {
  isProduction: process.env.NODE_ENV === 'production',
  debugMode: process.env.DEBUG_EMAIL === 'true',
  email: {
    service: 'gmail', // Can be changed to other services
    adminEmail: process.env.ADMIN_EMAIL || 'admin@greenloop.com',
    fromEmail: process.env.FROM_EMAIL || 'noreply@greenloop.com',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  }
};

// Create transporter (will be configured when credentials are provided)
let transporter: nodemailer.Transporter | null = null;

function initializeTransporter() {
  if (!config.email.smtpUser || !config.email.smtpPass) {
    return null;
  }

  return nodemailer.createTransporter({
    service: config.email.service,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
  });
}

/**
 * Sends email notification for a new order
 * Used as backup when SMS delivery fails
 */
export async function sendOrderEmailNotification(
  orderId: number,
  customerName: string,
  customerEmail: string,
  totalAmount: number
) {
  const log = (message: string, isError = false) => {
    const prefix = `[Email][Order #${orderId}]`;
    const debugInfo = config.debugMode ? '[Debug Mode]' : '';
    const logMessage = `${prefix}${debugInfo} ${message}`;
    isError ? console.error(logMessage) : console.log(logMessage);
  };

  log('Starting email notification process');

  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    log('Email service not configured - skipping email notifications', true);
    return {
      success: false,
      error: 'Email service not configured',
      hint: 'Add SMTP_USER and SMTP_PASS environment variables'
    };
  }

  const results = [];

  // Admin notification email
  const adminMailOptions = {
    from: config.email.fromEmail,
    to: config.email.adminEmail,
    subject: `New Order #${orderId} - Green Loop Rentals`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Order Alert</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Total Amount:</strong> $${totalAmount}</p>
        </div>
        <p>Please process this order promptly.</p>
        <p style="color: #6b7280; font-size: 12px;">Green Loop Rentals - Sustainable Dining Solutions</p>
      </div>
    `
  };

  // Customer confirmation email
  const customerMailOptions = {
    from: config.email.fromEmail,
    to: customerEmail,
    subject: `Order Confirmation #${orderId} - Green Loop Rentals`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order with Green Loop Rentals.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> #${orderId}</p>
          <p><strong>Total Amount:</strong> $${totalAmount}</p>
        </div>
        <p>We'll contact you soon to arrange pickup/delivery details.</p>
        <p>Thank you for choosing sustainable dining solutions!</p>
        <p style="color: #6b7280; font-size: 12px;">Green Loop Rentals - Sustainable Dining Solutions</p>
      </div>
    `
  };

  // Send admin email
  try {
    log('Sending admin notification email');
    await transporter.sendMail(adminMailOptions);
    log('Admin email sent successfully');
    results.push({ success: true, recipient: 'admin', type: 'email' });
  } catch (error: any) {
    log(`Failed to send admin email: ${error.message}`, true);
    results.push({ success: false, recipient: 'admin', type: 'email', error: error.message });
  }

  // Send customer email
  try {
    log('Sending customer confirmation email');
    await transporter.sendMail(customerMailOptions);
    log('Customer email sent successfully');
    results.push({ success: true, recipient: 'customer', type: 'email' });
  } catch (error: any) {
    log(`Failed to send customer email: ${error.message}`, true);
    results.push({ success: false, recipient: 'customer', type: 'email', error: error.message });
  }

  return {
    success: results.every(r => r.success),
    results,
    debugEnabled: config.debugMode,
    environment: config.isProduction ? "production" : "development",
  };
}