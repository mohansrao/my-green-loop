import twilio from "twilio";

/**
 * Environment Configuration
 * Contains all necessary Twilio-related configuration settings from environment variables
 */
const config = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    templateSid: process.env.TWILIO_TEMPLATE_SID,
    adminNumber: process.env.TWILIO_ADMIN_WHATSAPP_NUMBER,
  },
  isProduction: process.env.NODE_ENV === "production",
  debugMode: process.env.DEBUG_TWILIO === "true",
};

// Initialize Twilio client with credentials
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

/**
 * Formats a phone number for WhatsApp messaging
 * Ensures the number is in the correct format with country code and plus sign
 *
 * @param {string} number - The phone number to format
 * @returns {string} - Formatted phone number (e.g., +1XXXXXXXXXX)
 */
function formatWhatsAppNumber(number: string): string {
  let cleaned = number.replace(/\D/g, "");
  if (!cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "1" + cleaned;
  }
  return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
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
 * Sends a WhatsApp notification for a new order
 * In production, uses WhatsApp templates for compliance
 * In development, sends direct messages
 *
 * @param {number} orderId - The unique identifier for the order
 * @param {string} customerName - The name of the customer who placed the order
 * @param {number} totalAmount - The total amount of the order
 * @returns {Promise<Object>} - Result object containing success status and additional details
 *
 * @example
 * const result = await sendOrderNotification(123, "John Doe", 99.99);
 * if (!result.success) {
 *   console.error(result.hint);
 * }
 */
export async function sendOrderNotification(
  orderId: number,
  customerName: string,
  totalAmount: number,
) {
  const log = (message: string, isError = false) => {
    const prefix = `[Twilio][Order #${orderId}]`;
    const debugInfo = config.debugMode ? "[Debug Mode]" : "";
    const logMessage = `${prefix}${debugInfo} ${message}`;
    isError ? console.error(logMessage) : console.log(logMessage);
  };

  log("Starting notification process");
  log(
    `Config: ${JSON.stringify({
      isProduction: config.isProduction,
      debugMode: config.debugMode,
      hasTemplateSid: !!config.twilio.templateSid,
      hasAccountSid: !!config.twilio.accountSid,
      hasAuthToken: !!config.twilio.authToken,
      hasWhatsAppNumber: !!config.twilio.whatsAppNumber,
      hasAdminNumber: !!config.twilio.adminNumber,
    })}`,
  );

  const adminNumber = config.twilio.adminNumber;
  const formattedFromNumber = formatWhatsAppNumber(
    config.twilio.whatsAppNumber,
  );
  const formattedToNumber = formatWhatsAppNumber(adminNumber);

  let messageOptions: any;

    if (!config.twilio.templateSid) {
    log("Template SID not configured for production messaging", true);
    return {
      success: false,
      error: "Template SID not configured",
      hint: "Add TWILIO_TEMPLATE_SID to environment variables",
    };
  }

  messageOptions = {
    from: `whatsapp:${formattedFromNumber}`,
    to: `whatsapp:${formattedToNumber}`,
    contentSid: config.twilio.templateSid,
    contentVariables: JSON.stringify({
      1: orderId.toString(),
      2: customerName,
      3: `$${totalAmount}`,
    }),
  };

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
      environment: config.isProduction ? "production" : "development",
    };
  } catch (error) {
    log(`Failed to send: ${error.toString()}`, true);
    if (config.debugMode) {
      log(
        `Debug details: ${JSON.stringify({
          code: error.code,
          status: error.status,
          moreInfo: error.moreInfo,
        })}`,
        true,
      );
    }

    return {
      success: false,
      error: error.toString(),
      hint: getTwilioErrorHint(error),
    };
  }
}
