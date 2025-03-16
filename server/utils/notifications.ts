import twilio from 'twilio';

// Environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
const templateSid = process.env.TWILIO_TEMPLATE_SID;
const debugMode = process.env.DEBUG_TWILIO === 'true';

// Use different admin numbers based on environment
const productionAdminNumber = process.env.PROD_ADMIN_WHATSAPP_NUMBER || '+1234567890';
const developmentAdminNumber = process.env.DEV_ADMIN_WHATSAPP_NUMBER || '+1987654321';

// Check template SID at startup
if (process.env.NODE_ENV === 'production' && !templateSid) {
  console.warn('[WhatsApp Configuration] WARNING: TWILIO_TEMPLATE_SID is not set. Template messaging will not work in production.');
}

// Select the appropriate admin number based on environment
const adminWhatsApp = process.env.NODE_ENV === 'production' 
  ? productionAdminNumber 
  : developmentAdminNumber;


if (!accountSid || !authToken || !adminWhatsApp || !twilioWhatsApp) {
  throw new Error('Missing Twilio credentials or WhatsApp numbers in environment variables');
}

// Create Twilio client
const client = twilio(accountSid, authToken);

// Log debug status on startup
console.log(`[Twilio Configuration] Debug mode: ${debugMode ? 'ENABLED' : 'DISABLED'}`);
console.log(`[Twilio Configuration] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Twilio Configuration] DEBUG_TWILIO env value: '${process.env.DEBUG_TWILIO}'`);
console.log(`[Twilio Configuration] Environment variables: ${Object.keys(process.env).filter(key => key.includes('TWILIO') || key.includes('DEBUG')).join(', ')}`);

export async function sendOrderNotification(orderId: number, customerName: string, totalAmount: number) {
  console.log(`[Twilio Notification] Starting notification for order #${orderId}, debugMode=${debugMode}, NODE_ENV=${process.env.NODE_ENV}`);
  
  // Format phone numbers to ensure they include country code and proper format
  const formattedFromNumber = formatWhatsAppNumber(twilioWhatsApp);
  const formattedToNumber = formatWhatsAppNumber(adminWhatsApp);

  // Automatically detect environment
  const isProduction = process.env.NODE_ENV === 'production';

  let messageOptions;

  if (isProduction) {
    // Use WhatsApp approved template for production
    if (!templateSid) {
      console.error('[WhatsApp Notification] Error: TWILIO_TEMPLATE_SID not set for production message');
      return {
        success: false,
        error: 'Template SID not configured',
        hint: 'Add TWILIO_TEMPLATE_SID to environment variables for production template messaging'
      };
    }
    
    messageOptions = {
      from: `whatsapp:${formattedFromNumber}`,
      to: `whatsapp:${formattedToNumber}`,
      contentSid: templateSid,
      contentVariables: JSON.stringify({
        1: orderId.toString(),
        2: customerName,
        3: `$${totalAmount}`
      })
    };

    if (debugMode) {
      console.log('[Twilio Debug] Using production WhatsApp template message');
      console.log('[Twilio Debug] Template variables:', {
        orderId,
        customerName,
        totalAmount
      });
    }
  } else {
    // Use direct message for development/sandbox
    const messageBody = `New Order #${orderId}\nCustomer: ${customerName}\nAmount: $${totalAmount}`;
    messageOptions = {
      body: messageBody,
      from: `whatsapp:${formattedFromNumber}`,
      to: `whatsapp:${formattedToNumber}`
    };

    if (debugMode) {
      console.log('[Twilio Debug] Using development/sandbox message format');
      console.log('[Twilio Debug] Message body:', messageBody);
    }
  }

  if (debugMode) {
    console.log(`[Twilio Debug] Attempting to send message:
      From: ${formattedFromNumber}
      To: ${formattedToNumber}
      Template: ${true ? 'Yes' : 'No'}
      Options:`, messageOptions);
  }

  try {
    // Always log important operations for production tracking
    console.log(`[WhatsApp Notification] Sending order notification to admin (${adminWhatsApp}) for order #${orderId}`);
    
    // Send WhatsApp message
    const message = await client.messages.create(messageOptions);

    if (debugMode) {
      console.log(`[Twilio Debug] Message sent successfully. SID: ${message.sid}`);
    }
    
    // Important success logs for production
    console.log(`[WhatsApp Notification] Successfully sent notification. SID: ${message.sid}`);
    return { 
      success: true, 
      sid: message.sid,
      debugEnabled: debugMode, 
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    const errorDetails = error.toString();
    console.error(`[WhatsApp Notification] FAILED to send notification for order #${orderId}:`, errorDetails);
    console.error(`[WhatsApp Notification] Admin number used: ${adminWhatsApp}`);

    // Log more detailed error information
    if (debugMode) {
      console.error('[Twilio Debug] Error details:', {
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
        details: error.details
      });
    }

    return { 
      success: false, 
      error: errorDetails,
      hint: getTwilioErrorHint(error)
    };
  }
}

// Helper function to format WhatsApp numbers
function formatWhatsAppNumber(number: string): string {
  // Remove any non-digit characters
  let cleaned = number.replace(/\D/g, '');

  // Ensure the number has a country code (add +1 for US if missing)
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }

  // Add + prefix if missing
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

// Get helpful hints based on common Twilio error codes
function getTwilioErrorHint(error: any): string {
  const errorCode = error.code;

  switch(errorCode) {
    case 21211:
      return "Invalid 'To' phone number. Make sure the recipient's number is formatted correctly with country code.";
    case 21606:
      return "The 'From' number is not a valid WhatsApp-enabled Twilio number.";
    case 21612:
      return "This Twilio account might be in trial mode, which restricts sending to unverified numbers.";
    case 63003:
    case 63004:
      return "For a production WhatsApp Business Profile, you may need to use pre-approved message templates.";
    case 20003:
      return "Authentication error. Check your Twilio credentials.";
    default:
      return "Check your Twilio console for more information about this error.";
  }
}