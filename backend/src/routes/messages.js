import express from 'express';
import {
  getConversationMessages,
  getConversations,
  sendMessage,
  startConversation,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
