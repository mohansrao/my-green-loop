import express from 'express';
import { sendOrderNotification } from '../services/twilio';

/**
 * Express Router for handling Twilio-related endpoints
 */
const router = express.Router();

/**
 * Webhook endpoint for incoming Twilio messages
 * Logs the message content and sender information, and sends automatic response
 */
router.post("/message", express.urlencoded({ extended: false }), (req, res) => {
  try {
    const { Body: messageBody, From: fromNumber } = req.body;
    console.log('[Twilio Webhook] Received message:', {
      from: fromNumber,
      message: messageBody
    });

    // Send automatic response using TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>Welcome to our rental service! 🎉

You're now subscribed to receive order notifications via SMS. 

You'll get updates when:
✅ Your order is confirmed
✅ Items are ready for pickup/delivery
✅ Return reminders

Thank you for choosing us!</Body>
  </Message>
</Response>`;

    res.type('text/xml');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('[Twilio Webhook] Error:', error);
    res.status(500).send();
  }
});

export { sendOrderNotification };
export default router;