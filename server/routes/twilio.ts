
import express from 'express';
import twilio from 'twilio';

/**
 * Environment Configuration
 * Defines all the necessary Twilio-related configuration and environment settings.
 * This includes account credentials, WhatsApp numbers, and operational modes.
 */
const config = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    templateSid: process.env.TWILIO_TEMPLATE_SID,
    adminNumber: process.env.TWILIO_ADMIN_WHATSAPP_NUMBER
  },
  isProduction: process.env.NODE_ENV === 'production',
  debugMode: process.env.DEBUG_TWILIO === 'true'
};

// Initialize Twilio client with account credentials
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

/**
 * Formats a phone number to be compatible with Twilio's WhatsApp API
 * @param {string} number - The phone number to format
 * @returns {string} - Formatted phone number with country code and plus sign
 */
function formatWhatsAppNumber(number: string): string {
  let cleaned = number.replace(/\D/g, '');
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

/**
 * Maps Twilio error codes to user-friendly error messages
 * @param {any} error - The error object from Twilio
 * @returns {string} - A user-friendly error message explaining the issue
 */
function getTwilioErrorHint(error: any): string {
  const hints: Record<number, string> = {
    21211: "Invalid 'To' phone number. Check number format and country code.",
    21606: "Invalid WhatsApp-enabled 'From' number.",
    21612: "Account may be in trial mode - can only send to verified numbers.",
    63003: "Production WhatsApp Business Profile may require approved templates.",
    63004: "Production WhatsApp Business Profile may require approved templates.",
    20003: "Authentication error. Check Twilio credentials."
  };
  return hints[error.code] || "Check Twilio console for more details.";
}

/**
 * Sends a WhatsApp notification for a new order
 * @param {number} orderId - The ID of the order
 * @param {string} customerName - The name of the customer
 * @param {number} totalAmount - The total amount of the order
 * @returns {Promise<Object>} - Result object indicating success/failure and additional details
 */
export async function sendOrderNotification(orderId: number, customerName: string, totalAmount: number) {
  const log = (message: string, isError = false) => {
    const prefix = `[WhatsApp Notification][Order #${orderId}]`;
    isError ? console.error(`${prefix} ${message}`) : console.log(`${prefix} ${message}`);
  };

  const adminNumber = config.twilio.adminNumber;
  const formattedFromNumber = formatWhatsAppNumber(config.twilio.whatsAppNumber);
  const formattedToNumber = formatWhatsAppNumber(adminNumber);

  let messageOptions: any;

  // Configure message based on environment (production uses templates)
  if (config.isProduction) {
    if (!config.twilio.templateSid) {
      log('Template SID not configured for production messaging', true);
      return {
        success: false,
        error: 'Template SID not configured',
        hint: 'Add TWILIO_TEMPLATE_SID to environment variables'
      };
    }

    messageOptions = {
      from: `whatsapp:${formattedFromNumber}`,
      to: `whatsapp:${formattedToNumber}`,
      contentSid: config.twilio.templateSid,
      contentVariables: JSON.stringify({
        1: orderId.toString(),
        2: customerName,
        3: `$${totalAmount}`
      })
    };
  } else {
    messageOptions = {
      body: `New Order #${orderId}\nCustomer: ${customerName}\nAmount: $${totalAmount}`,
      from: `whatsapp:${formattedFromNumber}`,
      to: `whatsapp:${formattedToNumber}`
    };
  }

  try {
    log(`Sending notification to ${adminNumber}`);
    if (config.debugMode) {
      log(`Message options: ${JSON.stringify(messageOptions, null, 2)}`);
    }
    const message = await client.messages.create(messageOptions);
    log(`Message sent successfully (SID: ${message.sid})`);

    return { 
      success: true, 
      sid: message.sid,
      debugEnabled: config.debugMode,
      environment: config.isProduction ? 'production' : 'development'
    };
  } catch (error) {
    log(`Failed to send: ${error.toString()}`, true);
    if (config.debugMode) {
      log(`Debug details: ${JSON.stringify({
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo
      })}`, true);
    }

    return { 
      success: false, 
      error: error.toString(),
      hint: getTwilioErrorHint(error)
    };
  }
}

/**
 * Express Router for handling Twilio-related endpoints
 */
const router = express.Router();

/**
 * Webhook endpoint for incoming Twilio messages
 * Logs the message content and sender information
 */
router.post("/message", express.urlencoded({ extended: false }), (req, res) => {
  try {
    const { Body: messageBody, From: fromNumber } = req.body;
    console.log('[Twilio Webhook] Received message:', {
      from: fromNumber,
      message: messageBody
    });
    
    res.status(200).send();
  } catch (error) {
    console.error('[Twilio Webhook] Error:', error);
    res.status(500).send();
  }
});

export default router;
