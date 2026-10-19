import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    width: { type: Number, default: 1080 },
    height: { type: Number, default: 1080 },
    aspectRatio: { type: String, default: '1:1' }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    caption: {
      type: String,
      default: '',
      maxlength: [2200, 'Caption cannot exceed 2200 characters'],
      trim: true
    },
    media: {
      type: [mediaItemSchema],
      validate: [
        (val) => val.length > 0 && val.length <= 10,
        'Post must contain between 1 and 10 media files'
      ]
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true
      }
    ],
    mentions: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
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
    isArchived: {
      type: Boolean,
      default: false
    },
    commentsDisabled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);
