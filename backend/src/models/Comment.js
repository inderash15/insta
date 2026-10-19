import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: false,
      index: true
    },
    targetType: {
      type: String,
      enum: ['post', 'reel'],
      default: 'post'
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
