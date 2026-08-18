import express from 'express';
import mongoose from 'mongoose';
import n8nAutomation from '../services/n8nAutomation.js';

const router = express.Router();

/**
 * GET /api/health — Health check for DB, n8n, and EjoChat
 */
router.get('/', async (req, res) => {
  try {
    const dbHealthy = mongoose.connection.readyState === 1;
    const n8nHealthy = await n8nAutomation.checkN8nHealth();

    let ejoChatHealthy = false;
    try {
      const { default: ejoChat } = await import('../services/ejoChat.js');
      ejoChatHealthy = await ejoChat.isHealthy();
    } catch {
      ejoChatHealthy = false;
    }

    res.status(200).json({
      success: true,
      status: 'healthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      n8n: n8nHealthy ? 'connected' : 'disconnected',
      ejoChat: ejoChatHealthy ? 'connected' : 'not configured',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
