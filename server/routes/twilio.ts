
import express from 'express';

const router = express.Router();

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
