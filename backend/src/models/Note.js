import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      maxlength: [60, 'Note cannot exceed 60 characters']
    },
    mood: {
      type: String,
      default: '',
      trim: true,
      maxlength: [10, 'Mood emoji or tag cannot exceed 10 characters']
    },
    audience: {
      type: String,
      enum: ['followers_follow_back', 'close_friends'],
      default: 'followers_follow_back',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically purge expired notes after 24 hours
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
noteSchema.index({ author: 1, expiresAt: 1 });

export const Note = mongoose.model('Note', noteSchema);
