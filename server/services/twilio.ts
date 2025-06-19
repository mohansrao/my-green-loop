import twilio from "twilio";

/**
 * Environment Configuration
 * Contains all necessary Twilio-related configuration settings from environment variables
 */
const config = {
  isProduction: process.env.NODE_ENV === 'production',
  debugMode: process.env.DEBUG_TWILIO === 'true',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    smsNumber: process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER,
    adminSmsNumber: process.env.TWILIO_ADMIN_SMS_NUMBER || process.env.DEV_ADMIN_SMS_NUMBER,
  }
};

// Initialize Twilio client with credentials
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

/**
 * Formats a phone number for SMS messaging
 * Ensures the number is in the correct format with country code and plus sign
 *
 * @param {string} number - The phone number to format
 * @returns {string} - Formatted phone number (e.g., +1XXXXXXXXXX)
 */
function formatSMSNumber(number: string): string {
  if (!number) return "";

  // Remove all non-digits first
  let cleaned = number.replace(/\D/g, "");

  // Add country code if missing and it's a 10-digit US number
  if (!cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "1" + cleaned;
  }

  // Validate US phone number format (11 digits starting with 1)
  if (cleaned.length !== 11 || !cleaned.startsWith("1")) {
    throw new Error(`Invalid phone number format: ${number}. Must be a valid US phone number.`);
  }

  // Ensure single plus sign
  return "+" + cleaned;
}

/**
 * Provides user-friendly error messages for common Twilio error codes
 *
 * @param {any} error - The error object from Twilio
 * @returns {string} - Human-readable error message
 */
function getTwilioErrorHint(error: any): string {
  const hints: Record<number, string> = {
    21211: "Invalid 'To' phone number. Check number format and country code.",
    21606: "Invalid WhatsApp-enabled 'From' number.",
    21612: "Account may be in trial mode - can only send to verified numbers.",
    63003:
      "Production WhatsApp Business Profile may require approved templates.",
    63004:
      "Production WhatsApp Business Profile may require approved templates.",
    20003: "Authentication error. Check Twilio credentials.",
  };
  return hints[error.code] || "Check Twilio console for more details.";
}

/**
 * Sends an SMS notification for a new order
 * Works in both development and production without templates
 *
 * @param {number} orderId - The unique identifier for the order
 * @param {string} customerName - The name of the customer who placed the order
 * @param {number} totalAmount - The total amount of the order
 * @param {string} customerPhone - Customer's phone number
 * @returns {Promise<Object>} - Result object containing success status and additional details
 *
 * @example
 * const result = await sendOrderNotification(123, "John Doe", 99.99, "+15551234567");
 * if (!result.success) {
 *   console.error(result.hint);
 * }
 */
// SMS doesn't require sandbox setup - removed addToSandbox function

export async function sendOrderNotification(
  orderId: number,
  customerName: string,
  totalAmount: number,
  customerPhone?: string
) {
  const log = (message: string, isError = false) => {
    const prefix = `[Twilio][Order #${orderId}]`;
    const debugInfo = config.debugMode ? '[Debug Mode]' : '';
    const logMessage = `${prefix}${debugInfo} ${message}`;
    isError ? console.error(logMessage) : console.log(logMessage);
  };

  log('Starting SMS notification process');
  log(`Config: ${JSON.stringify({
    isProduction: config.isProduction,
    debugMode: config.debugMode,
    hasAccountSid: !!config.twilio.accountSid,
    hasAuthToken: !!config.twilio.authToken,
    hasSMSNumber: !!config.twilio.smsNumber,
    hasAdminNumber: !!config.twilio.adminSmsNumber
  })}`);

  if (!config.twilio.smsNumber) {
    log("SMS number not configured", true);
    return {
      success: false,
      error: "SMS number not configured",
      hint: "Add TWILIO_SMS_NUMBER to environment variables",
    };
  }

  const formattedFromNumber = formatSMSNumber(config.twilio.smsNumber);
  const recipients = [
    { number: config.twilio.adminSmsNumber, type: 'admin' as const },
    ...(customerPhone ? [{ number: customerPhone, type: 'customer' as const }] : [])
  ];

  const results = [];

  for (const recipient of recipients) {
    if (!recipient.number) {
      log(`Skipping ${recipient.type} - no phone number configured`);
      results.push({ success: false, error: 'No phone number provided', recipient: recipient.type, hint: 'Phone number is required' });
      continue;
    }
    
    let formattedToNumber;
    try {
      formattedToNumber = formatSMSNumber(recipient.number);
    } catch (error: any) {
      log(`Invalid phone number for ${recipient.type}: ${error.message}`, true);
      results.push({ success: false, error: error.message, recipient: recipient.type, hint: 'Provide a valid US phone number' });
      continue;
    }

    // SMS message options (same for dev and production)
    const messageOptions = {
      from: formattedFromNumber,
      to: formattedToNumber,
      body: `New Order Alert!\n\nOrder #${orderId}\nCustomer: ${customerName}\nTotal: $${totalAmount}\n\nThank you for your business!`,
    };

    try {
      log(`Sending notification to ${recipient.number} (${recipient.type})`);
      if (config.debugMode) {
        log(`Message options: ${JSON.stringify(messageOptions, null, 2)}`);
      }
      const message = await client.messages.create(messageOptions);

      // Check message status - 'failed', 'undelivered' indicate issues
      if (message.status === 'failed' || message.status === 'undelivered') {
        throw new Error(`Message ${message.status}: ${message.errorMessage || 'No error message provided'}`);
      }

      log(`Message queued (SID: ${message.sid}, Status: ${message.status})`);
      results.push({ 
        success: true, 
        sid: message.sid, 
        status: message.status,
        recipient: recipient.type 
      });
    } catch (error: any) {
      const errorMessage = error?.toString() || 'Unknown error';
      log(`Failed to send to ${recipient.number} (${recipient.type}): ${errorMessage}`, true);
      if (config.debugMode) {
        log(
          `Debug details: ${JSON.stringify({
            code: error?.code,
            status: error?.status,
            moreInfo: error?.moreInfo,
          })}`,
          true,
        );
      }
      results.push({ success: false, error: errorMessage, recipient: recipient.type, hint: getTwilioErrorHint(error) });
    }
  }

  return {
    success: results.every(r => r.success),
    results,
    debugEnabled: config.debugMode,
    environment: config.isProduction ? "production" : "development",
  };
}