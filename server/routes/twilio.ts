
import express from 'express';

/**
 * Router for handling Twilio webhook endpoints
 * This module processes incoming messages from Twilio's webhook service
 */
const router = express.Router();

/**
 * POST /api/webhook/twilio/message
 * Handles incoming SMS/WhatsApp messages from Twilio
 * 
 * @param {Object} req.body.Body - The content of the message
 * @param {Object} req.body.From - The phone number that sent the message
 * 
 * Currently logs the incoming message details and returns a 200 status
 * Can be extended to handle different types of messages or implement
 * automated responses
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
