import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ listingId: 1, tenantId: 1, landlordId: 1 }, { unique: true });
conversationSchema.index({ tenantId: 1, lastMessageAt: -1 });
conversationSchema.index({ landlordId: 1, lastMessageAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
