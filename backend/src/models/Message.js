import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      default: '',
      trim: true
    },
    mediaUrl: {
      type: String,
      default: null
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        deliveredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
