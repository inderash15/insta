import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required']
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: '',
      maxlength: [2200, 'Caption cannot exceed 2200 characters'],
      trim: true
    },
    audioTitle: {
      type: String,
      default: 'Original Audio',
      trim: true
    },
    duration: {
      type: Number,
      default: 15
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true
      }
    ]
  },
  {
    timestamps: true
  }
);

reelSchema.index({ createdAt: -1 });

export const Reel = mongoose.model('Reel', reelSchema);
