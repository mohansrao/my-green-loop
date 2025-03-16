import twilio from 'twilio';

// Environment configuration consolidated
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

// Validate required configuration
const requiredVars = ['accountSid', 'authToken', 'whatsAppNumber'];
const missingVars = requiredVars.filter(key => !config.twilio[key]);
if (missingVars.length > 0) {
  throw new Error(`Missing required Twilio configuration: ${missingVars.join(', ')}`);
}

// Check admin number
if (!config.twilio.adminNumber) {
  console.warn('[Twilio Configuration] Warning: TWILIO_ADMIN_WHATSAPP_NUMBER is not set');
}

// Initialize Twilio client
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

// Log initial configuration once
console.log(`[Twilio Configuration] Environment: ${config.isProduction ? 'production' : 'development'}`);
if (config.debugMode) {
  console.log('[Twilio Configuration] Debug mode enabled');
  console.log('[Twilio Configuration] Config:', {
    environment: config.isProduction ? 'production' : 'development',
    whatsAppNumber: config.twilio.whatsAppNumber,
    adminNumbers: config.twilio.adminNumbers,
    hasTemplateSid: !!config.twilio.templateSid
  });
}

export async function sendOrderNotification(orderId: number, customerName: string, totalAmount: number) {
  const log = (message: string, isError = false) => {
    const prefix = `[WhatsApp Notification][Order #${orderId}]`;
    isError ? console.error(`${prefix} ${message}`) : console.log(`${prefix} ${message}`);
  };

  const adminNumber = config.twilio.adminNumber;
  const formattedFromNumber = formatWhatsAppNumber(config.twilio.whatsAppNumber);
  const formattedToNumber = formatWhatsAppNumber(adminNumber);

  let messageOptions: any;

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

function formatWhatsAppNumber(number: string): string {
  let cleaned = number.replace(/\D/g, '');
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

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