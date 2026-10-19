import mongoose from 'mongoose';

const viewerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    caption: {
      type: String,
      default: '',
      maxlength: [300, 'Story caption cannot exceed 300 characters'],
      trim: true
    },
    audience: {
      type: String,
      enum: ['everyone', 'close_friends'],
      default: 'everyone',
      index: true
    },
    dimensions: {
      width: { type: Number, default: 1080 },
      height: { type: Number, default: 1920 }
    },
    viewers: [viewerSchema],
    reactions: [reactionSchema],
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically purge expired stories after 24 hours
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, expiresAt: 1 });

export const Story = mongoose.model('Story', storySchema);
