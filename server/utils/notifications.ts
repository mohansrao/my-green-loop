
import twilio from 'twilio';

// Environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
const debugMode = process.env.DEBUG_TWILIO === 'true';

if (!accountSid || !authToken || !adminWhatsApp || !twilioWhatsApp) {
  throw new Error('Missing Twilio credentials or WhatsApp numbers in environment variables');
}

// Create Twilio client
const client = twilio(accountSid, authToken);

export async function sendOrderNotification(orderId: number, customerName: string, totalAmount: number) {
  // Format phone numbers to ensure they include country code and proper format
  const formattedFromNumber = formatWhatsAppNumber(twilioWhatsApp);
  const formattedToNumber = formatWhatsAppNumber(adminWhatsApp);

  // Prepare message content
  const messageBody = `New Order #${orderId}\nCustomer: ${customerName}\nAmount: $${totalAmount}`;
  
  if (debugMode) {
    console.log(`[Twilio Debug] Attempting to send message:
      From: ${formattedFromNumber}
      To: ${formattedToNumber}
      Body: ${messageBody}`);
  }

  try {
    // Send WhatsApp message
    const message = await client.messages.create({
      body: messageBody,
      from: `whatsapp:${formattedFromNumber}`,
      to: `whatsapp:${formattedToNumber}`
    });
    
    if (debugMode) {
      console.log(`[Twilio Debug] Message sent successfully. SID: ${message.sid}`);
    }
    
    return { success: true, sid: message.sid };
  } catch (error) {
    const errorDetails = error.toString();
    console.error('Failed to send WhatsApp notification:', errorDetails);
    
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
