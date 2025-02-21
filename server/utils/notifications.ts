
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !adminWhatsApp || !twilioWhatsApp) {
  throw new Error('Missing Twilio credentials or WhatsApp numbers in environment variables');
}

const client = twilio(accountSid, authToken);

export async function sendOrderNotification(orderId: number, customerName: string, totalAmount: number) {
  try {
    await client.messages.create({
      body: `New Order #${orderId}\nCustomer: ${customerName}\nAmount: $${totalAmount}`,
      from: `whatsapp:${twilioWhatsApp}`,
      to: `whatsapp:${adminWhatsApp}`
    });
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
  }
}
