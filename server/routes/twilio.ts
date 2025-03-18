import express from 'express';
import { sendOrderNotification } from '../services/twilio';

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

export { sendOrderNotification };
export default router;