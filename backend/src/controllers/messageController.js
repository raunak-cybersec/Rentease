import Conversation from '../models/Conversation.js';
import Listing from '../models/Listing.js';
import Message from '../models/Message.js';

const populateConversation = (query) =>
  query
    .populate('listingId', 'title images rent locality city')
    .populate('tenantId', 'name email phone role')
    .populate('landlordId', 'name email phone role');

const getId = (value) => value?._id?.toString?.() || value?.toString?.();

const canAccessConversation = (conversation, userId) =>
  getId(conversation.tenantId) === userId || getId(conversation.landlordId) === userId;

export const getConversations = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'tenant'
        ? { tenantId: req.userId }
        : req.user.role === 'landlord'
          ? { landlordId: req.userId }
          : {};

    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins do not participate in tenant-landlord messages' });
    }

    const conversations = await populateConversation(
      Conversation.find(filter).sort({ lastMessageAt: -1 }),
    );

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can start a new conversation' });
    }

    const { listingId, body } = req.body;
    if (!listingId || !body?.trim()) {
      return res.status(400).json({ message: 'Listing and message are required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.landlordId.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot message yourself about your own listing' });
    }

    let conversation = await Conversation.findOne({
      listingId,
      tenantId: req.userId,
      landlordId: listing.landlordId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingId,
        tenantId: req.userId,
        landlordId: listing.landlordId,
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.userId,
      body: body.trim(),
      readBy: [req.userId],
    });

    conversation.lastMessage = message.body;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populated = await populateConversation(Conversation.findById(conversation._id));
    res.status(201).json({ conversation: populated, message });
  } catch (err) {
    next(err);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await populateConversation(Conversation.findById(req.params.id));
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!canAccessConversation(conversation, req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: req.userId } },
      { $addToSet: { readBy: req.userId } },
    );

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!canAccessConversation(conversation, req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.userId,
      body: body.trim(),
      readBy: [req.userId],
    });

    conversation.lastMessage = message.body;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name email role');
    res.status(201).json(populatedMessage);
  } catch (err) {
    next(err);
  }
};
